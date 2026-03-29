<script lang="ts">
  import { isPlaying, addLogMessage } from "../lib/stores";
  import { togglePlayback, audioAvailable } from "../lib/audio";
  import { send } from "../lib/websocket";
  import AudioModal from "./AudioModal.svelte";

  let showModal = $state(false);
  let modalShown = false;

  async function handleClick() {
    const started = await togglePlayback();
    if (started) {
      send({ type: "enableSourceSdkPlayer", enabled: true });
      addLogMessage({ direction: "rx", type: "play" });
      if (!audioAvailable && !modalShown) {
        showModal = true;
        modalShown = true;
      }
    } else {
      addLogMessage({ direction: "rx", type: "pause" });
    }
  }
</script>

<AudioModal bind:show={showModal} onclose={() => {}} />

<div class="controls">
  <button class="play-btn" onclick={handleClick}>
    {#if $isPlaying}
      &#9646;&#9646;
    {:else}
      &#9654;
    {/if}
  </button>
</div>

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
</style>
