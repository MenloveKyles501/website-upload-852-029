(function () {
  var players = Array.prototype.slice.call(document.querySelectorAll('.js-player'));

  players.forEach(function (box) {
    var video = box.querySelector('.movie-video');
    var button = box.querySelector('.play-action');
    var message = box.querySelector('.player-message');
    var streamUrl = video ? video.getAttribute('data-stream') : '';
    var hlsInstance = null;
    var prepared = false;

    var setMessage = function (text) {
      if (message) {
        message.textContent = text || '';
      }
    };

    var prepare = function () {
      if (!video || prepared || !streamUrl) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
        prepared = true;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setMessage('播放暂时不可用，请稍后再试');
          }
        });
        prepared = true;
        return;
      }

      setMessage('播放暂时不可用，请稍后再试');
    };

    var start = function () {
      prepare();

      if (!video) {
        return;
      }

      var playRequest = video.play();
      box.classList.add('is-playing');
      video.setAttribute('controls', 'controls');

      if (playRequest && typeof playRequest.catch === 'function') {
        playRequest.catch(function () {
          box.classList.remove('is-playing');
          setMessage('点击播放按钮继续观看');
        });
      }
    };

    if (button) {
      button.addEventListener('click', start);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          start();
        } else {
          video.pause();
        }
      });

      video.addEventListener('play', function () {
        box.classList.add('is-playing');
        setMessage('');
      });

      video.addEventListener('pause', function () {
        if (video.currentTime === 0 || video.ended) {
          box.classList.remove('is-playing');
        }
      });
    }

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
})();
