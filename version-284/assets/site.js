
(function(){
  function qs(sel, root){ return (root || document).querySelector(sel); }
  function qsa(sel, root){ return Array.from((root || document).querySelectorAll(sel)); }

  // mobile menu
  const menuBtn = qs('[data-menu-btn]');
  const menuPanel = qs('[data-menu-panel]');
  if (menuBtn && menuPanel) {
    menuBtn.addEventListener('click', () => menuPanel.classList.toggle('hidden'));
  }

  // hero slider
  const slider = qs('[data-hero-slider]');
  if (slider) {
    const slides = qsa('[data-slide]', slider);
    const dots = qsa('[data-dot]', slider);
    const prev = qs('[data-prev]', slider);
    const next = qs('[data-next]', slider);
    let index = 0;
    let timer = null;

    function show(i){
      index = (i + slides.length) % slides.length;
      slides.forEach((s, idx) => s.classList.toggle('hidden', idx !== index));
      dots.forEach((d, idx) => d.classList.toggle('opacity-100', idx === index));
      dots.forEach((d, idx) => d.classList.toggle('opacity-40', idx !== index));
    }
    function autoplay(){
      timer = setInterval(() => show(index + 1), 5000);
    }
    if (slides.length) {
      show(0);
      autoplay();
      [slider, prev, next, ...dots].forEach(el => {
        if (!el) return;
        el.addEventListener('mouseenter', () => { if (timer) clearInterval(timer); });
        el.addEventListener('mouseleave', () => autoplay());
      });
      prev && prev.addEventListener('click', () => show(index - 1));
      next && next.addEventListener('click', () => show(index + 1));
      dots.forEach((d, idx) => d.addEventListener('click', () => show(idx)));
    }
  }

  // search/filter for listing blocks
  qsa('[data-search-input]').forEach(input => {
    const target = document.getElementById(input.getAttribute('data-search-target'));
    if (!target) return;
    const items = () => qsa('[data-search-item]', target);
    input.addEventListener('input', () => {
      const kw = input.value.trim().toLowerCase();
      items().forEach(card => {
        const text = (card.getAttribute('data-search-text') || card.textContent || '').toLowerCase();
        const show = !kw || text.includes(kw);
        card.classList.toggle('hidden', !show);
      });
    });
  });

  // detail tabs
  qsa('[data-tabs]').forEach(container => {
    const buttons = qsa('button[data-tab]', container);
    const panels = qsa('[data-tab-panel]', container);
    function open(name){
      buttons.forEach(btn => btn.classList.toggle('active', btn.dataset.tab === name));
      panels.forEach(p => p.classList.toggle('hidden', p.dataset.tabPanel !== name));
    }
    buttons.forEach(btn => btn.addEventListener('click', () => open(btn.dataset.tab)));
    if (buttons[0]) open(buttons[0].dataset.tab);
  });

  // video player / hls fallback
  qsa('[data-video-shell]').forEach(shell => {
    const video = qs('video', shell);
    const overlay = qs('[data-play-overlay]', shell);
    const src = shell.getAttribute('data-src') || '';
    const hlsSrc = shell.getAttribute('data-hls-src') || '';
    const autoPlay = shell.getAttribute('data-autoplay') === '1';
    let started = false;

    function start() {
      if (started) return;
      started = true;
      overlay && overlay.classList.add('hide');
      if (window.Hls && hlsSrc && Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(hlsSrc);
        hls.attachMedia(video);
        window.__siteHls = window.__siteHls || [];
        window.__siteHls.push(hls);
        hls.on(Hls.Events.ERROR, function(_, data){
          if (data && data.fatal) {
            try { video.src = src; video.play(); } catch(e) {}
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = hlsSrc || src;
      } else {
        video.src = src;
      }
      video.play().catch(function(){});
    }

    overlay && overlay.addEventListener('click', start);
    video && video.addEventListener('click', start);
    autoPlay && setTimeout(start, 300);
  });
})();
