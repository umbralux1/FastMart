from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

SQLALCHEMY_DATABASE_URL = "sqlite:///./dark_store.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()



# Колонки, добавленные после первого релиза. create_all() не меняет уже
# существующие таблицы, поэтому досоздаём их сами (работает и в SQLite, и в Postgres).
_ADDED_COLUMNS = {
    "products": {
        "name_en": "TEXT", "name_hy": "TEXT",
        "description_en": "TEXT", "description_hy": "TEXT",
        "category_en": "TEXT", "category_hy": "TEXT",
    },
    "orders": {
        "phone": "TEXT",
        "payment_method": "TEXT DEFAULT 'cash'",
        "delivery_fee": "FLOAT DEFAULT 0",
    },
}


def ensure_columns():
    from sqlalchemy import inspect, text

    insp = inspect(engine)
    tables = set(insp.get_table_names())
    with engine.begin() as conn:
        for table, columns in _ADDED_COLUMNS.items():
            if table not in tables:
                continue
            existing = {c["name"] for c in insp.get_columns(table)}
            for col, sql_type in columns.items():
                if col not in existing:
                    conn.execute(text(f"ALTER TABLE {table} ADD COLUMN {col} {sql_type}"))
