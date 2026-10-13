# Evaluación del swing del alumno — versión sencilla

Esta actualización corresponde únicamente a `chq-student-evaluation`.

## Qué incluye

22 campos principales: nombre, FDN (fecha de nacimiento), fecha de evaluación, 7 observaciones de parada/cuerpo, tus 10 pasos del swing (incluido 7.5), correcciones y drills. Todas las observaciones son comentarios libres. English/Español cambia los títulos sin traducir ni modificar tu opinión escrita.

Cuatro notas opcionales agrupan los aspectos de las fotos: manera de actuar, condición física y limitaciones, habilidades técnicas y putt. Los pasos P1 y P9 mantienen la descripción que proporcionaste; P7.5 se guarda por separado. No hay calificaciones predefinidas.

Los registros anteriores guardados en este navegador se conservan. Los campos de la versión larga que ya tengan datos permanecen en el registro y en la copia de seguridad, aunque no se muestran en esta vista sencilla. El envío nuevo contiene únicamente los campos de la evaluación sencilla.

## 1. Actualizar la conexión de Google Sheets

Usa el MISMO proyecto de Apps Script del enlace que ya tienes. No reemplaces sus otras funciones ni crees una implementación distinta.

1. Abre tu Google Sheet y entra en **Extensiones → Apps Script**.
2. Añade un archivo de secuencia de comandos llamado **SwingEvaluation**. Borra el contenido de ejemplo y pega el contenido completo de `SwingEvaluation.gs`.
3. En tu archivo actual, encuentra `function doPost(e)` y la línea que convierte el contenido de la petición con `JSON.parse(e.postData.contents)`. Si la variable se llama `datos`, añade inmediatamente después esta línea, dentro de `doPost` y antes de los manejadores actuales:

```javascript
if (datos.app === 'CHQ_SWING_SIMPLE') return guardarSwingSimpleCHQ(datos);
```

Si tu variable tiene otro nombre, usa ese nombre en los dos lugares de la línea. Conserva todas las rutas y funciones existentes para las otras prácticas.

4. Guarda. En el selector de funciones elige **crearClaveCoachSwingCHQ** y ejecútala. Si solicita autorización, autoriza con tu cuenta del Sheet. El registro de ejecución muestra la clave del coach. Si ya existe `CHQ_COACH_KEY`, conserva esa misma clave. No publiques la clave en GitHub.
5. Ve a **Implementar → Administrar implementaciones → lápiz → Nueva versión → Implementar**. Usa la implementación actual: la URL termina en `/exec` y se conserva. Debe ejecutarse como tú y permitir el acceso requerido por la app.

El destino es el archivo de Sheets existente:
https://docs.google.com/spreadsheets/d/180IUIA1jS9uNSPmiKMR1fZbK_xUZIaK9d3Fv5YErbRs/edit

La primera evaluación enviada crea allí la pestaña **CHQ Swing - Evaluaciones**, con una columna por comentario y títulos en los dos idiomas. No modifica las pestañas anteriores. Cada edición enviada tiene su propia revisión; un reintento de la misma revisión no crea una fila duplicada.

## 2. Actualizar la app existente

En https://github.com/Chelele1/chq-student-evaluation entra en **Add file → Upload files**. Sube únicamente estos tres archivos directamente a la raíz del repositorio, reemplazando los que tengan el mismo nombre:

* `index.html`
* `manifest.webmanifest`
* `chq-logo.png`

No subas `SwingEvaluation.gs`, estas instrucciones ni `field-schema.json` a GitHub. El logo pequeño de la página está incluido en el HTML; `chq-logo.png` es el icono del iPhone.

## 3. Probar el envío

Abre https://chelele1.github.io/chq-student-evaluation/ y escribe una evaluación de prueba. En **Acceso del coach · Sheets** introduce tu clave. Solo el nombre y la fecha de evaluación son obligatorios; el ID del alumno se conserva automáticamente.

Pulsa **Finalizar y enviar a Sheets** y comprueba la fila en **CHQ Swing - Evaluaciones**. La app confirma el guardado central únicamente cuando recibe la respuesta correcta del servidor. Si falla, conserva la evaluación local y permite reintentar.

## 4. Abrir en el iPhone sin la barra del navegador

Una vez publicada la actualización, abre la página en Safari, pulsa **Compartir → Añadir a pantalla de inicio** y crea un icono nuevo. Si aparece **Abrir como app web**, actívalo. Sal de Safari y abre ese icono desde la pantalla de inicio.

El modo `standalone` y la configuración de Apple están incluidos. La barra sigue apareciendo al abrir directamente el enlace en un navegador. La comprobación final se hace desde el icono del iPhone.

Conserva el icono anterior y descarga una copia de seguridad antes de cambiar de instalación. El guardado local de una instalación nueva puede estar separado del navegador anterior. No borres los datos de Safari. Si necesitas tus registros locales anteriores, abre **Evaluaciones guardadas → Descargar copia de seguridad** en la instalación anterior y luego **Restaurar copia de seguridad** en la nueva.

## Comprobaciones realizadas

Se verificaron los comentarios bilingües, FDN, P7.5, persistencia local, conservación de registros anteriores, nueva evaluación del mismo alumno, confirmación y reintento del envío, rechazo de una clave incorrecta, fechas válidas, prevención de duplicados y protección contra fórmulas en las opiniones.

Las pruebas de la conexión utilizaron un Sheet simulado. Todavía falta comprobar el envío real en tu implementación y la apertura desde el icono de tu iPhone.
