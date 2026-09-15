import './styles.css';
import './process.css';
import './team.css';
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
 * Drive a sticky scrolly stage: one viewport, views swap with scroll progress.
 * Process adds an opening beat before the chapters so the $1,000 question
 * can sit as its own chapter, then pin to the top for the four steps.
 */
function setupScrollyRoot(root) {
  const chapters = [...root.querySelectorAll('[data-chapter]')];
  const count = chapters.length;
  if (!count) return;

  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const desktop = window.matchMedia('(min-width: 1024px)');
  const isProcess = root.matches('.process');
  const views = isProcess ? count + 1 : count;
  const title = isProcess ? root.querySelector('.process-question') : null;
  const board = isProcess ? root.querySelector('.process-board') : null;
  let current = -1;

  if (isProcess) {
    root.style.setProperty('--process-views', String(views));
  }

  /**
   * Process scenes 0–3 share one timeline; opening and close stay off it.
   * Team uses this controller too, so the attribute stays process-only.
   */
  const syncProcessTimeline = (chapterIndex) => {
    if (!isProcess) return;
    if (chapterIndex >= 0 && chapterIndex <= 3) root.dataset.timeline = String(chapterIndex);
    else delete root.dataset.timeline;
  };

  /**
   * Measure how far the question must travel from the board's vertical centre
   * to the top. Transform percentages are relative to the title itself.
   */
  const measureTitleDrop = () => {
    if (!title || !board) return;
    const drop = Math.max(0, (board.clientHeight - title.offsetHeight) / 2);
    root.style.setProperty('--title-drop', `${drop}px`);
  };

  /**
   * Title is a discrete chapter: open (centred), pin (top), or out (close).
   */
  const syncProcessTitle = (viewIndex) => {
    if (!isProcess) return;
    if (viewIndex <= 0) root.dataset.title = 'open';
    else if (viewIndex >= views - 1) root.dataset.title = 'out';
    else root.dataset.title = 'pin';
  };

  /**
   * Word-reveal only once the centred title itself is on screen.
   * Leaving the scene clears the flag so scrolling back can play it again.
   */
  const syncTitleEnter = (viewIndex) => {
    if (!isProcess || !title) return;
    const box = title.getBoundingClientRect();
    const onScreen = box.top < window.innerHeight * 0.88 && box.bottom > 64;
    if (viewIndex === 0 && onScreen) root.dataset.titleEnter = '';
    else root.removeAttribute('data-title-enter');
  };

  const setStacked = () => {
    current = -1;
    root.dataset.step = '0';
    syncProcessTimeline(-1);
    root.removeAttribute('data-close-nav');
    if (isProcess) {
      root.removeAttribute('data-title');
      root.removeAttribute('data-title-enter');
      root.style.removeProperty('--title-drop');
    }
    chapters.forEach((chapter) => {
      chapter.toggleAttribute('data-active', true);
      chapter.removeAttribute('inert');
      chapter.removeAttribute('aria-hidden');
    });
  };

  /**
   * Show one view. Process view 0 is title-only; chapters start at view 1.
   * inert keeps hidden CTAs out of the tab order.
   */
  const setStep = (viewIndex) => {
    if (current === viewIndex) return;
    current = viewIndex;
    root.dataset.step = String(viewIndex);
    const chapterIndex = isProcess ? viewIndex - 1 : viewIndex;
    syncProcessTimeline(chapterIndex);
    syncProcessTitle(viewIndex);
    chapters.forEach((chapter, i) => {
      const on = i === chapterIndex;
      chapter.toggleAttribute('data-active', on);
      chapter.toggleAttribute('inert', !on);
      chapter.setAttribute('aria-hidden', String(!on));
    });
  };

  /**
   * Map the section's sticky travel to equally spaced views.
   */
  const update = () => {
    if (!desktop.matches || motion.matches) {
      setStacked();
      return;
    }

    measureTitleDrop();
    const rect = root.getBoundingClientRect();
    const travel = Math.max(1, rect.height - window.innerHeight);
    const progress = Math.min(1, Math.max(0, -rect.top / travel));
    const viewIndex = Math.min(views - 1, Math.floor(progress * views));
    setStep(viewIndex);
    syncTitleEnter(viewIndex);

    if (isProcess) {
      const covering = rect.top <= 0 && rect.bottom > 96;
      root.toggleAttribute('data-close-nav', covering && viewIndex === views - 1);
    }
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

  update();
}

function setupScrolly() {
  document.querySelectorAll('[data-scrolly]').forEach(setupScrollyRoot);
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

/**
 * Native snap strip: prev/next and arrow keys move one still.
 */
function setupWorkCarousel() {
  const root = document.querySelector('[data-carousel]');
  if (!root) return;

  const track = root.querySelector('.work-row');
  const prev = document.querySelector('[data-carousel-prev]');
  const next = document.querySelector('[data-carousel-next]');
  if (!track || !prev || !next) return;

  const slideStep = () => {
    const first = track.querySelector(':scope > li');
    if (!first) return 0;
    const gap = Number.parseFloat(getComputedStyle(track).gap) || 0;
    return first.getBoundingClientRect().width + gap;
  };

  const sync = () => {
    const max = Math.max(0, track.scrollWidth - track.clientWidth);
    prev.disabled = track.scrollLeft <= 2;
    next.disabled = track.scrollLeft >= max - 2;
  };

  const go = (dir) => {
    const behavior = reducedMotion.matches ? 'auto' : 'smooth';
    track.scrollBy({ left: dir * slideStep(), behavior });
  };

  prev.addEventListener('click', () => go(-1));
  next.addEventListener('click', () => go(1));
  track.addEventListener('scroll', sync, { passive: true });
  window.addEventListener('resize', sync);

  root.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      go(-1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      go(1);
    }
  });

  sync();
}

renderLogos();
reducedMotion.addEventListener('change', renderLogos);
setupLogoHover();
setupNav();
setupScrolly();
setupReveal();
setupWorkCarousel();
