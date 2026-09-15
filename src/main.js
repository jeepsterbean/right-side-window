import './styles.css';
import './process.css';
import './team.css';
import './story.css';

document.documentElement.classList.add('js');

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
  return `<div class="logo-slot"${hidden}><img class="logo-mark" src="${client.src}" alt="${alt}" width="120" height="36" decoding="async" /></div>`;
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
  rowsRoot.querySelectorAll('.logo-mark').forEach((img) => {
    img.addEventListener('error', () => {
      const cell = img.closest('.logo-slot');
      if (cell) cell.hidden = true;
    });
  });
}

/**
 * Pause the row under the pointer or keyboard focus so the marquee
 * meets WCAG 2.2.2 (moving content that lasts more than five seconds).
 */
function setRowPaused(row, paused) {
  row.querySelector('.logo-track')?.getAnimations().forEach((anim) => {
    anim.playbackRate = paused ? 0 : 1;
  });
}

function setupLogoHover() {
  const rowsRoot = document.querySelector('[data-logo-rows]');
  if (!rowsRoot) return;

  rowsRoot.addEventListener('pointerover', (event) => {
    const row = event.target instanceof Element ? event.target.closest('.logo-row[data-dir]') : null;
    const from = event.relatedTarget instanceof Element ? event.relatedTarget.closest('.logo-row[data-dir]') : null;
    if (!row || row === from) return;
    setRowPaused(row, true);
  });

  rowsRoot.addEventListener('pointerout', (event) => {
    const row = event.target instanceof Element ? event.target.closest('.logo-row[data-dir]') : null;
    const to = event.relatedTarget instanceof Element ? event.relatedTarget.closest('.logo-row[data-dir]') : null;
    if (!row || row === to) return;
    setRowPaused(row, false);
  });
}

function setupNav() {
  const nav = document.querySelector('[data-nav]');
  const toggle = document.querySelector('[data-nav-toggle]');
  const menu = document.querySelector('[data-mobile-menu]');
  const label = document.querySelector('[data-nav-label]');
  const iconOpen = toggle?.querySelector('.nav-icon-open');
  const iconClose = toggle?.querySelector('.nav-icon-close');
  const main = document.getElementById('main');
  const footer = document.querySelector('.site-foot');
  const skip = document.querySelector('.skip-link');
  if (!nav) return;

  const syncScroll = () => {
    nav.toggleAttribute('data-scrolled', window.scrollY > 12);
  };

  syncScroll();
  window.addEventListener('scroll', syncScroll, { passive: true });

  if (!toggle || !menu) return;

  /**
   * Open or close the drawer. Restore focus only after Escape so a
   * resize-to-desktop close doesn't yank keyboard users around.
   */
  const setOpen = (open, { restoreFocus = false } = {}) => {
    if (menu.hidden === !open) {
      if (!open && restoreFocus) toggle.focus();
      return;
    }

    menu.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    nav.toggleAttribute('data-menu-open', open);
    document.documentElement.classList.toggle('nav-locked', open);
    if (label) label.textContent = open ? 'Close menu' : 'Open menu';
    if (iconOpen) iconOpen.hidden = open;
    if (iconClose) iconClose.hidden = !open;
    main?.toggleAttribute('inert', open);
    footer?.toggleAttribute('inert', open);
    skip?.toggleAttribute('inert', open);
    if (!open && restoreFocus) toggle.focus();
  };

  const close = (options) => setOpen(false, options);

  toggle.addEventListener('click', () => setOpen(menu.hidden));

  menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => close()));

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !menu.hidden) {
      event.preventDefault();
      close({ restoreFocus: true });
    }
  });

  window.addEventListener('resize', () => {
    if (window.matchMedia('(min-width: 1024px)').matches) close();
  });
}

/**
 * Drive a sticky scrolly stage: one viewport, views swap with scroll progress.
 * Process adds an opening beat before the chapters so the $1,000 question
 * can sit as its own chapter, then pin to the top for the four steps.
 * Work-more does the same with "More happy customers", then holds the strip.
 * Team uses data-views with no chapters: three focused timeline beats, then close.
 * Straits uses data-views="4" over three chapters so the intro owns view 0.
 */
function setupScrollyRoot(root) {
  const chapters = [...root.querySelectorAll('[data-chapter]')];
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const desktop = window.matchMedia('(min-width: 1024px)');
  const isProcess = root.matches('.process');
  const isWorkMore = root.matches('.work-more');
  const isCase = root.matches('.case');
  const views = Number(root.dataset.views) || (isProcess ? chapters.length + 1 : chapters.length);
  const leadsWithTitle = views > chapters.length;
  if (!views) return;

  const title = root.querySelector('.process-question, .work-more-title');
  const board = root.querySelector('.process-board, .work-more-board');
  const caseHeading = isCase ? root.querySelector('.case-heading') : null;
  const teamTimeline = root.querySelector('.team-timeline');
  const teamClose = root.querySelector('.team-close');
  let current = -1;

  /**
   * Split the Straits heading into per-character spans so view 0 can type
   * it on, then release the lede. Spaces stay in the flow for natural wrap.
   */
  if (caseHeading && !caseHeading.dataset.typedReady) {
    const raw = caseHeading.textContent.replace(/\s+/g, ' ').trim();
    caseHeading.replaceChildren(
      ...[...raw].map((ch, i) => {
        const span = document.createElement('span');
        span.className = ch === ' ' ? 'case-char case-char--space' : 'case-char';
        span.style.setProperty('--i', String(i));
        span.textContent = ch;
        return span;
      }),
    );
    caseHeading.dataset.typedReady = '';
    root.style.setProperty('--case-chars', String(raw.length));
  }

  if (isProcess) {
    root.style.setProperty('--process-views', String(views));
  } else {
    root.style.setProperty('--scrolly-views', String(views));
  }

  /**
   * Process scenes 0–3 share one timeline; opening and close stay off it.
   */
  const syncProcessTimeline = (chapterIndex) => {
    if (!isProcess) return;
    if (chapterIndex >= 0 && chapterIndex <= 3) root.dataset.timeline = String(chapterIndex);
    else delete root.dataset.timeline;
  };

  /**
   * Size the open timeline row to the chapter copy so later steps sit
   * on the body instead of in a leftover gap. Then sit the whole spine
   * in the vertical middle of the stage so the bottom doesn't go empty.
   */
  const syncBodySlot = (chapterIndex) => {
    if (!isProcess) return;
    if (!desktop.matches || motion.matches || chapterIndex < 0 || chapterIndex > 3) {
      root.style.removeProperty('--process-body-slot');
      root.style.removeProperty('--cluster-y');
      return;
    }
    const body = chapters[chapterIndex].querySelector('.process-body');
    const timeline = root.querySelector('.process-timeline');
    if (!body || !timeline || !board) return;
    const gap = 44;
    const height = Math.ceil(body.getBoundingClientRect().height) + gap;
    root.style.setProperty('--process-body-slot', `${height}px`);

    const titleReserve = 64;
    const y = Math.max(
      titleReserve,
      Math.round((board.clientHeight - timeline.getBoundingClientRect().height) / 2),
    );
    root.style.setProperty('--cluster-y', `${y}px`);
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
  const syncTitle = (viewIndex) => {
    if (!title) return;
    if (viewIndex <= 0) root.dataset.title = 'open';
    else if (isProcess && viewIndex >= views - 1) root.dataset.title = 'out';
    else root.dataset.title = 'pin';
  };

  /**
   * Entrance flag for opening titles: process/work-more word-reveal, or the
   * Straits typewriter. Clears on leave so scrolling back can play again.
   */
  const syncTitleEnter = (viewIndex) => {
    if (!leadsWithTitle || (!title && !caseHeading)) return;
    const box = (title || caseHeading).getBoundingClientRect();
    const onScreen = box.top < window.innerHeight * 0.88 && box.bottom > 64;
    if (viewIndex === 0 && onScreen) root.dataset.titleEnter = '';
    else root.removeAttribute('data-title-enter');
  };

  /**
   * Team keeps all three steps readable until the close beat; then the
   * head + timeline leave and only the close copy stays in the a11y tree.
   */
  const syncTeamLayers = (viewIndex) => {
    if (!teamTimeline || !teamClose) return;
    const teamHead = root.querySelector('.team-head');
    const stacked = viewIndex < 0;
    const closing = viewIndex === views - 1;
    teamTimeline.toggleAttribute('inert', !stacked && closing);
    teamClose.toggleAttribute('inert', !stacked && !closing);
    if (teamHead) teamHead.toggleAttribute('inert', !stacked && closing);
    if (stacked) {
      teamTimeline.removeAttribute('aria-hidden');
      teamClose.removeAttribute('aria-hidden');
      if (teamHead) teamHead.removeAttribute('aria-hidden');
      return;
    }
    teamTimeline.setAttribute('aria-hidden', String(closing));
    teamClose.setAttribute('aria-hidden', String(!closing));
    if (teamHead) teamHead.setAttribute('aria-hidden', String(closing));
  };

  const setStacked = () => {
    current = -1;
    root.dataset.step = '0';
    syncProcessTimeline(-1);
    syncBodySlot(-1);
    syncTeamLayers(-1);
    root.removeAttribute('data-close-nav');
    root.removeAttribute('data-title-enter');
    if (title) {
      root.removeAttribute('data-title');
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
    const chapterIndex = leadsWithTitle ? viewIndex - 1 : viewIndex;
    syncProcessTimeline(chapterIndex);
    syncTitle(viewIndex);
    syncTeamLayers(viewIndex);
    chapters.forEach((chapter, i) => {
      const on = isWorkMore ? viewIndex > 0 : i === chapterIndex;
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
    const chapterIndex = leadsWithTitle ? viewIndex - 1 : viewIndex;
    setStep(viewIndex);
    syncBodySlot(chapterIndex);
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
 * Fail open: missing IntersectionObserver or a stalled observer must
 * never leave retainer / FAQ / book invisible.
 */
function setupReveal() {
  const nodes = [...document.querySelectorAll('[data-reveal]')];
  if (!nodes.length) return;

  const show = (node) => node.classList.add('is-in');

  if (
    window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
    typeof IntersectionObserver !== 'function'
  ) {
    nodes.forEach(show);
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        show(entry.target);
        io.unobserve(entry.target);
      });
    },
    { threshold: 0.08, rootMargin: '0px 0px -6% 0px' },
  );

  nodes.forEach((node) => {
    const box = node.getBoundingClientRect();
    if (box.top < window.innerHeight * 0.92 && box.bottom > 80) show(node);
    else io.observe(node);
  });

  window.setTimeout(() => nodes.forEach(show), 2500);
}

/**
 * Infinite work strip: a slow crawl that wraps forever.
 * Extra copies of the stills keep the seam off-screen on wide viewports.
 * Arrows step one still, then the crawl continues.
 */
function setupWorkCarousel() {
  const root = document.querySelector('[data-carousel]');
  if (!root) return;

  const section = root.closest('.work-more') || root;
  const track = root.querySelector('.work-row');
  const prev = document.querySelector('[data-carousel-prev]');
  const next = document.querySelector('[data-carousel-next]');
  if (!track || !prev || !next) return;

  const originals = [...track.children];
  let loopWidth = 0;
  let settling = false;
  let dragging = false;
  let paused = false;
  let inView = false;
  let lastTs = 0;
  let settleTimer = 0;
  let raf = 0;
  const SPEED = 36;

  /**
   * Append one full copy of the original stills for wrapping.
   */
  const appendSet = () => {
    originals.forEach((item) => {
      const clone = item.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      clone.querySelectorAll('img').forEach((img) => {
        img.alt = '';
      });
      track.appendChild(clone);
    });
  };

  /**
   * Measure one cycle and clone until the track can wrap inside the viewport.
   */
  const measure = () => {
    if (track.children.length < originals.length * 2) appendSet();
    const first = originals[0];
    const marker = track.children[originals.length];
    if (!first || !marker) return;
    loopWidth = marker.getBoundingClientRect().left - first.getBoundingClientRect().left;
    if (loopWidth <= 0) return;
    let guard = 0;
    while (track.scrollWidth < track.clientWidth + loopWidth + 1 && guard < 6) {
      appendSet();
      guard += 1;
    }
  };

  const slideStep = () => {
    const first = originals[0];
    if (!first) return 0;
    const gap = Number.parseFloat(getComputedStyle(track).gap) || 0;
    return first.getBoundingClientRect().width + gap;
  };

  const wrap = () => {
    if (loopWidth <= 0) return;
    while (track.scrollLeft >= loopWidth) track.scrollLeft -= loopWidth;
    while (track.scrollLeft < 0) track.scrollLeft += loopWidth;
  };

  const go = (dir) => {
    if (loopWidth <= 0) measure();
    if (dir < 0 && track.scrollLeft <= 2) track.scrollLeft += loopWidth;
    settling = true;
    window.clearTimeout(settleTimer);
    const behavior = reducedMotion.matches ? 'auto' : 'smooth';
    track.scrollBy({ left: dir * slideStep(), behavior });
    settleTimer = window.setTimeout(() => {
      settling = false;
      wrap();
    }, reducedMotion.matches ? 0 : 650);
  };

  const canCrawl = () =>
    inView &&
    !paused &&
    (!section.hasAttribute('data-title') || section.dataset.title === 'pin') &&
    !dragging &&
    !settling &&
    !reducedMotion.matches &&
    document.visibilityState === 'visible';

  const tick = (now) => {
    if (loopWidth <= 0) measure();
    const dt = Math.min(0.048, (now - lastTs) / 1000 || 0);
    lastTs = now;
    if (canCrawl() && loopWidth > 0) {
      track.scrollLeft += SPEED * dt;
      wrap();
    }
    raf = requestAnimationFrame(tick);
  };

  const startTick = () => {
    if (raf || reducedMotion.matches) return;
    lastTs = 0;
    raf = requestAnimationFrame(tick);
  };

  const stopTick = () => {
    if (!raf) return;
    cancelAnimationFrame(raf);
    raf = 0;
  };

  const syncTick = () => {
    if (inView && document.visibilityState === 'visible' && !reducedMotion.matches) startTick();
    else stopTick();
  };

  const scene = root.closest('.work-more-scene') || root;
  const setPaused = (value) => {
    paused = value;
  };
  scene.addEventListener('pointerenter', () => setPaused(true));
  scene.addEventListener('pointerleave', () => setPaused(false));
  scene.addEventListener('focusin', () => setPaused(true));
  scene.addEventListener('focusout', (event) => {
    if (!scene.contains(event.relatedTarget)) setPaused(false);
  });

  prev.addEventListener('click', () => go(-1));
  next.addEventListener('click', () => go(1));
  track.addEventListener(
    'scroll',
    () => {
      if (!settling) wrap();
    },
    { passive: true },
  );
  track.addEventListener('pointerdown', () => {
    dragging = true;
  });
  window.addEventListener('pointerup', () => {
    dragging = false;
  });
  window.addEventListener('pointercancel', () => {
    dragging = false;
  });
  window.addEventListener('resize', measure);

  root.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      go(-1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      go(1);
    }
  });

  const io = new IntersectionObserver(
    (entries) => {
      inView = entries.some((entry) => entry.isIntersecting);
      syncTick();
    },
    { threshold: 0.18 },
  );
  io.observe(section);

  document.addEventListener('visibilitychange', () => {
    lastTs = 0;
    syncTick();
  });
  reducedMotion.addEventListener('change', syncTick);

  track.querySelectorAll('img').forEach((img) => {
    if (!img.complete) img.addEventListener('load', measure, { once: true });
  });

  measure();
  syncTick();
}

renderLogos();
reducedMotion.addEventListener('change', renderLogos);
setupLogoHover();
setupNav();
setupScrolly();
setupReveal();
setupWorkCarousel();
