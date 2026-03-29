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
        { time: 3000, text: "They tell me that I'm never gonna make it" },
        { time: 7000, text: "They want me to do something that could make sense" },
        { time: 10500, text: "They hate when I keep dreaming I'll be famous" },
        { time: 14500, text: "But I don't give a fuck, I'ma keep chasing" },
        { time: 19000, text: "I got all this potential it's deep inside of me" },
        { time: 23000, text: "But they hate when you're successful 'cause they tried to be" },
        { time: 27000, text: "They sit there being judgmental because you trying things" },
        { time: 31000, text: "And they just want you to settle and do the right thing" },
        { time: 35000, text: "So get a good job, don't slack off" },
        { time: 39000, text: "Wake up every morning make a good impression on your boss" },
        { time: 43000, text: "Don't do anything that I wouldn't do" },
        { time: 47000, text: "And when you make your money make sure you don't spend it too soon" },
        { time: 51000, text: "Fuck that I'll do what I wanna do" },
        { time: 55000, text: "I got a different path from everyone and that includes you" },
        { time: 59000, text: "Who are you to tell me how to live life?" },
        { time: 62500, text: "In these times it feels like nobody is right" },
        { time: 66000, text: "So I'ma figure out what helps me succeed" },
        { time: 70000, text: "And then invest all of my time into that and proceed" },
        { time: 74000, text: "I need whatever the hell could make me happy" },
        { time: 78000, text: "And I don't think you have a clue what could that be" },
        { time: 82000, text: "They tell me that I'm never gonna make it" },
        { time: 86000, text: "They want me to do something that could make sense" },
        { time: 90000, text: "They hate when I keep dreaming I'll be famous" },
        { time: 94000, text: "But I don't give a fuck, I'ma keep chasing" },
        { time: 98000, text: "I think this life could be special" },
        { time: 101500, text: "If I get rid of the devils" },
        { time: 105000, text: "They think that I am a rebel" },
        { time: 108000, text: "I think they want me to settle" },
        { time: 111500, text: "There's nobody on my level" },
        { time: 115000, text: "They think that work is too stressful" },
        { time: 118000, text: "I think that work is essential" },
        { time: 121500, text: "The grind is all in your mental" },
        { time: 125000, text: "Got one life I won't regret it" },
        { time: 128500, text: "I will fight until I get it" },
        { time: 132000, text: "I'll look back one day from heaven" },
        { time: 135000, text: "And say damn I learned some lessons" },
        { time: 139000, text: "They tell me that I'm never gonna make it" },
        { time: 143000, text: "They want me to do something that could make sense" },
        { time: 147000, text: "They hate when I keep dreaming I'll be famous" },
        { time: 151000, text: "But I don't give a fuck, I'ma keep chasing" },
        { time: 160000, text: "\u266a \u266a \u266a" },
        { time: 166000, text: "" },
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
