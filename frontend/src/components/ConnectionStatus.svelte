<script lang="ts">
  import { connectionStatus, demoMode, audioAvailable } from "../lib/stores";
</script>

{#if $demoMode}
  <div class="status demo">
    <strong>Live Demo</strong> — backend simulated in-browser.
    {#if !$audioAvailable}
      Audio files are not included (copyright). Press play to see lyrics sync, progress bar, and slider — all functional without sound.
    {/if}
    <a href="https://github.com/IstudyCS/Karaoke-Demo#quick-start-docker" target="_blank">Run locally</a> for the full experience with audio + real C++ WebSocket backend.
  </div>
{:else}
  <div class="status" class:connected={$connectionStatus === "connected"} class:disconnected={$connectionStatus !== "connected"}>
    {$connectionStatus === "connected"
      ? "Connected to firmware"
      : $connectionStatus === "connecting"
        ? "Connecting..."
        : "Disconnected - restart server"}
  </div>
{/if}

<style>
  .status {
    font-size: 11px;
    padding: 3px 12px;
    border-radius: 10px;
    margin-bottom: 16px;
  }
  .connected {
    color: #66d96a;
    background: rgba(76, 175, 80, 0.14);
    border: 1px solid rgba(76, 175, 80, 0.35);
  }
  .disconnected {
    color: #ff6b5e;
    background: rgba(244, 67, 54, 0.14);
    border: 1px solid rgba(244, 67, 54, 0.35);
  }
  .demo {
    color: #c0c0d0;
    background: rgba(240, 198, 116, 0.06);
    border: 1px solid rgba(240, 198, 116, 0.25);
    padding: 8px 16px;
    line-height: 1.7;
    font-size: 11.5px;
  }
  .demo strong {
    color: #f0c674;
  }
  .demo a {
    color: #7eb8f7;
    text-decoration: underline;
  }
</style>
