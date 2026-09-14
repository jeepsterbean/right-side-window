import './styles.css';

/** Client marks for the nowadays-style logo field. */
const CLIENTS = [
  { src: '/logos/asics.jpg', name: 'ASICS' },
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

renderLogos();
setupNav();
