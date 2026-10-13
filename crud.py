import json
from sqlalchemy.orm import Session
import re
from i18n import AppError, localized_names
from settings import DELIVERY_FEE
from models import User, Product, Order
from schemas import UserCreate, ProductCreate, ProductUpdate, OrderCreate
from auth import hash_password


# ---------- USERS ----------
def create_user(db: Session, data: UserCreate) -> User:
    if db.query(User).filter((User.email == data.email) | (User.username == data.username)).first():
        raise AppError(400, "user.exists")
    user = User(
        email=data.email,
        username=data.username,
        hashed_password=hash_password(data.password),
        full_name=data.full_name,
        phone=data.phone,
        address=data.address,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


# ---------- PRODUCTS ----------
def create_product(db: Session, data: ProductCreate) -> Product:
    product = Product(**data.model_dump())
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


def update_product(db: Session, product_id: int, data: ProductUpdate) -> Product:
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise AppError(404, "product.not_found")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(product, field, value)
    db.commit()
    db.refresh(product)
    return product


# ---------- ORDERS ----------
def normalize_am_phone(raw: str) -> str:
    """'+374 91 234567', '091234567', '91 23 45 67' → '+37491234567'. Иначе — ошибка 400."""
    digits = re.sub(r"\D", "", raw or "")
    if digits.startswith("374") and len(digits) == 11:
        digits = digits[3:]
    elif digits.startswith("0") and len(digits) == 9:
        digits = digits[1:]
    if len(digits) != 8:
        raise AppError(400, "order.bad_phone")
    return "+374" + digits


def create_order(db: Session, user: User, data: OrderCreate) -> Order:
    phone = normalize_am_phone(data.phone)

    # Складываем строки с одинаковым товаром: [5×15, 5×15] → {5: 30}.
    # Иначе каждая строка сверяется с остатком отдельно и вместе превышают его.
    quantities: dict[int, int] = {}
    for item in data.items:
        quantities[item.product_id] = quantities.get(item.product_id, 0) + item.quantity

    items_data = []
    total = 0.0
    products = []

    for product_id, quantity in quantities.items():
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            raise AppError(404, "product.not_found_id", id=product_id)
        if not product.is_available:
            raise AppError(400, "product.unavailable", name=localized_names(product))
        if product.stock < quantity:
            raise AppError(
                400, "product.insufficient",
                name=localized_names(product), stock=product.stock,
            )
        line_total = product.price * quantity
        total += line_total
        items_data.append({
            "product_id": product.id,
            "name": product.name,
            "names": localized_names(product),  # чтобы история заказов была на любом языке
            "quantity": quantity,
            "price": product.price,
            "line_total": line_total,
        })
        products.append((product, quantity))

    # Уменьшаем остатки — только после того, как проверены все товары
    for product, quantity in products:
        product.stock -= quantity

    order = Order(
        user_id=user.id,
        total_price=round(total + DELIVERY_FEE, 2),  # товары + доставка
        delivery_fee=DELIVERY_FEE,
        phone=phone,
        payment_method=data.payment_method,
        delivery_address=data.delivery_address,
        items_json=json.dumps(items_data, ensure_ascii=False),
        comment=data.comment,
        status="pending",
    )
    db.add(order)
    db.commit()
    db.refresh(order)
    return order

