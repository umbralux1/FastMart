// ============================================================
//  Переводы интерфейса: русский, английский, армянский.
//  Добавить строку: один ключ во все три словаря.
//  В HTML:  data-i18n="ключ"            → textContent
//           data-i18n-html="ключ"       → innerHTML (только для строк из этого файла)
//           data-i18n-ph="ключ"         → placeholder
//           data-i18n-aria="ключ"       → aria-label
//  В JS:    t("ключ", {параметры}),  tp("ключ", число)
// ============================================================

const I18N = {
  ru: {
    "lang.label": "Язык",
    "title.catalog": "Каталог",
    "title.orders": "Мои заказы",
    "title.login": "Вход",
    "title.admin": "Админка",

    "nav.catalog": "Каталог",
    "nav.orders": "Мои заказы",
    "nav.admin": "Админка",
    "nav.logout": "Выйти",
    "nav.login": "Войти",

    "err.request": "Ошибка запроса",
    "err.auth": "Требуется авторизация",
    "err.validation": "Проверьте введённые данные",
    "err.network": "Нет соединения с сервером",

    "status.pending": "Ожидает",
    "status.confirmed": "Подтверждён",
    "status.delivering": "В доставке",
    "status.delivered": "Доставлен",
    "status.cancelled": "Отменён",

    // Каталог
    "search.placeholder": "Найти продукты",
    "search.aria": "Поиск товара",
    "cats.aria": "Категории",
    "cats.all": "Все",
    "catalog.empty": "Ничего не нашлось 🤷",
    "card.add": "В корзину",
    "card.out": "Нет в наличии",
    "card.low": "Осталось {n} шт.",
    "stepper.dec": "Убрать одну штуку",
    "stepper.inc": "Добавить ещё",

    // Корзина
    "cart.title": "Корзина",
    "cart.aria": "Корзина",
    "cart.clear": "Очистить",
    "cart.close": "Закрыть корзину",
    "cart.empty": "Корзина пуста.<br>Добавьте что-нибудь из каталога.",
    "cart.total": "Итого",
    "cart.checkout": "Оформить заказ",
    "cart.clear_confirm": "Очистить корзину?",
    "cart.synced": "Корзина обновлена: изменились цены или наличие",
    "cart.no_more": "Больше нет в наличии",
    "cart.items": { one: "товар", few: "товара", many: "товаров", other: "товара" },

    // Оформление
    "checkout.title": "Оформление заказа",
    "checkout.address": "Адрес доставки",
    "checkout.address_ph": "Улица, дом, квартира, подъезд",
    "checkout.save_addr": "Запомнить адрес и телефон",
    "checkout.comment": "Комментарий курьеру",
    "checkout.optional": "— необязательно",
    "checkout.comment_ph": "Например: домофон не работает, позвоните",
    "checkout.back": "Назад",
    "checkout.place": "Заказать за {sum}",
    "checkout.placing": "Оформляем…",
    "checkout.login_first": "Войдите, чтобы оформить заказ",
    "checkout.done": "Заказ оформлен! 🎉",
    "checkout.phone": "Телефон для курьера",
    "checkout.phone_bad": "Введите номер: +374 и 8 цифр",
    "checkout.address_bad": "Укажите адрес доставки",
    "checkout.payment": "Оплата",
    "pay.cash": "💵 Наличными курьеру",
    "pay.card": "💳 Картой курьеру",
    "cart.subtotal": "Товары",
    "cart.delivery": "Доставка",
    "cart.eta": "⚡ Привезём за ~{min} минут",

    // Мои заказы
    "orders.title": "Мои заказы",
    "orders.empty": "У вас пока нет заказов.",
    "orders.to_catalog": "Перейти в каталог →",
    "orders.order": "Заказ №{id}",
    "orders.address": "Адрес",
    "orders.comment": "Комментарий",
    "orders.created": "Создан",
    "orders.cancel": "Отменить",
    "orders.cancel_confirm": "Отменить заказ №{id}?",
    "orders.cancelled": "Заказ отменён",
    "orders.phone": "Телефон",
    "orders.payment": "Оплата",
    "orders.delivery": "Доставка",

    // Вход
    "login.title": "Вход",
    "login.register_title": "Регистрация",
    "login.username": "Имя пользователя",
    "login.password": "Пароль",
    "login.email": "Email",
    "login.full_name": "ФИО (необязательно)",
    "login.phone": "Телефон (необязательно)",
    "login.address": "Адрес доставки (необязательно)",
    "login.submit": "Войти",
    "login.register_submit": "Создать аккаунт",
    "login.no_account": "Нет аккаунта?",
    "login.has_account": "Уже есть аккаунт?",
    "login.to_register": "Зарегистрироваться",
    "login.to_login": "Войти",
    "login.fill": "Заполните логин и пароль",
    "login.success": "Успешно! Перенаправляем…",
    "login.bad": "Неверный логин или пароль",

    // Админка
    "admin.no_access": "⛔ Доступ только для администраторов",
    "admin.home": "← На главную",
    "admin.tab_products": "📦 Товары",
    "admin.tab_orders": "🧾 Заказы",
    "admin.tab_users": "👥 Пользователи",
    "admin.products": "Товары",
    "admin.orders": "Заказы",
    "admin.users": "Пользователи",
    "admin.add_product": "+ Добавить товар",
    "admin.refresh": "Обновить",
    "admin.th_name": "Название",
    "admin.th_category": "Категория",
    "admin.th_price": "Цена",
    "admin.th_stock": "Склад",
    "admin.th_status": "Статус",
    "admin.th_user": "Пользователь",
    "admin.th_sum": "Сумма",
    "admin.th_address": "Адрес",
    "admin.th_date": "Дата",
    "admin.th_username": "Логин",
    "admin.th_full_name": "ФИО",
    "admin.th_role": "Роль",
    "admin.th_created": "Создан",
    "admin.no_products": "Товаров нет",
    "admin.no_orders": "Заказов нет",
    "admin.empty": "Пусто",
    "admin.active": "Активен",
    "admin.hidden": "Скрыт",
    "admin.no_translation": "нет перевода",
    "admin.delete_confirm": "Удалить товар?",
    "admin.deleted": "Товар удалён",
    "admin.edit_title": "Редактировать товар",
    "admin.new_title": "Новый товар",
    "admin.f_name": "Название",
    "admin.f_desc": "Описание",
    "admin.f_price": "Цена, ֏",
    "admin.f_stock": "Склад",
    "admin.f_cat": "Категория",
    "admin.f_avail": "Доступен для заказа",
    "admin.lang_ru": "Русский — основной",
    "admin.lang_en": "English",
    "admin.lang_hy": "Հայերեն",
    "admin.translations_hint": "Если перевод не заполнен, покупатель увидит русский вариант.",
    "admin.cancel": "Отмена",
    "admin.save": "Сохранить",
    "admin.create": "Создать",
    "admin.need_name": "Введите название на русском",
    "admin.price_positive": "Цена должна быть больше 0",
    "admin.updated": "Товар обновлён",
    "admin.created": "Товар создан",
    "admin.status_changed": "Статус №{id} → {status}",
    "admin.order_title": "Заказ №{id}",
    "admin.f_status": "Статус",
    "admin.f_address": "Адрес",
    "admin.f_comment": "Комментарий",
    "admin.f_items": "Состав",
    "admin.f_phone": "Телефон",
    "admin.f_payment": "Оплата",
    "admin.f_delivery": "Доставка",
    "admin.f_subtotal": "Товары",
    "admin.total": "Итого",
    "admin.close": "Закрыть",
    "admin.role_admin": "Админ",
    "admin.role_user": "Покупатель",
    "admin.make_admin": "Сделать админом",
    "admin.make_admin_confirm": "Сделать пользователя администратором?",
    "admin.done": "Готово",
    "admin.user_n": "пользователь №{id}",
  },

  en: {
    "lang.label": "Language",
    "title.catalog": "Catalog",
    "title.orders": "My orders",
    "title.login": "Sign in",
    "title.admin": "Admin",

    "nav.catalog": "Catalog",
    "nav.orders": "My orders",
    "nav.admin": "Admin",
    "nav.logout": "Sign out",
    "nav.login": "Sign in",

    "err.request": "Request failed",
    "err.auth": "Please sign in",
    "err.validation": "Please check the data you entered",
    "err.network": "Can't reach the server",

    "status.pending": "Pending",
    "status.confirmed": "Confirmed",
    "status.delivering": "Out for delivery",
    "status.delivered": "Delivered",
    "status.cancelled": "Cancelled",

    "search.placeholder": "Search groceries",
    "search.aria": "Search products",
    "cats.aria": "Categories",
    "cats.all": "All",
    "catalog.empty": "Nothing found 🤷",
    "card.add": "Add to cart",
    "card.out": "Out of stock",
    "card.low": "Only {n} left",
    "stepper.dec": "Remove one",
    "stepper.inc": "Add one more",

    "cart.title": "Cart",
    "cart.aria": "Cart",
    "cart.clear": "Clear",
    "cart.close": "Close cart",
    "cart.empty": "Your cart is empty.<br>Add something from the catalog.",
    "cart.total": "Total",
    "cart.checkout": "Checkout",
    "cart.clear_confirm": "Clear the cart?",
    "cart.synced": "Cart updated: prices or availability have changed",
    "cart.no_more": "No more in stock",
    "cart.items": { one: "item", other: "items" },

    "checkout.title": "Checkout",
    "checkout.address": "Delivery address",
    "checkout.address_ph": "Street, building, apartment, entrance",
    "checkout.save_addr": "Remember address and phone",
    "checkout.comment": "Note for the courier",
    "checkout.optional": "— optional",
    "checkout.comment_ph": "E.g. the intercom is broken, please call",
    "checkout.back": "Back",
    "checkout.place": "Order for {sum}",
    "checkout.placing": "Placing order…",
    "checkout.login_first": "Sign in to place an order",
    "checkout.done": "Order placed! 🎉",
    "checkout.phone": "Phone for the courier",
    "checkout.phone_bad": "Enter a number: +374 and 8 digits",
    "checkout.address_bad": "Enter the delivery address",
    "checkout.payment": "Payment",
    "pay.cash": "💵 Cash to courier",
    "pay.card": "💳 Card to courier",
    "cart.subtotal": "Items",
    "cart.delivery": "Delivery",
    "cart.eta": "⚡ Delivered in ~{min} minutes",

    "orders.title": "My orders",
    "orders.empty": "You have no orders yet.",
    "orders.to_catalog": "Go to catalog →",
    "orders.order": "Order #{id}",
    "orders.address": "Address",
    "orders.comment": "Note",
    "orders.created": "Placed",
    "orders.cancel": "Cancel",
    "orders.cancel_confirm": "Cancel order #{id}?",
    "orders.cancelled": "Order cancelled",
    "orders.phone": "Phone",
    "orders.payment": "Payment",
    "orders.delivery": "Delivery",

    "login.title": "Sign in",
    "login.register_title": "Create account",
    "login.username": "Username",
    "login.password": "Password",
    "login.email": "Email",
    "login.full_name": "Full name (optional)",
    "login.phone": "Phone (optional)",
    "login.address": "Delivery address (optional)",
    "login.submit": "Sign in",
    "login.register_submit": "Create account",
    "login.no_account": "No account yet?",
    "login.has_account": "Already have an account?",
    "login.to_register": "Sign up",
    "login.to_login": "Sign in",
    "login.fill": "Enter your username and password",
    "login.success": "Success! Redirecting…",
    "login.bad": "Incorrect username or password",

    "admin.no_access": "⛔ Administrators only",
    "admin.home": "← Back to store",
    "admin.tab_products": "📦 Products",
    "admin.tab_orders": "🧾 Orders",
    "admin.tab_users": "👥 Users",
    "admin.products": "Products",
    "admin.orders": "Orders",
    "admin.users": "Users",
    "admin.add_product": "+ Add product",
    "admin.refresh": "Refresh",
    "admin.th_name": "Name",
    "admin.th_category": "Category",
    "admin.th_price": "Price",
    "admin.th_stock": "Stock",
    "admin.th_status": "Status",
    "admin.th_user": "Customer",
    "admin.th_sum": "Total",
    "admin.th_address": "Address",
    "admin.th_date": "Date",
    "admin.th_username": "Username",
    "admin.th_full_name": "Full name",
    "admin.th_role": "Role",
    "admin.th_created": "Joined",
    "admin.no_products": "No products",
    "admin.no_orders": "No orders",
    "admin.empty": "Empty",
    "admin.active": "Active",
    "admin.hidden": "Hidden",
    "admin.no_translation": "not translated",
    "admin.delete_confirm": "Delete this product?",
    "admin.deleted": "Product deleted",
    "admin.edit_title": "Edit product",
    "admin.new_title": "New product",
    "admin.f_name": "Name",
    "admin.f_desc": "Description",
    "admin.f_price": "Price, ֏",
    "admin.f_stock": "Stock",
    "admin.f_cat": "Category",
    "admin.f_avail": "Available for ordering",
    "admin.lang_ru": "Русский — main",
    "admin.lang_en": "English",
    "admin.lang_hy": "Հայերեն",
    "admin.translations_hint": "If a translation is empty, customers will see the Russian version.",
    "admin.cancel": "Cancel",
    "admin.save": "Save",
    "admin.create": "Create",
    "admin.need_name": "Enter the name in Russian",
    "admin.price_positive": "Price must be greater than 0",
    "admin.updated": "Product updated",
    "admin.created": "Product created",
    "admin.status_changed": "Order #{id} → {status}",
    "admin.order_title": "Order #{id}",
    "admin.f_status": "Status",
    "admin.f_address": "Address",
    "admin.f_comment": "Note",
    "admin.f_items": "Items",
    "admin.f_phone": "Phone",
    "admin.f_payment": "Payment",
    "admin.f_delivery": "Delivery",
    "admin.f_subtotal": "Items",
    "admin.total": "Total",
    "admin.close": "Close",
    "admin.role_admin": "Admin",
    "admin.role_user": "Customer",
    "admin.make_admin": "Make admin",
    "admin.make_admin_confirm": "Give this user admin rights?",
    "admin.done": "Done",
    "admin.user_n": "user #{id}",
  },

  hy: {
    "lang.label": "Լեզու",
    "title.catalog": "Կատալոգ",
    "title.orders": "Իմ պատվերները",
    "title.login": "Մուտք",
    "title.admin": "Ադմին",

    "nav.catalog": "Կատալոգ",
    "nav.orders": "Պատվերներ",
    "nav.admin": "Ադմին",
    "nav.logout": "Ելք",
    "nav.login": "Մուտք",

    "err.request": "Հարցման սխալ",
    "err.auth": "Անհրաժեշտ է մուտք գործել",
    "err.validation": "Ստուգեք մուտքագրված տվյալները",
    "err.network": "Սերվերի հետ կապ չկա",

    "status.pending": "Սպասում է",
    "status.confirmed": "Հաստատված է",
    "status.delivering": "Առաքվում է",
    "status.delivered": "Առաքված է",
    "status.cancelled": "Չեղարկված է",

    "search.placeholder": "Որոնել մթերքներ",
    "search.aria": "Ապրանքի որոնում",
    "cats.aria": "Կատեգորիաներ",
    "cats.all": "Բոլորը",
    "catalog.empty": "Ոչինչ չի գտնվել 🤷",
    "card.add": "Ավելացնել",
    "card.out": "Առկա չէ",
    "card.low": "Մնացել է {n} հատ",
    "stepper.dec": "Հանել մեկը",
    "stepper.inc": "Ավելացնել ևս մեկը",

    "cart.title": "Զամբյուղ",
    "cart.aria": "Զամբյուղ",
    "cart.clear": "Մաքրել",
    "cart.close": "Փակել զամբյուղը",
    "cart.empty": "Զամբյուղը դատարկ է։<br>Ավելացրեք ինչ-որ բան կատալոգից։",
    "cart.total": "Ընդամենը",
    "cart.checkout": "Ձևակերպել պատվերը",
    "cart.clear_confirm": "Մաքրե՞լ զամբյուղը",
    "cart.synced": "Զամբյուղը թարմացվեց․ փոխվել են գները կամ առկայությունը",
    "cart.no_more": "Ավելին առկա չէ",
    "cart.items": { one: "ապրանք", other: "ապրանք" },

    "checkout.title": "Պատվերի ձևակերպում",
    "checkout.address": "Առաքման հասցե",
    "checkout.address_ph": "Փողոց, շենք, բնակարան, մուտք",
    "checkout.save_addr": "Հիշել հասցեն և հեռախոսը",
    "checkout.comment": "Մեկնաբանություն առաքիչի համար",
    "checkout.optional": "— ըստ ցանկության",
    "checkout.comment_ph": "Օրինակ՝ դոմոֆոնը չի աշխատում, զանգահարեք",
    "checkout.back": "Հետ",
    "checkout.place": "Պատվիրել {sum}",
    "checkout.placing": "Ձևակերպում ենք…",
    "checkout.login_first": "Պատվիրելու համար մուտք գործեք",
    "checkout.done": "Պատվերն ընդունված է 🎉",
    "checkout.phone": "Հեռախոս առաքիչի համար",
    "checkout.phone_bad": "Մուտքագրեք համարը՝ +374 և 8 թվանշան",
    "checkout.address_bad": "Նշեք առաքման հասցեն",
    "checkout.payment": "Վճարում",
    "pay.cash": "💵 Կանխիկ՝ առաքիչին",
    "pay.card": "💳 Քարտով՝ առաքիչին",
    "cart.subtotal": "Ապրանքներ",
    "cart.delivery": "Առաքում",
    "cart.eta": "⚡ Կառաքենք ~{min} րոպեում",

    "orders.title": "Իմ պատվերները",
    "orders.empty": "Դուք դեռ պատվերներ չունեք։",
    "orders.to_catalog": "Անցնել կատալոգ →",
    "orders.order": "Պատվեր №{id}",
    "orders.address": "Հասցե",
    "orders.comment": "Մեկնաբանություն",
    "orders.created": "Ստեղծված",
    "orders.cancel": "Չեղարկել",
    "orders.cancel_confirm": "Չեղարկե՞լ №{id} պատվերը",
    "orders.cancelled": "Պատվերը չեղարկված է",
    "orders.phone": "Հեռախոս",
    "orders.payment": "Վճարում",
    "orders.delivery": "Առաքում",

    "login.title": "Մուտք",
    "login.register_title": "Գրանցում",
    "login.username": "Օգտանուն",
    "login.password": "Գաղտնաբառ",
    "login.email": "Էլ. փոստ",
    "login.full_name": "Անուն, ազգանուն (ըստ ցանկության)",
    "login.phone": "Հեռախոս (ըստ ցանկության)",
    "login.address": "Առաքման հասցե (ըստ ցանկության)",
    "login.submit": "Մուտք գործել",
    "login.register_submit": "Ստեղծել հաշիվ",
    "login.no_account": "Հաշիվ չունե՞ք",
    "login.has_account": "Արդեն ունե՞ք հաշիվ",
    "login.to_register": "Գրանցվել",
    "login.to_login": "Մուտք գործել",
    "login.fill": "Լրացրեք օգտանունը և գաղտնաբառը",
    "login.success": "Հաջողվեց։ Վերահղում ենք…",
    "login.bad": "Սխալ օգտանուն կամ գաղտնաբառ",

    "admin.no_access": "⛔ Միայն ադմինիստրատորների համար",
    "admin.home": "← Գլխավոր էջ",
    "admin.tab_products": "📦 Ապրանքներ",
    "admin.tab_orders": "🧾 Պատվերներ",
    "admin.tab_users": "👥 Օգտատերեր",
    "admin.products": "Ապրանքներ",
    "admin.orders": "Պատվերներ",
    "admin.users": "Օգտատերեր",
    "admin.add_product": "+ Ավելացնել ապրանք",
    "admin.refresh": "Թարմացնել",
    "admin.th_name": "Անվանում",
    "admin.th_category": "Կատեգորիա",
    "admin.th_price": "Գին",
    "admin.th_stock": "Պահեստ",
    "admin.th_status": "Կարգավիճակ",
    "admin.th_user": "Գնորդ",
    "admin.th_sum": "Գումար",
    "admin.th_address": "Հասցե",
    "admin.th_date": "Ամսաթիվ",
    "admin.th_username": "Օգտանուն",
    "admin.th_full_name": "Անուն, ազգանուն",
    "admin.th_role": "Դեր",
    "admin.th_created": "Գրանցված",
    "admin.no_products": "Ապրանքներ չկան",
    "admin.no_orders": "Պատվերներ չկան",
    "admin.empty": "Դատարկ է",
    "admin.active": "Ակտիվ",
    "admin.hidden": "Թաքցված",
    "admin.no_translation": "թարգմանություն չկա",
    "admin.delete_confirm": "Ջնջե՞լ ապրանքը",
    "admin.deleted": "Ապրանքը ջնջված է",
    "admin.edit_title": "Խմբագրել ապրանքը",
    "admin.new_title": "Նոր ապրանք",
    "admin.f_name": "Անվանում",
    "admin.f_desc": "Նկարագրություն",
    "admin.f_price": "Գին, ֏",
    "admin.f_stock": "Պահեստ",
    "admin.f_cat": "Կատեգորիա",
    "admin.f_avail": "Հասանելի է պատվիրելու համար",
    "admin.lang_ru": "Русский — հիմնական",
    "admin.lang_en": "English",
    "admin.lang_hy": "Հայերեն",
    "admin.translations_hint": "Եթե թարգմանությունը լրացված չէ, գնորդը կտեսնի ռուսերեն տարբերակը։",
    "admin.cancel": "Չեղարկել",
    "admin.save": "Պահպանել",
    "admin.create": "Ստեղծել",
    "admin.need_name": "Մուտքագրեք անվանումը ռուսերեն",
    "admin.price_positive": "Գինը պետք է լինի 0-ից մեծ",
    "admin.updated": "Ապրանքը թարմացված է",
    "admin.created": "Ապրանքը ստեղծված է",
    "admin.status_changed": "Պատվեր №{id} → {status}",
    "admin.order_title": "Պատվեր №{id}",
    "admin.f_status": "Կարգավիճակ",
    "admin.f_address": "Հասցե",
    "admin.f_comment": "Մեկնաբանություն",
    "admin.f_items": "Կազմը",
    "admin.f_phone": "Հեռախոս",
    "admin.f_payment": "Վճարում",
    "admin.f_delivery": "Առաքում",
    "admin.f_subtotal": "Ապրանքներ",
    "admin.total": "Ընդամենը",
    "admin.close": "Փակել",
    "admin.role_admin": "Ադմին",
    "admin.role_user": "Գնորդ",
    "admin.make_admin": "Դարձնել ադմին",
    "admin.make_admin_confirm": "Օգտատիրոջը տա՞լ ադմինիստրատորի իրավունքներ",
    "admin.done": "Պատրաստ է",
    "admin.user_n": "օգտատեր №{id}",
  },
};

const LANGS = [
  { code: "hy", short: "ՀԱՅ", name: "Հայերեն", locale: "hy-AM" },
  { code: "ru", short: "RU",  name: "Русский", locale: "ru-RU" },
  { code: "en", short: "EN",  name: "English", locale: "en-US" },
];
const DEFAULT_LANG = "hy"; // язык при первом заходе, пока посетитель не выбрал другой

function detectLang() {
  try {
    const saved = localStorage.getItem("lang");
    if (saved && I18N[saved]) return saved;
  } catch {}
  return DEFAULT_LANG;
}

const LANG = detectLang();
const LOCALE = LANGS.find(l => l.code === LANG).locale;
const _pluralRules = new Intl.PluralRules(LOCALE);

function setLang(code) {
  if (!I18N[code] || code === LANG) return;
  try { localStorage.setItem("lang", code); } catch {}
  location.reload();
}

// t("orders.order", { id: 5 }) → «Заказ №5»
function t(key, params = {}) {
  let s = I18N[LANG][key] ?? I18N.ru[key] ?? key;
  if (typeof s !== "string") s = s.other;
  return s.replace(/\{(\w+)\}/g, (_, k) => (k in params ? params[k] : `{${k}}`));
}

// tp("cart.items", 3) → «товара» / «items» / «ապրանք»
function tp(key, n) {
  const forms = I18N[LANG][key] ?? I18N.ru[key];
  return forms[_pluralRules.select(n)] ?? forms.other;
}

// Локализованное поле объекта: loc(product, "name") → product.name_hy || product.name
function loc(obj, field) {
  if (!obj) return "";
  if (LANG !== "ru") {
    const v = obj[`${field}_${LANG}`];
    if (v) return v;
  }
  return obj[field] ?? "";
}

// Название позиции заказа (в items_json хранятся названия на всех языках)
function itemName(item) {
  return (item.names && (item.names[LANG] || item.names.ru)) || item.name || "";
}

// Цены — в армянских драмах, без копеек: 1 250 ֏
// Для армянского берём разделитель разрядов «пробел» явно: не во всех браузерах есть данные локали hy-AM
const _num = new Intl.NumberFormat(LANG === "en" ? "en-US" : "ru-RU", { maximumFractionDigits: 0 });
function fmtPrice(n) {
  return `${_num.format(Math.round(Number(n) || 0))} ֏`;
}

function fmtDateTime(iso) {
  return new Date(iso).toLocaleString(LOCALE, { dateStyle: "short", timeStyle: "short" });
}
function fmtDate(iso) {
  return new Date(iso).toLocaleDateString(LOCALE);
}

// Применить переводы к статическому HTML
function applyI18n(root = document) {
  document.documentElement.lang = LANG;
  root.querySelectorAll("[data-i18n]").forEach(el => { el.textContent = t(el.dataset.i18n); });
  root.querySelectorAll("[data-i18n-html]").forEach(el => { el.innerHTML = t(el.dataset.i18nHtml); });
  root.querySelectorAll("[data-i18n-ph]").forEach(el => { el.placeholder = t(el.dataset.i18nPh); });
  root.querySelectorAll("[data-i18n-aria]").forEach(el => { el.setAttribute("aria-label", t(el.dataset.i18nAria)); });
  const titleKey = document.documentElement.dataset.title;
  if (titleKey) document.title = `${t(titleKey)} — FastMarket`;
}

// ---------- Телефон (Армения) ----------
// Любой ввод → 8 цифр абонента: "+374 91 234567", "091234567", "91234567" → "91234567"
function amPhoneDigits(raw) {
  let d = String(raw || "").replace(/\D/g, "");
  if (d.length > 8 && d.startsWith("374")) d = d.slice(3);  // код страны
  d = d.replace(/^0+/, "");   // местный формат 0XX… (номер абонента с нуля не начинается)
  return d.slice(0, 8);
}
// "91234567" → "91 234 567" — для поля ввода (префикс +374 стоит рядом с полем)
function formatAmLocal(raw) {
  const d = amPhoneDigits(raw);
  return [d.slice(0, 2), d.slice(2, 5), d.slice(5, 8)].filter(Boolean).join(" ");
}
// "+37491234567" → "+374 91 234 567" — для показа
function formatAmPhone(raw) {
  const local = formatAmLocal(raw);
  return local ? "+374 " + local : "";
}
function isValidAmPhone(raw) {
  return amPhoneDigits(raw).length === 8;
}
