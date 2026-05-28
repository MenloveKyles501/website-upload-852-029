
import { H as Hls } from './hls.bundle.js';

function $(sel, root = document) {
  return root.querySelector(sel);
}

function $all(sel, root = document) {
  return Array.from(root.querySelectorAll(sel));
}

function textify(node) {
  return (node.textContent || '').toLowerCase();
}

function bindNav() {
  const toggle = $('.nav-toggle');
  const nav = $('[data-nav]');
  if (!toggle || !nav) return;
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(open));
  });
}

function bindLocalFilter() {
  const input = $('[data-filter-input]');
  const target = $('[data-filter-target]');
  if (!input || !target) return;
  const cards = $all('.movie-card', target);
  const update = () => {
    const q = input.value.trim().toLowerCase();
    cards.forEach(card => {
      const hit = !q || textify(card).includes(q);
      card.style.display = hit ? '' : 'none';
    });
  };
  input.addEventListener('input', update);
}

function renderMovieCard(movie) {
  const style = `--p1:${movie.c1};--p2:${movie.c2};--p3:${movie.c3};--accent:${movie.accent};--accent2:${movie.accent2};`;
  const tags = (movie.tags || []).slice(0, 4).map(t => `<span class="tag">${escapeHtml(t)}</span>`).join('');
  return `
    <article class="movie-card" style="${style}">
      <a class="movie-link" href="/movie/${movie.id}.html">
        <div class="movie-poster">
          <div class="poster-topline">${escapeHtml(movie.region_bucket || movie.region)}</div>
          <div class="poster-main">
            <div class="poster-year">${movie.year}</div>
            <h3>${escapeHtml(movie.title)}</h3>
            <p>${escapeHtml(shortText(movie.one_line || movie.summary || '', 72))}</p>
          </div>
          <div class="poster-footer">
            <span>${escapeHtml(movie.type)}</span>
            <span>${escapeHtml(movie.genre || '')}</span>
          </div>
        </div>
        <div class="movie-meta">
          <div>
            <h4>${escapeHtml(movie.title)}</h4>
            <p>${escapeHtml(movie.region)} · ${movie.year} · ${escapeHtml(movie.type)}</p>
          </div>
          <div class="movie-tags">${tags}</div>
        </div>
      </a>
    </article>`;
}

function shortText(text, n) {
  const compact = String(text).replace(/\s+/g, ' ').trim();
  return compact.length <= n ? compact : compact.slice(0, n - 1).trimEnd() + '…';
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

async function bindSearchPage() {
  const input = $('[data-search-input]');
  const results = $('[data-search-results]');
  const count = $('[data-search-count]');
  if (!input || !results || !count) return;

  const regionFilter = $('[data-region-filter]');
  const typeFilter = $('[data-type-filter]');
  const res = await fetch('/assets/movies.json', { cache: 'force-cache' });
  const movies = await res.json();

  function apply() {
    const q = input.value.trim().toLowerCase();
    const region = regionFilter ? regionFilter.value : 'all';
    const type = typeFilter ? typeFilter.value : 'all';

    const matched = movies.filter(movie => {
      const hay = [movie.title, movie.region, movie.type, movie.genre, movie.one_line, movie.summary, movie.review, ...(movie.tags || [])].join(' ').toLowerCase();
      const hit = !q || hay.includes(q);
      const regionHit = region === 'all' || movie.region_bucket === region;
      const typeHit = type === 'all' || movie.type_bucket === type;
      return hit && regionHit && typeHit;
    });

    count.textContent = String(matched.length);
    results.innerHTML = matched.slice(0, 240).map(renderMovieCard).join('');
  }

  input.addEventListener('input', apply);
  if (regionFilter) regionFilter.addEventListener('change', apply);
  if (typeFilter) typeFilter.addEventListener('change', apply);
  apply();
}

function bindPlayer() {
  const video = $('[data-player]');
  if (!video) return;
  const mp4 = video.dataset.mp4;
  const hlsSrc = video.dataset.hls;
  const buttons = $all('[data-source-btn]');
  let hls = null;

  function setActive(name) {
    buttons.forEach(btn => btn.classList.toggle('is-active', btn.dataset.sourceBtn === name));
  }

  function loadMp4() {
    if (hls) {
      try { hls.destroy(); } catch (_) {}
      hls = null;
    }
    video.src = mp4;
    video.load();
  }

  function loadHls() {
    if (Hls && Hls.isSupported()) {
      if (hls) {
        try { hls.destroy(); } catch (_) {}
      }
      hls = new Hls({ enableWorker: false });
      hls.loadSource(hlsSrc);
      hls.attachMedia(video);
      hls.on(Hls.Events.ERROR, function (_evt, data) {
        if (data && data.fatal) {
          loadMp4();
          setActive('mp4');
        }
      });
      return;
    }
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = hlsSrc;
      return;
    }
    loadMp4();
    setActive('mp4');
  }

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const kind = btn.dataset.sourceBtn;
      setActive(kind);
      if (kind === 'hls') loadHls();
      else loadMp4();
      video.play().catch(() => {});
    });
  });

  // default to HLS if possible, otherwise MP4.
  if (Hls && Hls.isSupported()) {
    setActive('hls');
    loadHls();
  } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    setActive('hls');
    loadHls();
  } else {
    setActive('mp4');
    loadMp4();
  }
}

bindNav();
bindLocalFilter();
bindSearchPage();
bindPlayer();
