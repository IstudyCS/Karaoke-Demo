<script lang="ts">
</script>

<div class="ws-bridge">
  <span class="ws-label down">RX</span>
  <div class="ws-arrows">
    <div class="ws-arrow-col down">
      <span class="arrow-icon">&#9662;</span>
      <span class="arrow-icon">&#9662;</span>
    </div>
    <div class="ws-arrow-col up">
      <span class="arrow-icon">&#9652;</span>
      <span class="arrow-icon">&#9652;</span>
    </div>
  </div>
  <span class="ws-label up">TX</span>
  <span class="ws-url">ws://localhost:9001</span>
</div>

<style>
  .ws-bridge {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    padding: 12px 0;
    background: rgba(255, 255, 255, 0.03);
    border-top: 1px solid rgba(255, 255, 255, 0.06);
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  }
  .ws-url {
    font-family: "SF Mono", "Fira Code", monospace;
    font-size: 11px;
    color: #6a6a80;
  }
  .ws-arrows {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .ws-arrow-col {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0;
  }
  .ws-arrow-col .arrow-icon {
    font-size: 18px;
    font-weight: 700;
    animation-duration: 1.8s;
    animation-iteration-count: infinite;
    opacity: 0;
  }
  .ws-arrow-col.down .arrow-icon {
    color: #7eb8f7;
    animation-name: flowDown;
  }
  .ws-arrow-col.down .arrow-icon:nth-child(1) {
    animation-delay: 0s;
  }
  .ws-arrow-col.down .arrow-icon:nth-child(2) {
    animation-delay: 0.25s;
  }
  .ws-arrow-col.up .arrow-icon {
    color: #f7a87e;
    animation-name: flowUp;
  }
  .ws-arrow-col.up .arrow-icon:nth-child(1) {
    animation-delay: 0.1s;
  }
  .ws-arrow-col.up .arrow-icon:nth-child(2) {
    animation-delay: 0.35s;
  }
  .ws-label {
    font-size: 10px;
    letter-spacing: 1px;
    text-transform: uppercase;
  }
  .ws-label.down {
    color: #7eb8f7;
  }
  .ws-label.up {
    color: #f7a87e;
  }

  @keyframes flowDown {
    0% {
      opacity: 0;
      transform: translateY(-5px);
    }
    40% {
      opacity: 1;
    }
    100% {
      opacity: 0;
      transform: translateY(5px);
    }
  }
  @keyframes flowUp {
    0% {
      opacity: 0;
      transform: translateY(5px);
    }
    40% {
      opacity: 1;
    }
    100% {
      opacity: 0;
      transform: translateY(-5px);
    }
  }
</style>
