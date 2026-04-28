/**
 * RAPPICAMPO — Backend Node.js 22 LTS
 * Puerto: 4000
 */
require('dotenv').config({ path: '../../.env' })

const express    = require('express')
const http       = require('http')
const cors       = require('cors')
const { Server } = require('socket.io')

const { connectPostgres } = require('./config/postgres.config')
const { connectMongo }    = require('./config/mongo.config')
const { connectRedis }    = require('./config/redis.config')
const initSockets         = require('./sockets/tracking.socket')

const authRouter        = require('./routes/auth.routes')
const solicitudRouter   = require('./routes/solicitud.routes')
const conductorRouter   = require('./routes/conductor.routes')
const trackingRouter    = require('./routes/tracking.routes')

const errorMiddleware = require('./middleware/error.middleware')

const app    = express()
const server = http.createServer(app)
const io     = new Server(server, { cors: { origin: '*' } })

app.use(cors())
app.use(express.json())
app.use((req, _, next) => { req.io = io; next() })

app.use('/api/auth',        authRouter)
app.use('/api/solicitudes', solicitudRouter)
app.use('/api/conductores', conductorRouter)
app.use('/api/tracking',    trackingRouter)
app.get('/api/health',  (_, res) => res.json({ ok: true, ts: new Date() }))

app.use(errorMiddleware)

initSockets(io)

const PORT = process.env.PORT || 4000;
(async () => {
  await connectPostgres()
  await connectMongo()
  await connectRedis()
  server.listen(PORT, () => console.log(`🏍️  API en http://localhost:${PORT}`))
})()
