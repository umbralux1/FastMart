from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from database import get_db
from schemas import UserCreate, UserOut, Token, UserUpdate
from models import User
from auth import verify_password, create_access_token, get_current_user
from crud import create_user

router = APIRouter(prefix="/users", tags=["Пользователи"])


@router.post("/register", response_model=UserOut, status_code=201)
def register(data: UserCreate, db: Session = Depends(get_db)):
    return create_user(db, data)


@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Неверный логин или пароль")
    token = create_access_token({"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer"}


@router.get("/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)):
    return current_user


@router.patch("/me", response_model=UserOut)
def update_me(
    data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(current_user, field, value)
    db.commit()
    db.refresh(current_user)
    return current_user