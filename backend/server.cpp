// server.cpp — C++ WebSocket Server (simulates firmware controller chain)
//
// Architecture mapping:
//   This single file simulates the firmware-side controller chain:
//   WebViewBridge (WebSocket endpoint)
//     -> DisplayIPCBus (cross-process IPC)
//       -> AudioController (orchestrator)
//         -> SourceController (source-specific logic)
//           -> AppViewController (view management)
//             -> LyricsView (native Qt UI — the slider)
//
// Build with CMake (see CMakeLists.txt) or manually:
//   g++ -std=c++17 server.cpp -o server -I<path-to-nlohmann-json>

#include "protocol.h"
#include "sha1.h"
#include <iostream>
#include <fstream>
#include <sys/socket.h>
#include <netinet/in.h>
#include <unistd.h>
#include <cstring>
#include <csignal>
#include <vector>
#include <arpa/inet.h>
#include <cstdlib>

// ============================================================
// State Persistence (simulates firmware key-value store)
// ============================================================

static const char *defaultStateFile()
{
    const char *env = std::getenv("KARAOKE_STATE_FILE");
    return env ? env : "/tmp/karaoke_state.json";
}

static const char *STATE_FILE = defaultStateFile();

KaraokeState g_state;
bool g_running = true;

void saveState()
{
    std::ofstream f(STATE_FILE);
    f << g_state.toJson().dump(2);
}

void loadState()
{
    std::ifstream f(STATE_FILE);
    if (f.good())
    {
        try
        {
            json j;
            f >> j;
            g_state.position = j.value("position", 4);
            g_state.lyricsVisible = j.value("lyricsVisible", true);
            g_state.sdkPlayerEnabled = j.value("sdkPlayerEnabled", false);
            auto gains = positionToGains(g_state.position);
            std::cout << "[StateStore] Loaded persisted state: position="
                      << g_state.position << " (vocal=" << gains.vocal
                      << "%, accom=" << gains.accom << "%)\n";
        }
        catch (...)
        {
            std::cout << "[StateStore] No valid state file, using defaults\n";
        }
    }
}

// ============================================================
// WebSocket Frame Helpers (minimal RFC 6455 implementation)
// ============================================================

std::string base64Encode(const unsigned char *data, size_t len)
{
    static const char *chars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    std::string result;
    int i = 0;
    unsigned char a3[3], a4[4];
    while (len--)
    {
        a3[i++] = *(data++);
        if (i == 3)
        {
            a4[0] = (a3[0] & 0xfc) >> 2;
            a4[1] = ((a3[0] & 0x03) << 4) + ((a3[1] & 0xf0) >> 4);
            a4[2] = ((a3[1] & 0x0f) << 2) + ((a3[2] & 0xc0) >> 6);
            a4[3] = a3[2] & 0x3f;
            for (i = 0; i < 4; i++)
                result += chars[a4[i]];
            i = 0;
        }
    }

    if (i)
    {
        for (int j = i; j < 3; j++)
            a3[j] = '\0';
        a4[0] = (a3[0] & 0xfc) >> 2;
        a4[1] = ((a3[0] & 0x03) << 4) + ((a3[1] & 0xf0) >> 4);
        a4[2] = ((a3[1] & 0x0f) << 2) + ((a3[2] & 0xc0) >> 6);
        for (int j = 0; j < i + 1; j++)
            result += chars[a4[j]];
        while (i++ < 3)
            result += '=';
    }

    return result;
}

bool performWebSocketHandshake(int fd)
{
    char buf[4096];
    int n = recv(fd, buf, sizeof(buf) - 1, 0);
    if (n <= 0)
        return false;
    buf[n] = '\0';

    std::string request(buf);
    std::string keyHeader = "Sec-WebSocket-Key: ";
    auto pos = request.find(keyHeader);
    if (pos == std::string::npos)
        return false;

    auto endPos = request.find("\r\n", pos);
    std::string key = request.substr(pos + keyHeader.size(),
                                     endPos - pos - keyHeader.size());
    key += "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";

    auto digest = sha1::hash(
        reinterpret_cast<const uint8_t *>(key.c_str()), key.size());
    std::string accept = base64Encode(digest.data(), digest.size());

    std::string response =
        "HTTP/1.1 101 Switching Protocols\r\n"
        "Upgrade: websocket\r\n"
        "Connection: Upgrade\r\n"
        "Sec-WebSocket-Accept: " +
        accept + "\r\n\r\n";

    send(fd, response.c_str(), response.size(), 0);
    return true;
}

void sendWebSocketFrame(int fd, const std::string &payload)
{
    std::vector<uint8_t> frame;
    frame.push_back(0x81); // FIN + text opcode
    if (payload.size() < 126)
    {
        frame.push_back(static_cast<uint8_t>(payload.size()));
    }
    else if (payload.size() < 65536)
    {
        frame.push_back(126);
        frame.push_back((payload.size() >> 8) & 0xFF);
        frame.push_back(payload.size() & 0xFF);
    }
    frame.insert(frame.end(), payload.begin(), payload.end());
    send(fd, frame.data(), frame.size(), 0);
}

std::string readWebSocketFrame(int fd)
{
    uint8_t header[2];
    int n = recv(fd, header, 2, 0);
    if (n <= 0)
        return "";

    bool masked = header[1] & 0x80;
    uint64_t payloadLen = header[1] & 0x7F;

    if (payloadLen == 126)
    {
        uint8_t ext[2];
        recv(fd, ext, 2, 0);
        payloadLen = (ext[0] << 8) | ext[1];
    }
    else if (payloadLen == 127)
    {
        uint8_t ext[8];
        recv(fd, ext, 8, 0);
        payloadLen = 0;
        for (int i = 0; i < 8; i++)
            payloadLen = (payloadLen << 8) | ext[i];
    }

    uint8_t mask[4] = {0};
    if (masked)
        recv(fd, mask, 4, 0);

    std::string payload(payloadLen, '\0');
    size_t totalRead = 0;
    while (totalRead < payloadLen)
    {
        n = recv(fd, &payload[totalRead], payloadLen - totalRead, 0);
        if (n <= 0)
            return "";
        totalRead += n;
    }

    if (masked)
    {
        for (size_t i = 0; i < payloadLen; i++)
            payload[i] ^= mask[i % 4];
    }
    return payload;
}

// ============================================================
// Message Handlers (simulate the firmware controller chain)
// ============================================================

// Real path: SourceController -> AppSourceController -> WebViewBridge -> WebSocket TX
void sendVolumeUpdated(int fd, int position)
{
    auto gains = positionToGains(position);
    json msg = {
        {"type", "vocalAndAccompanyVolumeUpdated"},
        {"position", position},
        {"vocal", gains.vocal},
        {"accom", gains.accom}};
    sendWebSocketFrame(fd, msg.dump());
}

void sendLyricsData(int fd)
{
    json lyrics = json::array({
        {{"time", 0}, {"text", "\u266a \u266a \u266a"}},
        {{"time", 2400}, {"text", "Fever dream high in the quiet of the night"}},
        {{"time", 5500}, {"text", "You know that I caught it"}},
        {{"time", 8200}, {"text", "Bad, bad boy, shiny toy with a price"}},
        {{"time", 11000}, {"text", "You know that I bought it"}},
        {{"time", 13800}, {"text", "Killing me slow, out the window"}},
        {{"time", 16400}, {"text", "I'm always waiting for you to be waiting below"}},
        {{"time", 19200}, {"text", "Devils roll the dice, angels roll their eyes"}},
        {{"time", 22000}, {"text", "What doesn't kill me makes me want you more"}},
        {{"time", 24800}, {"text", "And it's new, the shape of your body"}},
        {{"time", 27600}, {"text", "It's blue, the feeling I've got"}},
        {{"time", 30000}, {"text", ""}},
    });
    json msg = {{"type", "lyricsData"}, {"lyrics", lyrics}};
    sendWebSocketFrame(fd, msg.dump());
}

void sendInitialState(int fd)
{
    json msg = {
        {"type", "initialState"},
        {"state", g_state.toJson()}};
    sendWebSocketFrame(fd, msg.dump());
    sendVolumeUpdated(fd, g_state.position);
    sendLyricsData(fd);
    std::cout << "[AudioController] Client connected, sent initial state\n";
}

// Handle: adjustVocalAndAccompanyVolume  (webapp -> firmware)
// Real path: WebSocket RX -> WebViewBridge -> IPC Bus
//   -> AudioController -> SourceController
//   -> persists to AUDIO_vocalAndAccompanyVolume
//   -> echoes back via AppViewController
void handleAdjustVolume(int fd, const json &msg)
{
    int position = msg["position"];
    auto gains = positionToGains(position);

    std::cout << "[SourceController] Position " << position
              << " (vocal=" << gains.vocal << "%, accom=" << gains.accom << "%)\n";

    g_state.position = position;
    saveState();
    std::cout << "[StateStore] Persisted position=" << position << "\n";

    sendVolumeUpdated(fd, position);
}

void handleEnableSdkPlayer(int fd, const json &msg)
{
    g_state.sdkPlayerEnabled = msg.value("enabled", true);
    saveState();
    std::cout << "[AppSourceController] SDK player "
              << (g_state.sdkPlayerEnabled ? "enabled" : "disabled") << "\n";
}

void handleToggleLyrics(int fd, const json &msg)
{
    g_state.lyricsVisible = msg.value("show", !g_state.lyricsVisible);
    saveState();
    std::cout << "[AudioController] Lyrics view "
              << (g_state.lyricsVisible ? "shown" : "hidden") << "\n";
}

void handleMessage(int fd, const std::string &raw)
{
    try
    {
        json msg = json::parse(raw);
        std::string type = msg["type"];

        std::cout << "\n[WebViewBridge] RX: " << type << "\n";

        if (type == "adjustVocalAndAccompanyVolume")
            handleAdjustVolume(fd, msg);
        else if (type == "enableSourceSdkPlayer")
            handleEnableSdkPlayer(fd, msg);
        else if (type == "toggleLyricsView")
            handleToggleLyrics(fd, msg);
        else
            std::cout << "[WebViewBridge] Unknown message type: " << type << "\n";
    }
    catch (const std::exception &e)
    {
        std::cerr << "[WebViewBridge] Parse error: " << e.what() << "\n";
    }
}

// ============================================================
// Main Server Loop
// ============================================================

void signalHandler(int) { g_running = false; }

int main()
{
    signal(SIGINT, signalHandler);
    signal(SIGPIPE, SIG_IGN);

    loadState();

    int serverFd = socket(AF_INET, SOCK_STREAM, 0);
    if (serverFd < 0)
    {
        std::cerr << "Failed to create socket\n";
        return 1;
    }
    int opt = 1;
    setsockopt(serverFd, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt));

    sockaddr_in addr{};
    addr.sin_family = AF_INET;
    addr.sin_addr.s_addr = INADDR_ANY;
    addr.sin_port = htons(9001);

    if (bind(serverFd, (sockaddr *)&addr, sizeof(addr)) < 0)
    {
        std::cerr << "Failed to bind port 9001\n";
        close(serverFd);
        return 1;
    }

    listen(serverFd, 1);

    std::cout << "========================================\n";
    std::cout << "  Karaoke Audio Controller (C++ Backend)\n";
    std::cout << "  WebSocket: ws://localhost:9001\n";
    std::cout << "  State file: " << STATE_FILE << "\n";
    std::cout << "  Position: " << g_state.position << "\n";
    std::cout << "========================================\n\n";

    while (g_running)
    {
        std::cout << "[WebViewBridge] Waiting for webapp connection...\n";

        sockaddr_in clientAddr{};
        socklen_t clientLen = sizeof(clientAddr);
        int clientFd = accept(serverFd, (sockaddr *)&clientAddr, &clientLen);
        if (clientFd < 0)
            continue;

        std::cout << "[WebViewBridge] Webapp connected\n";

        if (!performWebSocketHandshake(clientFd))
        {
            close(clientFd);
            continue;
        }

        sendInitialState(clientFd);

        while (g_running)
        {
            std::string msg = readWebSocketFrame(clientFd);
            if (msg.empty())
            {
                std::cout << "[WebViewBridge] Webapp disconnected\n";
                break;
            }
            handleMessage(clientFd, msg);
        }

        close(clientFd);
    }

    close(serverFd);
    std::cout << "\n[AudioController] Shutdown complete\n";
    return 0;
}
