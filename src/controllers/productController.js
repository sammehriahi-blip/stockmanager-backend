const Product = require('../models/Product');
const StockMovement = require('../models/StockMovement');
const { LOW_STOCK_THRESHOLD } = require('./dashboardController');

const SORT_FIELDS = ['name', 'price', 'quantity', 'createdAt'];

// GET /api/products?search=&category=&status=&minPrice=&maxPrice=&sort=price&order=desc
exports.getProducts = async (req, res, next) => {
  try {
    const { search, category, status, minPrice, maxPrice, sort = 'name', order = 'asc' } = req.query;
    const filter = {};

    if (search) {
      const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [{ name: regex }, { reference: regex }];
    }
    if (category) filter.category = category;
    if (status === 'rupture') filter.quantity = 0;
    if (status === 'bas') filter.quantity = { $gt: 0, $lt: LOW_STOCK_THRESHOLD };
    if (status === 'disponible') filter.quantity = { $gte: LOW_STOCK_THRESHOLD };
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const sortField = SORT_FIELDS.includes(sort) ? sort : 'name';
    const products = await Product.find(filter)
      .sort({ [sortField]: order === 'desc' ? -1 : 1 })
      .collation({ locale: 'fr' });

    res.json(products);
  } catch (err) {
    next(err);
  }
};

// GET /api/products/:id
exports.getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Produit introuvable' });
    res.json(product);
  } catch (err) {
    next(err);
  }
};

// POST /api/products
exports.createProduct = async (req, res, next) => {
  try {
    const product = await Product.create(req.body);
    await StockMovement.create({
      product: product._id,
      productName: product.name,
      delta: product.quantity,
      type: 'creation',
      quantityAfter: product.quantity,
    });
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
};

// PUT /api/products/:id
exports.updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product) return res.status(404).json({ message: 'Produit introuvable' });
    res.json(product);
  } catch (err) {
    next(err);
  }
};

// PATCH /api/products/:id/stock   body : { "delta": 1 } ou { "delta": -1 }
exports.updateStock = async (req, res, next) => {
  try {
    const delta = Number(req.body.delta);
    if (!Number.isInteger(delta) || delta === 0) {
      return res.status(400).json({ message: 'delta doit être un entier non nul' });
    }

    // Mise à jour atomique : refuse si le stock deviendrait négatif
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, quantity: { $gte: -delta } },
      { $inc: { quantity: delta } },
      { new: true }
    );

    if (!product) {
      const exists = await Product.exists({ _id: req.params.id });
      return exists
        ? res.status(400).json({ message: 'Stock insuffisant' })
        : res.status(404).json({ message: 'Produit introuvable' });
    }

    await StockMovement.create({
      product: product._id,
      productName: product.name,
      delta,
      type: delta > 0 ? 'entree' : 'sortie',
      quantityAfter: product.quantity,
    });
    res.json(product);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/products/:id
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Produit introuvable' });
    res.json({ message: 'Produit supprimé', id: req.params.id });
  } catch (err) {
    next(err);
  }
};
