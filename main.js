// qrmo — shared site behaviour: mobile nav, footer year, scroll reveal.
document.addEventListener('DOMContentLoaded', () => {

  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links){
    /* `.site-nav` is `position:sticky`, which makes it a containing block for
       any `position:fixed` descendant — so on mobile the fixed full-screen
       menu panel was sizing itself against the ~68px-tall nav bar instead of
       the viewport (collapsing to a sliver with no real backdrop, links
       spilling over the page beneath it). Fix: physically move the panel to
       be a direct child of <body> while in mobile layout, so `position:fixed`
       resolves against the real viewport, then move it back for desktop so
       it stays inline in the nav bar's flex row. */
    const homeParent = links.parentElement;
    const homeNextSibling = links.nextElementSibling;
    const mq = window.matchMedia('(max-width:820px)');

    function closeMenu(){
      links.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('menu-open');
    }

    function placeLinks(isMobile){
      closeMenu();
      if (isMobile){
        if (links.parentElement !== document.body) document.body.appendChild(links);
      } else if (links.parentElement !== homeParent){
        homeParent.insertBefore(links, homeNextSibling);
      }
    }
    placeLinks(mq.matches);
    mq.addEventListener('change', (e) => placeLinks(e.matches));

    toggle.addEventListener('click', () => {
      const open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.classList.toggle('menu-open', open);
    });
    links.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && links.classList.contains('open')) closeMenu();
    });
  }

  document.querySelectorAll('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });

  /* ---- light/dark theme toggle (persisted; applied early inline in <head>
     too, so there's no flash of the wrong theme on repeat visits) ---- */
  const THEME_KEY = 'qrmo-theme';
  const themeBtn = document.getElementById('themeToggle');
  const themeColorMeta = document.querySelector('meta[name="theme-color"]');
  function applyThemeColorMeta(){
    if (!themeColorMeta) return;
    const bg = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim();
    if (bg) themeColorMeta.setAttribute('content', bg);
  }
  applyThemeColorMeta();
  if (themeBtn){
    themeBtn.addEventListener('click', () => {
      const current = document.documentElement.dataset.theme || 'light';
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.dataset.theme = next;
      localStorage.setItem(THEME_KEY, next);
      applyThemeColorMeta();
    });
  }

  /* ---- PWA: register service worker (offline + installable) ---- */
  if ('serviceWorker' in navigator){
    window.addEventListener('load', () => {
      navigator.serviceWorker.register((document.documentElement.dataset.assetBase || '') + 'sw.js').catch(() => { /* offline support is a bonus, not required */ });
    });
  }

  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length && 'IntersectionObserver' in window){
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting){ entry.target.classList.add('in'); io.unobserve(entry.target); }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('in'));
  }
});
