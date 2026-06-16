# Арна 🌈

**Арна** (каз. «канал связи») — двусторонняя платформа для детей с аутизмом и их родителей.

- 👧 **Ребёнок** использует приложение как инструмент визуальной коммуникации и расписания дня.
- 👨‍👩‍👧 **Родитель** через веб-панель настраивает расписание, карточки коммуникации и ведёт дневник поведения.

Интерфейс на двух языках: **қазақша** и **русский**.

## Стек

**Backend:** Django 4.2 · DRF · PostgreSQL · Kafka · Django Channels (WebSocket) · Celery + Redis · JWT

**Frontend:** React 18 · Vite · Tailwind CSS · React Router v6 · Zustand · React Query · Framer Motion · i18next

## Быстрый старт

### 1. Инфраструктура (PostgreSQL, Kafka, Zookeeper, Redis)

```bash
cd backend
docker compose up -d
```

### 2. Backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver            # REST API + Channels (ASGI через runserver)
# в отдельных терминалах:
celery -A arna_project worker -l info
python -m kafka.consumers.schedule_consumer
python -m kafka.consumers.behavior_consumer
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Открыть http://localhost:5173

## Архитектура

```
Ребёнок жмёт «Готово!»
   → PATCH /api/schedule-items/{id}/complete/
   → Kafka topic: arna.schedule.completed
   → schedule_consumer → WebSocket push родителю (Django Channels)

Родитель создаёт запись в дневнике
   → POST /api/behavior-logs/
   → Kafka topic: arna.behavior.logged
   → behavior_consumer (задел для ИИ-анализа)

arna.ai.analyze — топик-задел под будущую ИИ-интеграцию (consumer пустой)
```
