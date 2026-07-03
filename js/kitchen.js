(function () {
  "use strict";

  const POLL_MS = 5000;
  const params = new URLSearchParams(window.location.search);
  const pin = params.get("pin");

  const board = document.getElementById("board");
  const statusDot = document.getElementById("statusDot");
  const statusText = document.getElementById("statusText");

  let knownIds = new Set();
  let firstLoad = true;

  function apiUrl(path) {
    return `${RESTAURANT.backendUrl}${path}`;
  }

  function showGate(message) {
    document.getElementById("pinGate").style.display = "flex";
    document.getElementById("kitchenApp").style.display = "none";
    if (message) {
      document.getElementById("pinGate").querySelector("p").textContent = message;
    }
  }

  // A short synthesized beep so we don't need an audio file asset.
  function playAlert() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      [0, 0.18].forEach((delay, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = i === 0 ? 880 : 1046;
        gain.gain.setValueAtTime(0.001, ctx.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + delay + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.16);
        osc.connect(gain).connect(ctx.destination);
        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + 0.18);
      });
    } catch (e) { /* audio not available, ignore */ }
  }

  function fmtElapsed(createdAt) {
    const mins = Math.max(0, Math.round((Date.now() - new Date(createdAt).getTime()) / 60000));
    return mins <= 0 ? "recién ahora" : `hace ${mins} min`;
  }
  function fmtMoney(n) { return `$${Number(n || 0).toFixed(2)}`; }
  function fmtPickupTime(hhmm) {
    if (!hhmm) return "—";
    const [h, m] = hhmm.split(":").map(Number);
    const period = h >= 12 ? "PM" : "AM";
    const h12 = ((h + 11) % 12) + 1;
    return `${h12}:${String(m).padStart(2, "0")} ${period}`;
  }

  function renderOrders(orders) {
    if (orders.length === 0) {
      board.innerHTML = `<div class="kitchen-empty">No hay órdenes activas.</div>`;
      knownIds = new Set();
      return;
    }

    const currentIds = new Set(orders.map(o => o.id));
    const newOnes = [...currentIds].filter(id => !knownIds.has(id));
    if (!firstLoad && newOnes.length > 0) playAlert();
    knownIds = currentIds;
    firstLoad = false;

    board.innerHTML = orders.map(o => {
      const isUrgent = (Date.now() - new Date(o.createdAt).getTime()) > 20 * 60000;
      const itemsHtml = o.items.map(it => `
        <li><span><span class="qty">${it.qty}×</span>${it.name}</span><span>${fmtMoney(it.price * it.qty)}</span></li>
      `).join("");
      return `
        <div class="order-ticket ${isUrgent ? "urgent" : ""}" data-id="${o.id}">
          <div class="order-ticket-head">
            <span class="order-code">${o.id}</span>
            <span class="order-elapsed">${fmtElapsed(o.createdAt)}</span>
          </div>
          <div class="order-ticket-body">
            <div class="order-customer">${escapeHtml(o.customerName)}</div>
            <div class="order-meta">${escapeHtml(o.customerPhone)} · Recoger ${fmtPickupTime(o.pickupTime)}</div>
            <ul class="order-items">${itemsHtml}</ul>
            ${o.notes ? `<div class="order-notes">${escapeHtml(o.notes)}</div>` : ""}
            <div class="order-total">Total: ${fmtMoney(o.total)}</div>
            <button class="order-done-btn" data-id="${o.id}">Marcar lista</button>
          </div>
        </div>
      `;
    }).join("");

    board.querySelectorAll(".order-done-btn").forEach(btn => {
      btn.addEventListener("click", () => markDone(btn.dataset.id, btn));
    });
  }

  function escapeHtml(s) {
    const div = document.createElement("div");
    div.textContent = s == null ? "" : String(s);
    return div.innerHTML;
  }

  async function markDone(id, btn) {
    btn.disabled = true;
    btn.textContent = "Actualizando…";
    try {
      const res = await fetch(apiUrl(`/orders/${encodeURIComponent(id)}/done`), {
        method: "PATCH",
        headers: { "x-kitchen-pin": pin }
      });
      if (!res.ok) throw new Error("Failed to mark done");
      poll();
    } catch (e) {
      btn.disabled = false;
      btn.textContent = "Marcar lista";
      alert("No se pudo actualizar esa orden — revisa tu conexión e intenta de nuevo.");
    }
  }

  async function poll() {
    try {
      const res = await fetch(apiUrl("/orders"), { headers: { "x-kitchen-pin": pin } });
      if (res.status === 401) {
        showGate("Ese PIN fue rechazado. Verifica el enlace que te dieron.");
        return;
      }
      if (!res.ok) throw new Error("Bad response");
      const data = await res.json();
      renderOrders(data.orders || []);
      statusDot.classList.remove("offline");
      statusText.textContent = `Conectado · actualizado ${new Date().toLocaleTimeString()}`;
    } catch (e) {
      statusDot.classList.add("offline");
      statusText.textContent = "Conexión perdida — reintentando…";
    }
  }

  function init() {
    const backendConfigured = RESTAURANT.backendUrl && !RESTAURANT.backendUrl.startsWith("REPLACE_WITH");
    if (!backendConfigured) {
      showGate("Aún no hay un backend conectado — configura RESTAURANT.backendUrl en js/config.js primero.");
      return;
    }
    if (!pin) {
      showGate("A este enlace le falta tu PIN de cocina. Pídele a quien configuró el sitio el enlace completo de kitchen.html.");
      return;
    }
    document.getElementById("pinGate").style.display = "none";
    document.getElementById("kitchenApp").style.display = "block";
    poll();
    setInterval(poll, POLL_MS);
  }

  document.addEventListener("DOMContentLoaded", init);
})();
