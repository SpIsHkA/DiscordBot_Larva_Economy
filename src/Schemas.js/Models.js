const { model, Schema } = require('mongoose');

const productSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  promocodes: { type: [String], default: [] } // Список промокодов для товара
});

const Product = model('Product', productSchema);

module.exports = { Product };
