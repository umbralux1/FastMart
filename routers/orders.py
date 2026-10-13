from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import Order, User
from schemas import OrderCreate, OrderOut, OrderStatusUpdate
from auth import get_current_user, get_current_admin
from i18n import AppError
from crud import create_order

router = APIRouter(prefix="/orders", tags=["Заказы"])

VALID_STATUSES = {"pending", "confirmed", "delivering", "delivered", "cancelled"}


@router.post("/", response_model=OrderOut, status_code=201)
def make_order(
    data: OrderCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return create_order(db, current_user, data)


@router.get("/my", response_model=List[OrderOut])
def my_orders(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return (
        db.query(Order)
        .filter(Order.user_id == current_user.id)
        .order_by(Order.created_at.desc())
        .all()
    )


@router.get("/{order_id}", response_model=OrderOut)
def get_order(
    order_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise AppError(404, "order.not_found")
    if order.user_id != current_user.id and not current_user.is_admin:
        raise AppError(403, "order.forbidden")
    return order


@router.patch("/{order_id}/cancel", response_model=OrderOut)
def cancel_order(
    order_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise AppError(404, "order.not_found")
    if order.user_id != current_user.id and not current_user.is_admin:
        raise AppError(403, "order.forbidden")
    if order.status not in ("pending", "confirmed"):
        raise AppError(400, "order.cannot_cancel")
    order.status = "cancelled"
    db.commit()
    db.refresh(order)
    return order


# ---------- ADMIN ----------
@router.get("/admin/all", response_model=List[OrderOut])
def all_orders(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    return db.query(Order).order_by(Order.created_at.desc()).all()


@router.patch("/admin/{order_id}/status", response_model=OrderOut)
def change_status(
    order_id: int,
    data: OrderStatusUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    if data.status not in VALID_STATUSES:
        raise AppError(400, "order.bad_status", allowed=", ".join(sorted(VALID_STATUSES)))
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise AppError(404, "order.not_found")
    order.status = data.status
    db.commit()
    db.refresh(order)
    return order