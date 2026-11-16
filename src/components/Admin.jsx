import { useEffect, useState } from 'react'
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { addDoc, collection, deleteDoc, doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { auth, db, firebaseListo } from '../firebase.js'
import { categorias } from '../data/catalogo.js'
import { ARCHIVE_URL, listarZips } from '../lib/archive.js'

const vacio = { titulo: '', categoria: categorias[0], anio: '', sinopsis: '', portadaUrl: '', almacenUrl: '', genero: '', temporadas: '', episodios: '', reparto: '' }

// Reduce la imagen a ~400 px y la guarda como JPG pequeño (cabe en Firestore, sin Storage).
const comprimir = (file) =>
  new Promise((ok, mal) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const e = Math.min(1, 400 / img.width)
      const c = document.createElement('canvas')
      c.width = Math.round(img.width * e)
      c.height = Math.round(img.height * e)
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height)
      URL.revokeObjectURL(url)
      ok(c.toDataURL('image/jpeg', 0.8))
    }
    img.onerror = () => mal(new Error('No se pudo leer la imagen.'))
    img.src = url
  })

function Login() {
  const [correo, setCorreo] = useState('')
  const [clave, setClave] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  const entrar = async (e) => {
    e.preventDefault()
    setError('')
    setCargando(true)
    try {
      await signInWithEmailAndPassword(auth, correo.trim(), clave)
    } catch {
      setError('Correo o contraseña incorrectos.')
    }
    setCargando(false)
  }

  return (
    <form className="admin__card admin__login" onSubmit={entrar}>
      <h1>Iniciar sesión</h1>
      <label>Correo<input type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} required autoComplete="username" /></label>
      <label>Contraseña<input type="password" value={clave} onChange={(e) => setClave(e.target.value)} required autoComplete="current-password" /></label>
      {error && <p className="admin__error">{error}</p>}
      <button className="btn" disabled={cargando}>{cargando ? 'Entrando…' : 'Entrar'}</button>
    </form>
  )
}

function Panel({ usuario, remotas }) {
  const [f, setF] = useState(vacio)
  const [archivo, setArchivo] = useState('')
  const [editId, setEditId] = useState(null)
  const [msg, setMsg] = useState({ tipo: '', texto: '' })
  const [guardando, setGuardando] = useState(false)

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const portada = archivo || f.portadaUrl.trim()

  const subirImagen = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try { setArchivo(await comprimir(file)) } catch (err) { setMsg({ tipo: 'error', texto: err.message }) }
  }

  const comprobar = async () => {
    setMsg({ tipo: '', texto: 'Comprobando…' })
    try {
      const zips = await listarZips(f.almacenUrl)
      setMsg({ tipo: 'ok', texto: `Se encontraron ${zips.length} archivo(s) .zip.` })
    } catch (err) {
      setMsg({ tipo: 'error', texto: err.message })
    }
  }

  const limpiar = () => { setF(vacio); setArchivo(''); setEditId(null) }

  const guardar = async (e) => {
    e.preventDefault()
    const zip = f.almacenUrl.trim()
    if (zip && !ARCHIVE_URL.test(zip)) return setMsg({ tipo: 'error', texto: 'Usa un enlace de archive.org, por ejemplo https://archive.org/download/IDENTIFICADOR' })
    const anio = Number(f.anio)
    if (!Number.isInteger(anio) || anio < 1950 || anio > 2100) return setMsg({ tipo: 'error', texto: 'Escribe un año válido.' })

    const num = (v) => (v === '' ? null : Number(v))
    const temporadas = num(f.temporadas)
    const episodios = num(f.episodios)
    if ([temporadas, episodios].some((n) => n !== null && (!Number.isInteger(n) || n < 1))) return setMsg({ tipo: 'error', texto: 'Temporadas y episodios deben ser números enteros mayores a 0.' })
    const reparto = f.reparto.split('\n').map((l) => l.trim()).filter(Boolean).map((l) => {
      const [nombre, ...resto] = l.split('/')
      return { nombre: nombre.trim(), personaje: resto.join('/').trim() || null }
    })

    const datos = { genero: f.genero.trim() || null, temporadas, episodios, reparto, titulo: f.titulo.trim(), categoria: f.categoria, anio, sinopsis: f.sinopsis.trim() || null, portada: portada || null, almacenUrl: zip || null }
    setGuardando(true)
    try {
      if (editId) await setDoc(doc(db, 'producciones', editId), datos, { merge: true })
      else await addDoc(collection(db, 'producciones'), { ...datos, creado: serverTimestamp() })
      setMsg({ tipo: 'ok', texto: editId ? 'Cambios guardados.' : 'Producción agregada.' })
      limpiar()
    } catch (err) {
      setMsg({ tipo: 'error', texto: err.code === 'permission-denied' ? 'Tu cuenta no tiene permiso para guardar. Revisa las reglas de Firestore.' : 'No se pudo guardar. Intenta de nuevo.' })
    }
    setGuardando(false)
  }

  const editar = (p) => {
    setEditId(p.id)
    setF({ titulo: p.titulo, categoria: p.categoria, anio: String(p.anio), sinopsis: p.sinopsis || '', portadaUrl: p.portada?.startsWith('data:') ? '' : p.portada || '', almacenUrl: p.almacenUrl || '', genero: p.genero || '', temporadas: p.temporadas ? String(p.temporadas) : '', episodios: p.episodios ? String(p.episodios) : '', reparto: (p.reparto || []).map((x) => (x.personaje ? `${x.nombre} / ${x.personaje}` : x.nombre)).join('\n') })
    setArchivo(p.portada?.startsWith('data:') ? p.portada : '')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const borrar = async (p) => {
    if (!window.confirm(`¿Eliminar «${p.titulo}»?`)) return
    try { await deleteDoc(doc(db, 'producciones', p.id)) } catch { setMsg({ tipo: 'error', texto: 'No se pudo eliminar.' }) }
  }

  return (
    <>
      <div className="admin__top">
        <h1>Administrar catálogo</h1>
        <span>{usuario.email}</span>
        <button className="btn btn--ghost" onClick={() => signOut(auth)}>Cerrar sesión</button>
      </div>

      <form className="admin__card" onSubmit={guardar}>
        <h2>{editId ? 'Editar producción' : 'Agregar producción'}</h2>
        <label>Título<input value={f.titulo} onChange={set('titulo')} required /></label>
        <div className="admin__row">
          <label>Categoría
            <select value={f.categoria} onChange={set('categoria')}>{categorias.map((c) => <option key={c}>{c}</option>)}</select>
          </label>
          <label>Año de estreno<input type="number" value={f.anio} onChange={set('anio')} required min="1950" max="2100" /></label>
        </div>
        <div className="admin__row">
          <label>Género (opcional)<input value={f.genero} onChange={set('genero')} placeholder="Drama, comedia…" /></label>
          <label>Temporadas (opcional)<input type="number" min="1" value={f.temporadas} onChange={set('temporadas')} /></label>
          <label>Episodios (opcional)<input type="number" min="1" value={f.episodios} onChange={set('episodios')} /></label>
        </div>
        <label>Sinopsis (opcional)<textarea rows="3" value={f.sinopsis} onChange={set('sinopsis')} /></label>

        <label>Reparto (opcional, uno por línea: Actor / Personaje)
          <textarea rows="3" value={f.reparto} onChange={set('reparto')} placeholder={'Nombre del actor / Personaje'} />
        </label>

        <label>Carátula: URL de imagen
          <input type="url" placeholder="https://..." value={f.portadaUrl} onChange={set('portadaUrl')} disabled={Boolean(archivo)} />
        </label>
        <label>O sube una imagen
          <input type="file" accept="image/*" onChange={subirImagen} />
        </label>
        {archivo && <button type="button" className="btn btn--ghost" onClick={() => setArchivo('')}>Quitar imagen subida</button>}
        {portada && <img className="admin__preview" src={portada} alt="Vista previa de la carátula" />}

        <label>URL de la carpeta de episodios (archive.org)
          <input type="url" placeholder="https://archive.org/download/IDENTIFICADOR" value={f.almacenUrl} onChange={set('almacenUrl')} />
        </label>
        <p className="admin__hint">El sitio detecta solo los archivos .zip de esa carpeta. Enlaza únicamente archivos que tengas derecho a compartir.</p>
        {f.almacenUrl.trim() && <button type="button" className="btn btn--ghost" onClick={comprobar}>Comprobar carpeta</button>}

        {msg.texto && <p className={msg.tipo === 'ok' ? 'admin__ok' : 'admin__error'}>{msg.texto}</p>}
        <div className="admin__row">
          <button className="btn" disabled={guardando}>{guardando ? 'Guardando…' : editId ? 'Guardar cambios' : 'Agregar'}</button>
          {editId && <button type="button" className="btn btn--ghost" onClick={limpiar}>Cancelar</button>}
        </div>
      </form>

      <h2 className="admin__sub">Producciones guardadas ({remotas.length})</h2>
      <ul className="admin__list">
        {remotas.length === 0 && <li>Aún no has agregado ninguna.</li>}
        {[...remotas].sort((a, b) => a.titulo.localeCompare(b.titulo, 'es')).map((p) => (
          <li key={p.id}>
            <span><b>{p.titulo}</b> · {p.anio} · {p.categoria}</span>
            <button className="btn btn--ghost" onClick={() => editar(p)}>Editar</button>
            <button className="btn btn--ghost" onClick={() => borrar(p)}>Eliminar</button>
          </li>
        ))}
      </ul>
    </>
  )
}

export default function Admin({ remotas }) {
  const [usuario, setUsuario] = useState(undefined)

  useEffect(() => (auth ? onAuthStateChanged(auth, setUsuario) : undefined), [])

  return (
    <section className="admin">
      <a className="back" href="#/">Volver al catálogo</a>
      {!firebaseListo ? (
        <div className="admin__card"><h1>Firebase sin configurar</h1><p>Pega tu configuración en <code>src/firebaseConfig.js</code>.</p></div>
      ) : usuario === undefined ? (
        <p className="admin__hint">Cargando…</p>
      ) : usuario ? (
        <Panel usuario={usuario} remotas={remotas} />
      ) : (
        <Login />
      )}
    </section>
  )
}
