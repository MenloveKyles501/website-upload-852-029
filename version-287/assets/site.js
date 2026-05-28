
(function () {
  const data = window.SITE_MOVIES || [];

  function qs(sel, root = document) { return root.querySelector(sel); }
  function qsa(sel, root = document) { return Array.from(root.querySelectorAll(sel)); }
  function svgPoster(movie) {
    const title = (movie.title || '').slice(0, 12);
    const region = movie.region || '';
    const genre = (movie.genre || '').slice(0, 18);
    const year = movie.year || '';
    const id = movie.id || '';
    const seed = (movie.title || '') + id;
    let hash = 0;
    for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
    const a = ['#0f172a','#111827','#1f2937','#312e81','#4c1d95','#7c2d12','#9f1239','#0f766e','#1d4ed8'][hash % 9];
    const b = ['#fb7185','#fb923c','#f59e0b','#f472b6','#38bdf8','#34d399','#a78bfa','#fda4af','#fde68a'][(hash >> 3) % 9];
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 720"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${a}"/><stop offset="100%" stop-color="${b}"/></linearGradient><radialGradient id="r" cx="28%" cy="18%" r="90%"><stop offset="0%" stop-color="#fff" stop-opacity="0.28"/><stop offset="100%" stop-color="#fff" stop-opacity="0"/></radialGradient></defs><rect width="480" height="720" rx="36" fill="url(#g)"/><rect width="480" height="720" rx="36" fill="url(#r)"/><circle cx="386" cy="118" r="104" fill="#fff" opacity="0.08"/><circle cx="90" cy="618" r="142" fill="#fff" opacity="0.06"/><path d="M0 550 C110 470, 250 670, 480 500 L480 720 L0 720 Z" fill="#000" opacity="0.18"/><text x="34" y="76" fill="#fff" font-family="Arial, PingFang SC, Microsoft YaHei, sans-serif" font-size="28" font-weight="700" opacity="0.92">${id}</text><text x="34" y="138" fill="#fff" font-family="Arial, PingFang SC, Microsoft YaHei, sans-serif" font-size="22" font-weight="600" opacity="0.88">${year}</text><text x="34" y="536" fill="#fff" font-family="Arial, PingFang SC, Microsoft YaHei, sans-serif" font-size="38" font-weight="800">${title}</text><text x="34" y="592" fill="#fff" font-family="Arial, PingFang SC, Microsoft YaHei, sans-serif" font-size="20" opacity="0.86">${region}</text><text x="34" y="628" fill="#fff" font-family="Arial, PingFang SC, Microsoft YaHei, sans-serif" font-size="18" opacity="0.8">${genre}</text><text x="34" y="678" fill="#fff" font-family="Arial, PingFang SC, Microsoft YaHei, sans-serif" font-size="16" opacity="0.75">站内热度 ${movie.score || ''}</text></svg>`;
    return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
  }

  function card(movie) {
    const title = movie.title || '';
    const year = movie.year ? String(movie.year) : '';
    const meta = [movie.region, movie.type, movie.genre].filter(Boolean).join(' · ');
    const tags = (movie.tags || '').split(/[、,，\s]+/).filter(Boolean).slice(0, 3).map(t => `<span class="badge">${t}</span>`).join('');
    return `
      <article class="movie-card">
        <a href="${movie.url}" aria-label="${title}">
          <div class="poster" style="background-image:url('${svgPoster(movie)}')"><span class="poster-badge">${movie.score || ''}</span></div>
          <div class="card-body">
            <h3 class="card-title">${title}</h3>
            <div class="card-meta"><span>${year}</span><span>${meta}</span></div>
            <div class="card-desc">${movie.one_line || ''}</div>
            <div class="card-actions"><span class="btn btn-secondary">详情</span></div>
            <div class="tags">${tags}</div>
          </div>
        </a>
      </article>`;
  }

  function openNav() {
    const navToggle = qs('[data-nav-toggle]');
    const navLinks = qs('[data-nav-links]');
    if (!navToggle || !navLinks) return;
    navToggle.addEventListener('click', () => navLinks.classList.toggle('open'));
  }

  function initHeroSlider() {
    const slides = qsa('[data-hero-slide]');
    if (!slides.length) return;
    let idx = 0;
    const show = (n) => {
      idx = (n + slides.length) % slides.length;
      slides.forEach((s, i) => s.classList.toggle('active', i === idx));
    };
    const prev = qs('[data-hero-prev]');
    const next = qs('[data-hero-next]');
    prev && prev.addEventListener('click', () => show(idx - 1));
    next && next.addEventListener('click', () => show(idx + 1));
    setInterval(() => show(idx + 1), 5000);
    show(0);
  }

  function initSearch() {
    const input = qs('[data-search-input]');
    const target = qs('[data-search-results]');
    if (!input || !target || !data.length) return;
    const hint = qs('[data-search-hint]');
    const render = (list) => {
      target.innerHTML = list.slice(0, 48).map(card).join('') || '<div class="notice">没有找到匹配结果。</div>';
      if (hint) hint.textContent = `已显示 ${Math.min(list.length, 48)} 条 / 共 ${list.length} 条`;
    };
    input.addEventListener('input', () => {
      const q = input.value.trim().toLowerCase();
      if (!q) { render(data.slice(0, 24)); return; }
      const list = data.filter(m => [m.title, m.region, m.type, m.genre, m.tags, m.one_line].join(' ').toLowerCase().includes(q));
      render(list);
    });
    render(data.slice(0, 24));
  }

  function initCategoryFilter() {
    const input = qs('[data-filter-input]');
    const cards = qsa('[data-filter-card]');
    if (!input || !cards.length) return;
    const apply = () => {
      const q = input.value.trim().toLowerCase();
      cards.forEach(card => {
        const text = card.textContent.toLowerCase();
        card.style.display = !q || text.includes(q) ? '' : 'none';
      });
    };
    input.addEventListener('input', apply);
  }

  function initPlayer() {
    const video = qs('[data-hls-src]');
    if (!video) return;
    const src = video.getAttribute('data-hls-src');
    const fallback = video.getAttribute('data-fallback-src') || src;
    const hint = qs('[data-player-hint]');
    const start = () => {
      if (window.Hls && Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: false,
          lowLatencyMode: false,
        });
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(Hls.Events.ERROR, function (_, data) {
          if (hint) hint.textContent = '播放器已连接，若网络受限可稍后重试。';
          console.warn('HLS error', data);
        });
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
      } else {
        video.src = fallback;
      }
    };
    start();
  }

  function bindCopyLinks() {
    qsa('[data-copy]').forEach(btn => btn.addEventListener('click', () => {
      const text = btn.getAttribute('data-copy');
      navigator.clipboard?.writeText(text || '');
      btn.textContent = '已复制';
      setTimeout(() => (btn.textContent = '复制链接'), 1000);
    }));
  }

  document.addEventListener('DOMContentLoaded', function () {
    openNav();
    initHeroSlider();
    initSearch();
    initCategoryFilter();
    initPlayer();
    bindCopyLinks();
  });
})();
