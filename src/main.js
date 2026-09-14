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

/**
 * Render a single client mark.
 */
function mark(client) {
  return `<img class="logo-mark" src="${client.src}" alt="${client.name}" />`;
}

function slot(client, index) {
  const delay = 80 + index * 40;
  return `<div class="logo-slot" style="animation-delay:${delay}ms">${mark(client)}</div>`;
}

function renderLogos() {
  const rowsRoot = document.querySelector('[data-logo-rows]');
  const track = document.querySelector('[data-logo-track]');
  if (!rowsRoot || !track) return;

  const rows = [CLIENTS.slice(0, 7), CLIENTS.slice(7, 14), CLIENTS.slice(14, 21), CLIENTS.slice(21, 28)];
  rowsRoot.innerHTML = rows
    .map((row, rowIndex) => `<div class="logo-row">${row.map((c, i) => slot(c, rowIndex * 7 + i)).join('')}</div>`)
    .join('');

  const marquee = CLIENTS.concat(CLIENTS).concat(CLIENTS);
  track.innerHTML = marquee.map((c) => slot(c, 0)).join('');
}

function setupNav() {
  const toggle = document.querySelector('[data-nav-toggle]');
  const menu = document.querySelector('[data-mobile-menu]');
  if (!toggle || !menu) return;

  const close = () => {
    menu.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

  toggle.addEventListener('click', () => {
    const open = menu.hidden;
    menu.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  });

  menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', close));
  window.addEventListener('resize', () => {
    if (window.matchMedia('(min-width: 1024px)').matches) close();
  });
}

/**
 * Pin the process story and activate a chapter from scroll position.
 */
function setupScrolly() {
  const root = document.querySelector('[data-scrolly]');
  if (!root) return;

  const chapters = [...root.querySelectorAll('[data-chapter]')];
  const marks = [...root.querySelectorAll('[data-step-mark]')];
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobileNav = root.querySelector('[data-process-nav]');

  const setStep = (index) => {
    if (root.dataset.step === String(index)) return;
    root.dataset.step = String(index);
    chapters.forEach((chapter, i) => {
      chapter.toggleAttribute('data-active', i === index);
    });
    marks.forEach((mark) => {
      const i = Number(mark.dataset.stepMark);
      if (i === index) mark.setAttribute('aria-current', 'step');
      else mark.removeAttribute('aria-current');
    });
  };

  /**
   * Map scroll to progress and the chapter around the viewport reading line.
   */
  const update = () => {
    const rect = root.getBoundingClientRect();
    const range = rect.height - window.innerHeight;
    const progress = range <= 0 ? 1 : Math.min(1, Math.max(0, -rect.top / range));
    root.style.setProperty('--process-progress', progress.toFixed(4));

    const desktop = window.matchMedia('(min-width: 1024px)').matches;
    if (mobileNav) {
      mobileNav.toggleAttribute(
        'data-stuck',
        !desktop && mobileNav.getBoundingClientRect().top <= 60,
      );
    }

    const probe = desktop ? window.innerHeight * 0.38 : window.innerHeight * 0.28;
    let current = 0;
    chapters.forEach((chapter, i) => {
      const box = chapter.getBoundingClientRect();
      if (box.top <= probe) current = i;
    });
    setStep(current);
  };

  marks.forEach((mark) => {
    mark.addEventListener('click', () => {
      const index = Number(mark.dataset.stepMark);
      chapters[index]?.scrollIntoView({
        behavior: reduced ? 'auto' : 'smooth',
        block: 'start',
      });
    });
  });

  if (reduced) {
    setStep(0);
    root.style.setProperty('--process-progress', '1');
    return;
  }

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
  update();
}

/**
 * Play a short entrance on each process visual once it reaches the viewport.
 */
function setupArtifacts() {
  const nodes = [...document.querySelectorAll('.process .artifact')];
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
 * Play entrance motion once a block reaches the viewport.
 */
function setupReveal() {
  const nodes = [...document.querySelectorAll('[data-reveal]')];
  if (!nodes.length) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    nodes.forEach((node) => node.classList.add('is-in'));
    return;
  }

  const show = (node) => node.classList.add('is-in');

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
}

renderLogos();
setupNav();
setupScrolly();
setupArtifacts();
setupReveal();
