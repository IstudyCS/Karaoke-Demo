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
    this.onMessage({ type: "lyricsData", lyrics: [] });
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
