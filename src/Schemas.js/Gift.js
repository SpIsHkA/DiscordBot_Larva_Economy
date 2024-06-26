// models/Gift.js
const { model, Schema } = require('mongoose');

const giftSchema = new Schema({
    giftId: { type: String, required: true, unique: true },
    amount: { type: Number, required: true },
    receivers: { type: Number, required: true },
    claimedUsers: { type: [String], default: [] },
});

module.exports = model('Gift', giftSchema);
