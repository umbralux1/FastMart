"""
Фото товаров: хранятся файлами в static/img/products/ и коммитятся в git.

Загружайте фото локально и коммитьте. На Render диск стирается при деплое —
загруженные там через админку файлы пропадут.
"""
import secrets
from pathlib import Path

from i18n import AppError

STATIC_DIR = Path(__file__).resolve().parent / "static"
PRODUCT_IMG_DIR = STATIC_DIR / "img" / "products"
URL_PREFIX = "/img/products/"
MAX_IMAGE_BYTES = 3 * 1024 * 1024  # браузер присылает уже сжатое фото, обычно 50–200 КБ


def _detect_ext(data: bytes) -> str | None:
    """Тип определяем по содержимому файла, а не по имени/заголовкам."""
    if data[:3] == b"\xff\xd8\xff":
        return "jpg"
    if data[:8] == b"\x89PNG\r\n\x1a\n":
        return "png"
    if data[:4] == b"RIFF" and data[8:12] == b"WEBP":
        return "webp"
    return None


def _own_file(image_url: str | None) -> Path | None:
    """Путь к файлу, если картинка лежит у нас в static/img/products (а не внешняя ссылка)."""
    if not image_url or not image_url.startswith(URL_PREFIX):
        return None
    name = image_url[len(URL_PREFIX):].split("?")[0]
    if "/" in name or "\\" in name or name.startswith("."):
        return None
    return PRODUCT_IMG_DIR / name


def save_product_image(product, data: bytes) -> str:
    """Сохраняет файл, удаляет старое фото товара, возвращает новый image_url."""
    if len(data) > MAX_IMAGE_BYTES:
        raise AppError(413, "product.image_too_big", mb=MAX_IMAGE_BYTES // (1024 * 1024))
    ext = _detect_ext(data)
    if not ext:
        raise AppError(400, "product.image_bad_type")

    PRODUCT_IMG_DIR.mkdir(parents=True, exist_ok=True)
    # Новое имя при каждой загрузке — браузеры не покажут старую картинку из кэша
    name = f"{product.id}-{secrets.token_hex(4)}.{ext}"
    (PRODUCT_IMG_DIR / name).write_bytes(data)

    remove_product_image(product)
    return URL_PREFIX + name


def remove_product_image(product) -> None:
    path = _own_file(product.image_url)
    if path and path.is_file():
        path.unlink()
