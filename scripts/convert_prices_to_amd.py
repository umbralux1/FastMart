"""
Однократный перевод цен в базе из рублей в армянские драмы (AMD).

    python scripts/convert_prices_to_amd.py [путь_к_бд]   # по умолчанию dark_store.db

Что делает:
  1. Копирует базу в <имя>.before-amd.db (резервная копия).
  2. Пересчитывает цены товаров по курсу и округляет до 10 драмов.
  3. Пересчитывает историю заказов (цены позиций и суммы) по тому же правилу.
  4. Добавляет колонки переводов и заполняет их для демо-товаров.
  5. Ставит отметку в таблице app_meta — повторный запуск ничего не сломает.

Курс: ЦБ РФ на 13.10.2026 — 23,1676 ₽ за 100 AMD.
"""
import json
import shutil
import sqlite3
import sys
from decimal import Decimal, ROUND_HALF_UP
from pathlib import Path

RUB_PER_100_AMD = Decimal("23.1676")
AMD_PER_RUB = Decimal(100) / RUB_PER_100_AMD  # ≈ 4.3164

# name → (name_en, name_hy, desc_en, desc_hy)
PRODUCT_TRANSLATIONS = {
    "Молоко 3.2%": ("Milk 3.2%", "Կաթ 3,2%", "Pasteurized milk, 1 L", "Պաստերիզացված կաթ, 1 լ"),
    "Хлеб бородинский": ("Borodinsky rye bread", "Բորոդինսկի հաց", "Fresh dark rye bread, 400 g", "Թարմ տարեկանի հաց, 400 գ"),
    "Яйца С1": ("Eggs, grade C1", "Ձու C1", "Chicken eggs, 10 pcs", "Հավի ձու, 10 հատ"),
    "Бананы": ("Bananas", "Բանան", "Bananas, 1 kg", "Բանան, 1 կգ"),
    "Сыр Гауда": ("Gouda cheese", "Գաուդա պանիր", "Gouda cheese, 200 g", "Գաուդա պանիր, 200 գ"),
    "Кола": ("Cola", "Կոլա", None, None),
}
CATEGORY_TRANSLATIONS = {
    "Молочные": ("Dairy", "Կաթնամթերք"),
    "Хлеб": ("Bread", "Հաց"),
    "Яйца": ("Eggs", "Ձու"),
    "Фрукты": ("Fruits", "Մրգեր"),
    "Овощи": ("Vegetables", "Բանջարեղեն"),
    "Сыры": ("Cheese", "Պանիրներ"),
    "Напитки": ("Drinks", "Ըմպելիքներ"),
    "Мясо": ("Meat", "Միս"),
    "Сладости": ("Sweets", "Քաղցրավենիք"),
}
NEW_COLUMNS = ["name_en", "name_hy", "description_en", "description_hy", "category_en", "category_hy"]


def to_amd(rub) -> int:
    """89.90 ₽ → 390 ֏ (округление до 10 драмов, но не меньше 10)."""
    amd = Decimal(str(rub)) * AMD_PER_RUB
    rounded = int((amd / 10).quantize(Decimal(1), rounding=ROUND_HALF_UP)) * 10
    return max(rounded, 10)


def main(db_path: str) -> None:
    path = Path(db_path)
    if not path.exists():
        sys.exit(f"Файл базы не найден: {path}")

    con = sqlite3.connect(path)
    con.execute("CREATE TABLE IF NOT EXISTS app_meta (key TEXT PRIMARY KEY, value TEXT)")
    row = con.execute("SELECT value FROM app_meta WHERE key = 'currency'").fetchone()
    if row and row[0] == "AMD":
        print("Цены уже в драмах — ничего не делаю.")
        return

    backup = path.with_name(path.stem + ".before-amd" + path.suffix)
    con.close()
    shutil.copy2(path, backup)
    print(f"Резервная копия: {backup}")
    con = sqlite3.connect(path)

    try:
        con.execute("BEGIN")
        existing = {r[1] for r in con.execute("PRAGMA table_info(products)")}
        for col in NEW_COLUMNS:
            if col not in existing:
                con.execute(f"ALTER TABLE products ADD COLUMN {col} TEXT")

        products = {}
        for pid, name, price, category in con.execute(
            "SELECT id, name, price, category FROM products"
        ).fetchall():
            new_price = to_amd(price)
            tr = PRODUCT_TRANSLATIONS.get(name, (None,) * 4)
            cat = CATEGORY_TRANSLATIONS.get(category or "", (None, None))
            con.execute(
                """UPDATE products SET price = ?,
                       name_en = COALESCE(name_en, ?), name_hy = COALESCE(name_hy, ?),
                       description_en = COALESCE(description_en, ?), description_hy = COALESCE(description_hy, ?),
                       category_en = COALESCE(category_en, ?), category_hy = COALESCE(category_hy, ?)
                   WHERE id = ?""",
                (new_price, *tr, *cat, pid),
            )
            products[pid] = (name, tr)
            print(f"  товар #{pid} {name}: {price} ₽ → {new_price} ֏")

        for oid, items_json, total in con.execute(
            "SELECT id, items_json, total_price FROM orders"
        ).fetchall():
            items = json.loads(items_json)
            new_total = 0
            for it in items:
                it["price"] = to_amd(it["price"])
                it["line_total"] = it["price"] * it["quantity"]
                new_total += it["line_total"]
                name, tr = products.get(it["product_id"], (it.get("name"), (None,) * 4))
                names = {"ru": it.get("name") or name}
                if tr[0]:
                    names["en"] = tr[0]
                if tr[1]:
                    names["hy"] = tr[1]
                it.setdefault("names", names)
            con.execute(
                "UPDATE orders SET items_json = ?, total_price = ? WHERE id = ?",
                (json.dumps(items, ensure_ascii=False), new_total, oid),
            )
            print(f"  заказ #{oid}: {total} ₽ → {new_total} ֏")

        con.execute("INSERT OR REPLACE INTO app_meta (key, value) VALUES ('currency', 'AMD')")
        con.commit()
        print("Готово.")
    except Exception:
        con.rollback()
        raise
    finally:
        con.close()


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "dark_store.db")
