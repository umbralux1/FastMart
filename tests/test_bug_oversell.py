"""
Баг: один товар двумя строками заказа уводит остаток в минус.

Воспроизведение (Postman или /docs), при остатке сыра 20 шт.:
    POST /orders/
    {"items": [{"product_id": 5, "quantity": 15},
               {"product_id": 5, "quantity": 15}], ...}

Сейчас заказ принимается, остаток становится −10, и GET /products/ отвечает 500.
Причина: crud.create_order сверяет с остатком каждую строку отдельно.

Тесты работают с временной базой — рабочая dark_store.db не затрагивается.
"""
import os
import sys
import tempfile
from pathlib import Path

import pytest
from sqlalchemy import create_engine

ROOT = Path(__file__).resolve().parents[1]
os.chdir(ROOT)                  # main.py ищет папку static/ по относительному пути
sys.path.insert(0, str(ROOT))

import database  # noqa: E402

# Подменяем базу до импорта main: main при импорте создаёт таблицы
database.engine = create_engine(
    f"sqlite:///{tempfile.mkdtemp()}/test.db",
    connect_args={"check_same_thread": False},
)
database.SessionLocal.configure(bind=database.engine)

import main  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

CHEESE = 5  # «Сыр Гауда», в демо-данных 20 шт.


@pytest.fixture
def client():
    """Чистая база с демо-данными и вход под админом."""
    database.Base.metadata.drop_all(database.engine)
    database.Base.metadata.create_all(database.engine)
    with TestClient(main.app) as c:
        r = c.post("/users/login", data={"username": "admin", "password": "admin123"})
        c.headers["Authorization"] = f"Bearer {r.json()['access_token']}"
        yield c


def order(client, *quantities):
    return client.post("/orders/", json={
        "items": [{"product_id": CHEESE, "quantity": q} for q in quantities],
        "delivery_address": "Abovyan 10, apt 5",
        "phone": "091234567",
    })


def stock(client):
    return client.get(f"/products/{CHEESE}").json()["stock"]


def test_same_product_in_two_lines_cannot_exceed_stock(client):
    assert stock(client) == 20

    r = order(client, 15, 15)  # 30 шт. при остатке 20

    assert r.status_code == 400, f"Заказ на 30 шт. при остатке 20 принят, сумма {r.json()['total_price']} ֏"
    assert client.get("/products/").status_code == 200
    assert stock(client) == 20
    assert client.get("/orders/admin/all").json() == []


@pytest.mark.parametrize("quantities", [(10, 10), (5, 5, 10)])
def test_same_product_in_several_lines_within_stock_is_accepted(client, quantities):
    r = order(client, *quantities)  # в сумме ровно 20

    assert r.status_code == 201
    assert stock(client) == 0
