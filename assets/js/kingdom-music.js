(() => {
  if (window.KINGDOM_MUSIC_CONTROL_READY) return;
  window.KINGDOM_MUSIC_CONTROL_READY = true;

  const script = document.currentScript;
  const musicSrc = script?.dataset.musicSrc || "assets/sounds/tunetank-medieval-happy-music-412790.mp3";
  const keys = {
    enabled: "kingdomMusicEnabled",
    volume: "kingdomMusicVolume",
    narratorVolume: "kingdomNarratorVolume",
    time: "kingdomMusicTime"
  };

  let desired = localStorage.getItem(keys.enabled) === "true";
  let isPlaying = false;
  let lastTimeSave = 0;

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function storedVolume() {
    const value = Number(localStorage.getItem(keys.volume));
    return Number.isFinite(value) ? clamp(value, 0, 1) : 0.45;
  }

  function storedNarratorVolume() {
    const value = Number(localStorage.getItem(keys.narratorVolume));
    return Number.isFinite(value) ? clamp(value, 0, 1) : 0.45;
  }

  window.KINGDOM_NARRATOR_VOLUME = storedNarratorVolume;

  function createStyle() {
    if (document.getElementById("kingdomMusicStyle")) return;
    const style = document.createElement("style");
    style.id = "kingdomMusicStyle";
    style.textContent = `
      .kingdom-music-control {
        position: fixed;
        right: 18px;
        bottom: 18px;
        z-index: 9999;
        display: grid;
        grid-template-columns: auto 120px 120px;
        gap: 8px;
        align-items: center;
        padding: 9px;
        border: 3px solid #6f2a14;
        border-radius: 8px;
        background: rgba(255, 244, 202, 0.96);
        color: #4d1f08;
        font-family: "Trebuchet MS", Arial, sans-serif;
        box-shadow: 0 6px 0 #9b4317, 0 12px 22px rgba(51, 20, 5, 0.24);
      }

      .kingdom-music-button {
        min-height: 40px;
        border: 3px solid #6f2a14;
        border-radius: 8px;
        padding: 7px 12px;
        background: linear-gradient(180deg, #fff0a6, #ffbd37);
        color: #4d1f08;
        font: inherit;
        font-size: 14px;
        font-weight: 900;
        cursor: pointer;
        box-shadow: 0 4px 0 #9b4317;
      }

      .kingdom-music-button.is-playing {
        background: linear-gradient(180deg, #94ff9e, #21b85a);
        color: #083b1d;
      }

      .kingdom-music-button.needs-tap {
        background: linear-gradient(180deg, #dff2ff, #83c8ff);
      }

      .kingdom-volume {
        display: grid;
        gap: 3px;
        min-width: 0;
      }

      .kingdom-volume label {
        font-size: 11px;
        font-weight: 900;
        text-transform: uppercase;
      }

      .kingdom-volume input {
        width: 120px;
        accent-color: #2ea55f;
      }

      @media (max-width: 620px) {
        .kingdom-music-control {
          left: 8px;
          right: 8px;
          bottom: max(8px, env(safe-area-inset-bottom));
          grid-template-columns: auto minmax(72px, 1fr) minmax(72px, 1fr);
          gap: 6px;
          padding: 6px;
          border-width: 2px;
          box-shadow: 0 4px 0 #9b4317, 0 8px 18px rgba(51, 20, 5, 0.22);
        }

        .kingdom-music-button {
          min-height: 34px;
          padding: 5px 8px;
          border-width: 2px;
          font-size: 12px;
          box-shadow: 0 3px 0 #9b4317;
          white-space: nowrap;
        }

        .kingdom-volume {
          gap: 1px;
        }

        .kingdom-volume label {
          font-size: 9px;
        }

        .kingdom-volume input {
          width: 100%;
          min-width: 0;
        }
      }
    `;
    document.head.append(style);
  }

  function createControl() {
    const audio = document.createElement("audio");
    audio.id = "kingdomBackgroundMusic";
    audio.src = musicSrc;
    audio.preload = "auto";
    audio.loop = true;
    audio.volume = storedVolume();

    const savedTime = Number(localStorage.getItem(keys.time));
    audio.addEventListener("loadedmetadata", () => {
      if (Number.isFinite(savedTime) && savedTime > 0 && Number.isFinite(audio.duration) && audio.duration > 0) {
        audio.currentTime = savedTime % audio.duration;
      }
    }, { once: true });

    const control = document.createElement("div");
    control.className = "kingdom-music-control";
    control.innerHTML = `
      <button class="kingdom-music-button" type="button" aria-pressed="false">Music: Off</button>
      <div class="kingdom-volume">
        <label for="kingdomMusicVolume">Volume</label>
        <input id="kingdomMusicVolume" type="range" min="0" max="100" step="1" value="${Math.round(audio.volume * 100)}" aria-label="Music volume">
      </div>
      <div class="kingdom-volume">
        <label for="kingdomNarratorVolume">Narrator</label>
        <input id="kingdomNarratorVolume" type="range" min="0" max="100" step="1" value="${Math.round(storedNarratorVolume() * 100)}" aria-label="Narrator volume">
      </div>
    `;

    document.body.append(audio, control);
    return {
      audio,
      button: control.querySelector(".kingdom-music-button"),
      musicSlider: control.querySelector("#kingdomMusicVolume"),
      narratorSlider: control.querySelector("#kingdomNarratorVolume")
    };
  }

  function boot() {
    createStyle();
    const { audio, button, musicSlider, narratorSlider } = createControl();

    function saveTime(force = false) {
      const now = Date.now();
      if (!force && now - lastTimeSave < 900) return;
      lastTimeSave = now;
      if (Number.isFinite(audio.currentTime)) {
        localStorage.setItem(keys.time, String(audio.currentTime));
      }
    }

    function updateButton() {
      button.classList.toggle("is-playing", desired && isPlaying);
      button.classList.toggle("needs-tap", desired && !isPlaying);
      button.textContent = desired ? (isPlaying ? "Music: On" : "Music: Tap") : "Music: Off";
      button.setAttribute("aria-pressed", String(desired));
    }

    async function start() {
      desired = true;
      localStorage.setItem(keys.enabled, "true");
      try {
        await audio.play();
        isPlaying = true;
      } catch (error) {
        isPlaying = false;
      }
      updateButton();
    }

    function stop() {
      desired = false;
      localStorage.setItem(keys.enabled, "false");
      saveTime(true);
      audio.pause();
      isPlaying = false;
      updateButton();
    }

    function resumeAfterGesture() {
      if (desired && audio.paused) start();
    }

    button.addEventListener("click", () => {
      if (desired && !audio.paused) {
        stop();
      } else {
        start();
      }
    });

    musicSlider.addEventListener("input", () => {
      const volume = clamp(Number(musicSlider.value) / 100, 0, 1);
      audio.volume = volume;
      localStorage.setItem(keys.volume, String(volume));
    });

    narratorSlider.addEventListener("input", () => {
      const volume = clamp(Number(narratorSlider.value) / 100, 0, 1);
      localStorage.setItem(keys.narratorVolume, String(volume));
      window.dispatchEvent(new CustomEvent("kingdom:narrator-volume", { detail: { volume } }));
    });

    audio.addEventListener("play", () => {
      isPlaying = true;
      updateButton();
    });

    audio.addEventListener("pause", () => {
      isPlaying = false;
      saveTime(true);
      updateButton();
    });

    audio.addEventListener("timeupdate", () => saveTime(false));
    window.addEventListener("beforeunload", () => saveTime(true));
    document.addEventListener("pointerdown", resumeAfterGesture, { passive: true });
    document.addEventListener("keydown", resumeAfterGesture);
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) saveTime(true);
      if (!document.hidden && desired) start();
    });

    updateButton();
    if (desired) start();
  }

  if (document.body) {
    boot();
  } else {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  }
})();
