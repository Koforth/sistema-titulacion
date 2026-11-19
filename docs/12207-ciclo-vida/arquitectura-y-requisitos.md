# Arquitectura y requisitos (ISO/IEC/IEEE 12207)

## 1. Arquitectura
```
App Flutter  ──HTTPS/JSON──▶  API Laravel (/api/v1)  ──▶  MySQL
 (frontend/)                   Controller → Service → Model
```
- Autenticación: tokens Sanctum (8 h de vigencia).
- Capas: controladores delgados, lógica de negocio en `app/Services`, validación en `app/Http/Requests`.

## 2. Requisitos funcionales
| ID | Requisito | Endpoint principal |
|---|---|---|
| RF-01 | Gestionar graduados | `/graduados` |
| RF-02 | Gestionar titulaciones | `/titulaciones` |
| RF-03 | Seguir etapas del proceso de titulación | `/procesos-titulo` |
| RF-04 | Registrar título físico, QR e historial | `/titulos-fisicos` |
| RF-05 | Enviar y retornar lotes de impresión | `/impresion` |
| RF-06 | Enviar, certificar y retornar lotes SETEC | `/setec` |
| RF-07 | Entregar título al graduado | `/entrega` |
| RF-08 | Dashboard, reportes y alertas SLA (45 días) | `/dashboard`, `/reportes` |
| RF-09 | Consulta pública y verificación por QR | `/publico/*` |

## 3. Requisitos no funcionales
Seguridad (ver 27001), calidad (ver 25010), trazabilidad de cada título (`historial_titulos`) y auditoría de operaciones (`audit_logs`).

## 4. Gestión de configuración y cambios
- Control de versiones con git; rama `reestructuracion` para esta migración.
- Integración continua: `.github/workflows/ci.yml` (Pint, `composer audit`, PHPUnit).
- Mensajes de commit recomendados: `feat:`, `fix:`, `docs:`, `test:`, `chore:`.

## 5. Verificación y validación
- Pruebas automáticas en `backend/tests` (acceso por rol, validación, consulta pública, autenticación).
- Pendiente: pruebas de los Services (flujo de lotes y entrega) y de la app Flutter.

## 6. Mantenimiento
Registro de cambios en `CHANGELOG.md` (por crear al primer release). Actualizar dependencias con `composer update` y verificar con `composer audit`.