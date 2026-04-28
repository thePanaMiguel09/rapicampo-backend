const { pool } = require('../config/postgres.config')

async function cercanos(req, res, next) {
  const { lat, lng, radio = 5 } = req.query
  if (!lat || !lng) return res.status(400).json({ error: 'lat y lng requeridos' })
  try {
    const { rows } = await pool.query(
      `SELECT c.*, u.nombre, u.rating,
        (6371 * acos(cos(radians($1))*cos(radians(c.lat_actual))
         *cos(radians(c.lng_actual)-radians($2))+sin(radians($1))*sin(radians(c.lat_actual))))
        AS distancia_km
       FROM conductores c JOIN usuarios u ON u.id = c.usuario_id
       WHERE c.disponible=TRUE AND c.lat_actual IS NOT NULL
       HAVING (6371 * acos(cos(radians($1))*cos(radians(c.lat_actual))
         *cos(radians(c.lng_actual)-radians($2))+sin(radians($1))*sin(radians(c.lat_actual)))) < $3
       ORDER BY distancia_km LIMIT 10`,
      [lat, lng, radio]
    )
    res.json(rows)
  } catch (err) { next(err) }
}

async function setDisponible(req, res, next) {
  try {
    await pool.query(`UPDATE conductores SET disponible=$1 WHERE usuario_id=$2`, [req.body.disponible, req.user.id])
    res.json({ disponible: req.body.disponible })
  } catch (err) { next(err) }
}

async function setUbicacion(req, res, next) {
  const { lat, lng } = req.body
  try {
    await pool.query(
      `UPDATE conductores SET lat_actual=$1, lng_actual=$2, ultima_ubicacion=NOW() WHERE usuario_id=$3`,
      [lat, lng, req.user.id]
    )
    res.json({ ok: true })
  } catch (err) { next(err) }
}

module.exports = { cercanos, setDisponible, setUbicacion }
