# Интернет-магазин «Web-Ларёк»

Учебный интернет-магазин товаров для веб-разработчиков. На этом этапе реализованы модели данных каталога, корзины и покупателя, а также отдельный коммуникационный слой для работы с API.

Стек: HTML, SCSS, TypeScript, Vite.

## Запуск проекта

1. Создайте файл `.env` в корне проекта и добавьте в него значение из `.env.example`.
2. Установите зависимости: `npm install`.
3. Запустите приложение в режиме разработки: `npm run dev`.
4. Соберите production-версию: `npm run build`.

## Структура и архитектура

Проект использует MVP (Model–View–Presenter).

- **Model** хранит и изменяет предметные данные, не зависит от DOM и HTTP.
- **View** отвечает за отображение интерфейса и пользовательские события.
- **Presenter** связывает модели, представления и коммуникационный слой. На текущем этапе его роль выполняет `main.ts`, где создаются объекты и обрабатывается результат запроса.

Событийный брокер `EventEmitter` позволяет представлениям и презентеру общаться без прямых зависимостей. Слой API изолирован от моделей: `StoreApi` получает абстракцию `IApi`, а не создаёт HTTP-клиент самостоятельно.

Основные каталоги:

- `src/components/base` — переиспользуемые классы `Api`, `Component` и `EventEmitter`;
- `src/components/models` — классы предметных данных;
- `src/components/services` — связь с серверным API;
- `src/types/index.ts` — единое место для типов приложения;
- `src/utils` — константы, тестовые данные и общие функции;
- `src/main.ts` — точка входа и проверка работы моделей.

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

Модели не работают с DOM и не выполняют сетевые запросы.

### `ProductCatalog`

Хранит полученный каталог и товар для детального просмотра.

- Поля: `products: IStoreProduct[]` — список каталога; `activeProduct: IStoreProduct | null` — выбранный товар или `null`.
- Конструктор не принимает параметров, создаёт пустой каталог.
- `replaceProducts(products: IStoreProduct[]): void` заменяет товары каталога переданным массивом.
- `getProducts(): IStoreProduct[]` возвращает копию массива товаров.
- `findProduct(productId: string): IStoreProduct | undefined` ищет товар по идентификатору.
- `setActiveProduct(product: IStoreProduct): void` сохраняет товар для детального просмотра.
- `getActiveProduct(): IStoreProduct | null` возвращает выбранный товар.

### `ShoppingCart`

Хранит выбранные для покупки товары и рассчитывает их стоимость.

- Поле: `products: IStoreProduct[]` — товары корзины.
- Конструктор не принимает параметров, создаёт пустую корзину.
- `getProducts(): IStoreProduct[]` возвращает копию товаров корзины.
- `addProduct(product: IStoreProduct): void` добавляет товар, если такого идентификатора ещё нет.
- `removeProduct(productId: string): void` удаляет товар по идентификатору.
- `clearProducts(): void` очищает корзину.
- `getTotalPrice(): number` возвращает сумму цен; товар с `null`-ценой добавляет ноль.
- `getProductCount(): number` возвращает число товаров.
- `containsProduct(productId: string): boolean` проверяет наличие товара.

### `CustomerData`

Хранит данные покупателя и проверяет обязательные поля оформления заказа.

- Поле: `details: ICustomerDetails` — способ оплаты, адрес, электронная почта и телефон.
- Конструктор не принимает параметров, создаёт объект с пустыми полями.
- `updateDetails(changes: Partial<ICustomerDetails>): void` обновляет только переданные поля.
- `getDetails(): ICustomerDetails` возвращает копию данных покупателя.
- `clearDetails(): void` сбрасывает поля к пустым значениям.
- `getValidationErrors(): TCustomerValidationErrors` возвращает ошибки для незаполненных полей.

## Коммуникационный слой

### `StoreApi`

Изолирует API интернет-магазина от остальных частей приложения и использует композицию с объектом, который реализует `IApi`.

- Конструктор: `constructor(client: IApi)` принимает HTTP-клиент.
- Поле: `client: IApi` хранит переданный клиент.
- `requestProducts(): Promise<IProductListResponse>` выполняет GET-запрос к `/product/`.
- `submitOrder(order: IOrderPayload): Promise<IOrderConfirmation>` отправляет POST-запрос к `/order/` и возвращает подтверждение заказа.
