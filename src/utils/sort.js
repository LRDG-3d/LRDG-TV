// Orden numérico: primero por temporada y luego por número de episodio
export const byNumber = (a, b) =>
  (Number(a.s) || 0) - (Number(b.s) || 0) || (Number(a.e) || 0) - (Number(b.e) || 0)
