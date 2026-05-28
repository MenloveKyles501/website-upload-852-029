import { H as Hls } from "./hls.js";

export function initStaticPlayer(options) {
  var video = document.getElementById(options.videoId);
  var button = document.getElementById(options.buttonId);
  var hls = null;
  var loaded = false;

  if (!video || !button || !options.source) {
    return;
  }

  function showMessage(message) {
    button.classList.remove("is-loading");
    button.innerHTML = "<strong>" + message + "</strong>";
  }

  function loadSource() {
    if (loaded) {
      return Promise.resolve();
    }

    loaded = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = options.source;
      return Promise.resolve();
    }

    if (Hls && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });

      hls.loadSource(options.source);
      hls.attachMedia(video);

      hls.on(Hls.Events.ERROR, function (eventName, data) {
        if (!data || !data.fatal) {
          return;
        }

        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          hls.startLoad();
          return;
        }

        if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
          return;
        }

        showMessage("播放暂不可用");
      });

      return Promise.resolve();
    }

    showMessage("播放暂不可用");
    return Promise.reject(new Error("HLS unavailable"));
  }

  function startPlayback() {
    button.classList.add("is-loading");

    loadSource()
      .then(function () {
        return video.play();
      })
      .then(function () {
        button.classList.remove("is-loading");
        button.classList.add("is-hidden");
      })
      .catch(function () {
        button.classList.remove("is-loading");
      });
  }

  function toggleVideo() {
    if (!loaded) {
      startPlayback();
      return;
    }

    if (video.paused) {
      video.play();
      return;
    }

    video.pause();
  }

  button.addEventListener("click", startPlayback);
  video.addEventListener("click", toggleVideo);

  video.addEventListener("play", function () {
    button.classList.add("is-hidden");
  });

  video.addEventListener("pause", function () {
    if (video.currentTime > 0 && !video.ended) {
      button.classList.remove("is-hidden");
    }
  });

  window.addEventListener("pagehide", function () {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });
}
