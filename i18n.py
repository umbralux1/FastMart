"""
Переводы сообщений API на русский, английский и армянский.

Язык берётся из заголовка Accept-Language (фронтенд выставляет его сам).
Ошибки бросаются как AppError("ключ", ...) — текст подставляется
в обработчике исключений уже на нужном языке.
"""
from fastapi import HTTPException, Request
from fastapi.responses import JSONResponse

SUPPORTED_LANGS = ("ru", "en", "hy")
DEFAULT_LANG = "ru"

# Поля товара, у которых есть переводы: name → name_en, name_hy
TRANSLATED_FIELDS = ("name", "description", "category")

MESSAGES = {
    "auth.invalid_token": {
        "ru": "Не удалось проверить токен",
        "en": "Could not validate credentials",
        "hy": "Չհաջողվեց ստուգել նույնականացման տվյալները",
    },
    "auth.admin_required": {
        "ru": "Требуются права администратора",
        "en": "Administrator rights required",
        "hy": "Անհրաժեշտ են ադմինիստրատորի իրավունքներ",
    },
    "user.exists": {
        "ru": "Email или имя пользователя уже заняты",
        "en": "Email or username is already taken",
        "hy": "Էլ. փոստը կամ օգտանունն արդեն զբաղված է",
    },
    "user.bad_credentials": {
        "ru": "Неверный логин или пароль",
        "en": "Incorrect username or password",
        "hy": "Սխալ օգտանուն կամ գաղտնաբառ",
    },
    "user.not_found": {
        "ru": "Пользователь не найден",
        "en": "User not found",
        "hy": "Օգտատերը չի գտնվել",
    },
    "product.not_found": {
        "ru": "Товар не найден",
        "en": "Product not found",
        "hy": "Ապրանքը չի գտնվել",
    },
    "product.not_found_id": {
        "ru": "Товар с id={id} не найден",
        "en": "Product with id={id} not found",
        "hy": "id={id} ապրանքը չի գտնվել",
    },
    "product.unavailable": {
        "ru": "Товар «{name}» недоступен",
        "en": "“{name}” is not available",
        "hy": "«{name}» ապրանքը հասանելի չէ",
    },
    "product.insufficient": {
        "ru": "Недостаточно товара «{name}». В наличии: {stock}",
        "en": "Not enough “{name}” in stock. Available: {stock}",
        "hy": "«{name}» ապրանքը բավարար չէ։ Առկա է՝ {stock}",
    },
    "order.not_found": {
        "ru": "Заказ не найден",
        "en": "Order not found",
        "hy": "Պատվերը չի գտնվել",
    },
    "order.forbidden": {
        "ru": "Нет доступа к этому заказу",
        "en": "You don't have access to this order",
        "hy": "Այս պատվերի հասանելիություն չունեք",
    },
    "order.cannot_cancel": {
        "ru": "Нельзя отменить заказ в этом статусе",
        "en": "The order can't be cancelled at this stage",
        "hy": "Այս կարգավիճակում պատվերը հնարավոր չէ չեղարկել",
    },
    "order.bad_status": {
        "ru": "Недопустимый статус. Разрешено: {allowed}",
        "en": "Invalid status. Allowed: {allowed}",
        "hy": "Անթույլատրելի կարգավիճակ։ Թույլատրված են՝ {allowed}",
    },
}


def pick_lang(accept_language: str | None) -> str:
    """'hy-AM,hy;q=0.9,en;q=0.8' → 'hy'. Учитывает веса q."""
    if not accept_language:
        return DEFAULT_LANG
    candidates = []
    for i, part in enumerate(accept_language.split(",")):
        piece = part.strip().split(";")
        code = piece[0].strip().lower().split("-")[0]
        q = 1.0
        for p in piece[1:]:
            p = p.strip()
            if p.startswith("q="):
                try:
                    q = float(p[2:])
                except ValueError:
                    q = 0.0
        candidates.append((-q, i, code))
    for _, _, code in sorted(candidates):
        if code in SUPPORTED_LANGS:
            return code
    return DEFAULT_LANG


def translate(key: str, lang: str, **params) -> str:
    texts = MESSAGES.get(key)
    if not texts:
        return key
    template = texts.get(lang) or texts[DEFAULT_LANG]
    # Параметр может быть словарём по языкам — например, название товара
    resolved = {
        k: (v.get(lang) or v.get(DEFAULT_LANG) if isinstance(v, dict) else v)
        for k, v in params.items()
    }
    return template.format(**resolved)


def localized_names(obj, field: str = "name") -> dict:
    """{'ru': 'Молоко', 'en': 'Milk', 'hy': 'Կաթ'} — пустые переводы отбрасываются."""
    out = {"ru": getattr(obj, field)}
    for lang in SUPPORTED_LANGS:
        if lang == DEFAULT_LANG:
            continue
        value = getattr(obj, f"{field}_{lang}", None)
        if value:
            out[lang] = value
    return out


class AppError(HTTPException):
    """HTTP-ошибка с ключом сообщения: текст переводится по Accept-Language."""

    def __init__(self, status_code: int, key: str, headers: dict | None = None, **params):
        super().__init__(status_code=status_code, detail=key, headers=headers)
        self.key = key
        self.params = params


async def app_error_handler(request: Request, exc: AppError) -> JSONResponse:
    lang = pick_lang(request.headers.get("accept-language"))
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": translate(exc.key, lang, **exc.params), "code": exc.key},
        headers=exc.headers,
    )
