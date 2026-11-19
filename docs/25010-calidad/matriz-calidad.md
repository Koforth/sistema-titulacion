# Matriz de calidad (ISO/IEC 25010)

| Característica | Medida aplicada | Estado |
|---|---|---|
| Adecuación funcional | Endpoints cubren RF-01…RF-09 | Cumplido |
| Eficiencia de desempeño | Paginación (15 por página), límites de resultados en búsqueda pública | Parcial: falta prueba de carga |
| Compatibilidad | API JSON versionada (`/api/v1`) consumible por cualquier cliente | Cumplido |
| Usabilidad | Mensajes de error JSON consistentes (422 de validación) | Parcial: depende de la app Flutter |
| Fiabilidad | Transacciones en Services críticos, pruebas automáticas en CI | Parcial: ampliar pruebas |
| Seguridad | Roles, tokens, auditoría, cabeceras, política de contraseñas (ver 27001) | Cumplido |
| Mantenibilidad | Capas Controller/Service/Model, Pint en CI, FormRequests | Cumplido |
| Portabilidad | Configuración por `.env`, backend y frontend desacoplados | Cumplido |

## Pendientes recomendados
1. Pruebas unitarias de `LoteImpresionService`, `LoteSetecService`, `EntregaService`, `ProcesoTituloService`.
2. Eliminar el código web Blade/Breeze cuando la app Flutter lo reemplace.
3. Medir cobertura (`phpunit --coverage`) y fijar un umbral.