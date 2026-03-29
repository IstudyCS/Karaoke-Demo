import { positionToGains, type TxMessage } from "./protocol";

/**
 * In-browser simulation of the C++ firmware backend.
 * Used as a fallback when ws://localhost:9001 is unreachable (e.g. GitHub Pages).
 * Mirrors the behavior of server.cpp: initial state, volume echo, lyrics data.
 */
export class MockBackend {
  private state = { position: 4, lyricsVisible: true, sdkPlayerEnabled: false };
  private onMessage: (msg: TxMessage) => void;

  constructor(onMessage: (msg: TxMessage) => void) {
    this.onMessage = onMessage;
    setTimeout(() => this.sendInitialState(), 100);
  }

  handleMessage(raw: string): void {
    const msg = JSON.parse(raw);
    switch (msg.type) {
      case "adjustVocalAndAccompanyVolume":
        this.state.position = msg.position;
        this.sendVolumeUpdated(msg.position);
        break;
      case "enableSourceSdkPlayer":
        this.state.sdkPlayerEnabled = msg.enabled;
        break;
      case "toggleLyricsView":
        this.state.lyricsVisible = msg.show ?? !this.state.lyricsVisible;
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
