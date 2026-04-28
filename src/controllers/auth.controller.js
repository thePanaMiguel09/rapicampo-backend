const { pool }   = require('../config/postgres.config')
const { hash, compare } = require('../utils/bcrypt.util')
const { sign }   = require('../utils/jwt.util')

async function register(req, res, next) {
  const { nombre, telefono, email, password, rol, vehiculo, placa } = req.body
  try {
    const passwordHash = await hash(password)
    const { rows } = await pool.query(
      `INSERT INTO usuarios (nombre, telefono, email, password, rol)
       VALUES ($1,$2,$3,$4,$5) RETURNING id, nombre, telefono, rol, rating`,
      [nombre, telefono, email || null, passwordHash, rol]
    )
    const user = rows[0]
    if (rol === 'conductor') {
      await pool.query(
        `INSERT INTO conductores (usuario_id, vehiculo, placa) VALUES ($1,$2,$3)`,
        [user.id, vehiculo || null, placa || null]
      )
    }
    res.status(201).json({ token: sign({ id: user.id, rol: user.rol }), user })
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Teléfono ya registrado' })
    next(err)
  }
}

async function login(req, res, next) {
  const { telefono, password } = req.body
  try {
    const { rows } = await pool.query(
      `SELECT id, nombre, telefono, rol, password, rating FROM usuarios
       WHERE telefono = $1 AND activo = TRUE`, [telefono]
    )
    if (!rows.length) return res.status(401).json({ error: 'Credenciales inválidas' })
    const user = rows[0]
    if (!await compare(password, user.password)) return res.status(401).json({ error: 'Credenciales inválidas' })
    delete user.password
    res.json({ token: sign({ id: user.id, rol: user.rol }), user })
  } catch (err) { next(err) }
}

module.exports = { register, login }
