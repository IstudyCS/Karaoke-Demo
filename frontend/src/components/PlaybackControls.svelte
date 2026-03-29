<script lang="ts">
  import { isPlaying, addLogMessage, demoMode } from "../lib/stores";
  import { togglePlayback, audioAvailable } from "../lib/audio";
  import { send } from "../lib/websocket";

  let showToast = $state(false);
  let toastShown = false;

  async function handleClick() {
    const started = await togglePlayback();
    if (started) {
      send({ type: "enableSourceSdkPlayer", enabled: true });
      addLogMessage({ direction: "rx", type: "play" });

      if ($demoMode && !audioAvailable && !toastShown) {
        showToast = true;
        toastShown = true;
        setTimeout(() => (showToast = false), 6000);
      }
    } else {
      addLogMessage({ direction: "rx", type: "pause" });
    }
  }
</script>

<div class="controls">
  <button class="play-btn" onclick={handleClick}>
    {#if $isPlaying}
      &#9646;&#9646;
    {:else}
      &#9654;
    {/if}
  </button>
</div>

{#if showToast}
  <div class="toast" role="alert">
    Audio files are not included in the online demo.
    Run <a href="https://github.com/IstudyCS/Karaoke-Demo#quick-start-docker" target="_blank">locally</a> for full audio playback.
  </div>
{/if}

<style>
  .controls {
    display: flex;
    align-items: center;
    justify-content: center;
    padding-bottom: 4px;
  }
  .play-btn {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: rgba(126, 184, 247, 0.15);
    color: #7eb8f7;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    font-weight: 700;
    border: 1px solid rgba(126, 184, 247, 0.25) !important;
    backdrop-filter: blur(10px);
  }
  .play-btn:hover {
    background: rgba(126, 184, 247, 0.25);
    transform: scale(1.08);
  }
  .toast {
    position: fixed;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(30, 30, 40, 0.95);
    color: #f0c674;
    border: 1px solid rgba(240, 198, 116, 0.35);
    border-radius: 10px;
    padding: 12px 24px;
    font-size: 13px;
    line-height: 1.5;
    backdrop-filter: blur(12px);
    z-index: 100;
    animation: fadeIn 0.3s ease;
    max-width: 420px;
    text-align: center;
  }
  .toast a {
    color: #7eb8f7;
    text-decoration: underline;
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateX(-50%) translateY(10px); }
    to { opacity: 1; transform: translateX(-50%) translateY(0); }
  }
</style>
