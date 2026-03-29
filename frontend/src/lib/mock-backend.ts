import { positionToGains, type TxMessage } from "./protocol";

const STORAGE_KEY = "karaoke-demo-state";

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch { /* localStorage unavailable */ }
  return null;
}

function saveState(state: { position: number; lyricsVisible: boolean }) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch { /* localStorage unavailable */ }
}

/**
 * In-browser simulation of the C++ firmware backend.
 * Used as a fallback when ws://localhost:9001 is unreachable (e.g. GitHub Pages).
 * Mirrors the behavior of server.cpp: initial state, volume echo, lyrics data.
 * Persists slider position to localStorage so it survives page refreshes.
 */
export class MockBackend {
  private state: { position: number; lyricsVisible: boolean; sdkPlayerEnabled: boolean };
  private onMessage: (msg: TxMessage) => void;

  constructor(onMessage: (msg: TxMessage) => void) {
    const saved = loadState();
    this.state = {
      position: saved?.position ?? 4,
      lyricsVisible: saved?.lyricsVisible ?? true,
      sdkPlayerEnabled: false,
    };
    this.onMessage = onMessage;
    setTimeout(() => this.sendInitialState(), 100);
  }

  handleMessage(raw: string): void {
    const msg = JSON.parse(raw);
    switch (msg.type) {
      case "adjustVocalAndAccompanyVolume":
        this.state.position = msg.position;
        saveState(this.state);
        this.sendVolumeUpdated(msg.position);
        break;
      case "enableSourceSdkPlayer":
        this.state.sdkPlayerEnabled = msg.enabled;
        break;
      case "toggleLyricsView":
        this.state.lyricsVisible = msg.show ?? !this.state.lyricsVisible;
        saveState(this.state);
        break;
    }
  }

  private sendInitialState(): void {
    this.onMessage({ type: "initialState", state: { ...this.state } });
    this.sendVolumeUpdated(this.state.position);
    this.onMessage({
      type: "lyricsData",
      lyrics: [
        { time: 0, text: "\u266a \u266a \u266a" },
        { time: 2400, text: "Fever dream high in the quiet of the night" },
        { time: 5500, text: "You know that I caught it" },
        { time: 8200, text: "Bad, bad boy, shiny toy with a price" },
        { time: 11000, text: "You know that I bought it" },
        { time: 13800, text: "Killing me slow, out the window" },
        { time: 16400, text: "I'm always waiting for you to be waiting below" },
        { time: 19200, text: "Devils roll the dice, angels roll their eyes" },
        { time: 22000, text: "What doesn't kill me makes me want you more" },
        { time: 24800, text: "And it's new, the shape of your body" },
        { time: 27600, text: "It's blue, the feeling I've got" },
        { time: 30000, text: "" },
      ],
    });
  }

  private sendVolumeUpdated(position: number): void {
    const gains = positionToGains(position);
    this.onMessage({
      type: "vocalAndAccompanyVolumeUpdated",
      position,
      vocal: gains.vocal,
      accom: gains.accom,
    });
  }
}
