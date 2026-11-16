/*
 * CATÁLOGO DE PRODUCCIONES
 * ------------------------------------------------------------------
 * Para agregar una producción, añade una línea con la función de su
 * categoría. Ejemplo:
 *
 *   novela('Mi telenovela', 2010, { sinopsis: '...', episodios: 120 })
 *
 * Campos opcionales (null = "Desconocido" en la ficha):
 *   genero, sinopsis, temporadas, episodios, portada,
 *   temporadasDetalle: [{ numero: 1, anio: 2004, episodios: 100 }]
 *
 * PORTADAS: coloca la imagen en public/portadas/ (solo si tienes derecho
 * a usarla) y escribe portada: 'portadas/archivo.jpg'. También se acepta
 * una URL completa. Si no hay portada, se genera un póster con el título.
 *
 * Solo se incluyen datos verificados; lo demás queda en null.
 */

export const categorias = ['Telenovelas', 'Series', 'Comedias', 'Programas juveniles', 'Producciones infantiles']

const slug = (s) =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

const crear = (categoria, temporadasBase) => (titulo, anio, extra = {}) => ({
  id: `${slug(titulo)}-${anio}`,
  titulo,
  anio,
  categoria,
  genero: null,
  sinopsis: null,
  temporadas: temporadasBase,
  episodios: null,
  portada: null,
  temporadasDetalle: [],
  ...extra,
})

export const novela = crear('Telenovelas', 1)
export const serie = crear('Series', null)
export const comedia = crear('Comedias', null)
export const juvenil = crear('Programas juveniles', null)
export const infantil = crear('Producciones infantiles', null)

export const producciones = [
  // Agrega aquí tus producciones. Ejemplo:
  // novela('Título de la telenovela', 2005, { sinopsis: '...', episodios: 100 }),
  // serie('Título de la serie', 2010),
]
