const { Pool } = require('pg')

const pool = new Pool({
  host:     process.env.POSTGRES_HOST || 'postgres',
  port:     process.env.POSTGRES_PORT || 5432,
  database: process.env.POSTGRES_DB,
  user:     process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  max: 10,
})

async function connectPostgres() {
  const client = await pool.connect()
  console.log('✅ PostgreSQL 17 conectado')
  client.release()
}

module.exports = { pool, connectPostgres }
