from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime


# ---------- USERS ----------
class UserBase(BaseModel):
    email: EmailStr
    username: str
    full_name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None


class UserCreate(UserBase):
    password: str = Field(..., min_length=4)


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None


class UserOut(UserBase):
    id: int
    is_active: bool
    is_admin: bool
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class LoginData(BaseModel):
    username: str
    password: str


# ---------- PRODUCTS ----------
class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float = Field(..., gt=0)
    category: Optional[str] = None
    stock: int = 0
    image_url: Optional[str] = None
    is_available: bool = True


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    category: Optional[str] = None
    stock: Optional[int] = None
    image_url: Optional[str] = None
    is_available: Optional[bool] = None


class ProductOut(ProductBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# ---------- ORDERS ----------
class OrderItem(BaseModel):
    product_id: int
    quantity: int = Field(..., gt=0)


class OrderCreate(BaseModel):
    items: List[OrderItem]
    delivery_address: str
    comment: Optional[str] = None


class OrderOut(BaseModel):
    id: int
    user_id: int
    status: str
    total_price: float
    delivery_address: str
    items_json: str
    comment: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class OrderStatusUpdate(BaseModel):
    status: str