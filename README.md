# Aiti Guru Test

Административная панель товаров на `React + TypeScript + Vite`.

Сейчас в проекте реализованы:
- Шаг 1: базовая структура, роутинг, подготовка к GitHub Pages.
- Шаг 2: авторизация через DummyJSON (`Zustand + Ant Design`).

---

## 1. Технологии

- React 18
- TypeScript (strict mode)
- Vite
- React Router v6 (`HashRouter`)
- Zustand (состояние авторизации)
- TanStack React Query (подключен как провайдер)
- Ant Design

---

## 2. Быстрый старт (если вы новичок)

### Шаг 1. Установите зависимости

```bash
npm install
```

### Шаг 2. Запустите проект

```bash
npm run dev
```

После запуска откройте адрес из терминала (обычно `http://localhost:5173`).

### Шаг 3. Войдите в систему

Для теста используйте:
- Логин (поле "Почта"): `emilys`
- Пароль: `emilyspass`

---

## 3. Полезные команды

```bash
# запуск в режиме разработки
npm run dev

# проверка линтером
npm run lint

# production-сборка
npm run build

# локальный просмотр production-сборки
npm run preview

# деплой на GitHub Pages
npm run deploy
```

---

## 4. Как работает авторизация

### Маршруты

- `/#/login` — публичная страница входа.
- `/#/products` — защищенная страница (пока заглушка).
- `/#/` — автоматический редирект:
  - если пользователь авторизован -> `/#/products`
  - если нет -> `/#/login`

### Логика "Запомнить меня"

- Если чекбокс включен: сессия сохраняется в `localStorage`.
- Если чекбокс выключен: сессия сохраняется в `sessionStorage`.
- При сохранении очищается альтернативное хранилище, чтобы не было конфликтов.

### Обработка ошибок входа

- Ошибка показывается под формой.
- Дополнительно показывается `toast` через `message.error`.

---

## 5. Подготовка к GitHub Pages

В `vite.config.ts` используется:

```ts
base: '/<repo-name>/'
```

Перед деплоем замените `<repo-name>` на имя вашего репозитория.

Для этого проекта обычно будет:

```ts
base: '/Aiti-Guru-test/'
```

Роутинг сделан через `HashRouter`, поэтому обновление страницы на GitHub Pages не приводит к 404.

---

## 6. Структура проекта

```text
src/
  app/
    providers/
      router.tsx
    styles/
      index.css
  pages/
    login/
      ui/
        LoginPage.tsx
    products/
      ui/
        ProductsPage.tsx
  features/
    auth/
      api/
        authApi.ts
      model/
        auth.types.ts
        useAuthStore.ts
      lib/
        authStorage.ts
  shared/
    config/
      routes.ts
    lib/
      guards/
        RequireAuth.tsx
  main.tsx
```

---

## 7. Что уже проверено

- `npm run lint` проходит без ошибок.
- `npm run build` проходит успешно.
- Неавторизованный пользователь не может попасть на `/products`.
- Успешный логин переводит на `/products`.

---

## 8. Следующий этап

Следующий этап разработки: **Шаг 3** — таблица товаров (React Query + AntD Table).
