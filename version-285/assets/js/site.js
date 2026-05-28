(() => {
  const menuButton = document.querySelector('[data-menu-toggle]');
  const mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', () => {
      mobilePanel.classList.toggle('is-open');
    });
  }

  const hero = document.querySelector('[data-hero]');

  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    const previous = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    let current = 0;
    let timer = null;

    const showSlide = (index) => {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach((slide, slideIndex) => {
        slide.classList.toggle('is-active', slideIndex === current);
      });

      dots.forEach((dot, dotIndex) => {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    };

    const startTimer = () => {
      timer = window.setInterval(() => {
        showSlide(current + 1);
      }, 5200);
    };

    const restartTimer = () => {
      window.clearInterval(timer);
      startTimer();
    };

    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        showSlide(index);
        restartTimer();
      });
    });

    if (previous) {
      previous.addEventListener('click', () => {
        showSlide(current - 1);
        restartTimer();
      });
    }

    if (next) {
      next.addEventListener('click', () => {
        showSlide(current + 1);
        restartTimer();
      });
    }

    showSlide(0);
    startTimer();
  }

  const normalize = (value) => String(value || '').trim().toLowerCase();

  const applyFilter = (input, list) => {
    const query = normalize(input.value);
    const cards = Array.from(list.querySelectorAll('.movie-card'));
    let visible = 0;

    cards.forEach((card) => {
      const haystack = normalize([
        card.dataset.title,
        card.dataset.tags,
        card.dataset.genre,
        card.dataset.region,
        card.dataset.year,
        card.textContent,
      ].join(' '));
      const matched = !query || haystack.includes(query);
      card.style.display = matched ? '' : 'none';
      if (matched) {
        visible += 1;
      }
    });

    const emptyState = document.querySelector('[data-empty-state]');
    if (emptyState) {
      emptyState.classList.toggle('is-visible', visible === 0);
    }
  };

  const filterInput = document.querySelector('[data-card-filter]');
  const cardList = document.querySelector('[data-card-list]');

  if (filterInput && cardList) {
    filterInput.addEventListener('input', () => applyFilter(filterInput, cardList));
    applyFilter(filterInput, cardList);
  }

  const globalSearch = document.querySelector('[data-global-search]');

  if (globalSearch && cardList) {
    const params = new URLSearchParams(window.location.search);
    const query = params.get('q') || '';
    globalSearch.value = query;
    globalSearch.addEventListener('input', () => applyFilter(globalSearch, cardList));
    applyFilter(globalSearch, cardList);
  }

  const attachStream = (video, streamUrl) => {
    if (video.dataset.ready === '1') {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      video.dataset.ready = '1';
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      const hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      video.dataset.ready = '1';
      return;
    }

    video.src = streamUrl;
    video.dataset.ready = '1';
  };

  document.querySelectorAll('.player').forEach((player) => {
    const video = player.querySelector('video');
    const overlay = player.querySelector('.player-overlay');
    const streamUrl = player.dataset.stream;

    if (!video || !streamUrl) {
      return;
    }

    const play = () => {
      attachStream(video, streamUrl);
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {});
      }
    };

    if (overlay) {
      overlay.addEventListener('click', play);
    }

    video.addEventListener('click', () => {
      if (video.paused) {
        play();
      }
    });

    video.addEventListener('play', () => {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    });
  });
})();
