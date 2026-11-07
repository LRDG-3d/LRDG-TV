import { useEffect, useState } from 'react'

const KEY = 'rosanatv_eps'

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]')
  } catch {
    return []
  }
}

export default function useEpisodes() {
  const [eps, setEps] = useState(load)

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(eps))
    } catch {}
  }, [eps])

  const add = (ep) => setEps((list) => [...list, ep])
  const remove = (index) => setEps((list) => list.filter((_, i) => i !== index))

  return { eps, add, remove }
}
