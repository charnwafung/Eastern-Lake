(function () {
  "use strict";

  const TAX_RATE = 0.115; // Puerto Rico IVU — adjust if your municipality differs
  const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  const DAY_LABELS = { sun: "Sunday", mon: "Monday", tue: "Tuesday", wed: "Wednesday", thu: "Thursday", fri: "Friday", sat: "Saturday" };

  /* ---------- state ---------- */
  // Cart lives in memory only (not localStorage) so it resets on reload.
  // If you want it to survive a refresh once this is hosted on your own
  // domain, you can swap `cart` for a localStorage-backed store.
  let cart = {}; // { itemId: { item, qty } }

  /* ---------- boot: fill in restaurant details ---------- */
  function initBranding() {
    document.title = `${RESTAURANT.name} — Order for Pickup`;
    document.getElementById("brandName").textContent =
      `${RESTAURANT.name} · ${RESTAURANT.tagline}`;
    document.getElementById("heroSub").textContent =
      `${RESTAURANT.tagline}. Place your order online and it'll be ready when you walk in.`;
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
      const text = h ? `${fmtTime(h.open)} – ${fmtTime(h.close)}` : "Closed";
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
      statusEl.textContent = "Closed today";
      todayEl.textContent = "Closed today";
      return;
    }
    const text = `${fmtTime(h.open)} – ${fmtTime(h.close)}`;
    todayEl.textContent = text;

    const nowMin = now.getHours() * 60 + now.getMinutes();
    const openMin = toMinutes(h.open);
    const closeMin = toMinutes(h.close);
    statusEl.textContent = (nowMin >= openMin && nowMin < closeMin)
      ? `Open now · until ${fmtTime(h.close)}`
      : "Closed now";
  }

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
  function fmtMoney(n) { return `$${n.toFixed(2)}`; }

  /* ---------- menu rendering ---------- */
  function initMenu() {
    const tabsEl = document.getElementById("categoryTabs");
    const bodyEl = document.getElementById("menuBody");

    tabsEl.innerHTML = MENU.map((cat, i) =>
      `<button class="tab${i === 0 ? " active" : ""}" data-target="cat-${i}">${cat.category}</button>`
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
      addToCart(btn.dataset.id);
      btn.classList.add("added");
      btn.textContent = "✓";
      setTimeout(() => { btn.classList.remove("added"); btn.textContent = "+"; }, 700);
    });

    // Highlight active tab on scroll
    const sections = MENU.map((_, i) => document.getElementById(`cat-${i}`));
    const tabs = [...tabsEl.children];
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const idx = sections.indexOf(entry.target);
        tabs.forEach(t => t.classList.remove("active"));
        if (tabs[idx]) tabs[idx].classList.add("active");
      });
    }, { rootMargin: "-30% 0px -60% 0px" });
    sections.forEach(s => io.observe(s));
  }

  function renderDish(item) {
    const tagHtml = item.tag ? `<span class="tag tag-${item.tag}">${item.tag}</span>` : "";
    const priceHtml = item.price > 0
      ? fmtMoney(item.price)
      : `<span class="price-todo">set price</span>`;
    const noHtml = item.no ? `<span class="dish-no">${item.no}.</span>` : "";
    return `
      <div class="dish">
        <div>
          <div class="dish-name">${noHtml}${item.name} ${tagHtml}</div>
          ${item.desc ? `<div class="dish-desc">${item.desc}</div>` : ""}
        </div>
        <div class="dish-price">${priceHtml}</div>
        <button class="add-btn" data-id="${item.id}" aria-label="Add ${item.name} to order">+</button>
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

  /* ---------- cart logic ---------- */
  function addToCart(id) {
    const item = findItem(id);
    if (!item) return;
    if (!cart[id]) cart[id] = { item, qty: 0 };
    cart[id].qty += 1;
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
    return cartEntries().reduce((sum, [, { item, qty }]) => sum + item.price * qty, 0);
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
      body.innerHTML = `<div class="drawer-empty">Nothing here yet — add a dish from the menu.</div>`;
      foot.style.display = "none";
      return;
    }
    foot.style.display = "block";
    body.innerHTML = cartEntries().map(([id, { item, qty }]) => `
      <div class="cart-line">
        <div class="qty-control">
          <button data-act="dec" data-id="${id}" aria-label="Decrease quantity">−</button>
          <span>${qty}</span>
          <button data-act="inc" data-id="${id}" aria-label="Increase quantity">+</button>
        </div>
        <div>
          <div class="cart-line-name">${item.name}</div>
        </div>
        <div class="cart-line-price">${fmtMoney(item.price * qty)}</div>
        <button class="cart-line-remove" data-act="remove" data-id="${id}">remove</button>
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
    linesEl.innerHTML = cartEntries().map(([, { item, qty }]) => `
      <div class="summary-line"><span>${qty} × ${item.name}</span><span>${fmtMoney(item.price * qty)}</span></div>
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
      select.innerHTML = `<option value="">Closed today</option>`;
      select.disabled = true;
      noteEl.textContent = "We're closed today — please check our hours above.";
      return;
    }

    const closeMin = toMinutes(h.close);
    const openMin = toMinutes(h.open);
    let startMin = Math.max(openMin, earliest.getHours() * 60 + earliest.getMinutes());
    // round up to next slot interval
    startMin = Math.ceil(startMin / RESTAURANT.slotIntervalMinutes) * RESTAURANT.slotIntervalMinutes;

    const options = [];
    for (let m = startMin; m <= closeMin - 5; m += RESTAURANT.slotIntervalMinutes) {
      const hh = String(Math.floor(m / 60)).padStart(2, "0");
      const mm = String(m % 60).padStart(2, "0");
      options.push(`${hh}:${mm}`);
    }

    if (options.length === 0) {
      select.innerHTML = `<option value="">No pickup slots left today</option>`;
      select.disabled = true;
      noteEl.textContent = "Kitchen is closing soon — try again tomorrow.";
      return;
    }

    select.disabled = false;
    select.innerHTML = options.map(t => `<option value="${t}">${fmtTime(t)}</option>`).join("");
    noteEl.textContent = `We need at least ${RESTAURANT.minLeadMinutes} minutes to prepare your order.`;
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

  function backToMenu() {
    document.getElementById("checkoutSection").classList.remove("open");
    document.getElementById("menu").style.display = "";
    document.getElementById("hoursSection").style.display = "";
    document.querySelector(".hero").style.display = "";
  }

  async function submitOrder(e) {
    e.preventDefault();
    const name = document.getElementById("custName").value.trim();
    const phone = document.getElementById("custPhone").value.trim();
    const time = document.getElementById("pickupTime").value;
    if (!name || !phone || !time) return;

    const orderId = Math.floor(100000 + Math.random() * 900000);
    const sub = subtotal();
    const total = sub + sub * TAX_RATE;

    const submitBtn = e.target.querySelector('button[type="submit"]');
    const backendConfigured = RESTAURANT.paymentApiUrl && !RESTAURANT.paymentApiUrl.startsWith("REPLACE_WITH");

    if (!backendConfigured) {
      // No payment backend deployed yet — fall through to the demo
      // confirmation so the ordering flow is still testable end to end.
      showConfirmation(name, phone, time, orderId);
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Connecting to payment…";

    try {
      const res = await fetch(`${RESTAURANT.paymentApiUrl}/create-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          customerName: name,
          customerPhone: phone,
          pickupTime: time,
          total: total.toFixed(2)
        })
      });
      if (!res.ok) throw new Error("Payment server error");
      const data = await res.json();
      if (!data.processUrl) throw new Error("No payment URL returned");

      // Hand off to Evertec's hosted PlaceToPay checkout page.
      window.location.href = data.processUrl;
    } catch (err) {
      console.error(err);
      submitBtn.disabled = false;
      submitBtn.textContent = "Continue to payment";
      alert("We couldn't reach the payment system just now. Please try again in a moment or call us to order.");
    }
  }

  function showConfirmation(name, phone, time, orderId) {
    document.getElementById("confirmName").textContent = name;
    document.getElementById("confirmPhone").textContent = phone;
    document.getElementById("confirmTime").textContent = fmtTime(time);
    document.getElementById("confirmOrderId").textContent = `#${orderId}`;

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
  }

  document.addEventListener("DOMContentLoaded", init);
})();
