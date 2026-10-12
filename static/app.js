// Меняйте, если сервер на другом адресе
const API = "";

// ---------- Работа с токеном ----------
const auth = {
  getToken: () => localStorage.getItem("token"),
  setToken: (t) => localStorage.setItem("token", t),
  clear: () => localStorage.removeItem("token"),
  isLoggedIn: () => !!localStorage.getItem("token"),
};

// ---------- Обёртка над fetch ----------
async function api(path, options = {}) {
  const headers = options.headers || {};
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
  const token = auth.getToken();
  if (token) headers["Authorization"] = "Bearer " + token;

  const res = await fetch(API + path, { ...options, headers });

  if (res.status === 401) {
    auth.clear();
    if (!location.pathname.includes("login")) {
      location.href = "/login.html";
    }
    throw new Error("Требуется авторизация");
  }

  if (res.status === 204) return null;

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.detail || "Ошибка запроса");
  }
  return data;
}

// ---------- Тост-уведомления ----------
function toast(msg) {
  let el = document.querySelector(".toast");
  if (!el) {
    el = document.createElement("div");
    el.className = "toast";
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.add("show");
  setTimeout(() => el.classList.remove("show"), 2400);
}

function updateCartBadge() {
  const badge = document.getElementById("cart-count");
  if (!badge) return;
  badge.textContent = String(cart.count());
}

// ---------- Корзина (в localStorage) ----------
const cart = {
  key: "cart",
  get() {
    try { return JSON.parse(localStorage.getItem(this.key)) || []; }
    catch { return []; }
  },
  save(items) {
    localStorage.setItem(this.key, JSON.stringify(items));
    updateCartBadge();
  },
  add(product) {
    const items = this.get();
    const found = items.find(i => i.id === product.id);
    if (found) found.qty += 1;
    else items.push({ id: product.id, name: product.name, price: product.price, qty: 1 });
    this.save(items);
    renderCart();
    openCart();
  },
  setQty(id, qty) {
    let items = this.get();
    if (qty <= 0) items = items.filter(i => i.id !== id);
    else items = items.map(i => i.id === id ? { ...i, qty } : i);
    this.save(items);
    renderCart();
  },
  clear() { localStorage.removeItem(this.key); updateCartBadge(); renderCart(); },
  total() { return this.get().reduce((s, i) => s + i.price * i.qty, 0); },
  count() { return this.get().reduce((s, i) => s + i.qty, 0); },
  deliveryFee() {
    return this.total() >= 500 ? 0 : 99;
  },
  finalTotal() {
    return this.total() + this.deliveryFee();
  },
};

function openCart() {
  const panel = document.getElementById("cart-panel");
  const overlay = document.getElementById("cart-overlay");
  if (panel) panel.classList.add("open");
  if (overlay) overlay.classList.add("visible");
}

function closeCart() {
  const panel = document.getElementById("cart-panel");
  const overlay = document.getElementById("cart-overlay");
  if (panel) panel.classList.remove("open");
  if (overlay) overlay.classList.remove("visible");
}

function renderCart() {
  const panel = document.getElementById("cart-panel");
  const list = document.getElementById("cart-items");
  const total = document.getElementById("cart-total");
  const summary = document.getElementById("cart-summary");
  const button = document.getElementById("checkout");

  if (!list) return;

  const items = cart.get();
  const totalValue = cart.total();
  const deliveryFee = cart.deliveryFee();

  if (!items.length) {
    list.innerHTML = `
      <div class="empty-cart">
        <div class="empty-cart-icon">🛒</div>
        <h4>Корзина пуста</h4>
        <p>Добавьте любимые товары и оформите заказ за пару кликов.</p>
      </div>
    `;
    if (total) total.textContent = "Итого: 0.00 ₽";
    if (summary) summary.innerHTML = `<div class="delivery-row"><span>Доставка</span><strong>0 ₽</strong></div><div class="summary-total"><span>К оплате</span><strong>0.00 ₽</strong></div>`;
    if (button) button.disabled = true;
    if (panel) panel.classList.add("empty");
    return;
  }

  if (panel) panel.classList.remove("empty");
  list.innerHTML = "";

  items.forEach((item) => {
    const row = document.createElement("div");
    row.className = "cart-row";
    row.innerHTML = `
      <div class="cart-product">
        <div>
          <strong>${String(item.name || "Товар").replace(/[&<>\"']/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]))}</strong>
          <small>${(item.price * item.qty).toFixed(2)} ₽</small>
        </div>
      </div>
      <div class="qty-controls">
        <button data-act="dec" data-id="${item.id}" type="button">−</button>
        <span>${item.qty}</span>
        <button data-act="inc" data-id="${item.id}" type="button">+</button>
      </div>
    `;
    list.appendChild(row);
  });

  list.querySelectorAll("button[data-act]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = Number(btn.dataset.id);
      const target = items.find((i) => i.id === id);
      if (!target) return;
      const delta = btn.dataset.act === "inc" ? 1 : -1;
      cart.setQty(id, target.qty + delta);
    });
  });

  if (total) total.textContent = `Итого: ${totalValue.toFixed(2)} ₽`;
  if (summary) {
    summary.innerHTML = `
      <div class="delivery-row"><span>Доставка</span><strong>${deliveryFee.toFixed(2)} ₽</strong></div>
      <div class="summary-total"><span>К оплате</span><strong>${cart.finalTotal().toFixed(2)} ₽</strong></div>
    `;
  }
  if (button) button.disabled = false;
}

// ---------- Хедер с навигацией ----------
async function renderHeader() {
  const el = document.getElementById("header");
  if (!el) return;

  const loggedIn = auth.isLoggedIn();
  let isAdmin = false;

  if (loggedIn) {
    try {
      const me = await api("/users/me");
      isAdmin = me.is_admin;
    } catch {}
  }

  el.innerHTML = `
    <div class="header-inner">
      <a href="/" class="logo"><h1>FastMart</h1></a>
      <nav>
        <a href="/">Каталог</a>
        ${loggedIn
          ? `<a href="/orders.html">Мои заказы</a>
             ${isAdmin ? `<a href="/admin.html">Админка</a>` : ""}
             <a href="#" id="logout">Выйти</a>`
          : `<a href="/login.html">Войти</a>`}
      </nav>
      <button class="cart-button" id="cart-toggle" type="button">
        🛒 Корзина <span id="cart-count">0</span>
      </button>
    </div>
  `;

  const logout = document.getElementById("logout");
  if (logout) {
    logout.addEventListener("click", (e) => {
      e.preventDefault();
      auth.clear();
      location.href = "/";
    });
  }

  const cartToggle = document.getElementById("cart-toggle");
  if (cartToggle) {
    cartToggle.addEventListener("click", () => {
      const panel = document.getElementById("cart-panel");
      if (!panel) return;
      panel.classList.toggle("open");
    });
  }

  updateCartBadge();
  renderCart();
}

document.addEventListener("DOMContentLoaded", () => {
  renderHeader();
  const closeCartBtn = document.getElementById("close-cart");
  if (closeCartBtn) closeCartBtn.addEventListener("click", closeCart);
  const overlay = document.getElementById("cart-overlay");
  if (overlay) overlay.addEventListener("click", closeCart);
});