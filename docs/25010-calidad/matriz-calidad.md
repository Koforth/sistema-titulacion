# Matriz de Calidad del Producto (ISO/IEC 25010) y Usabilidad (ISO 9241-11)

Este documento detalla la implementación y evaluación de las directrices de calidad del software y ergonomía de interacción para el sistema **SIGTU**.

---

## 1. ISO/IEC 25010: Calidad del Producto de Software

La norma evalúa 8 características esenciales de calidad:

| Característica | Subcaracterísticas | Implementación en SIGTU | Verificación |
|---|---|---|---|
| **Adecuación Funcional** | Completitud, corrección, pertinencia | Todos los requisitos de gestión de graduados, títulos, lotes de imprenta, SETEC y entrega implementados en controladores API y endpoints REST. | Tests de integración Feature/Api (`ApiAccessTest`). |
| **Eficiencia de Desempeño** | Comportamiento temporal, utilización de recursos | Paginación en servidor (15 registros), consultas optimizadas con relaciones eager-loading (`withCount`, `with`), Vite bundler con tree-shaking en frontend. | Respuestas JSON en < 150ms en entorno local. |
| **Compatibilidad** | Coexistencia, interoperabilidad | Separación estricta Backend/Frontend. API pública en `/api/v1` documentada y desacoplada consumible por clientes Web, Mobile o servicios externos. | Estructura monorepo `backend/` y `frontend/`. |
| **Usabilidad** | Reconocimiento, aprendizaje, operabilidad, estética | Interfaz React diseñada conforme a **ISO 9241-11** (efectividad, eficiencia y satisfacción del usuario). | Ver sección 2 de este documento. |
| **Fiabilidad** | Madurez, tolerancia a fallos, recuperabilidad | Transacciones atómicas de BD en operaciones críticas (`EntregaService`, `LoteService`). Pruebas unitarias de servicios. | `tests/Unit/Services/CoreServicesTest.php` (100% aprobadas). |
| **Seguridad** | Confidencialidad, integridad, no repudio, autenticidad | Alineado con **ISO 27001**: Tokens Sanctum con expiración, políticas de contraseña robusta, auditoría de peticiones (`audit_logs`), cabeceras HTTP de seguridad (`SecurityHeaders`). | Middleware de auditoría y tests de acceso por roles. |
| **Mantenibilidad** | Modularidad, reusabilidad, modificabilidad, comprobabilidad | Arquitectura en 3 capas (Controller -> Service -> Model), estándares PSR-12 vía Laravel Pint, TypeScript estricto en frontend. | `vendor/bin/pint --test` y `tsc --noEmit` en CI. |
| **Portabilidad** | Adaptabilidad, facilidad de instalación | Aislamiento de configuraciones en variables de entorno `.env`, contenedorizable mediante Docker y CI automatizado en GitHub Actions. | `.github/workflows/ci.yml`. |

---

## 2. ISO 9241-11: Usabilidad (Eficacia, Eficiencia y Satisfacción)

La norma **ISO 9241-11** define la usabilidad como la medida en que un producto puede ser usado por usuarios específicos para conseguir objetivos determinados con **eficacia**, **eficiencia** y **satisfacción** en un contexto de uso especificado.

### Principios Implementados en el Frontend:

#### A. Eficacia (Accuracy & Completeness)
* **Tolerancia y Prevención de Errores:**
  * Diálogos de confirmación previa para acciones destructivas o irreversibles (e.g., entrega de títulos físicos o eliminación de graduados).
  * Validación reactiva de campos obligatorios en formularios y mensajes de error descriptivos (`errorMessage`) que detallan fallos de validación backend.
* **Control de Acceso Visual:** 
  * Los botones de modificación o borrado se ocultan dinámicamente si el rol del usuario no tiene permisos (`can('admin')`), evitando intentos fallidos y frustración.

#### B. Eficiencia (Resources expended in relation to the accuracy and completeness)
* **Búsqueda y Paginación Unificada (`ListPage`):**
  * Búsqueda en vivo (`debounce` y query) para localizar rápidamente expedientes por carnet, cédula o número de título sin recargar la página.
* **Accesibilidad por Teclado:**
  * Enlace oculto para saltar la navegación (`.skip-link:focus`) dirigido al contenido principal (`#main-content`), permitiendo a usuarios avanzados o con discapacidad motriz operar sin ratón.
  * Estados `:focus-visible` universales para indicar claramente el elemento activo.
* **Tiempos de Respuesta Inmediatos:**
  * Single Page Application (SPA) con carga asíncrona de datos (`useApi`), evitando re-renderizados completos del navegador.

#### C. Satisfacción (Comfort and positive attitudes towards the use of the product)
* **Contraste de Color y Legibilidad:**
  * Paleta de colores ajustada a niveles WCAG AA para asegurar una relación de contraste mínima de 4.5:1 entre textos y fondos.
  * Etiquetas de estado (`Badge`) diferenciadas no solo por color sino por texto descriptivo claro (`LEON`, `IMPRENTA`, `SETEC`, `ENTREGADO`).
* **Diseño Responsivo y Limpio:**
  * Cuadrícula de estadísticas (`stats`) que se adapta a pantallas de escritorio y dispositivos móviles.
  * Tablas desplazables horizontalmente en resoluciones estrechas mediante contenedores con `overflow-x: auto`.
