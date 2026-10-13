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
    // если мы не на странице логина — редирект
    if (!location.pathname.includes("login")) {
      location.href = "/login.html";
    }
    throw new Error("Требуется авторизация");
  }

  if (res.status === 204) return null;

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const detail = Array.isArray(data.detail)
      ? data.detail.map(d => d.msg).join("; ")   // ошибки валидации Pydantic
      : data.detail;
    throw new Error(detail || "Ошибка запроса");
  }
  return data;
}

// ---------- Общие утилиты ----------
function escapeHtml(s) {
  return String(s ?? "").replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[c]);
}

const _rub0 = new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 });
const _rub2 = new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB", minimumFractionDigits: 2 });

// 45 → «45 ₽», 89.9 → «89,90 ₽»
function fmtPrice(n) {
  const v = Math.round(Number(n) * 100) / 100;
  return (Number.isInteger(v) ? _rub0 : _rub2).format(v);
}

// plural(3, "товар", "товара", "товаров") → «товара»
function plural(n, one, few, many) {
  const m10 = n % 10, m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
  return many;
}

// ---------- Тост-уведомления ----------
let _toastTimer;
function toast(msg) {
  let el = document.querySelector(".toast");
  if (!el) {
    el = document.createElement("div");
    el.className = "toast";
    el.setAttribute("role", "status");
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => el.classList.remove("show"), 2600);
}

// ---------- Корзина (в localStorage) ----------
// Элемент: { id, name, price, qty, stock, category, image_url }
const cart = {
  key: "cart",
  get() {
    try { return JSON.parse(localStorage.getItem(this.key)) || []; }
    catch { return []; }
  },
  save(items) { localStorage.setItem(this.key, JSON.stringify(items)); },
  qty(id) {
    const found = this.get().find(i => i.id === id);
    return found ? found.qty : 0;
  },
  // Возвращает false, если больше добавить нельзя (упёрлись в остаток)
  add(product) {
    const items = this.get();
    const found = items.find(i => i.id === product.id);
    const max = product.stock ?? found?.stock ?? Infinity;
    if (found) {
      if (found.qty >= max) return false;
      found.qty += 1;
      if (product.stock != null) found.stock = product.stock;
    } else {
      if (max <= 0) return false;
      items.push({
        id: product.id,
        name: product.name,
        price: product.price,
        qty: 1,
        stock: product.stock,
        category: product.category,
        image_url: product.image_url,
      });
    }
    this.save(items);
    return true;
  },
  setQty(id, qty) {
    let items = this.get();
    if (qty <= 0) {
      items = items.filter(i => i.id !== id);
    } else {
      items = items.map(i => {
        if (i.id !== id) return i;
        const max = i.stock ?? Infinity;
        return { ...i, qty: Math.min(qty, max) };
      });
    }
    this.save(items);
  },
  // Сверяет корзину с актуальным каталогом: цены, остатки, снятые с продажи товары.
  // Возвращает true, если что-то поменялось.
  sync(products) {
    const map = new Map(products.map(p => [p.id, p]));
    let changed = false;
    const next = [];
    for (const i of this.get()) {
      const p = map.get(i.id);
      if (!p || !p.is_available || p.stock <= 0) { changed = true; continue; }
      const qty = Math.min(i.qty, p.stock);
      if (qty !== i.qty || p.price !== i.price) changed = true;
      next.push({
        ...i, qty,
        name: p.name, price: p.price, stock: p.stock,
        category: p.category, image_url: p.image_url,
      });
    }
    this.save(next);
    return changed;
  },
  clear() { localStorage.removeItem(this.key); },
  total() { return this.get().reduce((s, i) => s + i.price * i.qty, 0); },
  count() { return this.get().reduce((s, i) => s + i.qty, 0); },
};

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
    <a href="/" class="logo"><h1>🛒 FastMart</h1></a>
    <nav>
      <a href="/">Каталог</a>
      ${loggedIn
        ? `<a href="/orders.html">Мои заказы</a>
           ${isAdmin ? `<a href="/admin.html">Админка</a>` : ""}
           <a href="#" id="logout">Выйти</a>`
        : `<a href="/login.html">Войти</a>`}
    </nav>
  `;

  const logout = document.getElementById("logout");
  if (logout) {
    logout.addEventListener("click", (e) => {
      e.preventDefault();
      auth.clear();
      location.href = "/";
    });
  }
}

document.addEventListener("DOMContentLoaded", renderHeader);
