const { pool }         = require('../config/postgres.config')
const { calcularETA }  = require('../utils/geo.util')

async function listar(req, res, next) {
  try {
    let query, params
    if (req.user.rol === 'ciudadano') {
      query  = `SELECT s.*, u.nombre AS conductor_nombre FROM solicitudes s
                LEFT JOIN usuarios u ON u.id = s.conductor_id
                WHERE s.ciudadano_id = $1 ORDER BY s.creado_en DESC LIMIT 20`
      params = [req.user.id]
    } else {
      query  = `SELECT s.*, u.nombre AS ciudadano_nombre FROM solicitudes s
                JOIN usuarios u ON u.id = s.ciudadano_id
                WHERE s.estado = 'pendiente' ORDER BY s.creado_en DESC`
      params = []
    }
    const { rows } = await pool.query(query, params)
    res.json(rows)
  } catch (err) { next(err) }
}

async function crear(req, res, next) {
  const { tipo, descripcion, peso_aprox, origen_dir, origen_lat, origen_lng,
          destino_dir, destino_lat, destino_lng, pago_ofrecido } = req.body
  try {
    let eta = null, distancia = null
    if (origen_lat && destino_lat) {
      try {
        const r = await calcularETA(origen_lng, origen_lat, destino_lng, destino_lat)
        if (r) { eta = r.eta_minutos; distancia = r.distancia_km }
      } catch { /* OSRM opcional */ }
    }
    const { rows } = await pool.query(
      `INSERT INTO solicitudes
       (ciudadano_id, tipo, descripcion, peso_aprox,
        origen_dir, origen_lat, origen_lng,
        destino_dir, destino_lat, destino_lng,
        pago_ofrecido, eta_minutos, distancia_km)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
      [req.user.id, tipo, descripcion, peso_aprox||null,
       origen_dir, origen_lat||null, origen_lng||null,
       destino_dir, destino_lat||null, destino_lng||null,
       pago_ofrecido||null, eta, distancia]
    )
    req.io.emit('solicitud:nueva', rows[0])
    res.status(201).json(rows[0])
  } catch (err) { next(err) }
}

async function aceptar(req, res, next) {
  try {
    const { rows } = await pool.query(
      `UPDATE solicitudes SET conductor_id=$1, estado='aceptada', aceptado_en=NOW()
       WHERE id=$2 AND estado='pendiente' RETURNING *`,
      [req.user.id, req.params.id]
    )
    if (!rows.length) return res.status(409).json({ error: 'Solicitud ya tomada' })
    req.io.to(`solicitud:${req.params.id}`).emit('solicitud:actualizada', rows[0])
    res.json(rows[0])
  } catch (err) { next(err) }
}

async function actualizarEstado(req, res, next) {
  const { estado } = req.body
  const validos = ['en_camino','recogido','entregado','cancelado']
  if (!validos.includes(estado)) return res.status(400).json({ error: 'Estado inválido' })
  try {
    const extra = estado === 'entregado' ? ', entregado_en=NOW()' : ''
    const { rows } = await pool.query(
      `UPDATE solicitudes SET estado=$1 ${extra} WHERE id=$2 RETURNING *`,
      [estado, req.params.id]
    )
    req.io.to(`solicitud:${req.params.id}`).emit('solicitud:actualizada', rows[0])
    res.json(rows[0])
  } catch (err) { next(err) }
}

async function calificar(req, res, next) {
  const { estrellas, comentario, para_usuario } = req.body
  try {
    const { rows } = await pool.query(
      `INSERT INTO calificaciones (solicitud_id, de_usuario, para_usuario, estrellas, comentario)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [req.params.id, req.user.id, para_usuario, estrellas, comentario||null]
    )
    res.status(201).json(rows[0])
  } catch (err) { next(err) }
}

module.exports = { listar, crear, aceptar, actualizarEstado, calificar }
