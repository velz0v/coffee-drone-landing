/* ═══════════════════════════════════════════════
   AeroBrew — interactions
   ═══════════════════════════════════════════════ */

'use strict';

/* ─── Sticky nav ─── */
const nav = document.getElementById('nav');
const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 12);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* ─── Mobile burger ─── */
const burger = document.getElementById('burger');
burger.addEventListener('click', () => nav.classList.toggle('open'));
document.querySelectorAll('.nav__links a').forEach(a =>
  a.addEventListener('click', () => nav.classList.remove('open'))
);

/* ─── Scroll reveal ─── */
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      revealObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ─── Animated counters ─── */
const counterObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target;
    counterObserver.unobserve(el);
    const to = parseInt(el.dataset.to, 10) || 0;
    const dur = 1400;
    const t0 = performance.now();
    const tick = now => {
      const p = Math.min(1, (now - t0) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      const val = Math.round(to * eased);
      el.textContent = val >= 1000 ? val.toLocaleString('ru-RU') : val;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}, { threshold: 0.6 });
document.querySelectorAll('.js-counter').forEach(el => counterObserver.observe(el));

/* ─── Order modal ─── */
const modal = document.getElementById('orderModal');
const stageForm = document.getElementById('modalForm');
const stageFlight = document.getElementById('modalFlight');

function openModal(drink) {
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  stageForm.classList.remove('hidden');
  stageFlight.classList.add('hidden');
  if (drink) {
    const sel = document.getElementById('drink');
    [...sel.options].some(o => { if (o.text === drink) { sel.value = o.value || o.text; return true; } return false; });
  }
  setTimeout(() => document.getElementById('address')?.focus(), 260);
}

function closeModal() {
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  stopFlight();
}

document.querySelectorAll('.js-order').forEach(btn =>
  btn.addEventListener('click', () => openModal(btn.dataset.drink || null))
);
modal.querySelectorAll('.js-close').forEach(el => el.addEventListener('click', closeModal));
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

/* ─── Flight simulation ─── */
const flightEmoji = document.getElementById('flightEmoji');
const flightTitle = document.getElementById('flightTitle');
const flightBar = document.getElementById('flightBar');
const flightEta = document.getElementById('flightEta');
const flightSteps = [...document.querySelectorAll('#flightSteps span')];

const STAGES = [
  { emoji: '🧑‍🍳', title: 'Бариста готовит твой кофе…' },
  { emoji: '📦', title: 'Запечатываем в термо-капсулу…' },
  { emoji: '🛸', title: 'Дрон взлетел! Идёт по маршруту…' },
  { emoji: '🪟', title: 'У окна! Ловим капсулу ☕' },
];

let flightTimer = null;
let etaTimer = null;

function stopFlight() {
  clearInterval(flightTimer);
  clearInterval(etaTimer);
  flightTimer = etaTimer = null;
}

function startFlight() {
  const drink = document.getElementById('drink').value;
  stageForm.classList.add('hidden');
  stageFlight.classList.remove('hidden');
  stopFlight();

  let step = 0;
  let etaSec = 15 * 60;

  const applyStage = i => {
    flightEmoji.textContent = STAGES[i].emoji;
    flightTitle.textContent = STAGES[i].title;
    flightBar.style.width = `${(i + 1) / STAGES.length * 100}%`;
    flightSteps.forEach((s, k) => s.classList.toggle('is-active', k <= i));
    if (i === STAGES.length - 1) {
      flightEta.textContent = `«${drink}» доставлен 🎉 Осталось решить, с какой стороны подойти к счастью.`;
    }
  };

  applyStage(0);
  etaSec -= 40;
  flightEta.textContent = `ETA: ${fmt(etaSec)} ☁️`;

  etaTimer = setInterval(() => {
    etaSec = Math.max(0, etaSec - 17);
    flightEta.textContent = etaSec > 0 ? `ETA: ${fmt(etaSec)} ☁️` : 'Досталось! 🎉';
  }, 120);

  flightTimer = setInterval(() => {
    step++;
    if (step >= STAGES.length) {
      stopFlight();
      setTimeout(() => {
        if (modal.classList.contains('open')) closeModal();
      }, 2600);
      return;
    }
    applyStage(step);
  }, 2100);
}

const fmt = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

document.getElementById('launchBtn').addEventListener('click', startFlight);

/* ─── Subscribe fake ─── */
const subForm = document.getElementById('subForm');
subForm.addEventListener('submit', e => {
  e.preventDefault();
  subForm.innerHTML = '<b>Готово 🛸</b><span style="color:#C4B3A2;font-size:.9rem">Теперь предстоит ждать писем про погоду и кофе. Дрон-пилоты довольны.</span>';
});
