// protocol.ts — Shared message types (mirrors protocol.h)
// In production, a bridge-protocol.idl auto-generates both sides.
// Here we manually keep protocol.h and protocol.ts in sync.

export const SLIDER_POSITIONS = 9;

export interface GainLevels {
  vocal: number; // 0-100
  accom: number; // 0-100
}

// Maps 9-position slider to gain percentages:
//   Position 0 (left):   vocal 100%, accompaniment   0%  — vocal only
//   Position 4 (center): vocal 100%, accompaniment 100%  — original mix
//   Position 8 (right):  vocal   0%, accompaniment 100%  — accompaniment only
export function positionToGains(position: number): GainLevels {
  if (position <= 4) {
    return { vocal: 100, accom: position * 25 };
  } else {
    return { vocal: (8 - position) * 25, accom: 100 };
  }
}

// --- Message Types (webapp <-> firmware) ---
export type RxMessage =
  | { type: "adjustVocalAndAccompanyVolume"; position: number }
  | { type: "enableSourceSdkPlayer"; enabled: boolean }
  | { type: "toggleLyricsView"; show: boolean };

export type TxMessage =
  | {
      type: "vocalAndAccompanyVolumeUpdated";
      position: number;
      vocal: number;
      accom: number;
    }
  | { type: "lyricsData"; lyrics: LyricLine[] }
  | { type: "initialState"; state: KaraokeState };

export interface KaraokeState {
  position: number;
  lyricsVisible: boolean;
  sdkPlayerEnabled: boolean;
}

export interface LyricLine {
  time: number;
  text: string;
}
