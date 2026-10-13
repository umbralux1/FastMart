"""
Привязывает картинки из static/img/demo/ к демо-товарам в существующей базе.

    python scripts/set_demo_images.py [путь_к_бд]   # по умолчанию dark_store.db

Меняет только товары без фото (image_url пустой) с известными названиями.
Можно запускать при работающем сервере и повторно — ничего не сломает.
"""
import sqlite3
import sys

DEMO_IMAGES = {
    "Молоко 3.2%": "/img/demo/milk.jpg",
    "Хлеб бородинский": "/img/demo/bread.jpg",
    "Яйца С1": "/img/demo/eggs.jpg",
    "Бананы": "/img/demo/bananas.jpg",
    "Сыр Гауда": "/img/demo/cheese.jpg",
    "Кола": "/img/demo/cola.jpg",
}


def main(db_path: str) -> None:
    con = sqlite3.connect(db_path, timeout=10)
    with con:
        for name, url in DEMO_IMAGES.items():
            cur = con.execute(
                "UPDATE products SET image_url = ? "
                "WHERE name = ? AND (image_url IS NULL OR image_url = '')",
                (url, name),
            )
            print(f"  {name}: {'фото добавлено' if cur.rowcount else 'пропущено (нет товара или фото уже есть)'}")
    con.close()
    print("Готово. Обновите страницу каталога.")


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "dark_store.db")
