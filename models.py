from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Boolean, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    address = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    orders = relationship("Order", back_populates="user")


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    description = Column(Text, nullable=True)
    price = Column(Float, nullable=False)
    category = Column(String, index=True, nullable=True)
    # Переводы (русский — основной язык, поля выше)
    name_en = Column(String, nullable=True)
    name_hy = Column(String, nullable=True)
    description_en = Column(Text, nullable=True)
    description_hy = Column(Text, nullable=True)
    category_en = Column(String, nullable=True)
    category_hy = Column(String, nullable=True)
    stock = Column(Integer, default=0)
    image_url = Column(String, nullable=True)
    is_available = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(String, default="pending")  # pending, confirmed, delivering, delivered, cancelled
    total_price = Column(Float, default=0.0)
    delivery_address = Column(Text, nullable=False)
    phone = Column(String, nullable=True)            # +374XXXXXXXX; у старых заказов пусто
    payment_method = Column(String, default="cash")  # cash | card (курьеру)
    delivery_fee = Column(Float, default=0.0)        # входит в total_price
    items_json = Column(Text, nullable=False)  # JSON: [{"product_id": 1, "quantity": 2, "price": 99.9}]
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="orders")