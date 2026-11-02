const LOW_STOCK_THRESHOLD = 5;
exports.LOW_STOCK_THRESHOLD = LOW_STOCK_THRESHOLD;
exports.getDashboard = async (_req, res, next) => {
  try {
    const Product = require('../models/Product');
    const { CATEGORIES } = Product;

    const [totals] = await Product.aggregate([
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          totalUnits: { $sum: '$quantity' },
          totalValue: { $sum: { $multiply: ['$quantity', '$price'] } },
        },
      },
    ]);

    const byCategoryRaw = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          value: { $sum: { $multiply: ['$quantity', '$price'] } },
        },
      },
    ]);
    const byCategory = CATEGORIES.map((category) => {
      const found = byCategoryRaw.find((c) => c._id === category);
      return { category, count: found ? found.count : 0, value: found ? found.value : 0 };
    });

    const lowStock = await Product.find({ quantity: { $gt: 0, $lt: LOW_STOCK_THRESHOLD } }).sort({ quantity: 1 });
    const outOfStock = await Product.find({ quantity: 0 }).sort({ name: 1 });

    res.json({
      totalProducts: totals ? totals.totalProducts : 0,
      totalUnits: totals ? totals.totalUnits : 0,
      totalValue: totals ? Math.round(totals.totalValue * 100) / 100 : 0,
      lowStock,
      outOfStock,
      byCategory,
    });
  } catch (err) {
    next(err);
  }
};
