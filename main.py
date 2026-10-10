from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import Base, engine, SessionLocal
from models import User, Product
from auth import hash_password
from routers import users, products, orders
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os


Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Dark Store API",
    description="Каталог продуктов и заказы для dark store",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router)
app.include_router(products.router)
app.include_router(orders.router)



@app.on_event("startup")
def seed_data():
    """Создаём админа и пару товаров для теста (если БД пустая)."""
    db = SessionLocal()
    try:
        if not db.query(User).filter(User.username == "admin").first():
            admin = User(
                email="admin@darkstore.local",
                username="admin",
                hashed_password=hash_password("admin123"),
                full_name="Администратор",
                is_admin=True,
            )
            db.add(admin)

        if db.query(Product).count() == 0:
            demo_products = [
                Product(name="Молоко 3.2%", price=89.90, category="Молочные", stock=50,
                        description="Пастеризованное молоко, 1 л"),
                Product(name="Хлеб бородинский", price=45.00, category="Хлеб", stock=30,
                        description="Свежий бородинский хлеб, 400 г"),
                Product(name="Яйца С1", price=129.50, category="Яйца", stock=80,
                        description="Куриные яйца, 10 шт"),
                Product(name="Бананы", price=99.00, category="Фрукты", stock=100,
                        description="Бананы, 1 кг"),
                Product(name="Сыр Гауда", price=289.00, category="Сыры", stock=20,
                        description="Сыр гауда, 200 г"),
            ]
            db.add_all(demo_products)

        db.commit()
    finally:
        db.close()


@app.get("/", include_in_schema=False)
def root():
    index = os.path.join("static", "index.html")
    if os.path.isfile(index):
        return FileResponse(index)
    return {"message": "Dark Store API работает", "docs": "/docs"}

app.mount("/", StaticFiles(directory="static", html=True), name="static")