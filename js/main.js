/* =============================================
   おおがさんち（大賀屋）- main.js
   ============================================= */

(function () {
  'use strict';

  /* ----- Smooth Scroll ----- */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var target = document.querySelector(this.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      var headerH = document.getElementById('header').offsetHeight;
      var top = target.getBoundingClientRect().top + window.scrollY - headerH;
      window.scrollTo({ top: top, behavior: 'smooth' });
      // Close mobile nav if open
      closeNav();
    });
  });

  /* ----- Header: scroll state ----- */
  var header = document.getElementById('header');

  function updateHeader() {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', updateHeader, { passive: true });
  updateHeader();

  /* ----- Hamburger Menu ----- */
  var hamburger = document.getElementById('hamburger');
  var nav = document.getElementById('nav');

  // Create overlay element
  var overlay = document.createElement('div');
  overlay.className = 'nav-overlay';
  overlay.setAttribute('aria-hidden', 'true');
  document.body.appendChild(overlay);

  function openNav() {
    nav.classList.add('is-open');
    overlay.classList.add('is-show');
    hamburger.classList.add('is-active');
    hamburger.setAttribute('aria-expanded', 'true');
    hamburger.setAttribute('aria-label', 'メニューを閉じる');
    document.body.style.overflow = 'hidden';
  }

  function closeNav() {
    nav.classList.remove('is-open');
    overlay.classList.remove('is-show');
    hamburger.classList.remove('is-active');
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.setAttribute('aria-label', 'メニューを開く');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', function () {
    if (nav.classList.contains('is-open')) {
      closeNav();
    } else {
      openNav();
    }
  });

  overlay.addEventListener('click', closeNav);

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeNav();
  });

  /* ----- Scroll Reveal ----- */
  var revealEls = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    revealEls.forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    // Fallback: show all immediately
    revealEls.forEach(function (el) { el.classList.add('visible'); });
  }

  /* ----- Gallery Carousel ----- */
  var track = document.getElementById('galleryTrack');
  var prevBtn = document.getElementById('galleryPrev');
  var nextBtn = document.getElementById('galleryNext');
  var dotsContainer = document.getElementById('galleryDots');

  if (track && prevBtn && nextBtn) {
    var items = track.querySelectorAll('.gallery-item');
    var total = items.length;
    var current = 0;
    var itemsVisible = getItemsVisible();
    var maxIndex = Math.max(0, total - itemsVisible);
    var isDragging = false;
    var startX = 0;
    var currentTranslate = 0;

    function getItemsVisible() {
      if (window.innerWidth <= 767) return 1;
      if (window.innerWidth <= 900) return 2;
      return 3;
    }

    // Build dots
    function buildDots() {
      dotsContainer.innerHTML = '';
      itemsVisible = getItemsVisible();
      maxIndex = Math.max(0, total - itemsVisible);
      var dotCount = maxIndex + 1;
      for (var i = 0; i < dotCount; i++) {
        var dot = document.createElement('button');
        dot.className = 'gallery-dot' + (i === current ? ' is-active' : '');
        dot.setAttribute('aria-label', (i + 1) + ' ページ目');
        dot.setAttribute('role', 'tab');
        dot.dataset.index = i;
        dot.addEventListener('click', function () {
          goTo(parseInt(this.dataset.index));
        });
        dotsContainer.appendChild(dot);
      }
    }

    function updateDots() {
      var dots = dotsContainer.querySelectorAll('.gallery-dot');
      dots.forEach(function (d, i) {
        d.classList.toggle('is-active', i === current);
      });
    }

    function goTo(index) {
      current = Math.max(0, Math.min(index, maxIndex));
      var itemWidth = items[0].offsetWidth + 12; // width + gap
      track.style.transform = 'translateX(-' + (current * itemWidth) + 'px)';
      updateDots();
    }

    prevBtn.addEventListener('click', function () { goTo(current - 1); });
    nextBtn.addEventListener('click', function () { goTo(current + 1); });

    // Touch / drag support
    track.addEventListener('mousedown', onDragStart);
    track.addEventListener('touchstart', onDragStart, { passive: true });
    window.addEventListener('mouseup', onDragEnd);
    window.addEventListener('touchend', onDragEnd);
    window.addEventListener('mousemove', onDragMove);
    window.addEventListener('touchmove', onDragMove, { passive: false });

    function getClientX(e) {
      return e.touches ? e.touches[0].clientX : e.clientX;
    }

    function onDragStart(e) {
      isDragging = true;
      startX = getClientX(e);
    }

    function onDragEnd() {
      if (!isDragging) return;
      isDragging = false;
      var diff = currentTranslate;
      if (diff < -60) goTo(current + 1);
      else if (diff > 60) goTo(current - 1);
      currentTranslate = 0;
    }

    function onDragMove(e) {
      if (!isDragging) return;
      currentTranslate = getClientX(e) - startX;
      if (e.cancelable && e.type === 'touchmove') e.preventDefault();
    }

    // Keyboard navigation
    document.addEventListener('keydown', function (e) {
      var gallerySection = document.getElementById('gallery');
      if (!gallerySection) return;
      var rect = gallerySection.getBoundingClientRect();
      if (rect.top > window.innerHeight || rect.bottom < 0) return;
      if (e.key === 'ArrowLeft') goTo(current - 1);
      if (e.key === 'ArrowRight') goTo(current + 1);
    });

    // Rebuild on resize
    window.addEventListener('resize', function () {
      var newVisible = getItemsVisible();
      if (newVisible !== itemsVisible) {
        itemsVisible = newVisible;
        current = 0;
        buildDots();
        goTo(0);
      }
    });

    buildDots();
    goTo(0);
  }

  /* ----- Contact Form ----- */
  var form = document.getElementById('contactForm');
  var submitBtn = document.getElementById('submitBtn');
  var formSuccess = document.getElementById('formSuccess');

  if (form) {
    // Real-time validation helpers
    function showError(id, msg) {
      var el = document.getElementById(id);
      if (el) el.textContent = msg;
    }

    function clearError(id) {
      var el = document.getElementById(id);
      if (el) el.textContent = '';
    }

    function validateField(input) {
      var id = input.id + 'Error';
      if (input.required && !input.value.trim()) {
        showError(id, 'この項目は必須です。');
        return false;
      }
      if (input.type === 'email' && input.value.trim()) {
        var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRe.test(input.value.trim())) {
          showError(id, '正しいメールアドレスを入力してください。');
          return false;
        }
      }
      clearError(id);
      return true;
    }

    // Validate on blur
    ['name', 'email', 'date', 'venue'].forEach(function (fieldId) {
      var el = document.getElementById(fieldId);
      if (el) {
        el.addEventListener('blur', function () { validateField(this); });
        el.addEventListener('input', function () {
          if (document.getElementById(fieldId + 'Error') &&
              document.getElementById(fieldId + 'Error').textContent) {
            validateField(this);
          }
        });
      }
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      // Validate all required fields
      var valid = true;
      ['name', 'email', 'date', 'venue'].forEach(function (fieldId) {
        var el = document.getElementById(fieldId);
        if (el && !validateField(el)) valid = false;
      });

      if (!valid) return;

      // Loading state
      var btnText = submitBtn.querySelector('.btn-text');
      var btnLoading = submitBtn.querySelector('.btn-loading');
      btnText.style.display = 'none';
      btnLoading.style.display = 'inline';
      submitBtn.disabled = true;

      // Submit via fetch (Formspree)
      fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      })
        .then(function (response) {
          if (response.ok) {
            form.reset();
            form.style.display = 'none';
            formSuccess.style.display = 'block';
            formSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
          } else {
            return response.json().then(function (data) {
              throw new Error(data.error || '送信に失敗しました。');
            });
          }
        })
        .catch(function (err) {
          alert('送信に失敗しました。時間をおいて再度お試しいただくか、直接メール（imcryasa20z22@gmail.com）またはお電話（070-1528-4648）にてご連絡ください。');
          btnText.style.display = 'inline';
          btnLoading.style.display = 'none';
          submitBtn.disabled = false;
        });
    });
  }

  /* ----- Back To Top ----- */
  var backToTop = document.getElementById('backToTop');

  if (backToTop) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 400) {
        backToTop.classList.add('visible');
      } else {
        backToTop.classList.remove('visible');
      }
    }, { passive: true });

    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

})();
