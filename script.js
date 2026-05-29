// Marescalchi — interactions

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Sticky nav state on scroll
const nav = document.getElementById('nav');
const onNavScroll = () => nav.classList.toggle('scrolled', window.scrollY > 60);
onNavScroll();

// Mobile menu
const toggle = document.getElementById('navToggle');
const links = document.querySelector('.nav__links');
toggle.addEventListener('click', () => {
  const open = links.classList.toggle('open');
  toggle.setAttribute('aria-expanded', String(open));
});
links.querySelectorAll('a').forEach((a) =>
  a.addEventListener('click', () => {
    links.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  })
);

// Hero video: reveal once it can play; gracefully fall back to the CSS backdrop
const heroVideo = document.querySelector('.hero__video');
if (heroVideo) {
  const ready = () => heroVideo.classList.add('is-ready');
  if (heroVideo.readyState >= 3) ready();
  heroVideo.addEventListener('canplay', ready, { once: true });
  heroVideo.addEventListener('loadeddata', ready, { once: true });
  // If sources 404 or can't decode, keep it hidden so the backdrop shows
  heroVideo.addEventListener('error', () => heroVideo.classList.remove('is-ready'));
}

// Staggered scroll reveal
const revealEls = Array.from(document.querySelectorAll('.reveal'));
// give siblings within the same container a cascading delay
const groups = new Map();
revealEls.forEach((el) => {
  const key = el.parentElement;
  const idx = groups.get(key) || 0;
  el.style.transitionDelay = Math.min(idx * 90, 360) + 'ms';
  groups.set(key, idx + 1);
});

if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
  );
  revealEls.forEach((el) => io.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add('in'));
}

// Parallax engine (transform-based, rAF-throttled)
const parallaxEls = Array.from(document.querySelectorAll('[data-parallax]')).map((el) => ({
  el,
  speed: parseFloat(el.dataset.speed || '0.1'),
}));

let ticking = false;
function applyParallax() {
  const vh = window.innerHeight;
  const mid = vh / 2;
  for (const { el, speed } of parallaxEls) {
    const rect = el.getBoundingClientRect();
    // only compute while near the viewport
    if (rect.bottom < -vh || rect.top > vh * 2) continue;
    const center = rect.top + rect.height / 2;
    const offset = (center - mid) * speed;
    el.style.transform = `translate3d(0, ${offset.toFixed(2)}px, 0)`;
  }
  ticking = false;
}

function onScroll() {
  onNavScroll();
  if (!reduceMotion && !ticking) {
    ticking = true;
    requestAnimationFrame(applyParallax);
  }
}

window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('resize', () => requestAnimationFrame(applyParallax), { passive: true });
if (!reduceMotion) applyParallax();

// Contact form (front-end demo)
const form = document.getElementById('contactForm');
const note = document.getElementById('formNote');
form.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }
  note.hidden = false;
  form.querySelector('button[type="submit"]').textContent = 'Sent';
  form.reset();
});

// Footer year
document.getElementById('year').textContent = new Date().getFullYear();
