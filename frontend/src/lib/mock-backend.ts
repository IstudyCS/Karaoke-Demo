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
        { time: 15000, text: "I can feel the blood creepin' up from the heathens" },
        { time: 18000, text: "Got will, got fight, got pride, got reason" },
        { time: 21000, text: "If they wanna go eat, then you know I'm gonna feed 'em" },
        { time: 24000, text: "If you comin' for me, hope you're ready for a demon" },
        { time: 27000, text: "I got eyes in the back of my head, I'm seeing" },
        { time: 30000, text: "Take me for granted and you know I'm leaving" },
        { time: 33000, text: "I'ma take what's mine with the webs I'm weaving" },
        { time: 36000, text: "I can take this crowd from seeing to believing" },
        { time: 39000, text: "Gotta taste for blood and my tongue keeps bleeding" },
        { time: 42000, text: "From the words I spit, so sharp, so freezing" },
        { time: 45000, text: "So cold, behold, frostbite they feeling" },
        { time: 48000, text: "I can tear you apart or I can go heal 'em" },
        { time: 51000, text: "Don't believe in fate, don't believe in ceilings" },
        { time: 54000, text: "I just need a taste and my mind starts peeling" },
        { time: 57000, text: "I don't pace myself, I grind, no kneeling" },
        { time: 60000, text: "Got lust for change, I just love the feeling" },
        { time: 63000, text: "And I ain't gonna give up" },
        { time: 65000, text: "Got too little time, I'ma live up" },
        { time: 67000, text: "Head down, push forward through the tough times" },
        { time: 70000, text: "'Cause anything worth doing is a tough climb" },
        { time: 73000, text: "And I ain't gonna give up" },
        { time: 74000, text: "Got too little time, I'ma live up" },
        { time: 77000, text: "Head down, push forward through the tough times" },
        { time: 80000, text: "'Cause anything worth doing is a tough climb" },
        { time: 82000, text: "I'ma live life for the fight, yeah, I'm here to get it" },
        { time: 86000, text: "I got drive, got sight, always have a vision" },
        { time: 89000, text: "I don't lie at night, I be in my feelings" },
        { time: 92000, text: "I'ma be fine, need time and I'll soon be winning" },
        { time: 95000, text: "I live life for the fight, yeah, I'm here to get it" },
        { time: 98000, text: "I got drive, got sight, always have a vision" },
        { time: 101000, text: "I don't lie at night, I be in my feelings" },
        { time: 104000, text: "I'ma be fine, need time and I'll soon be winning" },
        { time: 107000, text: "\u266a \u266a \u266a" },
        { time: 122000, text: "" },
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
