// sha1.h — Minimal SHA-1 (RFC 3174) for WebSocket handshake
// Public domain — no external crypto dependency needed

#pragma once
#include <cstdint>
#include <cstring>
#include <array>
#include <vector>

namespace sha1 {

static constexpr size_t DIGEST_SIZE = 20;

inline uint32_t rotl(uint32_t x, int n) { return (x << n) | (x >> (32 - n)); }

inline std::array<uint8_t, DIGEST_SIZE> hash(const uint8_t *data, size_t len) {
    uint32_t h0 = 0x67452301, h1 = 0xEFCDAB89,
             h2 = 0x98BADCFE, h3 = 0x10325476, h4 = 0xC3D2E1F0;

    uint64_t ml = static_cast<uint64_t>(len) * 8;
    size_t padded = ((len + 8) / 64 + 1) * 64;
    std::vector<uint8_t> msg(padded, 0);
    std::memcpy(msg.data(), data, len);
    msg[len] = 0x80;
    for (int i = 0; i < 8; i++)
        msg[padded - 1 - i] = static_cast<uint8_t>((ml >> (i * 8)) & 0xFF);

    for (size_t off = 0; off < padded; off += 64) {
        uint32_t w[80];
        for (int i = 0; i < 16; i++)
            w[i] = (msg[off+i*4] << 24) | (msg[off+i*4+1] << 16) |
                   (msg[off+i*4+2] << 8)  | msg[off+i*4+3];
        for (int i = 16; i < 80; i++)
            w[i] = rotl(w[i-3] ^ w[i-8] ^ w[i-14] ^ w[i-16], 1);

        uint32_t a = h0, b = h1, c = h2, d = h3, e = h4;
        for (int i = 0; i < 80; i++) {
            uint32_t f, k;
            if      (i < 20) { f = (b & c) | (~b & d);           k = 0x5A827999; }
            else if (i < 40) { f = b ^ c ^ d;                    k = 0x6ED9EBA1; }
            else if (i < 60) { f = (b & c) | (b & d) | (c & d);  k = 0x8F1BBCDC; }
            else              { f = b ^ c ^ d;                    k = 0xCA62C1D6; }
            uint32_t t = rotl(a, 5) + f + e + k + w[i];
            e = d; d = c; c = rotl(b, 30); b = a; a = t;
        }
        h0 += a; h1 += b; h2 += c; h3 += d; h4 += e;
    }

    std::array<uint8_t, DIGEST_SIZE> digest;
    for (int i = 0; i < 4; i++) {
        digest[i]    = (h0 >> (24 - i*8)) & 0xFF;
        digest[4+i]  = (h1 >> (24 - i*8)) & 0xFF;
        digest[8+i]  = (h2 >> (24 - i*8)) & 0xFF;
        digest[12+i] = (h3 >> (24 - i*8)) & 0xFF;
        digest[16+i] = (h4 >> (24 - i*8)) & 0xFF;
    }
    return digest;
}

} // namespace sha1
