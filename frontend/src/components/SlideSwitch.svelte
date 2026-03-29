<script lang="ts">
  import { currentPosition } from "../lib/stores";
  import { send } from "../lib/websocket";
  import { SLIDER_POSITIONS } from "../lib/protocol";

  const POSITION_LABELS: (string | null)[] = [
    null, null, null, null, "Original", null, null, null, null,
  ];

  function handleClick(pos: number) {
    currentPosition.set(pos);
    send({ type: "adjustVocalAndAccompanyVolume", position: pos });
  }

  function highlightLeft(pos: number): string {
    return `${(pos / SLIDER_POSITIONS) * 100}%`;
  }
</script>

<div class="slide-switch-wrapper">
  <div class="slide-switch-labels-row">
    <span>Vocal</span>
    <span class="center-label">Original</span>
    <span>Accompaniment</span>
  </div>
  <div class="slide-switch">
    <div
      class="slide-switch-highlight"
      style="left: {highlightLeft($currentPosition)}"
    ></div>
    {#each Array(SLIDER_POSITIONS) as _, i}
      <div
        class="slide-switch-pos"
        class:active={i === $currentPosition}
        onclick={() => handleClick(i)}
        role="button"
        tabindex="0"
        onkeydown={(e) => e.key === 'Enter' && handleClick(i)}
      >
        <div class="slide-switch-tick"></div>
        <div class="slide-switch-label">{POSITION_LABELS[i] || ""}</div>
      </div>
    {/each}
  </div>
</div>

<style>
  .slide-switch-wrapper {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }
  .slide-switch-labels-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    font-size: 14px;
    color: #aaa;
    font-weight: 500;
    position: relative;
    padding: 0 4px;
  }
  .slide-switch-labels-row .center-label {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    color: #bbb;
    font-weight: 600;
  }

  .slide-switch {
    display: flex;
    align-items: center;
    background: #1e1e2a;
    border-radius: 8px;
    padding: 0;
    height: 48px;
    position: relative;
    user-select: none;
    border: 1px solid #2e2e40;
  }
  .slide-switch-pos {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    cursor: pointer;
    position: relative;
    z-index: 1;
  }
  .slide-switch-tick {
    width: 2px;
    height: 14px;
    background: #4a4a5e;
    border-radius: 1px;
    transition: background 0.2s;
  }
  .slide-switch-pos:hover .slide-switch-tick {
    background: #7a7a90;
  }
  .slide-switch-pos.active .slide-switch-tick {
    display: none;
  }
  .slide-switch-label {
    display: none;
    font-size: 13px;
    font-weight: 600;
    color: #ddd;
  }
  .slide-switch-pos.active .slide-switch-label {
    display: block;
  }
  .slide-switch-highlight {
    position: absolute;
    top: 4px;
    bottom: 4px;
    width: calc(100% / 9);
    border-radius: 6px;
    background: #2e2e42;
    border: 1px solid #3e3e55;
    transition: left 0.2s ease;
    z-index: 0;
  }
</style>
