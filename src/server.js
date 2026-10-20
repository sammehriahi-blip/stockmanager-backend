require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middlewares/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());

// Log simple de chaque requête (utile pendant la démo)
app.use((req, _res, next) => {
  console.log(`${new Date().toLocaleTimeString('fr-FR')}  ${req.method} ${req.originalUrl}`);
  next();
});

app.get('/api', (_req, res) => res.json({ message: 'API StockManager opérationnelle 🚀' }));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/movements', require('./routes/movementRoutes'));

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  // 0.0.0.0 : accessible depuis le téléphone sur le même Wi-Fi
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 API démarrée sur http://localhost:${PORT}/api`);
  });
});
