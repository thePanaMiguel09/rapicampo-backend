const { body, validationResult } = require('express-validator')

const registroRules = [
  body('nombre').trim().notEmpty().withMessage('Nombre requerido'),
  body('telefono').trim().notEmpty().withMessage('Teléfono requerido'),
  body('password').isLength({ min: 6 }).withMessage('Mínimo 6 caracteres'),
  body('rol').isIn(['ciudadano','conductor']).withMessage('Rol inválido'),
]

const loginRules = [
  body('telefono').trim().notEmpty(),
  body('password').notEmpty(),
]

function validar(req, res, next) {
  const errores = validationResult(req)
  if (!errores.isEmpty()) return res.status(400).json({ error: errores.array()[0].msg })
  next()
}

module.exports = { registroRules, loginRules, validar }
