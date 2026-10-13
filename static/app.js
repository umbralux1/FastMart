// Меняйте, если сервер на другом адресе
const API = "";
// Переводы, форматирование цен и дат — в i18n.js (подключается перед этим файлом)

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
  headers["Accept-Language"] = LANG;   // сервер вернёт ошибки на этом языке
  const token = auth.getToken();
  if (token) headers["Authorization"] = "Bearer " + token;

  let res;
  try {
    res = await fetch(API + path, { ...options, headers });
  } catch {
    throw new Error(t("err.network"));
  }

  if (res.status === 401) {
    auth.clear();
    // если мы не на странице логина — редирект
    if (!location.pathname.includes("login")) {
      location.href = "/login.html";
    }
    throw new Error(t("err.auth"));
  }

  if (res.status === 204) return null;

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    // 422 — ошибка валидации Pydantic: её текст всегда на английском, показываем свой
    const detail = Array.isArray(data.detail) ? t("err.validation") : data.detail;
    throw new Error(detail || t("err.request"));
  }
  return data;
}

// ---------- Общие утилиты ----------
function escapeHtml(s) {
  return String(s ?? "").replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[c]);
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
// Элемент: { id, name, name_en, name_hy, price, qty, stock, category, image_url }
function pickCartFields(p) {
  return {
    id: p.id,
    name: p.name, name_en: p.name_en, name_hy: p.name_hy,
    price: p.price,
    stock: p.stock,
    category: p.category,
    image_url: p.image_url,
  };
}
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
      items.push({ ...pickCartFields(product), qty: 1 });
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
      next.push({ ...i, ...pickCartFields(p), qty });
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
    <a href="/" class="logo"><h1>🛒 FastMarket</h1></a>
    <nav>
      <a href="/" class="nav-catalog">${t("nav.catalog")}</a>
      ${loggedIn
        ? `<a href="/orders.html">${t("nav.orders")}</a>
           ${isAdmin ? `<a href="/admin.html">${t("nav.admin")}</a>` : ""}
           <a href="#" id="logout">${t("nav.logout")}</a>`
        : `<a href="/login.html">${t("nav.login")}</a>`}
      <select class="lang-switch" id="lang-switch" aria-label="${t("lang.label")}">
        ${LANGS.map(l => `<option value="${l.code}" ${l.code === LANG ? "selected" : ""}>${l.short}</option>`).join("")}
      </select>
    </nav>
  `;
  document.getElementById("lang-switch").addEventListener("change", (e) => setLang(e.target.value));

  const logout = document.getElementById("logout");
  if (logout) {
    logout.addEventListener("click", (e) => {
      e.preventDefault();
      auth.clear();
      location.href = "/";
    });
  }
}

applyI18n();
document.addEventListener("DOMContentLoaded", renderHeader);
