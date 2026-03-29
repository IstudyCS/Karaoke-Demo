// protocol.h — Shared message types and enums (mirrors bridge-protocol.idl)
// In production, a .idl file auto-generates both C++ and JS bindings.
// Here we manually keep protocol.h and protocol.ts in sync.

#pragma once
#include <string>
#include <nlohmann/json.hpp>

using json = nlohmann::json;

// --- WebSocket Message Types ---
// Named to match the bridge protocol IDL messages
enum class MessageType : uint8_t
{
    // Webapp -> Firmware (RX in firmware terms)
    AdjustVocalAndAccompanyVolume,
    EnableSourceSdkPlayer,
    ToggleLyricsView,

    // Firmware -> Webapp (TX in firmware terms)
    VocalAndAccompanyVolumeUpdated,
    LyricsData,
};

static const char *messageTypeToString(MessageType t)
{
    switch (t)
    {
    case MessageType::AdjustVocalAndAccompanyVolume:
        return "adjustVocalAndAccompanyVolume";
    case MessageType::EnableSourceSdkPlayer:
        return "enableSourceSdkPlayer";
    case MessageType::ToggleLyricsView:
        return "toggleLyricsView";
    case MessageType::VocalAndAccompanyVolumeUpdated:
        return "vocalAndAccompanyVolumeUpdated";
    case MessageType::LyricsData:
        return "lyricsData";
    }
    return "unknown";
}

static constexpr int NUM_SLIDER_POSITIONS = 9;

struct GainLevels
{
    int vocal;
    int accom;
};

// Maps 9-position slider to gain percentages:
//   Position 0 (left):   vocal 100%, accompaniment   0%  — vocal only
//   Position 4 (center): vocal 100%, accompaniment 100%  — original mix
//   Position 8 (right):  vocal   0%, accompaniment 100%  — accompaniment only
static GainLevels positionToGains(int position)
{
    if (position <= 4)
        return {100, position * 25};
    else
        return {(8 - position) * 25, 100};
}

// --- Persistent State (simulates firmware key-value store) ---
struct KaraokeState
{
    int position = 4; // default: original (center)
    bool lyricsVisible = true;
    bool sdkPlayerEnabled = false;

    json toJson() const
    {
        return {
            {"position", position},
            {"lyricsVisible", lyricsVisible},
            {"sdkPlayerEnabled", sdkPlayerEnabled}};
    }
};
