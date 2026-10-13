from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import Base, engine, SessionLocal, ensure_columns
from i18n import AppError, app_error_handler
import settings
from models import User, Product
from auth import hash_password
from routers import users, products, orders
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os



Base.metadata.create_all(bind=engine)
ensure_columns()

app = FastAPI(
    title="FastMarket API",
    description="Каталог продуктов и заказы для FastMarket. "
                "Цены — в армянских драмах (AMD). "
                "Язык сообщений об ошибках выбирается по заголовку Accept-Language: ru, en, hy.",
    version="1.1.0",
)

app.add_exception_handler(AppError, app_error_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Браузер всегда сверяется с сервером, не изменился ли файл (если нет — короткий ответ 304).
# Вместе с ?v=N у CSS/JS это не даёт Safari и другим браузерам показывать старую версию сайта.
@app.middleware("http")
async def no_cache(request, call_next):
    response = await call_next(request)
    response.headers.setdefault("Cache-Control", "no-cache")
    return response


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
                email="admin@example.com",
                username="admin",
                hashed_password=hash_password("admin123"),
                full_name="Администратор",
                is_admin=True,
            )
            db.add(admin)

        if db.query(Product).count() == 0:
            # Цены — в армянских драмах
            demo_products = [
                Product(name="Молоко 3.2%", name_en="Milk 3.2%", name_hy="Կաթ 3,2%",
                        price=390, stock=50,
                        category="Молочные", category_en="Dairy", category_hy="Կաթնամթերք",
                        description="Пастеризованное молоко, 1 л",
                        description_en="Pasteurized milk, 1 L",
                        description_hy="Պաստերիզացված կաթ, 1 լ"),
                Product(name="Хлеб бородинский", name_en="Borodinsky rye bread", name_hy="Բորոդինսկի հաց",
                        price=190, stock=30,
                        category="Хлеб", category_en="Bread", category_hy="Հաց",
                        description="Свежий бородинский хлеб, 400 г",
                        description_en="Fresh dark rye bread, 400 g",
                        description_hy="Թարմ տարեկանի հաց, 400 գ"),
                Product(name="Яйца С1", name_en="Eggs, grade C1", name_hy="Ձու C1",
                        price=560, stock=80,
                        category="Яйца", category_en="Eggs", category_hy="Ձու",
                        description="Куриные яйца, 10 шт",
                        description_en="Chicken eggs, 10 pcs",
                        description_hy="Հավի ձու, 10 հատ"),
                Product(name="Бананы", name_en="Bananas", name_hy="Բանան",
                        price=430, stock=100,
                        category="Фрукты", category_en="Fruits", category_hy="Մրգեր",
                        description="Бананы, 1 кг",
                        description_en="Bananas, 1 kg",
                        description_hy="Բանան, 1 կգ"),
                Product(name="Сыр Гауда", name_en="Gouda cheese", name_hy="Գաուդա պանիր",
                        price=1250, stock=20,
                        category="Сыры", category_en="Cheese", category_hy="Պանիրներ",
                        description="Сыр гауда, 200 г",
                        description_en="Gouda cheese, 200 g",
                        description_hy="Գաուդա պանիր, 200 գ"),
            ]
            db.add_all(demo_products)

        db.commit()
    finally:
        db.close()


@app.get("/config", tags=["Магазин"])
def shop_config():
    """Публичные настройки магазина: доставка, валюта, способы оплаты."""
    return {
        "currency": settings.CURRENCY,
        "delivery_fee": settings.DELIVERY_FEE,
        "delivery_minutes": settings.DELIVERY_MINUTES,
        "min_order_amount": settings.MIN_ORDER_AMOUNT,
        "payment_methods": list(settings.PAYMENT_METHODS),
    }


@app.get("/", include_in_schema=False)
def root():
    index = os.path.join("static", "index.html")
    if os.path.isfile(index):
        return FileResponse(index)
    return {"message": "FastMarket API работает", "docs": "/docs"}


@app.get("/admin", include_in_schema=False)
def admin_page():
    return FileResponse("static/admin.html")


app.mount("/", StaticFiles(directory="static", html=True), name="static")