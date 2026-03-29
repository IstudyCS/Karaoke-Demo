<script lang="ts">
  let { show = $bindable(), onclose }: { show: boolean; onclose: () => void } =
    $props();

  function dismiss() {
    show = false;
    onclose();
  }
</script>

{#if show}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="overlay" onclick={dismiss}>
    <div class="modal" onclick={(e) => e.stopPropagation()}>
      <p class="title">Audio not available in online demo</p>
      <p class="body">
        The audio files are not included in this hosted version for copyright
        reasons. Everything else works — lyrics, progress bar, slider, and
        message log are all fully interactive.
      </p>
      <p class="body">
        To hear the full audio experience, clone the repo and add your own MP3s.
        See the
        <a
          href="https://github.com/IstudyCS/Karaoke-Demo#audio-files"
          target="_blank">README</a
        > for details.
      </p>
      <button class="ok-btn" onclick={dismiss}>Got it</button>
    </div>
  </div>
{/if}

<style>
  .overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    backdrop-filter: blur(4px);
  }
  .modal {
    background: #1e1e2e;
    border: 1px solid rgba(126, 184, 247, 0.25);
    border-radius: 16px;
    padding: 28px 32px;
    max-width: 400px;
    width: 90%;
    text-align: center;
  }
  .title {
    color: #f0c674;
    font-size: 15px;
    font-weight: 600;
    margin: 0 0 12px;
  }
  .body {
    color: #b0b8c8;
    font-size: 13px;
    line-height: 1.6;
    margin: 0 0 12px;
  }
  .body a {
    color: #7eb8f7;
    text-decoration: underline;
  }
  .ok-btn {
    margin-top: 8px;
    padding: 8px 32px;
    border-radius: 8px;
    background: rgba(126, 184, 247, 0.15);
    color: #7eb8f7;
    font-size: 14px;
    font-weight: 600;
    border: 1px solid rgba(126, 184, 247, 0.25) !important;
    cursor: pointer;
  }
  .ok-btn:hover {
    background: rgba(126, 184, 247, 0.25);
  }
</style>
