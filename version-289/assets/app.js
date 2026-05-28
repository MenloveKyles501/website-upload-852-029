(function () {
  const navToggle = document.querySelector('.nav-toggle');
  const siteNav = document.querySelector('.site-nav');

  if (navToggle && siteNav) {
    navToggle.addEventListener('click', function () {
      siteNav.classList.toggle('is-open');
    });
  }

  const slider = document.querySelector('[data-hero-slider]');

  if (slider) {
    const slides = Array.from(slider.querySelectorAll('.hero-slide'));
    const dots = Array.from(document.querySelectorAll('[data-hero-dot]'));
    let current = 0;

    const showSlide = function (index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    };

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }
  }

  document.querySelectorAll('[data-filter-set]').forEach(function (panel) {
    const grid = document.querySelector(panel.getAttribute('data-filter-set'));
    if (!grid) {
      return;
    }

    const cards = Array.from(grid.querySelectorAll('.movie-card'));
    const search = panel.querySelector('[data-search]');
    const typeFilter = panel.querySelector('[data-type-filter]');
    const yearFilter = panel.querySelector('[data-year-filter]');
    const channelFilter = panel.querySelector('[data-channel-filter]');
    const empty = document.querySelector(panel.getAttribute('data-empty-target'));
    const urlQuery = new URLSearchParams(window.location.search).get('q');

    if (search && urlQuery && !search.value) {
      search.value = urlQuery;
    }

    const normalize = function (value) {
      return String(value || '').trim().toLowerCase();
    };

    const apply = function () {
      const query = normalize(search ? search.value : '');
      const typeValue = normalize(typeFilter ? typeFilter.value : '');
      const yearValue = normalize(yearFilter ? yearFilter.value : '');
      const channelValue = normalize(channelFilter ? channelFilter.value : '');
      let visible = 0;

      cards.forEach(function (card) {
        const haystack = normalize(card.getAttribute('data-keywords'));
        const type = normalize(card.getAttribute('data-type'));
        const year = normalize(card.getAttribute('data-year'));
        const channel = normalize(card.getAttribute('data-channel'));
        const matched = (!query || haystack.indexOf(query) !== -1) &&
          (!typeValue || type === typeValue) &&
          (!yearValue || year === yearValue) &&
          (!channelValue || channel === channelValue);

        card.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    };

    [search, typeFilter, yearFilter, channelFilter].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });

    apply();
  });

  const playerConfig = document.getElementById('player-options');
  const video = document.getElementById('movieVideo');
  const overlay = document.getElementById('playOverlay');

  if (playerConfig && video && overlay) {
    let options = null;

    try {
      options = JSON.parse(playerConfig.textContent || '{}');
    } catch (error) {
      options = null;
    }

    if (options && options.url) {
      const attachVideo = function () {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = options.url;
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          const hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(options.url);
          hls.attachMedia(video);
          return;
        }

        video.src = options.url;
      };

      const startVideo = function () {
        overlay.classList.add('is-hidden');
        video.controls = true;
        const playTask = video.play();

        if (playTask && typeof playTask.catch === 'function') {
          playTask.catch(function () {
            overlay.classList.remove('is-hidden');
          });
        }
      };

      attachVideo();

      overlay.addEventListener('click', function (event) {
        event.preventDefault();
        startVideo();
      });

      video.addEventListener('click', function () {
        if (video.paused) {
          startVideo();
        }
      });

      video.addEventListener('play', function () {
        overlay.classList.add('is-hidden');
      });
    }
  }
}());
