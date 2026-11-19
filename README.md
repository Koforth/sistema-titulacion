# SIGTU – Sistema Integral de Gestión de Títulos Universitarios

Monorepo con backend (API REST) y frontend (Flutter).

| Carpeta | Contenido |
|---|---|
| `backend/` | Laravel 13 / PHP 8.3, API REST `/api/v1`, Sanctum, MySQL |
| `frontend/` | App Flutter (pendiente de crear; requiere el SDK de Flutter) |
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

## Roles
`admin` (todo), `operador` (crear/editar), `consulta` (solo lectura).

## Documentación ISO
Ver [docs/README.md](docs/README.md).