'use strict';

document.addEventListener('DOMContentLoaded', () => {

  /* ── 1. HEADER SCROLL ─────────────────────────────────────────── */
  const header = document.getElementById('site-header');
  if (header) {
    const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ── 2. MOBILE NAV ────────────────────────────────────────────── */
  const burger  = document.getElementById('burger');

  // Build mobile overlay
  const overlay = document.createElement('nav');
  overlay.className = 'mobile-nav-overlay';
  overlay.setAttribute('aria-label', 'Мобильное меню');
  const path = location.pathname;
  overlay.innerHTML = `
    <a href="index.html"     class="nav-link ${(path.endsWith('index.html')||path==='/'||path.endsWith('/')) ? 'active':''}">Главная</a>
    <a href="portfolio.html" class="nav-link ${path.includes('portfolio') ? 'active':''}">Портфолио</a>
    <a href="contact.html"   class="nav-link ${path.includes('contact')   ? 'active':''}">Контакты</a>
  `;
  document.body.appendChild(overlay);

  let navOpen = false;
  const toggleNav = (force) => {
    navOpen = force !== undefined ? force : !navOpen;
    burger?.classList.toggle('open', navOpen);
    overlay.classList.toggle('open', navOpen);
    burger?.setAttribute('aria-expanded', String(navOpen));
    document.body.style.overflow = navOpen ? 'hidden' : '';
  };
  burger?.addEventListener('click', () => toggleNav());
  overlay.querySelectorAll('a').forEach(a => a.addEventListener('click', () => toggleNav(false)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && navOpen) toggleNav(false); });

  /* ── 3. SCROLL REVEAL ─────────────────────────────────────────── */
  const revealTargets = document.querySelectorAll(
    '.service-card,.portfolio-card,.contact-detail,.contact-form-wrap,.slide-body,.three-canvas-wrap,.cta-frame,.featured-card,.thumb,.best-arts-tag'
  );
  revealTargets.forEach((el, i) => {
    el.classList.add('reveal');
    const mod = i % 4;
    if (mod === 1) el.classList.add('reveal-delay-1');
    if (mod === 2) el.classList.add('reveal-delay-2');
    if (mod === 3) el.classList.add('reveal-delay-3');
  });
  const revealObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); revealObs.unobserve(e.target); }
    });
  }, { threshold: 0.08 });
  revealTargets.forEach(el => revealObs.observe(el));

  /* ── 4. SLIDER ────────────────────────────────────────────────── */
  const slider   = document.getElementById('slider');
  const dotsWrap = document.getElementById('slider-dots');
  const prevBtn  = document.getElementById('slider-prev');
  const nextBtn  = document.getElementById('slider-next');

  if (slider) {
    const slides = [...slider.querySelectorAll('.slide')];
    const dots   = dotsWrap ? [...dotsWrap.querySelectorAll('.dot')] : [];
    let current  = 0;
    let timer;

    // FIX: allow goTo to same index only when forced (e.g., dot click)
    const goTo = (idx, force = false) => {
      const next = ((idx % slides.length) + slides.length) % slides.length;
      if (next === current && !force) return;

      slides[current].classList.remove('active');
      slides[current].setAttribute('aria-hidden', 'true');
      if (dots[current]) { dots[current].classList.remove('active'); dots[current].setAttribute('aria-selected','false'); }

      current = next;

      slides[current].classList.add('active');
      slides[current].setAttribute('aria-hidden', 'false');
      if (dots[current]) { dots[current].classList.add('active'); dots[current].setAttribute('aria-selected','true'); }
    };

    prevBtn?.addEventListener('click', () => { goTo(current - 1); resetTimer(); });
    nextBtn?.addEventListener('click', () => { goTo(current + 1); resetTimer(); });
    dots.forEach((d, i) => d.addEventListener('click', () => { goTo(i, true); resetTimer(); }));

    // Keyboard
    slider.setAttribute('tabindex','0');
    slider.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft')  { goTo(current-1); resetTimer(); }
      if (e.key === 'ArrowRight') { goTo(current+1); resetTimer(); }
    });

    // Touch swipe
    let tx = 0;
    slider.addEventListener('touchstart', e => { tx = e.changedTouches[0].clientX; }, { passive: true });
    slider.addEventListener('touchend',   e => {
      const dx = e.changedTouches[0].clientX - tx;
      if (Math.abs(dx) > 40) { goTo(dx < 0 ? current+1 : current-1); resetTimer(); }
    });

    const startTimer = () => { timer = setInterval(() => goTo(current+1), 5000); };
    const resetTimer = () => { clearInterval(timer); startTimer(); };
    slider.addEventListener('mouseenter', () => clearInterval(timer));
    slider.addEventListener('mouseleave', startTimer);
    startTimer();
  }

  /* ── 5. STATS COUNTER ─────────────────────────────────────────── */
  const statEls = document.querySelectorAll('[data-target]');

  const countUp = (el) => {
    const target = +el.dataset.target;
    const numEl  = el.querySelector('.stat-num');
    if (!numEl) return;
    const dur = 1600, start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / dur, 1);
      const e = 1 - Math.pow(1 - p, 3);
      numEl.textContent = Math.floor(e * target);
      if (p < 1) requestAnimationFrame(step);
      else numEl.textContent = target;
    };
    requestAnimationFrame(step);
  };

  const statsObs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { countUp(e.target); statsObs.unobserve(e.target); } });
  }, { threshold: 0.15 });
  statEls.forEach(el => statsObs.observe(el));

  /* ── 6. PORTFOLIO FILTER ──────────────────────────────────────── */
  const filterBar = document.querySelector('.filter-bar');
  const grid      = document.getElementById('portfolio-grid');
  if (filterBar && grid) {
    const btns  = [...filterBar.querySelectorAll('.filter-btn')];
    const cards = [...grid.querySelectorAll('.portfolio-card')];

    btns.forEach(btn => btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const f = btn.dataset.filter;
      let visible = 0;
      cards.forEach(card => {
        const cats = (card.dataset.cat||'').split(' ');
        const show = f === 'all' || cats.includes(f);
        card.classList.toggle('hidden', !show);
        if (show) visible++;
      });
      const noRes = document.getElementById('no-results');
      if (noRes) noRes.style.display = visible ? 'none' : 'block';
    }));
  }

  /* ── 7. DYNAMIC GREETING ─────────────────────────────────────── */
  const greetEl = document.getElementById('dynamic-greeting');
  if (greetEl) {
    const h = new Date().getHours();
    if      (h < 6)  greetEl.textContent = 'Доброй ночи';
    else if (h < 12) greetEl.textContent = 'Доброе утро';
    else if (h < 18) greetEl.textContent = 'Добрый день';
    else             greetEl.textContent = 'Добрый вечер';
  }

  /* ── 8. LIKE BUTTON ───────────────────────────────────────────── */
  const likeBtn = document.getElementById('like-featured');
  if (likeBtn) {
    likeBtn.addEventListener('click', () => {
      const liked = likeBtn.classList.toggle('liked');
      likeBtn.textContent = liked ? '♥' : '♡';
      likeBtn.setAttribute('aria-pressed', liked);
    });
  }

  /* ── 9. THUMB CLICK (dynamic content) ────────────────────────── */
  const thumbs = document.querySelectorAll('.thumb');
  const featured = document.querySelector('.featured-bg');
  const THUMB_IMGS = [
    'https://picsum.photos/seed/arch1/800/600',
    'https://picsum.photos/seed/neon2/800/600',
    'https://picsum.photos/seed/tech3/800/600',
    'https://picsum.photos/seed/dark4/800/600',
    'https://picsum.photos/seed/space5/800/600',
    'https://picsum.photos/seed/city1/800/600',
  ];
  thumbs.forEach((thumb, i) => {
    thumb.addEventListener('click', () => {
      if (featured) {
        const img = featured.querySelector('img');
        if (img) {
          featured.style.filter = 'brightness(2)';
          img.src = THUMB_IMGS[i] || THUMB_IMGS[0];
          setTimeout(() => { featured.style.filter = 'brightness(1)'; }, 80);
        }
      }
    });
    thumb.addEventListener('keydown', e => { if (e.key==='Enter'||e.key===' ') thumb.click(); });
  });

  /* ── 10. FORM VALIDATION ──────────────────────────────────────── */
  const form = document.getElementById('contact-form');
  if (form) {
    const successPanel = document.getElementById('form-success');
    const successHead  = document.getElementById('success-heading');
    const submitBtn    = form.querySelector('.btn-submit');
    const charCountEl  = document.getElementById('msg-char-count');
    const msgArea      = document.getElementById('msg');

    // Char counter
    msgArea?.addEventListener('input', () => {
      const len = msgArea.value.length;
      if (charCountEl) { charCountEl.textContent = len + '/1000'; charCountEl.classList.toggle('over', len > 1000); }
    });

    // Validators
    const validators = {
      name:    v => v.trim().length >= 2  ? '' : '// Минимум 2 символа',
      email:   v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : '// Некорректный e-mail',
      phone:   v => !v || /^\+?[\d\s\-\(\)]{7,}$/.test(v.trim()) ? '' : '// Неверный формат телефона',
      subject: v => v ? '' : '// Выберите тему',
      msg:     v => {
        if (v.trim().length < 10) return '// Минимум 10 символов';
        if (v.length > 1000)      return '// Максимум 1000 символов';
        return '';
      },
    };

    const setState = (id, err) => {
      const field = document.getElementById(id)?.closest('.field');
      const errEl = field?.querySelector('.field-error');
      if (!field) return;
      field.classList.toggle('error',   !!err);
      field.classList.toggle('success', !err && !!document.getElementById(id)?.value);
      if (errEl) errEl.textContent = err || '';
    };

    Object.keys(validators).forEach(id => {
      const input = document.getElementById(id);
      if (!input) return;
      input.addEventListener('blur',  () => setState(id, validators[id](input.value)));
      input.addEventListener('input', () => {
        if (input.closest('.field')?.classList.contains('error'))
          setState(id, validators[id](input.value));
      });
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      let valid = true;

      Object.keys(validators).forEach(id => {
        const input = document.getElementById(id);
        if (!input) return;
        const err = validators[id](input.value);
        setState(id, err);
        if (err) valid = false;
      });

      if (!valid) {
        form.querySelector('.field.error input, .field.error select, .field.error textarea')?.focus();
        return;
      }

      // Simulate send
      submitBtn.classList.add('loading');
      submitBtn.disabled = true;
      await new Promise(r => setTimeout(r, 1600));

      submitBtn.classList.remove('loading');
      form.style.display = 'none';
      if (successPanel) {
        successPanel.classList.add('show');
        const name = document.getElementById('name')?.value?.split(' ')[0] || '';
        if (successHead) successHead.textContent = name ? `${name}, сообщение отправлено!` : 'Сообщение отправлено!';
      }
    });
  }

}); // DOMContentLoaded
