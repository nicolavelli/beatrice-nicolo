const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));


const weddingDate = new Date('2026-12-07T11:30:00+01:00');

function updateCountdown() {
  const now = new Date();
  let distance = weddingDate.getTime() - now.getTime();

  if (distance < 0) distance = 0;

  const days = Math.floor(distance / 86400000);
  const hours = Math.floor((distance % 86400000) / 3600000);
  const minutes = Math.floor((distance % 3600000) / 60000);
  const seconds = Math.floor((distance % 60000) / 1000);

  const values = { days, hours, minutes, seconds };

  Object.entries(values).forEach(([unit, value]) => {
    const el = document.querySelector(`[data-countdown="${unit}"]`);
    if (!el) return;
    el.textContent = unit === 'days' ? String(value) : String(value).padStart(2, '0');
  });
}

updateCountdown();
setInterval(updateCountdown, 1000);
