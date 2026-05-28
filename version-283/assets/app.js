(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    var showSlide = function (index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    };

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        showSlide(dotIndex);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showSlide(current + 1);
      }, 5600);
    }
  }

  document.querySelectorAll('[data-filter-list]').forEach(function (container) {
    var input = container.querySelector('[data-search]') || document.querySelector('[data-search]');
    var cards = Array.prototype.slice.call(container.querySelectorAll('[data-card]'));
    var chips = Array.prototype.slice.call(container.querySelectorAll('[data-filter]'));
    var activeFilter = 'all';

    var normalize = function (value) {
      return String(value || '').trim().toLowerCase();
    };

    var applyFilter = function () {
      var keyword = normalize(input ? input.value : '');
      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-tags'),
          card.getAttribute('data-region'),
          card.getAttribute('data-year'),
          card.getAttribute('data-type')
        ].join(' '));
        var filterOk = activeFilter === 'all' || haystack.indexOf(normalize(activeFilter)) !== -1;
        var keywordOk = !keyword || haystack.indexOf(keyword) !== -1;
        card.classList.toggle('is-hidden', !(filterOk && keywordOk));
      });
    };

    if (input) {
      input.addEventListener('input', applyFilter);
    }

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        chips.forEach(function (item) {
          item.classList.remove('is-active');
        });
        chip.classList.add('is-active');
        activeFilter = chip.getAttribute('data-filter') || 'all';
        applyFilter();
      });
    });
  });
})();
