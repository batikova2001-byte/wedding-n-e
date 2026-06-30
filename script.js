const API_URL =
  "https://script.google.com/macros/s/AKfycbwpVwDtilgJhHD0J7DnQHpHI-nC9NEa4aI6vscup1pJsc6WKLs1whR6SNE_slYFnypb/exec";

/* =====================================
   GLOBAL VARIABLES
===================================== */

let currentGuest = null;
let currentGuestSlug = null;
let formLocked = false;

/* =====================================
   OVERLAY
===================================== */

const overlay = document.getElementById("overlay");
const openButton = document.getElementById("openButton");
const audio = document.getElementById("audio");

if (overlay && openButton) {

  openButton.addEventListener("click", () => {

    overlay.classList.add("hide");

    if (audio) {
      audio.play().catch(() => {});
    }

  });

}

/* =====================================
   MUSIC
===================================== */

const musicButton = document.getElementById("musicButton");

if (musicButton && audio) {

  musicButton.addEventListener("click", () => {

    if (audio.paused) {
      audio.play();
    } else {
      audio.pause();
    }

  });

}

/* =====================================
   COUNTDOWN
===================================== */

const targetDate = new Date("2026-10-24T00:00:00").getTime();

function updateCountdown() {

  const distance = targetDate - Date.now();

  if (distance < 0) return;

  document.getElementById("days").textContent =
    Math.floor(distance / (1000 * 60 * 60 * 24));

  document.getElementById("hours").textContent =
    Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  document.getElementById("minutes").textContent =
    Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

  document.getElementById("seconds").textContent =
    Math.floor((distance % (1000 * 60)) / 1000);

}

updateCountdown();
setInterval(updateCountdown,1000);

/* =====================================
   LOAD GUEST
===================================== */

async function loadGuest(){

  try{

    const params=new URLSearchParams(location.search);

    currentGuestSlug=params.get("guest");

    if(!currentGuestSlug){

      showNeutralInvitation();
      return;

    }

    const response=await fetch(
      API_URL+"?guest="+encodeURIComponent(currentGuestSlug)
    );

    const data=await response.json();

    if(!data.success){

      showNeutralInvitation();
      return;

    }

    currentGuest=data.guest;

    const greeting=document.getElementById("guestGreeting");

    if(greeting){

      const greetingWord = getGuestGreeting(currentGuest.slug);

greeting.innerHTML =
`${greetingWord} <strong>${currentGuest.displayName}</strong>`;

    }

if (currentGuest.answered) {

    lockFormFinal();

} else {

    renderRSVPForm();

}

}

catch(error){

    console.error(error);

    showNeutralInvitation();

}

}

function showNeutralInvitation() {

    const greeting = document.getElementById("guestGreeting");

    if (greeting) {

        greeting.textContent =
            "Мы будем счастливы видеть Вас";

    }

    const form = document.getElementById("weddingForm");

    if (form) {

        form.innerHTML = `
            <p class="section-subtitle" style="text-align:center;">
                Не удалось загрузить анкету гостя.
            </p>
        `;

    }

}
/* =====================================
   GUEST GREETING
===================================== */

function getGuestGreeting(slug) {

    const femaleGuests = [
        "yana",
        "elena",
        "viktoriya",
        "tatyana",
        "elizaveta"
    ];

    const maleGuests = [
        "evgeniy",
        "sergey",
        "maksim",
        "egor",
        "nikolay"
    ];

    if (femaleGuests.includes(slug)) {
        return "Дорогая";
    }

    if (maleGuests.includes(slug)) {
        return "Дорогой";
    }

    return "Дорогие";
}
loadGuest();

/* =========================
   RSVP FLOW INIT
========================= */

/* =====================================
   RENDER RSVP FORM
===================================== */

function renderRSVPForm() {

  const form = document.getElementById("weddingForm");

  if (!form) return;

  form.innerHTML = `

<div class="guest-name">
<b>${currentGuest.displayName}</b>
</div>

<div class="form-group">
<label>Будете ли присутствовать?</label>

<select id="attendance">

<option value="Да">Да</option>

<option value="Нет">Нет</option>

</select>
</div>

<div id="attendanceFields">

<div class="form-group">

<label>
Нужен ли трансфер из Зеленокумска?
</label>

<select id="transfer">

<option value="Нет">Нет</option>
<option value="Да">Да</option>

</select>

</div>

<div class="form-group">

<label>
Планируете ли брать детей?
</label>

<select id="childrenSelect">

<option value="Нет">Нет</option>
<option value="Да">Да</option>

</select>

</div>

<div
class="form-group"
id="childrenBlock"
style="display:none;"
>

<label>
Количество детей
</label>

<input
type="number"
id="childrenCount"
min="1"
value="1"
>

</div>

<div class="form-group">

<label>
Что планируете пить?
</label>

<div class="checkbox-group">

<label><input type="checkbox" value="Вино красное"> Вино красное</label>

<label><input type="checkbox" value="Вино белое"> Вино белое</label>

<label><input type="checkbox" value="Шампанское"> Шампанское</label>

<label><input type="checkbox" value="Коньяк"> Коньяк</label>

<label><input type="checkbox" value="Водка"> Водка</label>

<label><input type="checkbox" value="HomeMade"> HomeMade</label>

<label><input type="checkbox" value="Безалкогольные напитки"> Безалкогольные напитки</label>

</div>

</div>

<div class="form-group">

<label>
Есть ли непереносимость продуктов?
</label>

<textarea
id="allergy"
rows="4"
></textarea>

</div>

</div>

<div style="text-align:center;margin-top:40px;">

<button
class="button"
type="submit"
>

Отправить ответ

</button>

</div>

`;

  initRSVPEvents();

const attendance = document.getElementById("attendance");

if (attendance) {
    attendance.dispatchEvent(new Event("change"));
}

const children = document.getElementById("childrenSelect");

if (children) {
    children.dispatchEvent(new Event("change"));
}

}
/* =====================================
   RSVP EVENTS
===================================== */

function initRSVPEvents(){

const attendance=document.getElementById("attendance");

const attendanceFields=document.getElementById("attendanceFields");

const children=document.getElementById("childrenSelect");

const childrenBlock=document.getElementById("childrenBlock");

attendance.addEventListener("change",()=>{

if(attendance.value==="Нет"){

attendanceFields.style.display="none";
  
document.getElementById("transfer").value = "";

document.getElementById("childrenSelect").value = "Нет";

document.getElementById("childrenCount").value = 1;

document
.querySelectorAll(".checkbox-group input")
.forEach(el => el.checked = false);

document.getElementById("allergy").value = "";

}else{

attendanceFields.style.display="block";

}

});

children.addEventListener("change",()=>{

if(children.value==="Да"){

childrenBlock.style.display="block";

}else{

childrenBlock.style.display="none";

}

});

}
/* =========================
   SHOW / HIDE FORM LOGIC
========================= */

/* =====================================
   FORM SUBMIT
===================================== */

document.addEventListener("submit", async function (e) {

  if (e.target.id !== "weddingForm") return;

  e.preventDefault();

  if (formLocked) return;

  const attendance =
    document.getElementById("attendance").value;

  let transfer = "";
  let children = "";
  let childrenCount = 0;

  if (attendance === "Да") {

    transfer =
      document.getElementById("transfer").value;

    children =
      document.getElementById("childrenSelect").value;

    if (children === "Да") {

      childrenCount =
        Number(
          document.getElementById("childrenCount").value
        );

    }

  }

  const drinks = [];

  document
    .querySelectorAll(".checkbox-group input:checked")
    .forEach(el => {

      drinks.push(el.value);

    });

  const payload = {

    slug: currentGuest.slug,

    attendance,

    transfer,

    children,

    childrenCount,

    drinks,

    allergy:
      document.getElementById("allergy").value,

    userAgent:
      navigator.userAgent

  };

  try {

    const response = await fetch(API_URL, {

      method: "POST",

      headers: {

        "Content-Type": "text/plain"

      },

      body: JSON.stringify(payload)

    });

    const result =
      await response.json();

    if (!result.success) {

      alert(result.message);

      return;

    }

    lockFormFinal(attendance);

  }

  catch (err) {

    console.error(err);

    alert("Ошибка отправки формы");

  }

});

function lockFormFinal(attendance = "Да") {

  formLocked = true;

  const form =
    document.getElementById("weddingForm");

  const success =
    document.getElementById("successMessage");

  form.style.display = "none";

  success.classList.remove("hidden");

  if (attendance === "Да") {

    success.innerHTML =

      "Ваш ответ отправлен.<br><br>Ждём Вас на нашем празднике ❤️";

  }

  else {

    success.innerHTML =

      "Спасибо, что сообщили нам о своём решении.<br><br>Нам очень жаль, что у Вас не получится разделить этот день вместе с нами. Если Ваши планы изменятся, мы будем искренне рады видеть Вас на нашем празднике.";

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
/* =====================================
   AUTO STOP MUSIC
===================================== */

document.addEventListener("visibilitychange", () => {

    if (!audio) return;

    if (document.hidden) {
        audio.pause();
    }

});

window.addEventListener("pagehide", () => {

    if (!audio) return;

    audio.pause();
    audio.currentTime = 0;

});
