<script lang="ts">
  import { connectionStatus, demoMode } from "../lib/stores";
</script>

{#if $demoMode}
  <div class="status demo">
    Demo Mode — backend simulated in-browser.
    <a href="https://github.com/IstudyCS/karaoke-demo#quick-start-docker" target="_blank">Run locally</a> for the full WebSocket experience.
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
    color: #f0c674;
    background: rgba(240, 198, 116, 0.1);
    border: 1px solid rgba(240, 198, 116, 0.3);
    padding: 6px 16px;
    line-height: 1.6;
  }
  .demo a {
    color: #7eb8f7;
    text-decoration: underline;
  }
</style>
