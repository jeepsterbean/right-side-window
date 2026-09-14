import './styles.css';
import './process.css';
import './story.css';

document.documentElement.classList.add('js');

/** Client marks for the nowadays-style logo field. */
const CLIENTS = [
  { src: '/logos/asics.png', name: 'ASICS' },
  { src: '/logos/puma.png', name: 'Puma' },
  { src: '/logos/brooks-running.png', name: 'Brooks' },
  { src: '/logos/keen-footwear.png', name: 'KEEN' },
  { src: '/logos/lamborghini.png', name: 'Lamborghini' },
  { src: '/logos/atoms.png', name: 'Atoms' },
  { src: '/logos/feelgrounds.jpg', name: 'Feelgrounds' },
  { src: '/logos/nus.png', name: 'NUS' },
  { src: '/logos/smu.png', name: 'SMU' },
  { src: '/logos/singapore-polytechnic.jpg', name: 'Singapore Polytechnic' },
  { src: '/logos/burpple.png', name: 'Burpple' },
  { src: '/logos/identitee.png', name: 'identiTEE' },
  { src: '/logos/kaamp.png', name: 'KAAMP' },
  { src: '/logos/fireball-whiskey.png', name: 'Fireball' },
  { src: '/logos/bastille.png', name: 'Bastille' },
  { src: '/logos/bunka.png', name: 'Bunka' },
  { src: '/logos/british-hainan.png', name: 'British Hainan' },
  { src: '/logos/tcm.png', name: 'TCM' },
  { src: '/logos/straits-podiatry.png', name: 'Straits Podiatry' },
  { src: '/logos/new-healthway.png', name: 'Healthway' },
  { src: '/logos/sg100-foundation.png', name: 'SG100 Foundation' },
  { src: '/logos/speech-academy.png', name: 'Speech Academy' },
  { src: '/logos/success-frontiers.png', name: 'Success Frontiers' },
  { src: '/logos/trainium.png', name: 'Trainium' },
  { src: '/logos/peak.svg', name: 'Peak' },
  { src: '/logos/superfly.png', name: 'Superfly' },
  { src: '/logos/tpi.png', name: 'TPI' },
  { src: '/logos/muses.png', name: 'Muses' },
];

const LOGO_COLUMNS = 7;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

/**
 * Render one logo cell. Duplicate passes are decorative so screen readers skip them.
 */
function slot(client, decorative = false) {
  const alt = decorative ? '' : client.name;
  const hidden = decorative ? ' aria-hidden="true"' : '';
  return `<div class="logo-slot"${hidden}><img class="logo-mark" src="${client.src}" alt="${alt}" decoding="async" /></div>`;
}

/**
 * Four logo rows. Motion users get a duplicated track that loops left/right;
 * reduced-motion users get a static row with a single copy of each mark.
 */
function renderLogos() {
  const rowsRoot = document.querySelector('[data-logo-rows]');
  if (!rowsRoot) return;

  const staticRows = reducedMotion.matches;
  const rows = [];

  for (let start = 0, index = 0; start < CLIENTS.length; start += LOGO_COLUMNS, index += 1) {
    const clients = CLIENTS.slice(start, start + LOGO_COLUMNS);
    const first = clients.map((client) => slot(client)).join('');

    if (staticRows) {
      rows.push(`<div class="logo-row logo-row--static">${first}</div>`);
      continue;
    }

    // Three copies so translateX(-33.333%) always has a full viewport of identical marks ahead.
    const copies = clients.map((client) => slot(client, true)).join('');
    const dir = index % 2 === 0 ? 'left' : 'right';
    rows.push(
      `<div class="logo-row" data-dir="${dir}"><div class="logo-track">${first}${copies}${copies}</div></div>`,
    );
  }

  rowsRoot.innerHTML = rows.join('');
}

const HOVER_PLAYBACK_RATE = 0.32;

/**
 * Slow only the row under the pointer. playbackRate keeps the current
 * offset, so the track decelerates in place instead of jumping or pausing.
 */
function setRowSpeed(row, rate) {
  row.querySelector('.logo-track')?.getAnimations().forEach((anim) => {
    anim.playbackRate = rate;
  });
}

function setupLogoHover() {
  const rowsRoot = document.querySelector('[data-logo-rows]');
  if (!rowsRoot || !window.matchMedia('(hover: hover)').matches) return;

  rowsRoot.addEventListener('pointerover', (event) => {
    const row = event.target instanceof Element ? event.target.closest('.logo-row[data-dir]') : null;
    const from = event.relatedTarget instanceof Element ? event.relatedTarget.closest('.logo-row[data-dir]') : null;
    if (!row || row === from) return;
    setRowSpeed(row, HOVER_PLAYBACK_RATE);
  });

  rowsRoot.addEventListener('pointerout', (event) => {
    const row = event.target instanceof Element ? event.target.closest('.logo-row[data-dir]') : null;
    const to = event.relatedTarget instanceof Element ? event.relatedTarget.closest('.logo-row[data-dir]') : null;
    if (!row || row === to) return;
    setRowSpeed(row, 1);
  });
}

function setupNav() {
  const nav = document.querySelector('[data-nav]');
  const toggle = document.querySelector('[data-nav-toggle]');
  const menu = document.querySelector('[data-mobile-menu]');
  if (!nav) return;

  const syncScroll = () => {
    nav.toggleAttribute('data-scrolled', window.scrollY > 12);
  };

  syncScroll();
  window.addEventListener('scroll', syncScroll, { passive: true });

  if (!toggle || !menu) return;

  const close = () => {
    menu.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
    nav.removeAttribute('data-menu-open');
    document.body.style.overflow = '';
  };

  toggle.addEventListener('click', () => {
    const open = menu.hidden;
    menu.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    nav.toggleAttribute('data-menu-open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });

  menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', close));
  window.addEventListener('resize', () => {
    if (window.matchMedia('(min-width: 1024px)').matches) close();
  });
}

/**
 * Mark the chapter whose step label has reached the sticky pricing question.
 */
function setupScrolly() {
  const root = document.querySelector('[data-scrolly]');
  if (!root) return;

  const pin = root.querySelector('.process-pin-inner');
  const chapters = [...root.querySelectorAll('[data-chapter]')];
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const desktop = window.matchMedia('(min-width: 1024px)');

  const setStep = (index) => {
    root.dataset.step = String(index);
    chapters.forEach((chapter, i) => {
      chapter.toggleAttribute('data-active', i === index);
    });
  };

  /**
   * Active chapter is the last one whose label has crossed the pin's top edge.
   */
  const update = () => {
    if (!desktop.matches || motion.matches) {
      chapters.forEach((chapter) => chapter.toggleAttribute('data-active', true));
      return;
    }

    const probe = pin ? pin.getBoundingClientRect().top + 36 : window.innerHeight * 0.22;
    let current = 0;
    chapters.forEach((chapter, i) => {
      const label = chapter.querySelector('.process-step') ?? chapter;
      if (label.getBoundingClientRect().top <= probe) current = i;
    });
    setStep(current);
  };

  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      update();
      ticking = false;
    });
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  motion.addEventListener('change', onScroll);
  desktop.addEventListener('change', onScroll);

  root.dataset.step = '';
  setStep(0);
  update();
}

/**
 * Play entrance motion once a block reaches the viewport.
 */
function setupReveal() {
  const nodes = [...document.querySelectorAll('[data-reveal]')];
  if (!nodes.length) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    nodes.forEach((node) => node.classList.add('is-in'));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    },
    { threshold: 0.08, rootMargin: '0px 0px -6% 0px' },
  );

  nodes.forEach((node) => {
    const box = node.getBoundingClientRect();
    if (box.top < window.innerHeight * 0.92 && box.bottom > 80) node.classList.add('is-in');
    else io.observe(node);
  });
}

renderLogos();
reducedMotion.addEventListener('change', renderLogos);
setupLogoHover();
setupNav();
setupScrolly();
setupReveal();
