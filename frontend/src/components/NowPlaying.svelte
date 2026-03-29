<script lang="ts">
</script>

<div class="now-playing">
  <div class="album-art">&#9835;</div>
  <div class="track-info">
    <div class="track-title">Winning</div>
    <div class="track-artist">NEFFEX</div>
  </div>
</div>

<style>
  .now-playing {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 20px;
  }
  .album-art {
    width: 72px;
    height: 72px;
    border-radius: 14px;
    background: linear-gradient(135deg, #222240, #2e2e52);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 30px;
    flex-shrink: 0;
    border: 1px solid rgba(126, 184, 247, 0.18);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  }
  .track-info {
    flex: 1;
    min-width: 0;
  }
  .track-title {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 3px;
  }
  .track-artist {
    font-size: 13px;
    color: #8888a0;
  }
</style>
