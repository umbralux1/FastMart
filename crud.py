import json
from sqlalchemy.orm import Session
from fastapi import HTTPException
from models import User, Product, Order
from schemas import UserCreate, ProductCreate, ProductUpdate, OrderCreate
from auth import hash_password


# ---------- USERS ----------
def create_user(db: Session, data: UserCreate) -> User:
    if db.query(User).filter((User.email == data.email) | (User.username == data.username)).first():
        raise HTTPException(status_code=400, detail="Email или username уже заняты")
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
        raise HTTPException(status_code=404, detail="Товар не найден")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(product, field, value)
    db.commit()
    db.refresh(product)
    return product


# ---------- ORDERS ----------
def create_order(db: Session, user: User, data: OrderCreate) -> Order:
    items_data = []
    total = 0.0

    for item in data.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail=f"Товар с id={item.product_id} не найден")
        if not product.is_available:
            raise HTTPException(status_code=400, detail=f"Товар '{product.name}' недоступен")
        if product.stock < item.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Недостаточно товара '{product.name}'. В наличии: {product.stock}"
            )
        line_total = product.price * item.quantity
        total += line_total
        items_data.append({
            "product_id": product.id,
            "name": product.name,
            "quantity": item.quantity,
            "price": product.price,
            "line_total": line_total,
        })

    # Уменьшаем остатки
    for item in data.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        product.stock -= item.quantity

    order = Order(
        user_id=user.id,
        total_price=round(total, 2),
        delivery_address=data.delivery_address,
        items_json=json.dumps(items_data, ensure_ascii=False),
        comment=data.comment,
        status="pending",
    )
    db.add(order)
    db.commit()
    db.refresh(order)
    return order