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
  setTimeout(() => el.classList.remove("show"), 2200);
}

// ---------- Корзина (в localStorage) ----------
const cart = {
  key: "cart",
  get() {
    try { return JSON.parse(localStorage.getItem(this.key)) || []; }
    catch { return []; }
  },
  save(items) { localStorage.setItem(this.key, JSON.stringify(items)); },
  add(product) {
    const items = this.get();
    const found = items.find(i => i.id === product.id);
    if (found) found.qty += 1;
    else items.push({ id: product.id, name: product.name, price: product.price, qty: 1 });
    this.save(items);
  },
  setQty(id, qty) {
    let items = this.get();
    if (qty <= 0) items = items.filter(i => i.id !== id);
    else items = items.map(i => i.id === id ? { ...i, qty } : i);
    this.save(items);
  },
  clear() { localStorage.removeItem(this.key); },
  total() { return this.get().reduce((s, i) => s + i.price * i.qty, 0); },
  count() { return this.get().reduce((s, i) => s + i.qty, 0); },
};

// ---------- Хедер с навигацией ----------
function renderHeader() {
  const el = document.getElementById("header");
  if (!el) return;

  const loggedIn = auth.isLoggedIn();
  el.innerHTML = `
    <h1>🛒 Dark Store</h1>
    <nav>
      <a href="/">Каталог</a>
      ${loggedIn
        ? `<a href="/orders.html">Мои заказы</a>
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