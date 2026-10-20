const mongoose = require('mongoose');

// Bonus : historique de chaque entrée / sortie de stock
const movementSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    productName: { type: String, required: true },
    delta: { type: Number, required: true },
    type: { type: String, enum: ['entree', 'sortie', 'creation'], required: true },
    quantityAfter: { type: Number, required: true },
  },
  { timestamps: { createdAt: 'date', updatedAt: false } }
);

movementSchema.set('toJSON', {
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    ret.productId = ret.product.toString();
    delete ret._id;
    delete ret.product;
    return ret;
  },
});

module.exports = mongoose.model('StockMovement', movementSchema);
