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
Entra a `https://lrdg-3d.github.io/LRDG-TV/#/admin`, inicia sesión y podrás agregar y borrar capítulos.
Los visitantes no ven ningún botón de administrador.

## Publicación
El archivo `.github/workflows/deploy.yml` publica la página en GitHub Pages en cada push a `main`
(Settings -> Pages -> Source: GitHub Actions).

## Datos en Firestore
- `temporadas`: número (`n`) y nombre opcional
- `episodios`: título, temporada (`s`), episodio (`e`), duración y enlace
- `estrenos`: título, fecha (`f`), hora (`h`), temporada y episodio

Publica de nuevo `firestore.rules` en Firebase (con tu correo): ahora cubre las tres colecciones.
