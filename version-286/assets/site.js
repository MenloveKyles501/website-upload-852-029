(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
      return;
    }

    callback();
  }

  function setupMobileMenu() {
    var button = document.querySelector("[data-mobile-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");

    if (!button || !panel) {
      return;
    }

    button.addEventListener("click", function () {
      panel.classList.toggle("is-open");
      button.textContent = panel.classList.contains("is-open") ? "×" : "☰";
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");

    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    var index = 0;

    function activate(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        activate(dotIndex);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        activate(index + 1);
      }, 5200);
    }
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function setupFilters() {
    var panel = document.querySelector(".filter-panel");

    if (!panel) {
      return;
    }

    var input = panel.querySelector("[data-local-search]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
    var selectedType = "";
    var selectedYear = "";

    function setActive(buttons, selectedButton) {
      buttons.forEach(function (button) {
        button.classList.toggle("is-active", button === selectedButton);
      });
    }

    function applyFilters() {
      var query = normalize(input ? input.value : "");

      cards.forEach(function (card) {
        var haystack = normalize(card.getAttribute("data-title"));
        var type = normalize(card.getAttribute("data-type"));
        var year = normalize(card.getAttribute("data-year"));
        var matchesQuery = !query || haystack.indexOf(query) !== -1;
        var matchesType = !selectedType || type === selectedType;
        var matchesYear = !selectedYear || year === selectedYear;
        card.hidden = !(matchesQuery && matchesType && matchesYear);
      });
    }

    if (input) {
      var params = new URLSearchParams(window.location.search);
      var q = params.get("q");

      if (q) {
        input.value = q;
      }

      input.addEventListener("input", applyFilters);
    }

    var typeButtons = Array.prototype.slice.call(panel.querySelectorAll("[data-filter-type]"));
    var yearButtons = Array.prototype.slice.call(panel.querySelectorAll("[data-filter-year]"));

    typeButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        selectedType = normalize(button.getAttribute("data-filter-type"));
        setActive(typeButtons, button);
        applyFilters();
      });
    });

    yearButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        selectedYear = normalize(button.getAttribute("data-filter-year"));
        setActive(yearButtons, button);
        applyFilters();
      });
    });

    applyFilters();
  }

  function setupSearchForms() {
    var forms = Array.prototype.slice.call(document.querySelectorAll("form[action='./search.html']"));

    forms.forEach(function (form) {
      form.addEventListener("submit", function () {
        var input = form.querySelector("input[name='q']");

        if (input) {
          input.value = input.value.trim();
        }
      });
    });
  }

  ready(function () {
    setupMobileMenu();
    setupHero();
    setupFilters();
    setupSearchForms();
  });
})();
