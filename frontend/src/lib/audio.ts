import { get } from "svelte/store";
import { isPlaying, playbackTime, songDuration, addLogMessage } from "./stores";

let audioCtx: AudioContext | null = null;
let vocalGain: GainNode | null = null;
let accomGain: GainNode | null = null;
let vocalSource: AudioBufferSourceNode | null = null;
let accomSource: AudioBufferSourceNode | null = null;
let vocalBuffer: AudioBuffer | null = null;
let instrBuffer: AudioBuffer | null = null;
let playStartTime = 0;
let animFrameId: number | null = null;
let audioAvailable = false;

const VOCAL_URL = "./vocal.mp3";
const INSTRUMENTAL_URL = "./instrumental.mp3";
const FALLBACK_DURATION = 30;

async function initAudio(): Promise<void> {
  audioCtx = new AudioContext();
  vocalGain = audioCtx.createGain();
  accomGain = audioCtx.createGain();
  vocalGain.connect(audioCtx.destination);
  accomGain.connect(audioCtx.destination);

  try {
    const [vocalResp, instrResp] = await Promise.all([
      fetch(VOCAL_URL),
      fetch(INSTRUMENTAL_URL),
    ]);

    if (!vocalResp.ok || !instrResp.ok) throw new Error("HTTP error");

    const [vBuf, iBuf] = await Promise.all([
      vocalResp.arrayBuffer().then((b) => audioCtx!.decodeAudioData(b)),
      instrResp.arrayBuffer().then((b) => audioCtx!.decodeAudioData(b)),
    ]);

    vocalBuffer = vBuf;
    instrBuffer = iBuf;
    songDuration.set(vBuf.duration);
    audioAvailable = true;
  } catch {
    songDuration.set(FALLBACK_DURATION);
    audioAvailable = false;
    addLogMessage({
      direction: "rx",
      type: "audio",
      detail: "files not found — visual-only mode",
    });
  }
}

function startPlaybackFrom(offset: number = 0): void {
  if (!audioCtx) return;

  if (vocalSource) vocalSource.onended = null;
  if (accomSource) accomSource.onended = null;
  try { vocalSource?.stop(); } catch { /* already stopped */ }
  try { accomSource?.stop(); } catch { /* already stopped */ }
  if (animFrameId) cancelAnimationFrame(animFrameId);

  if (audioAvailable && vocalBuffer && instrBuffer) {
    vocalSource = audioCtx.createBufferSource();
    vocalSource.buffer = vocalBuffer;
    vocalSource.connect(vocalGain!);

    accomSource = audioCtx.createBufferSource();
    accomSource.buffer = instrBuffer;
    accomSource.connect(accomGain!);

    vocalSource.onended = () => {
      if (get(isPlaying)) stopPlayback();
    };

    vocalSource.start(0, offset);
    accomSource.start(0, offset);
  }

  playStartTime = audioCtx.currentTime - offset;
  isPlaying.set(true);

  const duration = get(songDuration);
  function tick() {
    if (!get(isPlaying)) return;
    const elapsed = Math.min(audioCtx!.currentTime - playStartTime, duration);
    playbackTime.set(elapsed);
    if (elapsed >= duration) {
      stopPlayback();
      return;
    }
    animFrameId = requestAnimationFrame(tick);
  }
  tick();
}

function stopPlayback(): void {
  try { vocalSource?.stop(); } catch { /* already stopped */ }
  try { accomSource?.stop(); } catch { /* already stopped */ }
  isPlaying.set(false);
  if (animFrameId) cancelAnimationFrame(animFrameId);
}

/**
 * Toggle audio playback. Returns true if playback started, false if stopped.
 */
export async function togglePlayback(): Promise<boolean> {
  if (!audioCtx) {
    await initAudio();
    startPlaybackFrom(0);
    return true;
  } else if (get(isPlaying)) {
    stopPlayback();
    return false;
  } else {
    startPlaybackFrom(0);
    return true;
  }
}

/**
 * Seek to a specific time (in seconds). Resumes playback from that position.
 */
export async function seekTo(time: number): Promise<void> {
  if (!audioCtx) {
    await initAudio();
  }
  const clampedTime = Math.max(0, Math.min(time, get(songDuration)));
  startPlaybackFrom(clampedTime);
}

export function applyGainLevels(vocal: number, accom: number): void {
  if (vocalGain && accomGain && audioCtx) {
    vocalGain.gain.setTargetAtTime(vocal / 100, audioCtx.currentTime, 0.05);
    accomGain.gain.setTargetAtTime(accom / 100, audioCtx.currentTime, 0.05);
  }
}
