module.exports = function errorMiddleware(err, req, res, next) {
  console.error(`[ERROR] ${req.method} ${req.path}:`, err.message)
  res.status(err.status || 500).json({ error: err.message || 'Error interno del servidor' })
}
