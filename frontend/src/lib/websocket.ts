import {
  connectionStatus,
  currentPosition,
  lyrics,
  addLogMessage,
  demoMode,
} from "./stores";
import { positionToGains, type TxMessage, type RxMessage } from "./protocol";
import { applyGainLevels } from "./audio";
import { MockBackend } from "./mock-backend";

let ws: WebSocket | null = null;
let mock: MockBackend | null = null;

const isLocal =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1");

export function connect(): void {
  if (mock) return;

  if (!isLocal) {
    activateMockMode();
    return;
  }

  connectionStatus.set("connecting");

  try {
    ws = new WebSocket("ws://localhost:9001");
  } catch {
    activateMockMode();
    return;
  }

  ws.onopen = () => {
    connectionStatus.set("connected");
    addLogMessage({ direction: "tx", type: "connected" });
  };

  ws.onclose = () => {
    if (mock) return;
    connectionStatus.set("disconnected");
    setTimeout(connect, 3000);
  };

  ws.onerror = () => {};

  ws.onmessage = (event: MessageEvent) => {
    const msg: TxMessage = JSON.parse(event.data);
    dispatch(msg);
  };
}

function activateMockMode(): void {
  ws = null;
  demoMode.set(true);
  connectionStatus.set("connected");
  addLogMessage({ direction: "tx", type: "connected (demo mode)" });
  mock = new MockBackend((msg) => dispatch(msg));
}

function dispatch(msg: TxMessage): void {
  switch (msg.type) {
    case "vocalAndAccompanyVolumeUpdated":
      addLogMessage({
        direction: "tx",
        type: "updated",
        detail: `vocal ${msg.vocal}%, accompaniment ${msg.accom}%`,
      });
      currentPosition.set(msg.position);
      applyGainLevels(msg.vocal, msg.accom);
      break;

    case "lyricsData":
      addLogMessage({
        direction: "tx",
        type: "lyrics",
        detail: `${msg.lyrics.length} lines`,
      });
      lyrics.set(msg.lyrics);
      break;

    case "initialState": {
      const g = positionToGains(msg.state.position);
      addLogMessage({
        direction: "tx",
        type: "init",
        detail: `vocal ${g.vocal}%, accompaniment ${g.accom}%`,
      });
      break;
    }
  }
}

export function send(msg: RxMessage): void {
  const payload = JSON.stringify(msg);

  if (mock) {
    mock.handleMessage(payload);
  } else if (ws?.readyState === WebSocket.OPEN) {
    ws.send(payload);
  } else {
    return;
  }

  if ("position" in msg) {
    const g = positionToGains(
      (msg as { type: string; position: number }).position,
    );
    addLogMessage({
      direction: "rx",
      type: "adjust",
      detail: `vocal ${g.vocal}%, accompaniment ${g.accom}%`,
    });
  } else {
    addLogMessage({ direction: "rx", type: msg.type });
  }
}
