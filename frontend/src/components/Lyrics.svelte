<script lang="ts">
  import { lyrics, playbackTime } from "../lib/stores";
  import { derived } from "svelte/store";
  import type { LyricLine } from "../lib/protocol";

  const activeIndex = derived(
    [lyrics, playbackTime],
    ([$lyrics, $time]) => {
      const ms = $time * 1000;
      let idx = -1;
      for (let i = $lyrics.length - 1; i >= 0; i--) {
        if (ms >= $lyrics[i].time && $lyrics[i].text) {
          idx = i;
          break;
        }
      }
      return idx;
    },
  );

  function findTextLine(lyr: LyricLine[], from: number, dir: number): string {
    for (let i = from; i >= 0 && i < lyr.length; i += dir) {
      if (lyr[i].text) return lyr[i].text;
    }
    return "";
  }

  const prevLine = derived(
    [lyrics, activeIndex],
    ([$l, $idx]) => ($idx > 0 ? findTextLine($l, $idx - 1, -1) : ""),
  );
  const currentLine = derived(
    [lyrics, activeIndex],
    ([$l, $idx]) => ($idx >= 0 ? $l[$idx].text : ""),
  );
  const nextLine = derived(
    [lyrics, activeIndex],
    ([$l, $idx]) => ($idx >= 0 ? findTextLine($l, $idx + 1, 1) : ""),
  );
</script>

<div class="lyrics-container">
  <div class="lyric-line past">{$prevLine}</div>
  <div class="lyric-line active">{$currentLine}</div>
  <div class="lyric-line">{$nextLine}</div>
</div>

<style>
  .lyrics-container {
    min-height: 120px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 12px 0 20px;
  }
  .lyric-line {
    font-size: 16px;
    color: #5a5a70;
    padding: 2px 0;
    transition: all 0.35s ease;
    text-align: center;
    line-height: 1.5;
    min-height: 1.5em;
  }
  .lyric-line.active {
    color: #fff;
    font-size: 22px;
    font-weight: 500;
    text-shadow: 0 0 40px rgba(126, 184, 247, 0.4);
  }
  .lyric-line.past {
    color: #6a6a7e;
    font-size: 15px;
  }
</style>
