# Интернет-магазин «Web-Ларёк»

Учебный интернет-магазин товаров для веб-разработчиков. Проект реализован по паттерну MVP с событийной моделью.

Стек: HTML, SCSS, TypeScript, Vite.

## Запуск проекта

1. Создайте файл `.env` в корне проекта и добавьте в него значение из `.env.example`.
2. Установите зависимости: `npm install`.
3. Запустите приложение в режиме разработки: `npm run dev`.
4. Соберите production-версию: `npm run build`.

## Структура и архитектура

Проект использует MVP (Model–View–Presenter).

- **Model** хранит и изменяет предметные данные, не зависит от DOM и HTTP. При изменении данных генерирует события через `EventEmitter`.
- **View** отвечает за отображение интерфейса и пользовательские события. Компоненты представления генерируют события о действиях пользователя.
- **Presenter** связывает модели, представления и коммуникационный слой. Реализован в `main.ts`, где обрабатываются все события от моделей и представлений.

Событийный брокер `EventEmitter` позволяет представлениям и презентеру общаться без прямых зависимостей. Слой API изолирован от моделей: `StoreApi` получает абстракцию `IApi`, а не создаёт HTTP-клиент самостоятельно.

Основные каталоги:

- `src/components/base` — переиспользуемые классы `Api`, `Component` и `EventEmitter`;
- `src/components/models` — классы предметных данных;
- `src/components/view` — компоненты представления (UI);
- `src/components/services` — связь с серверным API;
- `src/types/index.ts` — единое место для типов приложения;
- `src/utils` — константы, тестовые данные и общие функции;
- `src/main.ts` — точка входа и реализация презентера.

## Базовые классы

### `Component<T>`

Абстрактная основа для компонентов интерфейса.

- Конструктор: `constructor(container: HTMLElement)` принимает корневой элемент компонента.
- Поле: `container: HTMLElement` хранит корневой DOM-элемент.
- `setImage(element: HTMLImageElement, source: string, alternativeText?: string): void` устанавливает источник и альтернативный текст изображения.
- `render(data?: Partial<T>): HTMLElement` применяет переданные свойства к экземпляру и возвращает корневой элемент.

### `Api`

Базовый HTTP-клиент.

- Конструктор: `constructor(baseUrl: string, options: RequestInit = {})` принимает базовый адрес и настройки запроса.
- Поля: `baseUrl: string` — базовый URL; `options: RequestInit` — настройки с JSON-заголовком.
- `get<T extends object>(endpoint: string): Promise<T>` выполняет GET-запрос.
- `post<T extends object>(endpoint: string, payload: object, method: ApiPostMethod = 'POST'): Promise<T>` отправляет JSON-тело запроса.
- `handleResponse<T>(response: Response): Promise<T>` проверяет ответ и возвращает распарсенные данные либо отклонённый промис с ошибкой.

### `EventEmitter`

Реализует паттерн «Наблюдатель» для обмена событиями.

- Поле: `subscriptions: Map<EventName, Set<EventCallback>>` хранит подписчиков по имени или регулярному выражению события.
- `on<T extends object>(eventName: EventName, callback: (data: T) => void): void` добавляет подписчика.
- `off(eventName: EventName, callback: EventCallback): void` удаляет подписчика.
- `emit<T extends object>(eventName: string, data?: T): void` вызывает подходящие обработчики.
- `onAll(callback: (event: EmitterEvent) => void): void` подписывает обработчик на все события.
- `offAll(): void` удаляет все подписки.
- `trigger<T extends object>(eventName: string, context?: Partial<T>): (data: T) => void` создаёт функцию, которая генерирует событие.

## Типы данных

### `ApiPostMethod`

`'POST' | 'PUT' | 'DELETE'` — допустимый HTTP-метод для запроса с телом.

### `IApi`

Контракт HTTP-клиента: `get<T>(endpoint: string): Promise<T>` и `post<T>(endpoint: string, payload: object, method?: ApiPostMethod): Promise<T>`.

### `TPaymentOption`

`'card' | 'cash'` — вариант оплаты: онлайн или при получении.

### `IStoreProduct`

Товар каталога: `id`, `description`, `image`, `title`, `category` типа `string` и `price` типа `number | null`. Значение `null` означает, что товар нельзя купить.

### `ICustomerDetails`

Данные покупателя: `payment: TPaymentOption | ''`, `email: string`, `phone: string`, `address: string`. Пустая строка в `payment` используется до выбора способа оплаты.

### `TCustomerValidationErrors`

`Partial<Record<keyof ICustomerDetails, string>>` — объект ошибок проверки. В нём присутствуют только некорректные поля и сообщения для них.

### Типы обмена с сервером

- `IProductListResponse` содержит `total: number` и `items: IStoreProduct[]`.
- `IOrderPayload` расширяет `ICustomerDetails` и добавляет `total: number`, `items: string[]` с идентификаторами товаров.
- `IOrderConfirmation` содержит `id: string` оформленного заказа и `total: number` списанной суммы.

## Модели данных

Модели не работают с DOM и не выполняют сетевые запросы. При изменении данных генерируют события через `EventEmitter`.

### `ProductCatalog`

Хранит полученный каталог и товар для детального просмотра.

- Конструктор: `constructor(events: IEvents)` принимает брокер событий.
- Поля: `products: IStoreProduct[]` — список каталога; `activeProduct: IStoreProduct | null` — выбранный товар или `null`.
- `replaceProducts(products: IStoreProduct[]): void` заменяет товары каталога переданным массивом и генерирует событие `catalog:changed`.
- `getProducts(): IStoreProduct[]` возвращает копию массива товаров.
- `findProduct(productId: string): IStoreProduct | undefined` ищет товар по идентификатору.
- `setActiveProduct(product: IStoreProduct): void` сохраняет товар для детального просмотра и генерирует событие `product:selected`.
- `getActiveProduct(): IStoreProduct | null` возвращает выбранный товар.

### `ShoppingCart`

Хранит выбранные для покупки товары и рассчитывает их стоимость.

- Конструктор: `constructor(events: IEvents)` принимает брокер событий.
- Поле: `products: IStoreProduct[]` — товары корзины.
- `getProducts(): IStoreProduct[]` возвращает копию товаров корзины.
- `addProduct(product: IStoreProduct): void` добавляет товар, если такого идентификатора ещё нет, и генерирует событие `cart:changed`.
- `removeProduct(productId: string): void` удаляет товар по идентификатору и генерирует событие `cart:changed`.
- `clearProducts(): void` очищает корзину и генерирует событие `cart:changed`.
- `getTotalPrice(): number` возвращает сумму цен; товар с `null`-ценой добавляет ноль.
- `getProductCount(): number` возвращает число товаров.
- `containsProduct(productId: string): boolean` проверяет наличие товара.

### `CustomerData`

Хранит данные покупателя и проверяет обязательные поля оформления заказа.

- Конструктор: `constructor(events: IEvents)` принимает брокер событий.
- Поле: `details: ICustomerDetails` — способ оплаты, адрес, электронная почта и телефон.
- `updateDetails(changes: Partial<ICustomerDetails>): void` обновляет только переданные поля и генерирует событие `customer:changed`.
- `getDetails(): ICustomerDetails` возвращает копию данных покупателя.
- `clearDetails(): void` сбрасывает поля к пустым значениям и генерирует событие `customer:changed`.
- `getValidationErrors(): TCustomerValidationErrors` возвращает ошибки для незаполненных полей.

## Коммуникационный слой

### `StoreApi`

Изолирует API интернет-магазина от остальных частей приложения и использует композицию с объектом, который реализует `IApi`.

- Конструктор: `constructor(client: IApi)` принимает HTTP-клиент.
- Поле: `client: IApi` хранит переданный клиент.
- `requestProducts(): Promise<IProductListResponse>` выполняет GET-запрос к `/product/`.
- `submitOrder(order: IOrderPayload): Promise<IOrderConfirmation>` отправляет POST-запрос к `/order/` и возвращает подтверждение заказа.

## Компоненты представления (View)

Компоненты представления отвечают за отображение интерфейса и генерацию событий о действиях пользователя. Компоненты не хранят данные и не содержат бизнес-логику.

### `Modal`

Модальное окно приложения.

- Конструктор: `constructor(container: HTMLElement, events: IEvents)` принимает корневой элемент и брокер событий.
- Поля: `closeButton: HTMLButtonElement` — кнопка закрытия; `contentContainer: HTMLElement` — контейнер содержимого.
- `set content(value: HTMLElement)` устанавливает содержимое модального окна.
- `open(): void` открывает модальное окно (добавляет класс `modal_active`) и генерирует событие `modal:opened`.
- `close(): void` закрывает модальное окно (удаляет класс `modal_active`) и генерирует событие `modal:closed`.
- `render(data: IModal): HTMLElement` устанавливает содержимое и открывает модальное окно.

### `Page`

Главная страница приложения.

- Конструктор: `constructor(container: HTMLElement, events: IEvents)` принимает корневой элемент и брокер событий.
- Поля: `catalogContainer: HTMLElement` — контейнер каталога; `basketButton: HTMLButtonElement` — кнопка корзины; `basketCounter: HTMLElement` — счётчик товаров в корзине; `pageWrapper: HTMLElement` — обёртка страницы.
- `set catalog(items: HTMLElement[])` устанавливает карточки товаров в каталоге.
- `set counter(value: number)` устанавливает значение счётчика корзины.
- `set locked(value: boolean)` блокирует/разблокирует прокрутку страницы.
- При клике на кнопку корзины генерируется событие `basket:open`.

### `Card` (абстрактный)

Базовый класс для всех вариантов карточек товара.

- Конструктор: `constructor(container: HTMLElement, events: IEvents)` принимает корневой элемент и брокер событий.
- Поля: `titleElement`, `imageElement`, `categoryElement`, `priceElement`, `buttonElement`, `descriptionElement`, `indexElement` — DOM-элементы карточки.
- Сеттеры: `id`, `title`, `image`, `category`, `price`, `description`, `button`, `index` — устанавливают соответствующие значения.

### `CardCatalog`

Карточка товара для каталога.

- Наследует `Card`.
- При клике на карточку генерируется событие `card:select` с идентификатором товара.

### `CardPreview`

Карточка товара для детального просмотра в модальном окне.

- Наследует `Card`.
- При клике на кнопку генерируется событие `card:action` с идентификатором товара.

### `CardBasket`

Карточка товара для корзины.

- Наследует `Card`.
- При клике на кнопку удаления генерируется событие `card:remove` с идентификатором товара.

### `Basket`

Компонент корзины.

- Конструктор: `constructor(container: HTMLElement, events: IEvents)` принимает корневой элемент и брокер событий.
- Поля: `listElement: HTMLElement` — список товаров; `totalElement: HTMLElement` — общая стоимость; `buttonElement: HTMLButtonElement` — кнопка оформления.
- `set items(items: HTMLElement[])` устанавливает список карточек товаров. Если список пуст, отображается сообщение «Корзина пуста».
- `set total(value: number)` устанавливает общую стоимость.
- `disableButton(): void` деактивирует кнопку оформления.
- `enableButton(): void` активирует кнопку оформления.
- При клике на кнопку оформления генерируется событие `order:start`.

### `Form<T>` (абстрактный)

Базовый класс для всех форм приложения.

- Конструктор: `constructor(container: HTMLElement, events: IEvents)` принимает корневой элемент и брокер событий.
- Поля: `submitButton: HTMLButtonElement` — кнопка отправки; `errorsElement: HTMLElement` — элемент для вывода ошибок; `formElement: HTMLFormElement` — элемент формы.
- `set valid(value: boolean)` активирует/деактивирует кнопку отправки.
- `set errors(value: string[])` устанавливает текст ошибок.
- `clear(): void` очищает форму.
- `render(state: Partial<T> & IForm): HTMLElement` устанавливает состояние формы и возвращает элемент.
- При изменении полей генерируется событие `{formName}:change` с полем и значением.
- При отправке формы генерируется событие `{formName}:submit`.

### `OrderForm`

Форма выбора способа оплаты и ввода адреса доставки.

- Наследует `Form<IOrderForm>`.
- Поля: `paymentButtons: HTMLButtonElement[]` — кнопки выбора способа оплаты.
- `setPayment(name: TPaymentOption): void` устанавливает выбранный способ оплаты (добавляет класс `button_alt-active`).
- `set address(value: string)` устанавливает значение поля адреса.
- `clear(): void` очищает форму и снимает выделение с кнопок оплаты.

### `ContactsForm`

Форма ввода электронной почты и телефона.

- Наследует `Form<IContactsForm>`.
- `set email(value: string)` устанавливает значение поля электронной почты.
- `set phone(value: string)` устанавливает значение поля телефона.

### `Success`

Компонент успешного оформления заказа.

- Конструктор: `constructor(container: HTMLElement, events: IEvents)` принимает корневой элемент и брокер событий.
- Поля: `closeButton: HTMLButtonElement` — кнопка закрытия; `descriptionElement: HTMLElement` — элемент с описанием.
- `set total(value: number)` устанавливает списанную сумму.
- При клике на кнопку генерируется событие `success:close`.

## События приложения

### События моделей данных

- `catalog:changed` — изменился каталог товаров. Данные: `{ products: IStoreProduct[] }`.
- `product:selected` — выбран товар для просмотра. Данные: `{ product: IStoreProduct }`.
- `cart:changed` — изменилось содержимое корзины. Данные: `{ products: IStoreProduct[] }`.
- `customer:changed` — изменились данные покупателя. Данные: `{ customer: ICustomerDetails, errors: TCustomerValidationErrors }`.

### События представлений

- `card:select` — выбрана карточка в каталоге. Данные: `{ id: string }`.
- `card:action` — нажата кнопка действия в карточке (добавить/удалить). Данные: `{ id: string }`.
- `card:remove` — нажата кнопка удаления товара из корзины. Данные: `{ id: string }`.
- `basket:open` — нажата кнопка открытия корзины.
- `order:start` — нажата кнопка оформления заказа.
- `order:change` — изменились данные в форме заказа. Данные: `{ field: keyof ICustomerDetails, value: string }`.
- `order:submit` — отправлена форма заказа (переход к контактам).
- `contacts:change` — изменились данные в форме контактов. Данные: `{ field: keyof ICustomerDetails, value: string }`.
- `contacts:submit` — отправлена форма контактов (оплата).
- `success:close` — закрыт экран успешного оформления заказа.
- `modal:opened` — открыто модальное окно.
- `modal:closed` — закрыто модальное окно.

## Презентер

Презентер реализован в файле `main.ts` и связывает модели данных, представления и коммуникационный слой. Он подписывается на события от моделей и представлений и обрабатывает их, обновляя состояние приложения.

### Основные обработчики

- **catalog:changed** — создаёт карточки товаров для каталога и отображает их на главной странице.
- **product:selected** — создаёт карточку детального просмотра товара и открывает модальное окно.
- **cart:changed** — обновляет счётчик корзины, создаёт карточки товаров для корзины, обновляет общую стоимость и состояние кнопки оформления.
- **customer:changed** — обновляет состояние валидации форм заказа и контактов.
- **card:select** — находит товар по идентификатору и устанавливает его как активный.
- **card:action** — добавляет или удаляет товар из корзины и закрывает модальное окно.
- **card:remove** — удаляет товар из корзины.
- **basket:open** — открывает модальное окно с корзиной.
- **order:start** — открывает модальное окно с формой заказа.
- **order:change** — обновляет данные покупателя.
- **order:submit** — открывает модальное окно с формой контактов.
- **contacts:change** — обновляет данные покупателя.
- **contacts:submit** — отправляет заказ на сервер, очищает корзину и данные покупателя, открывает экран успеха.
- **success:close** — закрывает модальное окно.
- **modal:opened** — блокирует прокрутку страницы.
- **modal:closed** — разблокирует прокрутку страницы.

### Инициализация

При запуске приложения:
1. Создаются экземпляры моделей данных с передачей брокера событий.
2. Создаются экземпляры представлений с передачей брокера событий.
3. Устанавливаются обработчики всех событий.
4. Выполняется запрос к серверу за каталогом товаров.
5. При получении данных каталог обновляется, что генерирует событие `catalog:changed` и запускает отображение товаров на странице.
