// Schemas.js
const { model, Schema } = require('mongoose');

const coinSchema = new Schema({
  userId: String,
  coins: { type: Number, default: 0 },
  lastGiftClaimed: { type: Date, default: null },
  roleId: String,
  expirationDate: Date,
  roleExpiration: Date,
  roleName: String, // Название кастомной роли
  roleColor: String, // Цвет кастомной роли
  giftAmount: { type: Number, default: 0 }, // Новое поле для хранения количества монет в подарке
  giftReceivers: { type: Number, default: 0 }, // Новое поле для хранения количества пользователей, которые могут получить монеты
  claimedUsers: { type: Array, default: [] }, // Новое поле для хранения пользователей, которые уже получили подарок
  cooldown: { type: Number, default: 0 },
  promocodes: [{
    code: { type: String, required: true },
    promocoins: { type: Number, required: true },
    duration: { type: Number, required: true },
    createdAt: { type: Date, required: true },
    usedUsers: { type: [String], default: [] },
  }],
  partnerId: { type: String, default: null }
});

module.exports = model('Coin', coinSchema);
