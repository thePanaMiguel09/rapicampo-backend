const router = require('express').Router()
const ctrl   = require('../controllers/tracking.controller')
const { authMiddleware } = require('../middleware/auth.middleware')

router.get('/:id',  authMiddleware, ctrl.historial)
router.post('/:id', authMiddleware, ctrl.guardar)

module.exports = router
