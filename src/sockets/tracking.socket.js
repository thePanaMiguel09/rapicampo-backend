const jwt      = require('jsonwebtoken')
const Ubicacion = require('../models/ubicacion.model')
const { pool } = require('../config/postgres.config')
const { calcularETA } = require('../utils/geo.util')

module.exports = function initSockets(io) {
  io.use((socket, next) => {
    try {
      socket.user = jwt.verify(socket.handshake.auth?.token, process.env.JWT_SECRET)
      next()
    } catch { next(new Error('Token inválido')) }
  })

  io.on('connection', (socket) => {
    socket.on('tracking:join', ({ solicitudId }) => socket.join(`solicitud:${solicitudId}`))

    socket.on('conductor:ubicacion', async ({ solicitudId, lat, lng }) => {
      try {
        await Ubicacion.create({ solicitudId, conductorId: socket.user.id, lat, lng })
        await pool.query(
          `UPDATE conductores SET lat_actual=$1, lng_actual=$2, ultima_ubicacion=NOW() WHERE usuario_id=$3`,
          [lat, lng, socket.user.id]
        )
        let eta = null
        const { rows } = await pool.query(`SELECT destino_lat, destino_lng FROM solicitudes WHERE id=$1`, [solicitudId])
        if (rows[0]?.destino_lat) {
          const r = await calcularETA(lng, lat, rows[0].destino_lng, rows[0].destino_lat).catch(() => null)
          if (r) eta = r.eta_minutos
        }
        io.to(`solicitud:${solicitudId}`).emit('tracking:update', { lat, lng, eta, ts: new Date() })
      } catch (err) { console.error('Socket error:', err.message) }
    })
  })
}
