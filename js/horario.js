(function () {
  "use strict";

  const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  const DAY_LABELS = { sun: "Domingo", mon: "Lunes", tue: "Martes", wed: "Miércoles", thu: "Jueves", fri: "Viernes", sat: "Sábado" };

  function toMinutes(hhmm) {
    const [h, m] = hhmm.split(":").map(Number);
    return h * 60 + m;
  }
  function fmtTime(hhmm) {
    const [h, m] = hhmm.split(":").map(Number);
    const period = h >= 12 ? "PM" : "AM";
    const h12 = ((h + 11) % 12) + 1;
    return `${h12}:${String(m).padStart(2, "0")} ${period}`;
  }

  function updateOpenStatus() {
    const now = new Date();
    const key = DAY_KEYS[now.getDay()];
    const h = RESTAURANT.hours[key];
    const statusEl = document.getElementById("openStatus");
    if (!h) {
      statusEl.textContent = "Cerrado hoy";
      return;
    }
    const nowMin = now.getHours() * 60 + now.getMinutes();
    const openMin = toMinutes(h.open);
    const closeMin = toMinutes(h.close);
    statusEl.textContent = (nowMin >= openMin && nowMin < closeMin)
      ? `Abierto ahora · hasta las ${fmtTime(h.close)}`
      : "Cerrado ahora";
  }

  function init() {
    document.title = `Horario y ubicación — ${RESTAURANT.name}`;
    document.getElementById("fullAddress").textContent = RESTAURANT.address;
    document.getElementById("fullPhone").textContent = RESTAURANT.phone;
    document.getElementById("footAddr").textContent = RESTAURANT.address;
    document.getElementById("footPhone").textContent = RESTAURANT.phone;

    const table = document.getElementById("hoursTable");
    table.innerHTML = DAY_KEYS.map(k => {
      const h = RESTAURANT.hours[k];
      const label = DAY_LABELS[k];
      const text = h ? `${fmtTime(h.open)} – ${fmtTime(h.close)}` : "Cerrado";
      return `<div style="display:flex; justify-content:space-between; max-width:280px;"><span>${label}</span><span>${text}</span></div>`;
    }).join("");

    updateOpenStatus();
    setInterval(updateOpenStatus, 60000);
  }

  document.addEventListener("DOMContentLoaded", init);
})();
