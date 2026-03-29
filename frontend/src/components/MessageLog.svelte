<script lang="ts">
  import { logMessages } from "../lib/stores";
  import { tick } from "svelte";

  let logContainer: HTMLDivElement;

  $effect(() => {
    if ($logMessages.length) {
      tick().then(() => {
        if (logContainer) {
          logContainer.scrollTop = logContainer.scrollHeight;
        }
      });
    }
  });
</script>

<div class="log-panel">
  <div class="log-header">WebSocket Messages</div>
  <div class="log-entries" bind:this={logContainer}>
    {#each $logMessages as entry}
      <div class="log-entry" class:rx={entry.direction === "rx"} class:tx={entry.direction === "tx"}>
        <span class="log-ts">{entry.timestamp}</span>
        <span class="log-dir">
          {entry.direction === "rx"
            ? "\u2192 webapp to firmware"
            : "\u2190 firmware to webapp"}
        </span>
        {entry.type}{entry.detail ? ` - ${entry.detail}` : ""}
      </div>
    {/each}
  </div>
</div>

<style>
  .log-panel {
    width: 560px;
    flex-shrink: 0;
    background: #141420;
    border: 1px solid #252535;
    border-radius: 16px;
    padding: 16px;
    max-height: calc(100vh - 80px);
    display: flex;
    flex-direction: column;
    box-shadow: 0 0 40px rgba(0, 0, 0, 0.35);
  }
  .log-header {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    color: #7a7a90;
    margin-bottom: 10px;
    font-weight: 600;
  }
  .log-entries {
    font-family: "SF Mono", "Fira Code", monospace;
    font-size: 12px;
    line-height: 2.2;
    overflow-y: auto;
    color: #7a7a90;
    flex: 1;
  }
  .log-entries::-webkit-scrollbar {
    width: 3px;
  }
  .log-entries::-webkit-scrollbar-thumb {
    background: #3a3a4e;
    border-radius: 2px;
  }
  .log-entry.rx {
    color: #9acbff;
  }
  .log-entry.tx {
    color: #ffbe96;
  }
  .log-ts {
    color: #555568;
    margin-right: 6px;
  }
  .log-dir {
    font-weight: 600;
    margin-right: 4px;
  }

  @media (max-width: 900px) {
    .log-panel {
      width: 100%;
      max-height: 200px;
    }
  }
</style>
