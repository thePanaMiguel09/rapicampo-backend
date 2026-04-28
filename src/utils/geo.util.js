const axios = require('axios')

async function calcularETA(fromLng, fromLat, toLng, toLat) {
  const base = process.env.OSRM_BASE_URL || 'https://router.project-osrm.org'
  const url  = `${base}/route/v1/driving/${fromLng},${fromLat};${toLng},${toLat}?overview=false`
  const { data } = await axios.get(url, { timeout: 5000 })
  if (!data.routes?.[0]) return null
  return {
    eta_minutos:  Math.ceil(data.routes[0].duration / 60),
    distancia_km: +(data.routes[0].distance / 1000).toFixed(2),
  }
}

module.exports = { calcularETA }
