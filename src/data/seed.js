// Remplit la base avec des produits de démonstration : npm run seed
require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');
const StockMovement = require('../models/StockMovement');
const products = [
  { name: 'Clavier Logitech K120', reference: 'ELEC-001', category: 'Électronique', quantity: 25, price: 45, supplier: 'TechPro' },
  { name: 'Écran Samsung 24"', reference: 'ELEC-002', category: 'Électronique', quantity: 8, price: 320, supplier: 'TechPro' },
  { name: 'Souris sans fil', reference: 'ELEC-003', category: 'Électronique', quantity: 4, price: 30, supplier: 'TechPro' },
  { name: 'Chaise de bureau', reference: 'MOB-001', category: 'Mobilier', quantity: 3, price: 180, supplier: 'OfficePlus' },
  { name: 'Bureau 120 cm', reference: 'MOB-002', category: 'Mobilier', quantity: 6, price: 260, supplier: 'OfficePlus' },
  { name: 'Ramette papier A4', reference: 'CONS-001', category: 'Consommable', quantity: 0, price: 12, supplier: 'PaperCo' },
  { name: 'Cartouche encre noire', reference: 'CONS-002', category: 'Consommable', quantity: 14, price: 38, supplier: 'PaperCo' },
  { name: 'Stylos bleus (boîte)', reference: 'FOUR-001', category: 'Fournitures', quantity: 2, price: 6, supplier: 'PaperCo' },
  { name: 'Classeurs A4', reference: 'FOUR-002', category: 'Fournitures', quantity: 40, price: 4.5, supplier: 'PaperCo' },
];
(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await Product.deleteMany({});
    await StockMovement.deleteMany({});
    await Product.insertMany(products);
    console.log(`✅ ${products.length} produits ajoutés`);
  } catch (err) {
    console.error('❌ Erreur seed :', err.message);
  } finally {
    await mongoose.disconnect();
  }
})();
