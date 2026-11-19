# Controles de seguridad aplicados (ISO/IEC 27001:2022, Anexo A)

| Control | Descripción | Implementación |
|---|---|---|
| A.5.15 / A.8.2 | Control de acceso y privilegios | Roles `admin`, `operador`, `consulta`; middleware `role:` en `backend/routes/api.php` |
| A.5.17 | Información de autenticación | Contraseñas mín. 10 caracteres con mayúsculas, minúsculas, números y símbolos (`AppServiceProvider`) |
| A.8.5 | Autenticación segura | Tokens Sanctum con caducidad de 8 h; usuarios con campo `activo`; login limitado a 5 intentos/min |
| A.8.15 | Registro de actividad | Tabla `audit_logs` (usuario, rol, método, ruta, estado, IP) vía `AuditApiRequests`; sin cuerpos de petición |
| A.8.16 | Monitoreo | Registro de intentos de login fallidos en el log de Laravel |
| A.8.8 | Gestión de vulnerabilidades técnicas | `composer audit` en CI; actualización realizada el 2026-11-19 (0 avisos) |
| A.8.20 / A.8.21 | Seguridad de red y servicios | CORS con orígenes explícitos; cabeceras de seguridad; HSTS bajo HTTPS |
| A.5.34 | Privacidad de datos personales | Consulta pública minimizada (`TituloPublicoResource`), sin cédula/teléfono/correo |
| A.8.9 | Gestión de configuración | Secretos solo en `.env`; `.env.example` sin valores sensibles |
| A.8.13 | Respaldo | Procedimiento abajo |

## Procedimiento de respaldo (A.8.13)
```bash
mysqldump -u root -p sistema_titulacion > respaldo_AAAA-MM-DD.sql   # diario
mysql -u root -p sistema_titulacion < respaldo_AAAA-MM-DD.sql        # restauración
```
Guardar copias fuera del servidor y probar la restauración periódicamente.

## Pendientes
- Producción: `APP_DEBUG=false`, HTTPS obligatorio, `SESSION_ENCRYPT=true`.
- Revisión periódica de usuarios y roles; política de retención de `audit_logs`.
- Rotación o revocación de tokens al cambiar la contraseña.
- Evaluación formal de riesgos y declaración de aplicabilidad (requisitos del SGSI, fuera del alcance del código).