# 🚀 Краткое руководство по развертыванию

## Быстрый старт (локально)

```bash
npm install
cp .env.example .env.local
npm run dev:all
```

Откройте http://localhost:3000

---

## Развертывание в интернете

### Вариант 1: Vercel + Railway (Рекомендуется)

#### 1. Backend на Railway:
1. Зарегистрируйтесь на [railway.app](https://railway.app)
2. Создайте новый проект → Deploy from GitHub
3. Выберите ваш репозиторий
4. Railway автоматически обнаружит настройки
5. Добавьте переменную окружения: `WS_PORT=3001`
6. Скопируйте публичный URL (например: `your-app.railway.app`)

#### 2. Frontend на Vercel:
1. Зарегистрируйтесь на [vercel.com](https://vercel.com)
2. Import Project → выберите репозиторий
3. Добавьте переменную окружения:
   - `NEXT_PUBLIC_WS_URL` = `wss://your-app.railway.app`
4. Deploy!

**Важно**: Используйте `wss://` (не `ws://`) для production!

---

### Вариант 2: Render (всё в одном)

1. Создайте два сервиса на [render.com](https://render.com):

**Web Service 1 (Frontend):**
- Build Command: `npm install && npm run build`
- Start Command: `npm start`
- Environment: `NEXT_PUBLIC_WS_URL=wss://your-ws-service.onrender.com`

**Web Service 2 (WebSocket):**
- Build Command: `npm install`
- Start Command: `npm run start:server`
- Environment: `WS_PORT=3001`

---

### Вариант 3: VPS (полный контроль)

```bash
# На сервере
git clone <your-repo>
cd spy-game
npm install
npm run build

# Установите PM2
npm install -g pm2

# Запустите серверы
pm2 start npm --name "ws-server" -- run start:server
pm2 start npm --name "next-app" -- start
pm2 save
pm2 startup
```

Настройте Nginx для WebSocket и HTTP.

---

## Переменные окружения

**Frontend (.env.local или Vercel):**
```
NEXT_PUBLIC_WS_URL=wss://your-server.com
```

**Backend (Railway/Render/VPS):**
```
WS_PORT=3001
```

---

## Проверка работы

1. Откройте ваш сайт
2. Нажмите "Подключиться к серверу"
3. Создайте комнату
4. Откройте сайт на другом устройстве
5. Присоединитесь по коду комнаты
6. Играйте!

---

## Поддержка

Если возникли проблемы:
- Проверьте логи WebSocket сервера
- Убедитесь, что используете `wss://` (не `ws://`) в production
- Проверьте, что порт 3001 открыт на сервере
- Проверьте переменные окружения
