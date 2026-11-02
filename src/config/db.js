const dns = require('dns');
const mongoose = require('mongoose');

dns.setServers(['8.8.8.8', '1.1.1.1']);

async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('❌ MONGO_URI manquant dans le fichier .env');
    process.exit(1);
  }
  try {
    await mongoose.connect(uri);
    console.log(`✅ MongoDB connecté (base : ${mongoose.connection.name})`);
  } catch (err) {
    console.error('❌ Connexion MongoDB impossible :', err.message);
    process.exit(1);
  }
}

module.exports = connectDB;