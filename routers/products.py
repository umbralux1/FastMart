from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Product, User
from schemas import ProductCreate, ProductOut, ProductUpdate
from auth import get_current_admin
from crud import create_product, update_product

router = APIRouter(prefix="/products", tags=["Товары"])


@router.get("/", response_model=List[ProductOut])
def list_products(
    category: Optional[str] = None,
    search: Optional[str] = None,
    only_available: bool = True,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    query = db.query(Product)

    if category:
        query = query.filter(Product.category == category)

    if only_available:
        query = query.filter(Product.is_available == True)

    products = query.all()

    # Поиск делаем в Python — учитывает регистр кириллицы
    if search:
        needle = search.strip().lower()
        products = [p for p in products if needle in p.name.lower()]

    return products[skip:skip + limit]


@router.get("/{product_id}", response_model=ProductOut)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Товар не найден")
    return product


@router.post("/", response_model=ProductOut, status_code=201)
def add_product(
    data: ProductCreate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    return create_product(db, data)


@router.patch("/{product_id}", response_model=ProductOut)
def edit_product(
    product_id: int,
    data: ProductUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    return update_product(db, product_id, data)


@router.delete("/{product_id}", status_code=204)
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Товар не найден")
    db.delete(product)
    db.commit()
    return None