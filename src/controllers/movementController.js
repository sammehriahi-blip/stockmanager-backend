const StockMovement = require('../models/StockMovement');

// GET /api/movements (bonus : historique)
exports.getMovements = async (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 100, 500);
    const movements = await StockMovement.find().sort({ date: -1 }).limit(limit);
    res.json(movements);
  } catch (err) {
    next(err);
  }
};
