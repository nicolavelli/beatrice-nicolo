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

const rsvpDialog = document.querySelector('#rsvp-dialog');
const rsvpOpenButton = document.querySelector('.rsvp-open');
const rsvpCloseButton = document.querySelector('.rsvp-close');
const rsvpForm = document.querySelector('#rsvp-form');
const attendanceDetails = document.querySelector('[data-attendance-details]');
const childrenDetails = document.querySelector('[data-children-details]');
const overnightDetails = document.querySelector('[data-overnight-details]');
const rsvpStatus = document.querySelector('.rsvp-form-status');

if (rsvpDialog && rsvpOpenButton && rsvpCloseButton && rsvpForm) {
  const setDialogOpen = (open) => {
    document.body.classList.toggle('rsvp-opened', open);
    if (open) {
      rsvpDialog.showModal();
      setTimeout(() => document.querySelector('#guest-name')?.focus(), 30);
    } else {
      rsvpDialog.close();
    }
  };

  rsvpOpenButton.addEventListener('click', () => setDialogOpen(true));
  rsvpCloseButton.addEventListener('click', () => setDialogOpen(false));
  rsvpDialog.addEventListener('click', (event) => {
    if (event.target === rsvpDialog) setDialogOpen(false);
  });
  rsvpDialog.addEventListener('close', () => document.body.classList.remove('rsvp-opened'));

  rsvpForm.addEventListener('change', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) return;

    if (target.name === 'attendance') {
      const present = target.value === 'si';
      attendanceDetails.hidden = !present;
      if (!present) {
        childrenDetails.hidden = true;
        overnightDetails.hidden = true;
      }
    }

    if (target.name === 'children') {
      childrenDetails.hidden = target.value !== 'si';
    }

    if (target.name === 'overnight') {
      overnightDetails.hidden = target.value !== 'si';
    }
  });

  rsvpForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!rsvpForm.reportValidity()) return;

    const formData = new FormData(rsvpForm);
    const payload = Object.fromEntries(formData.entries());
    localStorage.setItem('beatrice-nicolo-rsvp-draft', JSON.stringify(payload));

    rsvpStatus.textContent = 'Dati compilati correttamente. Il modulo è pronto per essere collegato all’invio definitivo.';
  });
}
