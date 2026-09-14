import './styles.css';

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
 * Pin the retainer story and activate a chapter from scroll position.
 */
function setupScrolly() {
  const root = document.querySelector('[data-scrolly]');
  if (!root) return;

  const chapters = [...root.querySelectorAll('[data-chapter]')];
  const marks = [...root.querySelectorAll('[data-step-mark]')];
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const pin = root.querySelector('.offer-pin');

  const setStep = (index) => {
    if (root.dataset.step === String(index)) return;
    root.dataset.step = String(index);
    chapters.forEach((chapter, i) => {
      chapter.toggleAttribute('data-active', i === index);
    });
    marks.forEach((mark, i) => {
      if (i === index) mark.setAttribute('aria-current', 'step');
      else mark.removeAttribute('aria-current');
    });
  };

  /**
   * Map scroll position to progress (0–1) and the chapter sitting below the pin.
   */
  const update = () => {
    const rect = root.getBoundingClientRect();
    const range = rect.height - window.innerHeight;
    const progress = range <= 0 ? 1 : Math.min(1, Math.max(0, -rect.top / range));
    root.style.setProperty('--offer-progress', progress.toFixed(4));

    const pinBottom = pin ? pin.getBoundingClientRect().bottom : 0;
    if (pin) {
      pin.toggleAttribute('data-stuck', pin.getBoundingClientRect().top <= 60);
    }

    const probe = pinBottom || window.innerHeight * 0.2;
    let current = 0;
    let bestVisible = -1;
    chapters.forEach((chapter, i) => {
      const box = chapter.getBoundingClientRect();
      const visible = Math.max(
        0,
        Math.min(box.bottom, window.innerHeight) - Math.max(box.top, probe),
      );
      if (visible > bestVisible) {
        bestVisible = visible;
        current = i;
      }
    });
    setStep(current);
  };

  marks.forEach((mark) => {
    mark.addEventListener('click', () => {
      const index = Number(mark.dataset.stepMark);
      chapters[index]?.scrollIntoView({
        behavior: reduced ? 'auto' : 'smooth',
        block: 'center',
      });
    });
  });

  if (reduced) {
    root.dataset.step = '0';
    setStep(0);
    root.style.setProperty('--offer-progress', '1');
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

renderLogos();
setupNav();
setupScrolly();
