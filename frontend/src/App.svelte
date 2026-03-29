<script lang="ts">
  import { onMount } from "svelte";
  import { connect } from "./lib/websocket";
  import ConnectionStatus from "./components/ConnectionStatus.svelte";
  import NowPlaying from "./components/NowPlaying.svelte";
  import ProgressBar from "./components/ProgressBar.svelte";
  import PlaybackControls from "./components/PlaybackControls.svelte";
  import WSBridge from "./components/WSBridge.svelte";
  import SlideSwitch from "./components/SlideSwitch.svelte";
  import MessageLog from "./components/MessageLog.svelte";

  onMount(() => {
    connect();
  });
</script>

<h1>Music App - Karaoke</h1>
<p class="subtitle">WebSocket-bridged Hybrid Architecture</p>
<ConnectionStatus />

<div class="page-layout">
  <div class="main-column">
    <div class="screen-inner">
      <div class="webapp-section">
        <div class="section-header">
          <span class="arch-label arch-webapp"
            >Webapp - WebView Sandbox (Svelte)</span
          >
        </div>
        <NowPlaying />
        <ProgressBar />
        <PlaybackControls />
      </div>

      <WSBridge />

      <div class="native-section">
        <div class="native-border-overlay"></div>
        <div class="section-header">
          <span class="arch-label arch-native"
            >Native UI - C++/Qt Simulation (Firmware)</span
          >
        </div>
        <SlideSwitch />
        <p class="native-note">
          In the real system, this slider is a <strong>VocalAccompanySlider</strong
          > Qt widget rendered by the firmware process (LyricsView). It communicates
          with the WebView sandbox via WebSocket through WebViewBridge &rarr; IPC
          Bus &rarr; AudioController &rarr; SourceController. Audio mixing happens
          in the webapp's SDK player.
        </p>
      </div>
    </div>
  </div>

  <MessageLog />
</div>

<style>
  h1 {
    font-size: 26px;
    font-weight: 600;
    margin-bottom: 4px;
    color: #fff;
  }
  .subtitle {
    color: #888;
    font-size: 14px;
    margin-bottom: 14px;
    letter-spacing: 0.5px;
  }

  .page-layout {
    width: 100%;
    max-width: 1500px;
    display: flex;
    gap: 24px;
    align-items: flex-start;
  }
  .main-column {
    flex: 1;
    min-width: 0;
    background: #181820;
    border: 1px solid #2a2a38;
    border-radius: 20px;
    padding: 4px;
    box-shadow:
      0 0 60px rgba(0, 0, 0, 0.5),
      inset 0 0 30px rgba(0, 0, 0, 0.15);
  }
  .screen-inner {
    background: #1a1a26;
    border-radius: 17px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .webapp-section {
    padding: 24px 28px 20px;
    border-bottom: 1px solid rgba(126, 184, 247, 0.15);
  }
  .section-header {
    margin-bottom: 16px;
  }
  .arch-label {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    padding: 4px 12px;
    border-radius: 6px;
    font-weight: 600;
  }
  .arch-webapp {
    color: #9acbff;
    background: rgba(126, 184, 247, 0.15);
    border: 1px solid rgba(126, 184, 247, 0.3);
  }
  .arch-native {
    color: #ffbe96;
    background: rgba(247, 168, 126, 0.15);
    border: 1px solid rgba(247, 168, 126, 0.3);
  }

  .native-section {
    padding: 20px 28px 24px;
    position: relative;
  }
  .native-border-overlay {
    position: absolute;
    top: 0;
    left: 12px;
    right: 12px;
    bottom: 0;
    border: 2px dashed rgba(247, 168, 126, 0.3);
    border-radius: 12px;
    pointer-events: none;
  }
  .native-note {
    font-size: 11px;
    color: #ffbe96;
    opacity: 0.6;
    margin-top: 16px;
    line-height: 1.6;
    border-top: 1px solid rgba(247, 168, 126, 0.15);
    padding-top: 12px;
  }

  @media (max-width: 900px) {
    .page-layout {
      flex-direction: column;
    }
  }
</style>
