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

      const childrenRadios = rsvpForm.querySelectorAll('input[name="children"]');
      const foodRadios = rsvpForm.querySelectorAll('input[name="food"]');
      const overnightRadios = rsvpForm.querySelectorAll('input[name="overnight"]');

      [...childrenRadios, ...foodRadios, ...overnightRadios].forEach((input) => {
        input.required = false;
      });

      if (present) {
        childrenRadios[0].required = true;
        foodRadios[0].required = true;
        overnightRadios[0].required = true;
      } else {
        childrenDetails.hidden = true;
        overnightDetails.hidden = true;
      }
    }

    if (target.name === 'children') {
      const hasChildren = target.value === 'si';
      childrenDetails.hidden = !hasChildren;
      const number = rsvpForm.querySelector('input[name="children_number"]');
      const ages = rsvpForm.querySelector('input[name="children_ages"]');
      number.required = hasChildren;
      ages.required = hasChildren;
    }

    if (target.name === 'overnight') {
      const needsRoom = target.value === 'si';
      overnightDetails.hidden = !needsRoom;
      const rooms = rsvpForm.querySelector('input[name="rooms"]');
      const people = rsvpForm.querySelector('input[name="overnight_people"]');
      rooms.required = needsRoom;
      people.required = needsRoom;
    }

    if (target.name === 'food') {
      const allergies = rsvpForm.querySelector('input[name="food_allergies"]');
      const other = rsvpForm.querySelector('input[name="food_other"]');
      allergies.required = target.value === 'allergie';
      other.required = target.value === 'altro';
    }
  });
  rsvpForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!rsvpForm.reportValidity()) return;

    const submitButton = rsvpForm.querySelector('.rsvp-submit');
    const getValue = (name) => {
      const field = rsvpForm.querySelector(`[name="${name}"]`);
      return field ? String(field.value || '').trim() : '';
    };
    const getChecked = (name) => {
      const field = rsvpForm.querySelector(`input[name="${name}"]:checked`);
      return field ? field.value : '';
    };

    const attendance = getChecked('attendance');
    const children = getChecked('children');
    const food = getChecked('food');
    const overnight = getChecked('overnight');

    const attendanceMap = {
      si: 'Sì, sarò presente',
      no: 'Mi dispiace, non potrò partecipare'
    };
    const yesNoMap = {
      si: 'Sì',
      no: 'No'
    };
    const foodMap = {
      nessuna: 'Nessuna',
      vegetariano: 'Vegetariano',
      vegano: 'Vegano',
      'senza-glutine': 'Senza glutine',
      allergie: 'Allergie/intolleranze'
    };
    const overnightMap = {
      si: 'Sì, necessito di pernottamento',
      no: 'Non necessito di pernottamento'
    };

    const fields = {
      'entry.1739985760': getValue('guest_name'),
      'entry.1942568367': getValue('guest_surname'),
      'entry.925805838': attendanceMap[attendance] || ''
    };

    if (attendance === 'si') {
      fields['entry.274418705'] = yesNoMap[children] || '';
      fields['entry.1432009974'] = children === 'si' ? getValue('children_number') : '';
      fields['entry.541938802'] = children === 'si' ? getValue('children_ages') : '';

      if (food === 'altro') {
        const otherFood = getValue('food_other');
        fields['entry.31519537'] = '__other_option__';
        fields['entry.31519537.other_option_response'] = otherFood;
        fields['entry.625819844'] = otherFood;
      } else {
        fields['entry.31519537'] = foodMap[food] || '';
        fields['entry.625819844'] = '';
      }

      fields['entry.175629213'] = food === 'allergie' ? getValue('food_allergies') : '';
      fields['entry.1317663739'] = overnightMap[overnight] || '';
      fields['entry.743480152'] = overnight === 'si' ? getValue('rooms') : '';
      fields['entry.829440453'] = overnight === 'si' ? getValue('overnight_people') : '';
      fields['entry.864995182'] = getValue('special_needs');
    }

    const googleFormUrl = 'https://docs.google.com/forms/d/e/1FAIpQLSf-Us74iZMntnSuSksnYq2_1BkBTYjKzqc0iGv6lWQcMNrUvw/formResponse';
    const body = new URLSearchParams();

    Object.entries(fields).forEach(([name, value]) => {
      if (value !== '') body.append(name, value);
    });

    // Parametri standard usati dal modulo Google.
    body.append('fvv', '1');
    body.append('pageHistory', '0');
    body.append('submit', 'Submit');

    submitButton.disabled = true;
    rsvpStatus.textContent = 'Invio in corso…';

    fetch(googleFormUrl, {
      method: 'POST',
      mode: 'no-cors',
      cache: 'no-store',
      keepalive: true,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
      },
      body: body.toString()
    })
      .then(() => {
        rsvpStatus.innerHTML = '<strong>Grazie, la vostra conferma è arrivata.</strong><br><strong>Ci vediamo il 7 dicembre.</strong>';
        submitButton.textContent = 'Conferma inviata';
      })
      .catch(() => {
        rsvpStatus.textContent = 'Invio non riuscito. Riprova tra qualche istante.';
        submitButton.disabled = false;
      });
  });
}


const giftTicketOpen = document.querySelector('.gift-ticket-open');
const giftTicket = document.querySelector('#gift-ticket');
if (giftTicketOpen && giftTicket) {
  giftTicketOpen.addEventListener('click', () => {
    const opening = giftTicket.hidden;
    giftTicket.hidden = !opening;
    giftTicketOpen.setAttribute('aria-expanded', String(opening));
    giftTicketOpen.textContent = opening ? 'Chiudi il biglietto ↑' : 'Apri il biglietto →';
    if (opening) {
      setTimeout(() => giftTicket.scrollIntoView({ behavior:'smooth', block:'nearest' }), 40);
    }
  });
}
