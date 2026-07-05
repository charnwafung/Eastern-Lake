(function () {
  "use strict";

  const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  const DAY_LABELS = { sun: "Domingo", mon: "Lunes", tue: "Martes", wed: "Miércoles", thu: "Jueves", fri: "Viernes", sat: "Sábado" };

  function fmtTime(hhmm) {
    if (hhmm === "asap") return "Lo antes posible";
    const [h, m] = hhmm.split(":").map(Number);
    const period = h >= 12 ? "PM" : "AM";
    const h12 = ((h + 11) % 12) + 1;
    return `${h12}:${String(m).padStart(2, "0")} ${period}`;
  }

  function init() {
    document.title = `Horario y ubicación — ${RESTAURANT.name}`;
    document.getElementById("footAddr").textContent = RESTAURANT.address;
    document.getElementById("footPhone").textContent = RESTAURANT.phone;

    const table = document.getElementById("hoursTable");
    table.innerHTML = DAY_KEYS.map(k => {
      const h = RESTAURANT.hours[k];
      const label = DAY_LABELS[k];
      const text = h ? `${fmtTime(h.open)} – ${fmtTime(h.close)}` : "Cerrado";
      return `<div style="display:flex; justify-content:space-between; max-width:280px;"><span>${label}</span><span>${text}</span></div>`;
    }).join("");

    document.getElementById("fullAddress").textContent = RESTAURANT.address;
    document.getElementById("fullPhone").textContent = RESTAURANT.phone;
    document.getElementById("pickupNote").textContent = RESTAURANT.note || "";
  }

  document.addEventListener("DOMContentLoaded", init);
})();
