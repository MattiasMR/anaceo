// ---- NAV SCROLL ----
const nav = document.getElementById('nav');
const heroBg = document.getElementById('heroBg');
const manualImg = document.getElementById('manualFloatImg');
const manualSection = document.getElementById('manual');

window.addEventListener('scroll', () => {
  const sy = window.scrollY;
  nav.classList.toggle('scrolled', sy > 60);
  // Hero parallax
  if (heroBg && sy < window.innerHeight * 1.2) {
    heroBg.style.transform = `translateY(${sy * 0.28}px)`;
  }
  // Manual float image parallax
  if (manualImg && manualSection) {
    const rect = manualSection.getBoundingClientRect();
    const prog = -rect.top / (window.innerHeight * 0.8);
    if (prog > -0.5 && prog < 1.5) {
      manualImg.style.transform = `translateY(${prog * 36}px)`;
    }
  }
}, {passive: true});

// Mouse parallax on hero
document.addEventListener('mousemove', e => {
  if (!heroBg || window.scrollY > window.innerHeight) return;
  const x = (e.clientX / window.innerWidth - 0.5) * 14;
  const y = (e.clientY / window.innerHeight - 0.5) * 14 + window.scrollY * 0.28;
  heroBg.style.transform = `translate(${x}px, ${y}px)`;
});

// ---- REVEAL ----
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('revealed');
    const counter = e.target.querySelector('[data-count]');
    if (counter && !counter.dataset.done) {
      counter.dataset.done = 1;
      const end = +counter.dataset.count;
      let start = null;
      const step = ts => {
        if (!start) start = ts;
        const p = Math.min((ts - start) / 1800, 1);
        counter.textContent = Math.floor((1 - Math.pow(1 - p, 3)) * end);
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }
  });
}, {threshold: 0.12, rootMargin: '0px 0px -40px 0px'});

document.querySelectorAll('.reveal,.reveal-l,.reveal-r').forEach(el => observer.observe(el));

// ---- COUNTDOWN ----
function tick() {
  const target = new Date('2026-12-01T09:00:00');
  const now = new Date();
  const diff = Math.max(0, target - now);
  const days = Math.floor(diff / 864e5);
  const hours = Math.floor((diff % 864e5) / 36e5);
  const mins = Math.floor((diff % 36e5) / 6e4);
  const secs = Math.floor((diff % 6e4) / 1e3);
  const pad = (n, len) => String(n).padStart(len, '0');
  document.getElementById('cd-days').textContent = pad(days, 3);
  document.getElementById('cd-hours').textContent = pad(hours, 2);
  document.getElementById('cd-mins').textContent = pad(mins, 2);
  document.getElementById('cd-secs').textContent = pad(secs, 2);
  // Progress bar: from Jan 1 2026 to Dec 1 2026
  const yearStart = new Date('2026-01-01');
  const total = target - yearStart;
  const elapsed = now - yearStart;
  const pct = Math.min(100, Math.max(0, (elapsed / total) * 100));
  const prog = document.getElementById('cdProgress');
  if (prog) prog.style.width = pct + '%';
}
tick();
setInterval(tick, 1000);

// ---- SLIDER ----
let currentSlide = 0;
const track = document.getElementById('sliderTrack');
const dots = document.querySelectorAll('.slider-dot');
const totalSlides = 4;
let autoplay;

function goSlide(n) {
  currentSlide = (n + totalSlides) % totalSlides;
  track.style.transform = `translateX(-${currentSlide * 100}%)`;
  dots.forEach((d, i) => d.classList.toggle('active', i === currentSlide));
  clearInterval(autoplay);
  autoplay = setInterval(() => goSlide(currentSlide + 1), 4500);
}

document.getElementById('prevBtn').addEventListener('click', () => goSlide(currentSlide - 1));
document.getElementById('nextBtn').addEventListener('click', () => goSlide(currentSlide + 1));
autoplay = setInterval(() => goSlide(currentSlide + 1), 4500);

// Touch swipe on slider
let touchStartX = 0;
track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, {passive: true});
track.addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - touchStartX;
  if (Math.abs(dx) > 40) goSlide(currentSlide + (dx < 0 ? 1 : -1));
});

// ---- SMOOTH SCROLL ----
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const t = document.querySelector(a.getAttribute('href'));
    if (t) { e.preventDefault(); t.scrollIntoView({behavior: 'smooth'}); }
  });
});

// ---- FORM ----
document.getElementById('submitBtn').addEventListener('click', function() {
  this.textContent = '¡Mensaje enviado! ✓';
  this.style.background = '#1A9E5A';
  setTimeout(() => { this.textContent = 'Enviar mensaje'; this.style.background = ''; }, 3000);
});
