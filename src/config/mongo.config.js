const mongoose = require('mongoose')

async function connectMongo() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://mongodb:27017/rappicampo_tracking')
  console.log('✅ MongoDB 8 conectado')
}

module.exports = { connectMongo }
