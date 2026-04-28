const jwt = require('jsonwebtoken')

function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ error: 'Token requerido' })
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET)
    next()
  } catch {
    res.status(401).json({ error: 'Token inválido' })
  }
}

function requireRole(rol) {
  return (req, res, next) =>
    req.user?.rol === rol ? next() : res.status(403).json({ error: `Requiere rol: ${rol}` })
}

module.exports = { authMiddleware, requireRole }
