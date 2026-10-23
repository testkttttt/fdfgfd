/* ═══════════════════════════════════════════════════════════════════
   ZEUS STUDIO — transitions.js
   Pixel-art page transition overlay
   ═══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* Создаём overlay для перехода */
  var overlay = document.createElement('div');
  overlay.id = 'page-transition';
  overlay.innerHTML = '<div class="pt-scanline"></div><div class="pt-text">LOADING...</div>';
  document.body.appendChild(overlay);

  /* CSS инжектируем прямо сюда чтобы не зависеть от style.css */
  var style = document.createElement('style');
  style.textContent = [
    '#page-transition {',
    '  position: fixed; inset: 0; z-index: 99999;',
    '  background: #1a1a1a;',
    '  display: flex; align-items: center; justify-content: center;',
    '  pointer-events: none;',
    '  opacity: 0;',
    '  transition: opacity 0.22s steps(3);',
    '}',
    '#page-transition.pt-out {',
    '  opacity: 1;',
    '  pointer-events: all;',
    '}',
    '#page-transition.pt-in {',
    '  opacity: 0;',
    '}',
    '.pt-scanline {',
    '  position: absolute; inset: 0;',
    '  background: repeating-linear-gradient(',
    '    0deg, transparent, transparent 3px,',
    '    rgba(168,200,74,.06) 3px, rgba(168,200,74,.06) 4px',
    '  );',
    '  animation: ptScan 0.15s steps(2) infinite;',
    '}',
    '@keyframes ptScan {',
    '  from { background-position: 0 0; }',
    '  to   { background-position: 0 8px; }',
    '}',
    '.pt-text {',
    '  font-family: "Press Start 2P", monospace;',
    '  font-size: 0.6rem;',
    '  color: #a8c84a;',
    '  letter-spacing: 0.2em;',
    '  text-shadow: 0 0 10px #a8c84a;',
    '  animation: ptBlink 0.4s steps(1) infinite;',
    '  position: relative; z-index: 1;',
    '}',
    '@keyframes ptBlink { 0%,49%{opacity:1} 50%,100%{opacity:0} }',

    /* ── Страница появляется при входе ── */
    'body { opacity: 0; }',
    'body.page-ready { opacity: 1; transition: opacity 0.3s ease; }',
  ].join('\n');
  document.head.appendChild(style);

  /* Показываем страницу после загрузки */
  function pageIn() {
    document.body.classList.add('page-ready');
    overlay.classList.remove('pt-out');
  }

  if (document.readyState === 'complete') {
    setTimeout(pageIn, 60);
  } else {
    window.addEventListener('load', function() { setTimeout(pageIn, 60); });
  }

  /* Перехватываем клики по внутренним ссылкам */
  document.addEventListener('click', function(e) {
    /* Ищем ближайший <a> */
    var el = e.target;
    while (el && el.tagName !== 'A') el = el.parentElement;
    if (!el) return;

    var href = el.getAttribute('href');
    if (!href) return;

    /* Пропускаем: внешние, якоря, javascript:, target=_blank */
    if (
      href.startsWith('http') ||
      href.startsWith('//') ||
      href.startsWith('#') ||
      href.startsWith('javascript') ||
      href.startsWith('mailto') ||
      el.target === '_blank'
    ) return;

    /* Пропускаем, если это текущая страница (только якорь) */
    var currentPage = location.pathname.split('/').pop() || 'index.html';
    var targetPage  = href.split('#')[0].split('/').pop() || 'index.html';
    if (currentPage === targetPage) return;

    e.preventDefault();

    /* Анимация выхода */
    overlay.classList.add('pt-out');

    setTimeout(function() {
      window.location.href = href;
    }, 320);
  });

})();
