const Product = require('../models/Product');
const StockMovement = require('../models/StockMovement');
const { LOW_STOCK_THRESHOLD } = require('./dashboardController');

const SORT_FIELDS = ['name', 'price', 'quantity', 'createdAt'];

function cleanBarcode(body) {
  const data = { ...body };
  if (typeof data.barcode === 'string') data.barcode = data.barcode.trim();
  const removeBarcode = data.barcode === '' || data.barcode === null;
  if (removeBarcode) delete data.barcode;
  return { data, removeBarcode };
}

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

exports.getByBarcode = async (req, res, next) => {
  try {
    const product = await Product.findOne({ barcode: req.params.code.trim() });
    if (!product) return res.status(404).json({ message: 'Aucun produit avec ce code-barres' });
    res.json(product);
  } catch (err) {
    next(err);
  }
};

exports.getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Produit introuvable' });
    res.json(product);
  } catch (err) {
    next(err);
  }
};

exports.createProduct = async (req, res, next) => {
  try {
    const { data } = cleanBarcode(req.body);
    const product = await Product.create(data);
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

exports.updateProduct = async (req, res, next) => {
  try {
    const { data, removeBarcode } = cleanBarcode(req.body);
    const update = removeBarcode ? { ...data, $unset: { barcode: 1 } } : data;
    const product = await Product.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    });
    if (!product) return res.status(404).json({ message: 'Produit introuvable' });
    res.json(product);
  } catch (err) {
    next(err);
  }
};

exports.updateStock = async (req, res, next) => {
  try {
    const delta = Number(req.body.delta);
    if (!Number.isInteger(delta) || delta === 0) {
      return res.status(400).json({ message: 'delta doit être un entier non nul' });
    }

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

exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Produit introuvable' });
    res.json({ message: 'Produit supprimé', id: req.params.id });
  } catch (err) {
    next(err);
  }
};