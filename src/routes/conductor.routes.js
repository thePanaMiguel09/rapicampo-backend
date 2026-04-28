const router = require('express').Router()
const ctrl   = require('../controllers/conductor.controller')
const { authMiddleware, requireRole } = require('../middleware/auth.middleware')

router.get('/cercanos',     ctrl.cercanos)
router.put('/disponible',   authMiddleware, requireRole('conductor'), ctrl.setDisponible)
router.put('/ubicacion',    authMiddleware, requireRole('conductor'), ctrl.setUbicacion)

module.exports = router
