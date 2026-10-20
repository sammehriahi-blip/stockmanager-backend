const mongoose = require('mongoose');

const CATEGORIES = ['Électronique', 'Mobilier', 'Consommable', 'Fournitures'];

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Le nom est obligatoire'], trim: true },
    reference: {
      type: String,
      required: [true, 'La référence est obligatoire'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'La catégorie est obligatoire'],
      enum: { values: CATEGORIES, message: 'Catégorie invalide' },
    },
    quantity: {
      type: Number,
      required: [true, 'La quantité est obligatoire'],
      min: [0, 'La quantité doit être positive'],
      validate: { validator: Number.isInteger, message: 'La quantité doit être un entier' },
    },
    price: {
      type: Number,
      required: [true, 'Le prix est obligatoire'],
      min: [0.01, 'Le prix doit être supérieur à 0'],
    },
    supplier: { type: String, required: [true, 'Le fournisseur est obligatoire'], trim: true },
  },
  { timestamps: true }
);

// Renvoie "id" au lieu de "_id" pour que l'app mobile reste simple
productSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});

module.exports = mongoose.model('Product', productSchema);
module.exports.CATEGORIES = CATEGORIES;
