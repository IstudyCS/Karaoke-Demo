<script lang="ts">
  import { playbackTime, songDuration, addLogMessage } from "../lib/stores";
  import { seekTo } from "../lib/audio";
  import { send } from "../lib/websocket";
  import { derived } from "svelte/store";

  const progressPct = derived(
    [playbackTime, songDuration],
    ([$t, $d]) => ($d > 0 ? ($t / $d) * 100 : 0),
  );

  function fmt(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  function handleSeek(e: MouseEvent) {
    const bar = e.currentTarget as HTMLElement;
    const rect = bar.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const time = pct * $songDuration;
    seekTo(time);
    send({ type: "enableSourceSdkPlayer", enabled: true });
    addLogMessage({ direction: "rx", type: "seek", detail: fmt(time) });
  }
</script>

<div class="progress-wrapper">
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <div class="progress-bar" onclick={handleSeek} role="slider" tabindex="0" aria-valuenow={$playbackTime} aria-valuemin={0} aria-valuemax={$songDuration}>
    <div class="progress-fill" style="width: {$progressPct}%"></div>
  </div>
  <div class="progress-times">
    <span>{fmt($playbackTime)}</span>
    <span>{$songDuration > 0 ? fmt($songDuration) : "--:--"}</span>
  </div>
</div>

<style>
  .progress-wrapper {
    margin-bottom: 20px;
  }
  .progress-bar {
    width: 100%;
    height: 4px;
    background: #2a2a3a;
    border-radius: 2px;
    overflow: hidden;
    cursor: pointer;
  }
  .progress-fill {
    height: 100%;
    width: 0%;
    border-radius: 2px;
    background: linear-gradient(90deg, #5a9fd4, #7eb8f7);
    transition: width 0.1s linear;
  }
  .progress-times {
    display: flex;
    justify-content: space-between;
    font-size: 11px;
    color: #6a6a80;
    margin-top: 6px;
  }
</style>
