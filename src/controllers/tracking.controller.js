const Ubicacion = require('../models/ubicacion.model')

async function historial(req, res, next) {
  try {
    const puntos = await Ubicacion.find({ solicitudId: req.params.id }).sort({ ts: 1 }).select('lat lng ts -_id')
    res.json(puntos)
  } catch (err) { next(err) }
}

async function guardar(req, res, next) {
  const { lat, lng } = req.body
  try {
    await Ubicacion.create({ solicitudId: req.params.id, conductorId: req.user.id, lat, lng })
    req.io.to(`solicitud:${req.params.id}`).emit('tracking:update', { lat, lng, ts: new Date() })
    res.status(201).json({ ok: true })
  } catch (err) { next(err) }
}

module.exports = { historial, guardar }
