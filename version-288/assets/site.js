(function () {
  const menuButton = document.querySelector('[data-menu-button]');
  const mobileNav = document.querySelector('[data-mobile-nav]');
  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('.hero-carousel').forEach(function (carousel) {
    const slides = Array.from(carousel.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(carousel.querySelectorAll('[data-hero-dot]'));
    let current = 0;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        show(current + 1);
      }, 5200);
    }
  });

  document.querySelectorAll('.searchable-list').forEach(function (list) {
    const scope = list.closest('section') || document;
    const input = scope.querySelector('[data-search-input]');
    const filterRow = scope.querySelector('[data-filter-row]');
    const cards = Array.from(list.querySelectorAll('.searchable-card'));
    let activeFilter = 'all';

    function apply() {
      const query = input ? input.value.trim().toLowerCase() : '';
      cards.forEach(function (card) {
        const text = (card.getAttribute('data-search') || '').toLowerCase();
        const category = card.getAttribute('data-category') || '';
        const filterMatch = activeFilter === 'all' || category === activeFilter;
        const queryMatch = !query || text.indexOf(query) !== -1;
        card.hidden = !(filterMatch && queryMatch);
      });
    }

    if (input) {
      input.addEventListener('input', apply);
    }

    if (filterRow) {
      filterRow.querySelectorAll('[data-filter]').forEach(function (button) {
        button.addEventListener('click', function () {
          activeFilter = button.getAttribute('data-filter') || 'all';
          filterRow.querySelectorAll('[data-filter]').forEach(function (item) {
            item.classList.toggle('active', item === button);
          });
          apply();
        });
      });
    }
  });
}());
