const API_URL =
  "https://script.google.com/macros/s/AKfycbwpVwDtilgJhHD0J7DnQHpHI-nC9NEa4aI6vscup1pJsc6WKLs1whR6SNE_slYFnypb/exec";

/* =========================
   STATE
========================= */

let currentGuestSlug = null;
let guestAttendance = null;
let formLocked = false;

/* =========================
   OVERLAY + MUSIC
========================= */

const overlay = document.getElementById('overlay');
const openButton = document.getElementById('openButton');
const audio = document.getElementById('audio');

if (openButton && overlay) {
  openButton.addEventListener('click', () => {
    overlay.style.transition = "1.2s ease";
    overlay.style.opacity = 0;

    setTimeout(() => {
      overlay.style.display = "none";
    }, 1200);

    audio?.play().catch(() => {});
  });
}

const musicButton = document.getElementById('musicButton');

if (musicButton && audio) {
  musicButton.addEventListener('click', () => {
    if (audio.paused) audio.play();
    else audio.pause();
  });
}

/* =========================
   COUNTDOWN
========================= */

const targetDate = new Date('2026-10-24T00:00:00').getTime();

function updateCountdown() {
  const d = document.getElementById('days');
  const h = document.getElementById('hours');
  const m = document.getElementById('minutes');
  const s = document.getElementById('seconds');

  if (!d || !h || !m || !s) return;

  const now = Date.now();
  const distance = targetDate - now;

  if (distance <= 0) return;

  d.innerText = Math.floor(distance / (1000 * 60 * 60 * 24));
  h.innerText = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  m.innerText = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  s.innerText = Math.floor((distance % (1000 * 60)) / 1000);
}

setInterval(updateCountdown, 1000);
updateCountdown();

/* =========================
   GUEST LOAD
========================= */

async function loadGuest() {
  try {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get('guest');

    currentGuestSlug = slug;

    const greetingEl = document.getElementById('guestGreeting');
    const form = document.getElementById('weddingForm');
    const success = document.getElementById('successMessage');

    if (!slug) return;

    const res = await fetch(`${API_URL}?guest=${slug}`);
    const data = await res.json();

    if (!data.success || !data.guest) return;

    const name = data.guest.displayName || "Гость";
    guestAttendance = data.guest.attendance || null;

    if (greetingEl) {
      greetingEl.innerText = "Дорогие " + name;
    }

    /* =========================
       ALREADY ANSWERED
    ========================= */

    if (data.guest.answered === true) {
      lockFormFinal();
      return;
    }

    /* RSVP INIT */
    initRSVPFlow();

  } catch (e) {
    console.error("Guest load error:", e);
  }
}

loadGuest();

/* =========================
   RSVP FLOW INIT
========================= */

function initRSVPFlow() {
  const attendanceSelect = document.getElementById('attendance');
  const form = document.getElementById('weddingForm');

  if (!attendanceSelect || !form) return;

  toggleAttendanceUI(attendanceSelect.value);

  attendanceSelect.addEventListener('change', (e) => {
    toggleAttendanceUI(e.target.value);
  });
}

/* =========================
   SHOW / HIDE FORM LOGIC
========================= */

function toggleAttendanceUI(value) {
  const form = document.getElementById('weddingForm');
  const noMessage = document.getElementById('noMessage');

  if (!form) return;

  if (value === "Да") {
    if (noMessage) noMessage.remove();
    form.style.display = "block";
  }

  if (value === "Нет") {
    form.style.display = "none";

    if (!noMessage) {
      const msg = document.createElement('div');
      msg.id = "noMessage";
      msg.className = "success-message";
      msg.innerText =
        "Нам очень жаль, что у Вас не получится присутствовать на празднике. Если Ваши планы изменятся до 24 сентября 2026 года, пожалуйста, сообщите нам об этом.";
      form.parentNode.appendChild(msg);
    }
  }
}

/* =========================
   FORM SUBMIT
========================= */

const form = document.getElementById('weddingForm');

if (form) {
  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    if (formLocked) return;

    const attendance = document.getElementById('attendance')?.value || "";

    let childrenCount = 0;

    if (document.getElementById('childrenSelect')?.value === "Да") {
      childrenCount =
        parseInt(document.getElementById('childrenCount')?.value || "0");
    }

    const drinks = [];
    document.querySelectorAll('.checkbox-group input:checked')
      .forEach(el => drinks.push(el.value));

    const data = {
      slug: currentGuestSlug,
      guestName: "", // ИМЯ ТОЛЬКО СЕРВЕРНОЕ
      attendance,
      transfer: document.getElementById('transfer')?.value || "",
      children: document.getElementById('childrenSelect')?.value || "",
      childrenCount,
      drinks,
      allergy: document.getElementById('allergy')?.value || "",
      userAgent: navigator.userAgent
    };

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify(data)
      });

      const result = await res.json();

      if (result.success) {
        lockFormFinal();
      } else {
        alert(result.message || "Ошибка отправки");
      }

    } catch (e) {
      console.error(e);
      alert("Ошибка сети");
    }
  });
}

/* =========================
   LOCK UI AFTER SUBMIT
========================= */

function lockFormFinal() {
  formLocked = true;

  const form = document.getElementById('weddingForm');
  const success = document.getElementById('successMessage');

  if (form) form.style.display = "none";

  if (success) {
    success.classList.remove('hidden');
    success.innerText =
      "Ваш ответ отправлен. Ждём Вас на нашем празднике ❤️";
  }
}
/* =========================
   SCROLL REVEAL SYSTEM
========================= */

function initScrollReveal() {
  const elements = document.querySelectorAll('.fade');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('show');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15
  });

  elements.forEach(el => observer.observe(el));
}

initScrollReveal();