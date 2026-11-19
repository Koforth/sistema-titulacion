# SIGTU – Sistema Integral de Gestión de Títulos Universitarios

Monorepo con backend (API REST) y frontend (React).

| Carpeta | Contenido |
|---|---|
| `backend/` | Laravel 13 / PHP 8.3, API REST `/api/v1`, Sanctum, MySQL |
| `frontend/` | React 19 + TypeScript + Vite (SPA que consume la API) |
| `docs/` | Documentación y evidencias ISO (12207, 25010, 27001) |

## Backend

```bash
cd backend
composer install
cp .env.example .env && php artisan key:generate
php artisan migrate
php artisan serve
```

Pruebas: `vendor/bin/phpunit` (usa la base `sistema_titulacion_test`, créala antes).
Estilo: `vendor/bin/pint`. Dependencias: `composer audit`.

## Frontend

```bash
cd frontend
npm install
npm run dev      # http://localhost:8080 (proxy /api -> http://127.0.0.1:8000)
npm test
npm run build
```

## Roles
`admin` (todo), `operador` (crear/editar), `consulta` (solo lectura).

## Documentación ISO
Ver [docs/README.md](docs/README.md).