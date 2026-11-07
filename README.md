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
