const { body, validationResult } = require('express-validator')

const crearRules = [
  body('tipo').isIn(['llevar','traer']).withMessage('Tipo inválido'),
  body('descripcion').trim().notEmpty().withMessage('Descripción requerida'),
  body('origen_dir').trim().notEmpty().withMessage('Origen requerido'),
  body('destino_dir').trim().notEmpty().withMessage('Destino requerido'),
]

function validar(req, res, next) {
  const errores = validationResult(req)
  if (!errores.isEmpty()) return res.status(400).json({ error: errores.array()[0].msg })
  next()
}

module.exports = { crearRules, validar }
