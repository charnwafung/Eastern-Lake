(function () {
  "use strict";

  const TAX_RATE = 0.115; // Puerto Rico IVU — adjust if your municipality differs
  const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  const DAY_LABELS = { sun: "Domingo", mon: "Lunes", tue: "Martes", wed: "Miércoles", thu: "Jueves", fri: "Viernes", sat: "Sábado" };

  /* ---------- state ---------- */
  // Cart lives in memory only (not localStorage) so it resets on reload.
  // If you want it to survive a refresh once this is hosted on your own
  // domain, you can swap `cart` for a localStorage-backed store.
  let cart = {}; // { itemId: { item, qty } }

  /* ---------- boot: fill in restaurant details ---------- */
  function initBranding() {
    document.title = `${RESTAURANT.name} — Ordena para recoger`;
    document.getElementById("heroSub").textContent =
      `${RESTAURANT.tagline}. Ordena en línea y estará listo cuando llegues.`;
    const noteEl = document.getElementById("heroNote");
    if (noteEl) noteEl.textContent = RESTAURANT.note || "";
    document.getElementById("pickupAddr").textContent = RESTAURANT.address.split(",")[0];
    document.getElementById("pickupPhone").textContent = RESTAURANT.phone;
    document.getElementById("fullAddress").textContent = RESTAURANT.address;
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

  function updateOpenStatus() {
    const now = new Date();
    const key = DAY_KEYS[now.getDay()];
    const h = RESTAURANT.hours[key];
    const statusEl = document.getElementById("openStatus");
    const todayEl = document.getElementById("hoursToday");

    if (!h) {
      statusEl.textContent = "Cerrado hoy";
      todayEl.textContent = "Cerrado hoy";
      return;
    }
    const text = `${fmtTime(h.open)} – ${fmtTime(h.close)}`;
    todayEl.textContent = text;

    const nowMin = now.getHours() * 60 + now.getMinutes();
    const openMin = toMinutes(h.open);
    const closeMin = toMinutes(h.close);
    statusEl.textContent = (nowMin >= openMin && nowMin < closeMin)
      ? `Abierto ahora · hasta las ${fmtTime(h.close)}`
      : "Cerrado ahora";
  }

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
  function fmtMoney(n) { return `$${n.toFixed(2)}`; }

  /* ---------- menu rendering ---------- */
  function initMenu() {
    const tabsEl = document.getElementById("categoryTabs");
    const bodyEl = document.getElementById("menuBody");

    tabsEl.innerHTML = MENU.map((cat, i) =>
      `<button class="tab${i === 0 ? " active" : ""}" data-target="cat-${i}">${cat.shortLabel || cat.category}</button>`
    ).join("");

    bodyEl.innerHTML = MENU.map((cat, i) => `
      <div class="menu-category" id="cat-${i}">
        <h3><span class="cat-index">${String(i + 1).padStart(2, "0")}</span>${cat.category}</h3>
        ${cat.items.map(renderDish).join("")}
      </div>
    `).join("");

    tabsEl.addEventListener("click", (e) => {
      const btn = e.target.closest(".tab");
      if (!btn) return;
      document.getElementById(btn.dataset.target).scrollIntoView({ behavior: "smooth", block: "start" });
    });

    bodyEl.addEventListener("click", (e) => {
      const btn = e.target.closest(".add-btn");
      if (!btn) return;
      const item = findItem(btn.dataset.id);
      if (item && item.modifiers && item.modifiers.length) {
        openModifierModal(item);
        return;
      }
      addToCart(btn.dataset.id);
      btn.classList.add("added");
      btn.textContent = "✓";
      setTimeout(() => { btn.classList.remove("added"); btn.textContent = "+"; }, 700);
    });

    // Highlight active tab on scroll, and keep it visible within the
    // horizontally-scrolling tab strip (it can otherwise land off-screen
    // to the right as later categories become active).
    const sections = MENU.map((_, i) => document.getElementById(`cat-${i}`));
    const tabs = [...tabsEl.children];
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const idx = sections.indexOf(entry.target);
        tabs.forEach(t => t.classList.remove("active"));
        if (tabs[idx]) {
          tabs[idx].classList.add("active");
          tabs[idx].scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
        }
      });
    }, { rootMargin: "-30% 0px -60% 0px" });
    sections.forEach(s => io.observe(s));
  }

  function renderDish(item) {
    const tagHtml = item.tag ? `<span class="tag tag-${item.tag}">${item.tag}</span>` : "";
    const modTagHtml = (item.modifiers && item.modifiers.length) ? `<span class="tag tag-mod">opciones</span>` : "";
    const priceHtml = item.price > 0
      ? fmtMoney(item.price)
      : `<span class="price-todo">agregar precio</span>`;
    const noHtml = item.no ? `<span class="dish-no">${item.no}.</span>` : "";
    return `
      <div class="dish">
        <div class="dish-info">
          <div class="dish-name">${noHtml}${item.name} ${tagHtml}${modTagHtml}</div>
          ${item.desc ? `<div class="dish-desc">${item.desc}</div>` : ""}
        </div>
        <div class="dish-price-group">
          <span class="dish-price">${priceHtml}</span>
          <button class="add-btn" data-id="${item.id}" aria-label="Agregar ${item.name} a la orden">+</button>
        </div>
      </div>
    `;
  }

  function findItem(id) {
    for (const cat of MENU) {
      const found = cat.items.find(i => i.id === id);
      if (found) return found;
    }
    return null;
  }

  /* ---------- modifier picker ---------- */
  let pendingItem = null;

  function openModifierModal(item) {
    pendingItem = item;
    const groupId = item.modifiers[0];
    const group = MODIFIER_GROUPS[groupId];
    document.getElementById("modifierDishName").textContent = item.name;
    document.getElementById("modifierOptions").innerHTML = group.options.map((opt, idx) => `
      <label class="modifier-option">
        <input type="radio" name="modifierChoice" value="${idx}">
        <span class="modifier-option-label">${opt.label}</span>
        <span class="modifier-option-price">${opt.price > 0 ? "+" + fmtMoney(opt.price) : ""}</span>
      </label>
    `).join("");

    const confirmBtn = document.getElementById("confirmModifier");
    confirmBtn.disabled = true;
    document.getElementById("modifierOptions").querySelectorAll('input[name="modifierChoice"]').forEach(input => {
      input.addEventListener("change", () => { confirmBtn.disabled = false; });
    });

    document.getElementById("modifierOverlay").classList.add("open");
  }

  function closeModifierModal() {
    document.getElementById("modifierOverlay").classList.remove("open");
    pendingItem = null;
  }

  function confirmModifierChoice() {
    if (!pendingItem) return;
    const groupId = pendingItem.modifiers[0];
    const group = MODIFIER_GROUPS[groupId];
    const checked = document.querySelector('input[name="modifierChoice"]:checked');
    if (!checked) return; // shouldn't happen since the button is disabled until a choice is made
    const optIndex = Number(checked.value);
    const opt = group.options[optIndex];
    // First option represents "no change" — don't attach a modifier for it,
    // so it groups normally with plain adds of the same dish.
    const modifier = optIndex === 0 ? null : { groupId, optionId: opt.id, label: opt.label, price: opt.price };
    addToCart(pendingItem.id, modifier);
    closeModifierModal();
  }

  /* ---------- cart logic ---------- */
  // Cart keys include the modifier so "Pollo Agridulce" plain and
  // "Pollo Agridulce, sin papas con tostones" are separate lines.
  function lineExtra(entry) { return entry.modifier ? entry.modifier.price : 0; }
  function lineUnitPrice(entry) { return entry.item.price + lineExtra(entry); }
  function lineDisplayName(entry) {
    return entry.modifier ? `${entry.item.name} — ${entry.modifier.label}` : entry.item.name;
  }

  function addToCart(id, modifier = null) {
    const item = findItem(id);
    if (!item) return;
    const key = modifier ? `${id}::${modifier.optionId}` : id;
    if (!cart[key]) cart[key] = { item, qty: 0, modifier };
    cart[key].qty += 1;
    renderCart();
    openDrawer();
  }
  function changeQty(id, delta) {
    if (!cart[id]) return;
    cart[id].qty += delta;
    if (cart[id].qty <= 0) delete cart[id];
    renderCart();
  }
  function removeItem(id) {
    delete cart[id];
    renderCart();
  }
  function cartEntries() { return Object.entries(cart); }
  function subtotal() {
    return cartEntries().reduce((sum, [, entry]) => sum + lineUnitPrice(entry) * entry.qty, 0);
  }
  function totalCount() {
    return cartEntries().reduce((sum, [, { qty }]) => sum + qty, 0);
  }

  function renderCart() {
    const count = totalCount();
    document.getElementById("cartCount").textContent = count;

    const body = document.getElementById("drawerBody");
    const foot = document.getElementById("drawerFoot");

    if (count === 0) {
      body.innerHTML = `<div class="drawer-empty">Aún no hay nada — agrega un plato del menú.</div>`;
      foot.style.display = "none";
      return;
    }
    foot.style.display = "block";
    body.innerHTML = cartEntries().map(([key, entry]) => `
      <div class="cart-line">
        <div class="qty-control">
          <button data-act="dec" data-id="${key}" aria-label="Reducir cantidad">−</button>
          <span>${entry.qty}</span>
          <button data-act="inc" data-id="${key}" aria-label="Aumentar cantidad">+</button>
        </div>
        <div>
          <div class="cart-line-name">${entry.item.name}</div>
          ${entry.modifier ? `<div class="cart-line-modifier">${entry.modifier.label}</div>` : ""}
        </div>
        <div class="cart-line-price">${fmtMoney(lineUnitPrice(entry) * entry.qty)}</div>
        <button class="cart-line-remove" data-act="remove" data-id="${key}">quitar</button>
      </div>
    `).join("");

    const sub = subtotal();
    const tax = sub * TAX_RATE;
    const total = sub + tax;
    document.getElementById("drawerSubtotal").textContent = fmtMoney(sub);
    document.getElementById("drawerTax").textContent = fmtMoney(tax);
    document.getElementById("drawerTotal").textContent = fmtMoney(total);

    body.querySelectorAll("button[data-act]").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.id;
        const act = btn.dataset.act;
        if (act === "inc") changeQty(id, 1);
        if (act === "dec") changeQty(id, -1);
        if (act === "remove") removeItem(id);
      });
    });
  }

  function renderSummary() {
    const linesEl = document.getElementById("summaryLines");
    linesEl.innerHTML = cartEntries().map(([, entry]) => `
      <div class="summary-line"><span>${entry.qty} × ${lineDisplayName(entry)}</span><span>${fmtMoney(lineUnitPrice(entry) * entry.qty)}</span></div>
    `).join("");
    const sub = subtotal();
    const tax = sub * TAX_RATE;
    const total = sub + tax;
    document.getElementById("sumSubtotal").textContent = fmtMoney(sub);
    document.getElementById("sumTax").textContent = fmtMoney(tax);
    document.getElementById("sumTotal").textContent = fmtMoney(total);
  }

  /* ---------- drawer open/close ---------- */
  function openDrawer() {
    document.getElementById("cartDrawer").classList.add("open");
    document.getElementById("overlay").classList.add("open");
  }
  function closeDrawer() {
    document.getElementById("cartDrawer").classList.remove("open");
    document.getElementById("overlay").classList.remove("open");
  }

  /* ---------- pickup time slots ---------- */
  function buildPickupSlots() {
    const select = document.getElementById("pickupTime");
    const now = new Date();
    const earliest = new Date(now.getTime() + RESTAURANT.minLeadMinutes * 60000);

    const key = DAY_KEYS[now.getDay()];
    const h = RESTAURANT.hours[key];
    const noteEl = document.getElementById("leadTimeNote");

    if (!h) {
      select.innerHTML = `<option value="">Cerrado hoy</option>`;
      select.disabled = true;
      noteEl.textContent = "Hoy estamos cerrados — revisa nuestro horario arriba.";
      return;
    }

    const closeMin = toMinutes(h.close);
    const openMin = toMinutes(h.open);
    let startMin = Math.max(openMin, earliest.getHours() * 60 + earliest.getMinutes());
    // round up to next slot interval
    startMin = Math.ceil(startMin / RESTAURANT.slotIntervalMinutes) * RESTAURANT.slotIntervalMinutes;

    // Only offer slots within the next hour — anything further out, the
    // customer can just come back closer to that time to order.
    const windowEnd = Math.min(closeMin - 5, startMin + 60);

    const options = [];
    for (let m = startMin; m <= windowEnd; m += RESTAURANT.slotIntervalMinutes) {
      const hh = String(Math.floor(m / 60)).padStart(2, "0");
      const mm = String(m % 60).padStart(2, "0");
      options.push(`${hh}:${mm}`);
    }

    if (startMin > closeMin - 5) {
      select.innerHTML = `<option value="">No quedan horarios disponibles hoy</option>`;
      select.disabled = true;
      noteEl.textContent = "La cocina está por cerrar — intenta de nuevo mañana.";
      return;
    }

    select.disabled = false;
    const asapOption = `<option value="asap">Lo antes posible (~${RESTAURANT.minLeadMinutes} min)</option>`;
    select.innerHTML = asapOption + options.map(t => `<option value="${t}">${fmtTime(t)}</option>`).join("");
    noteEl.textContent = `Necesitamos al menos ${RESTAURANT.minLeadMinutes} minutos para preparar tu orden.`;
  }

  /* ---------- navigation between sections ---------- */
  function showCheckout() {
    if (totalCount() === 0) return;
    renderSummary();
    buildPickupSlots();
    closeDrawer();
    document.getElementById("checkoutSection").classList.add("open");
    document.getElementById("menu").style.display = "none";
    document.getElementById("hoursSection").style.display = "none";
    document.querySelector(".hero").style.display = "none";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function restoreHomeView() {
    document.getElementById("checkoutSection").classList.remove("open");
    document.getElementById("confirmSection").classList.remove("open");
    document.getElementById("menu").style.display = "";
    document.getElementById("hoursSection").style.display = "";
    document.querySelector(".hero").style.display = "";
  }

  function goHome() {
    restoreHomeView();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Scrolls to any in-page section without ever touching the URL —
  // using a real #hash anchor makes the browser jump straight to that
  // section on every future page refresh, which is not what we want.
  function goToSection(id) {
    restoreHomeView();
    const target = document.getElementById(id);
    if (target) target.scrollIntoView({ behavior: "smooth" });
  }

  function backToMenu() {
    goHome();
  }

  async function submitOrder(e) {
    e.preventDefault();
    const name = document.getElementById("custName").value.trim();
    const phone = document.getElementById("custPhone").value.trim();
    const time = document.getElementById("pickupTime").value;
    const notes = document.getElementById("orderNotes").value.trim();
    if (!name || !phone || !time) return;

    // Send item + modifier ids only, not a computed price — the backend
    // looks up prices itself from its own menu copy so a tampered request
    // can't charge something other than the real menu price.
    const orderItems = cartEntries().map(([, entry]) => ({
      id: entry.item.id,
      modifierOptionId: entry.modifier ? entry.modifier.optionId : null,
      qty: entry.qty
    }));

    const submitBtn = e.target.querySelector('button[type="submit"]');
    const backendConfigured = RESTAURANT.backendUrl && !RESTAURANT.backendUrl.startsWith("REPLACE_WITH");

    if (!backendConfigured) {
      // No backend deployed yet — fall through to the demo confirmation
      // so the ordering flow is still testable end to end. Nothing is
      // saved for the Kitchen Display in this case.
      const fallbackId = Math.floor(100000 + Math.random() * 900000);
      showConfirmation(name, phone, time, fallbackId);
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Enviando tu orden…";

    try {
      // 1. Save the order so it shows up on the Kitchen Display.
      const orderRes = await fetch(`${RESTAURANT.backendUrl}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: name,
          customerPhone: phone,
          pickupTime: time,
          notes,
          items: orderItems
        })
      });
      if (!orderRes.ok) throw new Error("Could not save order");
      const orderData = await orderRes.json();
      const orderId = orderData.orderId;

      // 2. Try to start payment. If Stripe isn't configured on the
      //    backend yet (501), the order is still saved and visible
      //    in the kitchen — just skip straight to confirmation.
      submitBtn.textContent = "Conectando con el pago…";
      const payRes = await fetch(`${RESTAURANT.backendUrl}/create-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId })
      });

      if (payRes.status === 501) {
        showConfirmation(name, phone, time, orderId);
        return;
      }
      if (!payRes.ok) throw new Error("Payment server error");
      const payData = await payRes.json();
      if (!payData.processUrl) throw new Error("No payment URL returned");

      window.location.href = payData.processUrl;
    } catch (err) {
      console.error(err);
      submitBtn.disabled = false;
      submitBtn.textContent = "Continuar al pago";
      alert("No pudimos conectar con el sistema de órdenes. Intenta de nuevo en un momento o llámanos para ordenar.");
    }
  }

  function showConfirmation(name, phone, time, orderId) {
    document.getElementById("confirmName").textContent = name;
    document.getElementById("confirmPhone").textContent = phone;
    document.getElementById("confirmTime").textContent = fmtTime(time);
    document.getElementById("confirmOrderId").textContent = `#${orderId}`;
    // Order lookup lives on its own page — hand it the order id and phone
    // so it can look the order up right away instead of the customer
    // having to type them in again.
    document.getElementById("goToLookupFromConfirm").href =
      `verificar.html?order=${encodeURIComponent(orderId)}&phone=${encodeURIComponent(phone)}`;

    document.getElementById("checkoutSection").classList.remove("open");
    document.getElementById("confirmSection").classList.add("open");
    cart = {};
    renderCart();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /* ---------- wire up ---------- */
  function init() {
    initBranding();
    initMenu();
    renderCart();

    document.getElementById("openCart").addEventListener("click", openDrawer);
    document.getElementById("closeCart").addEventListener("click", closeDrawer);
    document.getElementById("overlay").addEventListener("click", closeDrawer);
    document.getElementById("goToCheckout").addEventListener("click", showCheckout);
    document.getElementById("backToMenu").addEventListener("click", backToMenu);
    document.getElementById("checkoutForm").addEventListener("submit", submitOrder);
    document.getElementById("closeModifier").addEventListener("click", closeModifierModal);
    document.getElementById("modifierOverlay").addEventListener("click", (e) => {
      if (e.target.id === "modifierOverlay") closeModifierModal();
    });
    document.getElementById("confirmModifier").addEventListener("click", confirmModifierChoice);

    // Every in-page link (header brand, hero buttons, footer link, etc.)
    // scrolls via JS instead of a real #hash, so refreshing the page
    // always lands at the top instead of wherever was last clicked.
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const id = link.getAttribute("href").slice(1);
        if (id === "top") { goHome(); return; }
        goToSection(id);
      });
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
