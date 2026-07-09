(function () {
  "use strict";

  const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

  function toMinutes(hhmm) {
    const [h, m] = hhmm.split(":").map(Number);
    return h * 60 + m;
  }
  function fmtTime(hhmm) {
    if (hhmm === "asap") return "Lo antes posible";
    const [h, m] = hhmm.split(":").map(Number);
    const period = h >= 12 ? "PM" : "AM";
    const h12 = ((h + 11) % 12) + 1;
    return `${h12}:${String(m).padStart(2, "0")} ${period}`;
  }
  function fmtMoney(n) { return `$${Number(n || 0).toFixed(2)}`; }

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

  async function runLookup() {
    const orderId = document.getElementById("lookupOrderId").value.trim();
    const phone = document.getElementById("lookupPhone").value.trim();
    const resultEl = document.getElementById("lookupResult");

    if (!orderId || !phone) {
      resultEl.innerHTML = `<p style="color: var(--chili); font-size: 13.5px;">Ingresa el número de orden y el teléfono.</p>`;
      return;
    }
    const backendConfigured = RESTAURANT.backendUrl && !RESTAURANT.backendUrl.startsWith("REPLACE_WITH");
    if (!backendConfigured) {
      resultEl.innerHTML = `<p style="color: var(--chili); font-size: 13.5px;">El sistema de órdenes aún no está conectado.</p>`;
      return;
    }

    resultEl.innerHTML = `<p style="font-size: 13.5px; color: var(--ink-soft);">Buscando…</p>`;
    try {
      const res = await fetch(`${RESTAURANT.backendUrl}/orders/lookup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, phone })
      });
      if (!res.ok) {
        resultEl.innerHTML = `<p style="color: var(--chili); font-size: 13.5px;">No encontramos esa orden. Verifica el número y el teléfono.</p>`;
        return;
      }
      const data = await res.json();
      const statusLabel = data.status === "done" ? "Lista para recoger" : "Recibida — en preparación";
      const itemsHtml = data.items.map(it => `
        <div style="display:flex; justify-content:space-between; font-size:13.5px; padding:4px 0;">
          <span>${it.qty} × ${it.name}</span><span>${fmtMoney(it.price * it.qty)}</span>
        </div>
      `).join("");
      resultEl.innerHTML = `
        <div class="ticket" style="box-shadow:none;">
          <div class="ticket-body" style="padding: 20px 24px;">
            <p style="font-family: var(--font-mono); font-size: 12px; color: var(--sage); margin-bottom: 6px;">${data.id}</p>
            <p style="font-weight: 700; font-size: 16px; margin-bottom: 10px;">${statusLabel}</p>
            ${itemsHtml}
            <div style="border-top: 1px dashed var(--line); margin-top: 10px; padding-top: 10px; font-family: var(--font-mono); font-size: 13px; display:flex; justify-content:space-between;">
              <span>Total</span><span>${fmtMoney(data.total)}</span>
            </div>
            <p style="font-size: 12.5px; color: var(--ink-soft); margin-top: 10px;">Recoger: ${fmtTime(data.pickupTime)}</p>
          </div>
        </div>
      `;
    } catch (err) {
      resultEl.innerHTML = `<p style="color: var(--chili); font-size: 13.5px;">Hubo un problema al buscar tu orden. Intenta de nuevo.</p>`;
    }
  }

  function init() {
    document.title = `Verificar mi orden — ${RESTAURANT.name}`;
    document.getElementById("footAddr").textContent = RESTAURANT.address;
    document.getElementById("footPhone").textContent = RESTAURANT.phone;
    updateOpenStatus();
    setInterval(updateOpenStatus, 60000);

    document.getElementById("lookupBtn").addEventListener("click", runLookup);

    // If arriving from the confirmation screen (?order=...&phone=...),
    // prefill and run the lookup automatically.
    const params = new URLSearchParams(window.location.search);
    const order = params.get("order");
    const phone = params.get("phone");
    if (order && phone) {
      document.getElementById("lookupOrderId").value = order;
      document.getElementById("lookupPhone").value = phone;
      runLookup();
    }
  }

  document.addEventListener("DOMContentLoaded", init);
})();
