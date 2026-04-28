const mongoose = require('mongoose')

const ubicacionSchema = new mongoose.Schema({
  solicitudId: { type: String, required: true, index: true },
  conductorId: { type: String, required: true },
  lat:         { type: Number, required: true },
  lng:         { type: Number, required: true },
  ts:          { type: Date, default: Date.now, index: true },
})

ubicacionSchema.index({ ts: 1 }, { expireAfterSeconds: 604800 }) // TTL 7 días

module.exports = mongoose.model('Ubicacion', ubicacionSchema)
