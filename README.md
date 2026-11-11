# LA ROSANA TV

React + Vite + Firebase (Authentication y Firestore). Empieza vacía.

## Uso
```bash
npm install
npm run dev
npm run build
```

## Firebase (proyecto lrdg-tv)
1. Authentication -> Sign-in method -> activa Correo electrónico/contraseña.
2. Authentication -> Usuarios -> agrega tu usuario admin.
3. Firestore Database -> crea la base de datos.
4. Firestore -> Reglas -> pega el contenido de `firestore.rules` (con tu correo) y publica.
5. Authentication -> Configuración -> Dominios autorizados -> agrega el dominio donde publiques la página.

Los capítulos se guardan en la colección `episodios`. Solo el correo admin de las reglas puede agregar o borrar.

## Panel de administrador
Entra a `https://lrdg-3d.github.io/LRDG-TV/#/admin` e inicia sesión. Se abre un panel con menú lateral: Resumen, Temporadas, Capítulos y Estrenos, donde puedes agregar y borrar.
Los visitantes no ven ningún botón de administrador.

## Publicación
El archivo `.github/workflows/deploy.yml` publica la página en GitHub Pages en cada push a `main`
(Settings -> Pages -> Source: GitHub Actions).

## Datos en Firestore
- `temporadas`: número (`n`) y nombre opcional
- `episodios`: título, temporada (`s`), episodio (`e`), duración y enlace
- `estrenos`: título, fecha (`f`), hora (`h`), temporada y episodio

Publica de nuevo `firestore.rules` en Firebase (con tu correo): ahora cubre las tres colecciones.

## Reproductor
Al tocar un capítulo se abre el reproductor (`#/ver/<id>`).
- Vertical: video arriba, ficha del capítulo y siguientes capítulos.
- Horizontal (o pantalla completa): panel de cristal, tarjeta de siguiente capítulo y botón "Saltar intro".
- Enlaces válidos: video directo (.mp4/.webm), YouTube, Vimeo o Google Drive (compartido como "Cualquiera con el enlace").
  Con YouTube, Vimeo y Drive se usan los controles propios de esos servicios.

## Duración y miniatura automáticas
Al pegar el enlace en "Agregar capítulo":
- Video directo (.mp4/.webm): detecta la duración; la miniatura se toma de un fotograma si el servidor lo permite.
- YouTube: miniatura y duración automáticas.
- Vimeo: miniatura y duración automáticas.
- Google Drive: miniatura automática; la duración se escribe a mano.
También puedes elegir una imagen de tu teléfono como miniatura.

## Escanear la URL
- Al agregar o editar un capítulo, el botón "Escanear URL" lee la duración y la miniatura del enlace.
- En Admin -> Capítulos, "Escanear todos" completa la duración y la miniatura de los capítulos que no las tengan.
- El icono de lápiz en cada capítulo permite editarlo.

## Varias series
- Admin -> Series: agrega cada serie con carátula, información y un color.
- Temporadas, capítulos y estrenos pertenecen a una serie (se elige arriba en cada sección).
- Al abrir una serie, toda la página se pinta con su color.
- Si ya tenías capítulos de antes, Admin -> Series muestra un aviso para asignarlos a una serie.
- Publica de nuevo `firestore.rules`: ahora incluye la colección `series`.
