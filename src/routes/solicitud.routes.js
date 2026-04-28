const router = require('express').Router()
const ctrl   = require('../controllers/solicitud.controller')
const { authMiddleware, requireRole } = require('../middleware/auth.middleware')
const { crearRules, validar } = require('../validations/solicitud.validation')

router.get('/',                 authMiddleware,                    ctrl.listar)
router.post('/',                authMiddleware, requireRole('ciudadano'), crearRules, validar, ctrl.crear)
router.put('/:id/aceptar',      authMiddleware, requireRole('conductor'), ctrl.aceptar)
router.put('/:id/estado',       authMiddleware,                    ctrl.actualizarEstado)
router.post('/:id/calificar',   authMiddleware,                    ctrl.calificar)

module.exports = router
