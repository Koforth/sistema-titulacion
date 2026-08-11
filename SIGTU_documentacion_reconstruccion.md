# SIGTU — Sistema Integral de Gestión de Títulos Universitarios

## Documento maestro de reconstrucción del sistema

> Este documento reúne la arquitectura, tecnologías, variables, módulos, lógica de negocio, flujo documental, API académica, base de datos, seguridad, reportes, QR, alertas y estructura recomendada para reconstruir SIGTU desde cero.
>
> **Nota:** Los nombres exactos de algunas tablas, endpoints externos y campos pueden variar según la implementación final. Los puntos marcados como "por verificar" deben contrastarse con el código real o con la API académica antes de implementarlos.

---

# 1. Identidad del sistema

## Nombre recomendado

**SIGTU**

**Sistema Integral de Gestión de Títulos Universitarios**

## Propósito

SIGTU administra el ciclo de vida de un título universitario desde que el estudiante solicita la titulación hasta la entrega del título al graduado.

El sistema contempla:

- Registro y consulta de graduados.
- Procesos de titulación.
- Expedientes.
- Elaboración de títulos.
- Envío de títulos a una institución externa de Managua para impresión.
- Retorno de títulos impresos a León.
- Envío de títulos a SETEC para certificación.
- Retorno de títulos desde SETEC.
- Control físico del documento.
- Entrega al graduado.
- Historial y trazabilidad documental.
- Alertas automáticas.
- Reportes.
- Consulta pública.
- Verificación mediante QR.
- Integración con una API académica externa.

---

# 2. Arquitectura general

El flujo conceptual es:

```text
API ACADÉMICA
      |
      v
GRADUADO / DATOS ACADÉMICOS
      |
      v
PROCESO DE TITULACIÓN
      |
      v
TÍTULO FÍSICO
      |
      +--------------------+
      |                    |
      v                    v
  IMPRESIÓN             SETEC
  por lotes             por lotes
      |                    |
      v                    v
    LEÓN <--------------> LEÓN
      |
      v
ENTREGA AL GRADUADO
      |
      v
CONSULTA PÚBLICA / QR
```

## Principio arquitectónico

Cada módulo debe tener una sola responsabilidad:

```text
Procesos
    = ¿En qué etapa administrativa está?

Impresión
    = ¿Qué títulos fueron enviados a Managua y retornaron?

SETEC
    = ¿Qué títulos fueron enviados a certificación y cuál fue su resultado?

Títulos físicos
    = ¿Cuál es el documento físico y dónde está actualmente?

Historial
    = ¿Qué le ha ocurrido al título durante toda su vida?

Consulta pública
    = ¿Qué información pública puede verificar un tercero?
```

---

# 3. Tecnologías

## Backend

- PHP
- Laravel
- Composer
- Laravel Eloquent
- Laravel Blade
- Laravel HTTP Client
- Laravel Sanctum para autenticación de APIs cuando corresponda

## Base de datos

- MySQL o MariaDB

## Frontend

- Blade
- HTML
- CSS
- JavaScript
- Bootstrap, si está presente en la implementación
- AJAX / Fetch / jQuery según la vista existente

## Desarrollo local

- Windows
- WAMP
- Ruta utilizada durante el desarrollo:

```text
D:\wamp64\www\sistema-titulacion
```

También puede utilizarse Laragon u otro entorno PHP compatible.

## Control de versiones

- Git
- GitHub

---

# 4. Requisitos iniciales

Instalar:

1. PHP compatible con la versión de Laravel utilizada.
2. Composer.
3. MySQL/MariaDB.
4. WAMP/Laragon.
5. Node.js y npm si el proyecto utiliza compilación de assets.
6. Git.
7. Visual Studio Code u otro editor.
8. Postman para probar APIs.

Comprobar:

```bash
php -v
composer -V
node -v
npm -v
git --version
```

---

# 5. Crear el proyecto Laravel desde cero

Ejemplo:

```bash
composer create-project laravel/laravel sistema-titulacion
```

Entrar:

```bash
cd sistema-titulacion
```

Iniciar servidor:

```bash
php artisan serve
```

URL local:

```text
http://127.0.0.1:8000
```

---

# 6. Configuración .env

Ejemplo de configuración:

```env
APP_NAME=SIGTU
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://127.0.0.1:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=sistema_titulacion
DB_USERNAME=root
DB_PASSWORD=

ACADEMIC_URL=https://test.uncpggl.edu.ni:3001/api
ACADEMIC_TOKEN=
```

Generar la clave:

```bash
php artisan key:generate
```

Después de modificar variables de configuración:

```bash
php artisan config:clear
```

---

# 7. Crear la base de datos

Crear en MySQL:

```sql
CREATE DATABASE sistema_titulacion
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;
```

Luego:

```bash
php artisan migrate
```

---

# 8. Estructura recomendada

```text
sistema-titulacion/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   └── Requests/
│   ├── Models/
│   └── Services/
├── config/
├── database/
│   ├── migrations/
│   ├── seeders/
│   └── factories/
├── public/
├── resources/
│   └── views/
│       ├── layouts/
│       ├── procesos/
│       ├── titulos-fisicos/
│       ├── impresion/
│       ├── setec/
│       ├── consulta-publica/
│       └── public/
├── routes/
│   ├── web.php
│   └── api.php
└── storage/
```

---

# 9. Módulos principales

## 9.1 Procesos de titulación

Ruta utilizada:

```text
/procesos-titulo
```

Responsabilidad:

- Crear proceso de titulación.
- Registrar las etapas.
- Controlar progreso.
- Generar alertas.
- Controlar el plazo de 45 días.
- Determinar cuándo termina el proceso.

### Etapas manejadas

```text
Solicitado por el estudiante
Expediente completo en titulación
Elaboración de base de datos
Elaboración del título
Elaboración de documento para certificación de título
En gaceta
Título entregado al graduado
Título anulado
Título rechazado
Otro
Pendiente
En revisión
Revisado
Validado
Entregado al estudiante
```

### Regla importante

El proceso comienza a contar el plazo cuando:

```text
Solicitado por el estudiante = marcado
+
Expediente completo en titulación = marcado
```

No se debe contar desde la creación del registro si esas dos condiciones todavía no están cumplidas.

---

# 10. Regla de alerta de 45 días

## Inicio

Cuando ambas condiciones pasan a verdadero:

```text
Solicitado por el estudiante = true
Expediente completo en titulación = true
```

guardar una fecha de inicio del conteo.

Conceptualmente:

```php
$fechaInicio = now();
```

## Vencimiento

Se cuentan exactamente 45 días calendario.

```php
$fechaLimite = $fechaInicio->copy()->addDays(45);
```

## Alerta

Si:

```php
now() > $fechaLimite
```

y todavía NO se ha marcado:

```text
Título entregado al graduado
```

entonces generar alerta.

## Fin del proceso

El proceso termina cuando se marca:

```text
Título entregado al graduado
```

La alerta debe dejar de aparecer una vez finalizado el proceso.

## No usar SETEC como disparador de 45 días

No se recomienda generar la alerta por el tiempo que un título permanece en SETEC, porque la certificación normalmente se reporta rápidamente.

El SLA institucional se centra en el tiempo total que el título tarda en llegar a la entrega al estudiante después de tener solicitud y expediente completo.

---

# 11. Títulos físicos

Ruta:

```text
/titulos-fisicos
```

## Responsabilidad

Representar el documento físico individual.

Debe contener información permanente o documental del título.

Ejemplos:

```text
numero_titulo
titulacion_id
libro
tomo
folio
qr
ubicacion_actual
observaciones
calidad
```

## Ubicación actual

Campo autoritativo:

```text
titulos_fisicos.ubicacion_actual
```

Valores conceptuales:

```text
LEON
IMPRENTA
SETEC
ENTREGADO
```

La ubicación debe actualizarse automáticamente mediante los procesos correspondientes.

## Regla

El usuario no debe editar manualmente `ubicacion_actual`.

Debe ser de solo lectura.

---

# 12. Control físico

Control físico NO debe registrar movimientos.

Su responsabilidad es:

- Listar títulos.
- Consultar metadatos.
- Editar metadatos documentales permitidos.
- Mostrar ubicación actual.
- Mostrar historial.
- Gestionar entrega al graduado.
- Mostrar QR.
- Mostrar libro/tomo/folio.
- Mostrar información de calidad y observaciones.

## Menú recomendado

```text
Títulos físicos
    ├── Listado de títulos
    ├── Entrega al graduado
    └── Historial documental
```

---

# 13. Impresión por lotes

La institución no imprime directamente los títulos.

Los títulos son enviados a una institución tercera en Managua para su impresión.

Por lo tanto, el sistema debe controlar el movimiento por lotes.

## Flujo

```text
LEÓN
  |
  | envío
  v
MANAGUA / IMPRENTA
  |
  | retorno
  v
LEÓN
```

## Tabla

Conceptualmente:

```text
lotes_impresion
```

Campos:

```text
id
numero_lote
fecha_envio
responsable_envio
fecha_retorno
responsable_recepcion
estado
observaciones
```

## Tabla detalle

```text
lote_impresion_titulo
```

Campos conceptuales:

```text
id
lote_impresion_id
titulo_fisico_id
estado
observacion
```

## Envío

Cuando se crea/confirma un lote de impresión:

```php
$titulo->update([
    'ubicacion_actual' => 'IMPRENTA'
]);
```

## Retorno

Cuando retorna el lote:

```php
$titulo->update([
    'ubicacion_actual' => 'LEON'
]);
```

## Historial

Registrar eventos:

```text
Enviado a imprenta
Recibido de imprenta
```

---

# 14. SETEC por lotes

SETEC también trabaja por lotes.

## Flujo

```text
LEÓN
  |
  | lote de títulos
  v
SETEC
  |
  | certificación
  v
LEÓN
```

## Responsabilidad de SETEC

- Crear lote.
- Seleccionar múltiples títulos.
- Registrar salida.
- Registrar retorno.
- Registrar certificación.
- Registrar observaciones.
- Registrar títulos observados/no recibidos/certificados.

## Ubicación

Al enviar:

```php
ubicacion_actual = 'SETEC'
```

Al retornar:

```php
ubicacion_actual = 'LEON'
```

Esto ya se definió como parte de la arquitectura.

---

# 15. Control SETEC vs Control físico

No duplicar movimientos.

## Control SETEC

Responde:

```text
¿Qué ocurrió durante la certificación?
```

Ejemplos:

```text
Certificado
Observado
No recibido
Pendiente
```

## Control físico

Responde:

```text
¿Dónde está físicamente el título?
```

Ejemplo:

```text
SETEC
```

## Regla

Un envío a SETEC no debe registrarse dos veces.

El módulo SETEC es dueño de la operación SETEC.

Títulos físicos únicamente refleja la ubicación actual y el historial.

---

# 16. Historial documental

El sistema ya contempla un historial como `HistorialTitulo`.

El historial debe convertirse en una de las piezas centrales del sistema.

## Objetivo

Crear la "hoja de vida" del título.

Ejemplo:

```text
01/06/2026
✓ Expediente completo

03/06/2026
✓ Elaboración de título

05/06/2026
✓ Enviado a imprenta
Lote IMP-2026-001

10/06/2026
✓ Recibido de imprenta

12/06/2026
✓ Enviado a SETEC
Lote SETEC-2026-003

13/06/2026
✓ Certificado

18/06/2026
✓ Entregado al graduado
```

---

# 17. Vista dedicada de historial

Crear ruta:

```text
GET /titulos-fisicos/{titulo}/historial
```

Nombre de ruta recomendado:

```php
Route::get(
    '/titulos-fisicos/{titulo}/historial',
    [TituloFisicoController::class, 'historial']
)->name('titulos-fisicos.historial');
```

## Vista

Mostrar:

```text
Título
Graduado
Carrera
Número de título
Ubicación actual
Estado del proceso
```

y debajo un timeline completo.

## Acceso

Agregar botón:

```text
Ver hoja de vida
```

desde:

- Títulos físicos.
- Procesos.
- SETEC.
- Reportes.

---

# 18. Historial como fuente de trazabilidad

El historial debe registrar eventos importantes.

Ejemplos:

```text
Título creado
Expediente completo
Título elaborado
Enviado a imprenta
Recibido de imprenta
Enviado a SETEC
Recibido de SETEC
Certificado
Observado
Título entregado
Título anulado
Título rechazado
```

Cada evento puede almacenar:

```text
titulo_fisico_id
tipo_evento
fecha
usuario_id
descripcion
```

---

# 19. Reportes

Los reportes deben utilizar `titulos_fisicos.ubicacion_actual` como fuente autoritativa para ubicación.

## En imprenta

```php
TituloFisico::where(
    'ubicacion_actual',
    'IMPRENTA'
)->get();
```

## En SETEC

```php
TituloFisico::where(
    'ubicacion_actual',
    'SETEC'
)->get();
```

## En León

```php
TituloFisico::where(
    'ubicacion_actual',
    'LEON'
)->get();
```

## Entregados

```php
TituloFisico::where(
    'ubicacion_actual',
    'ENTREGADO'
)->get();
```

---

# 20. Reporte "En SETEC"

Ruta que se utilizó durante el desarrollo:

```text
/reportes?tipo=en_setec
```

La consulta debe depender de:

```text
titulos_fisicos.ubicacion_actual = SETEC
```

y no únicamente de:

```text
procesos_titulo.estado
```

Esto evita que un título en SETEC desaparezca del reporte debido a cambios en las etapas administrativas.

---

# 21. Procesos vs títulos físicos en reportes

Se definió esta separación:

```text
Títulos físicos
    = fuente autoritativa de ubicación
```

```text
Procesos
    = flujo administrativo cuando sea necesario
```

Un reporte puede mostrar ambos:

```text
Ubicación: SETEC
Etapa: Certificación
```

La ubicación responde dónde está.

La etapa responde qué se está haciendo.

---

# 22. Consulta pública

Actualmente existe:

```text
/consulta-publica
```

Se recomienda crear una página Home pública antes de entrar a la consulta.

## Ruta raíz

```text
/
```

## Home pública

Debe mostrar:

```text
Sistema Integral de Gestión de Títulos Universitarios

Consulta y verificación de títulos universitarios.

[Consultar título]
[Verificar documento]
```

También puede incluir:

- Información del sistema.
- Instrucciones.
- Preguntas frecuentes.
- Contacto institucional.
- Estadísticas públicas.

---

# 23. Consulta pública vs sistema interno

## Interno

Tiene acceso a:

- Historial completo.
- Usuarios.
- Lotes.
- Responsables.
- Observaciones administrativas.
- Documentación.
- Movimientos.

## Público

Debe mostrar solamente información autorizada.

Ejemplo:

```text
Graduado
Carrera
Título
Fecha
Estado de verificación
Información documental permitida
```

Nunca exponer información administrativa sensible.

---

# 24. QR

El QR debe apuntar a una URL pública.

Ejemplo conceptual:

```text
https://dominio-institucional/verificar/{uuid}
```

No utilizar directamente IDs incrementales si se quiere evitar enumeración.

Usar:

```text
uuid
```

o identificador público aleatorio.

## Librería recomendada

Simple QrCode:

```bash
composer require simplesoftwareio/simple-qrcode
```

Ejemplo:

```blade
{!! QrCode::size(250)->generate($url); !!}
```

## Flujo

```text
Título físico
      |
      v
UUID público
      |
      v
URL pública
      |
      v
QR
```

---

# 25. Integración con API académica

Existe la variable:

```env
ACADEMIC_URL=https://test.uncpggl.edu.ni:3001/api
```

La idea es que desde Titulación se pueda buscar información académica en una API externa.

## Flujo

```text
Crear Titulación
      |
      v
Ingresar carnet/identificador
      |
      v
Laravel consulta API académica
      |
      v
Obtiene datos
      |
      v
Autocompleta formulario
      |
      v
Usuario confirma
      |
      v
Guarda en SIGTU
```

---

# 26. Autenticación de API académica

Se recibió un token con formato:

```text
28079|...
```

Este formato parece corresponder a un Laravel Sanctum Personal Access Token.

La autenticación debe enviarse como:

```http
Authorization: Bearer TOKEN
Accept: application/json
```

## IMPORTANTE

No guardar tokens directamente en código fuente.

Usar:

```env
ACADEMIC_TOKEN=TOKEN
```

y:

```php
'academic' => [
    'url' => env('ACADEMIC_URL'),
    'token' => env('ACADEMIC_TOKEN'),
],
```

## Seguridad

Si un token real se expone, debe revocarse y generarse uno nuevo.

---

# 27. Servicio AcademicService

Crear:

```text
app/Services/AcademicService.php
```

Ejemplo conceptual:

```php
<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class AcademicService
{
    public function buscarEstudiante(string $identificador)
    {
        return Http::timeout(10)
            ->withToken(config('services.academic.token'))
            ->acceptJson()
            ->get(
                config('services.academic.url') .
                '/ENDPOINT'
            )
            ->json();
    }
}
```

El endpoint exacto debe obtenerse de la API/Postman.

---

# 28. Configuración services.php

Agregar:

```php
'academic' => [
    'url' => env('ACADEMIC_URL'),
    'token' => env('ACADEMIC_TOKEN'),
],
```

Después:

```bash
php artisan config:clear
```

---

# 29. Endpoint interno de búsqueda

Ejemplo:

```php
Route::get(
    '/titulacion/buscar-estudiante',
    [TitulacionController::class, 'buscarEstudiante']
);
```

Controller:

```php
public function buscarEstudiante(Request $request)
{
    $request->validate([
        'identificador' => 'required'
    ]);

    $data = app(AcademicService::class)
        ->buscarEstudiante($request->identificador);

    return response()->json($data);
}
```

El nombre del campo y endpoint real deben ajustarse a la API.

---

# 30. Postman

Postman se utiliza para probar la API.

El flujo no es:

```text
Postman -> base de datos
```

sino:

```text
Postman
   |
   v
Laravel/API
   |
   v
Controller
   |
   v
Service/Model
   |
   v
MySQL
```

Para la API académica:

```text
SIGTU
   |
   v
AcademicService
   |
   v
API académica externa
```

---

# 31. Modelo de datos conceptual

## Graduados

Información del graduado.

## Titulaciones

Información académica y administrativa de la titulación.

Relación:

```text
Graduado
   1
   |
   N
Titulaciones
```

## Procesos de título

Control del workflow.

Relación:

```text
Titulación
   1
   |
   1/N
ProcesoTitulo
```

## Títulos físicos

Representación del documento físico.

Relación conceptual:

```text
Titulación
   |
   v
TituloFisico
```

## Lotes de impresión

```text
LoteImpresion
   1
   |
   N
LoteImpresionTitulo
   N
   |
   1
TituloFisico
```

## SETEC

La estructura existente trabaja con lotes de títulos enviados a certificación.

Conceptualmente:

```text
LoteSetec
   1
   |
   N
DetalleTituloSetec
   N
   |
   1
TituloFisico
```

## Historial

```text
TituloFisico
   1
   |
   N
HistorialTitulo
```

---

# 32. Regla fundamental de relaciones

Un título físico puede participar en muchos movimientos durante su vida.

Ejemplo:

```text
Título #001
    |
    +-- Lote impresión 001
    |
    +-- Lote SETEC 003
    |
    +-- Entrega
```

No se debe almacenar todo el historial en columnas fijas del título.

Por eso existen lotes e historial.

---

# 33. Lo que NO hacer

## No duplicar movimientos

Evitar:

```text
Control SETEC -> movimiento SETEC
Control físico -> movimiento SETEC
```

El movimiento SETEC debe tener un único dueño.

## No duplicar ubicación

Evitar que:

```text
procesos_titulo.estado
```

y:

```text
titulos_fisicos.ubicacion_actual
```

se utilicen indistintamente para decir dónde está físicamente el documento.

## No editar ubicación manualmente

La ubicación cambia por eventos.

---

# 34. Menú final recomendado

```text
Dashboard

Graduados

Procesos
    └── Procesos de titulación

Impresión
    ├── Salida de títulos
    └── Retorno de impresión

SETEC
    ├── Salida de títulos
    └── Retorno y certificación

Títulos físicos
    ├── Listado de títulos
    ├── Entrega al graduado
    └── Historial documental

Reportes

Consulta pública
```

---

# 35. Dashboard

Debe mostrar indicadores como:

```text
Títulos en proceso
Títulos en imprenta
Títulos en SETEC
Títulos en León
Títulos entregados
Títulos con más de 45 días
```

Los indicadores deben derivarse de las fuentes correctas.

---

# 36. Entrega al graduado

La entrega es el cierre del proceso físico.

Al registrar:

```text
Título entregado al graduado
```

actualizar:

```php
ubicacion_actual = 'ENTREGADO';
```

y registrar:

```text
HistorialTitulo
```

Además, el proceso de titulación queda terminado.

---

# 37. Regla de finalización

No finalizar un proceso porque:

```text
está certificado
```

No finalizar porque:

```text
retornó de SETEC
```

Finalizar cuando:

```text
Título entregado al graduado = marcado
```

---

# 38. Calidad y documentación

El módulo de títulos físicos puede conservar metadatos como:

```text
Calidad
Observaciones
Libro
Tomo
Folio
```

El sistema puede asociar documentación digital cuando corresponda:

- PDF firmado.
- Escaneos.
- Comprobantes.
- Actas.
- Documentos de certificación.
- QR.

Estos documentos no sustituyen el historial; son evidencias/documentos asociados.

---

# 39. Reportes recomendados

## Ubicación

- En imprenta.
- En SETEC.
- En León.
- Entregados.

## Procesos

- Pendientes.
- En revisión.
- Validados.
- Certificados.
- Entregados.
- Anulados.
- Rechazados.

## Alertas

- Más de 45 días.
- Pendientes de entrega.

## Impresión

- Lotes enviados.
- Lotes retornados.
- Títulos pendientes de retorno.

## SETEC

- Lotes enviados.
- Lotes retornados.
- Certificados.
- Observados.
- No recibidos.

## Entrega

- Entregados por período.
- Pendientes de entrega.

---

# 40. Seguridad

## .env

Nunca subir:

```text
.env
```

al repositorio.

## Tokens

Nunca subir:

```text
ACADEMIC_TOKEN
```

## Git

Agregar:

```text
.env
/vendor
/node_modules
/storage/*.key
```

según el `.gitignore`.

---

# 41. Git desde cero

Inicializar:

```bash
git init
```

Configurar identidad:

```bash
git config --global user.name "Koforth"
git config --global user.email "tu-correo"
```

Si Git muestra:

```text
fatal: detected dubious ownership
```

agregar:

```bash
git config --global --add safe.directory D:/wamp64/www/sistema-titulacion
```

Comprobar:

```bash
git config --global --get-all safe.directory
```

Luego:

```bash
git add .
git commit -m "SIGTU"
```

Configurar rama:

```bash
git branch -M main
```

Agregar repositorio remoto:

```bash
git remote add origin URL_DEL_REPOSITORIO
```

Verificar:

```bash
git remote -v
```

Subir:

```bash
git push -u origin main
```

---

# 42. Error de correo Git

La configuración correcta es:

```bash
git config --global user.email "correo@dominio.com"
```

No usar:

```text
[correo](mailto:correo)
```

como valor.

Comprobar:

```bash
git config --global user.name
git config --global user.email
```

---

# 43. Flujo completo de negocio

## Paso 1

El estudiante solicita titulación.

```text
Solicitado por el estudiante = TRUE
```

## Paso 2

Se completa el expediente.

```text
Expediente completo en titulación = TRUE
```

Se registra la fecha de inicio del SLA.

## Paso 3

Se elaboran los datos y el título.

## Paso 4

Se crea el título físico.

```text
ubicacion_actual = LEON
```

## Paso 5

Se crea un lote de impresión.

```text
LEON -> IMPRENTA
```

La ubicación pasa a:

```text
IMPRENTA
```

## Paso 6

Retorna el lote.

```text
IMPRENTA -> LEON
```

La ubicación pasa a:

```text
LEON
```

## Paso 7

Se prepara el lote SETEC.

```text
LEON -> SETEC
```

La ubicación pasa a:

```text
SETEC
```

## Paso 8

SETEC certifica.

Puede ocurrir:

```text
CERTIFICADO
OBSERVADO
NO RECIBIDO
PENDIENTE
```

## Paso 9

Retorna a León.

```text
SETEC -> LEON
```

La ubicación vuelve a:

```text
LEON
```

## Paso 10

Se completa la documentación.

## Paso 11

Se entrega al graduado.

```text
ubicacion_actual = ENTREGADO
```

## Paso 12

Se marca:

```text
Título entregado al graduado
```

El proceso termina.

---

# 44. Línea de tiempo ejemplo

```text
Solicitud
    |
    v
Expediente completo
    |
    v
Elaboración
    |
    v
Imprenta
    |
    v
León
    |
    v
SETEC
    |
    v
León
    |
    v
Entrega
```

---

# 45. Principio de diseño final

La separación recomendada es:

```text
PROCESOS
    = flujo administrativo

IMPRESIÓN
    = lotes hacia Managua

SETEC
    = lotes de certificación

TÍTULO FÍSICO
    = documento + ubicación actual

HISTORIAL
    = trazabilidad completa

ENTREGA
    = cierre físico

CONSULTA PÚBLICA
    = verificación externa
```

---

# 46. Checklist de reconstrucción

## Base

- [ ] Crear proyecto Laravel.
- [ ] Configurar `.env`.
- [ ] Crear base MySQL.
- [ ] Ejecutar migraciones.
- [ ] Configurar autenticación.

## Académico

- [ ] Configurar `ACADEMIC_URL`.
- [ ] Configurar `ACADEMIC_TOKEN`.
- [ ] Crear `AcademicService`.
- [ ] Probar endpoint.
- [ ] Integrar búsqueda desde Titulación.

## Titulación

- [ ] Graduados.
- [ ] Titulaciones.
- [ ] Procesos.
- [ ] Etapas.
- [ ] SLA 45 días.
- [ ] Alertas.

## Títulos físicos

- [ ] Crear título físico.
- [ ] Ubicación actual.
- [ ] Libro/tomo/folio.
- [ ] QR.
- [ ] Calidad.
- [ ] Observaciones.
- [ ] Documentación.

## Impresión

- [ ] Crear lote.
- [ ] Agregar títulos.
- [ ] Registrar salida.
- [ ] Cambiar ubicación a IMPRENTA.
- [ ] Registrar retorno.
- [ ] Cambiar ubicación a LEON.
- [ ] Historial.

## SETEC

- [ ] Crear lote.
- [ ] Agregar títulos.
- [ ] Registrar salida.
- [ ] Cambiar ubicación a SETEC.
- [ ] Registrar certificación.
- [ ] Registrar observaciones.
- [ ] Registrar retorno.
- [ ] Cambiar ubicación a LEON.

## Historial

- [ ] Registrar eventos.
- [ ] Crear timeline.
- [ ] Crear ruta independiente.
- [ ] Botón "Ver hoja de vida".

## Entrega

- [ ] Registrar responsable.
- [ ] Registrar fecha.
- [ ] Cambiar ubicación a ENTREGADO.
- [ ] Marcar etapa final.
- [ ] Registrar historial.

## Consulta pública

- [ ] Crear Home.
- [ ] Crear `/consulta-publica`.
- [ ] Crear verificación por UUID.
- [ ] Generar QR.
- [ ] Proteger información privada.

## Reportes

- [ ] En imprenta.
- [ ] En SETEC.
- [ ] En León.
- [ ] Entregados.
- [ ] Alertas.
- [ ] Procesos.
- [ ] Lotes.
- [ ] Certificaciones.

---

# 47. Regla de oro del sistema

Antes de crear una nueva tabla, campo o módulo, preguntar:

> ¿Esta información ya tiene un dueño dentro del sistema?

Ejemplos:

```text
¿Dónde está el título?
    -> titulos_fisicos.ubicacion_actual

¿Qué etapa administrativa tiene?
    -> procesos_titulo

¿Fue enviado a Managua?
    -> lote_impresion

¿Fue enviado a SETEC?
    -> control/movimiento SETEC

¿Qué le ocurrió históricamente?
    -> HistorialTitulo

¿Fue entregado?
    -> entrega + ubicacion_actual + etapa final
```

Esto evita volver a crear módulos redundantes.

---

# 48. Arquitectura conceptual definitiva

```text
                    SIGTU
                      |
        +-------------+-------------+
        |             |             |
     PROCESOS      DOCUMENTO      API ACADÉMICA
        |             |
        |        TITULO FISICO
        |             |
        |       +-----+------+
        |       |            |
        |    IMPRESIÓN      SETEC
        |       |            |
        |       +-----+------+
        |             |
        |         HISTORIAL
        |             |
        +-------------+
                      |
                    ENTREGA
                      |
                 CONSULTA PÚBLICA
                      |
                     QR
```

---

# 49. Estado esperado del sistema

El sistema terminado debe permitir:

1. Buscar información académica desde la API.
2. Crear una titulación.
3. Iniciar el proceso cuando corresponda.
4. Controlar las etapas.
5. Generar alerta después de 45 días.
6. Crear el título físico.
7. Enviar múltiples títulos a impresión mediante un lote.
8. Registrar el retorno del lote.
9. Enviar múltiples títulos a SETEC mediante un lote.
10. Registrar resultados de certificación.
11. Registrar retorno de SETEC.
12. Mantener `ubicacion_actual` sincronizada.
13. Registrar todos los eventos en el historial.
14. Consultar la hoja de vida del título.
15. Entregar el título al graduado.
16. Finalizar el proceso.
17. Generar QR.
18. Permitir consulta pública.
19. Generar reportes.
20. Mantener trazabilidad completa.

---

# 50. Nota sobre implementación real

Este documento representa la arquitectura y lógica definida durante el diseño del sistema.

Antes de reconstruir el proyecto literalmente, verificar:

- nombres exactos de tablas existentes;
- nombres exactos de columnas;
- nombres exactos de modelos;
- endpoints reales de la API académica;
- estructura JSON real de la API;
- middleware y autenticación;
- relaciones Eloquent existentes;
- migraciones;
- nombres de rutas;
- controladores actuales;
- permisos y roles;
- estructura exacta de SETEC.

Los endpoints de la API académica no deben inventarse. Deben obtenerse de la documentación o colección Postman que utiliza actualmente el sistema.

