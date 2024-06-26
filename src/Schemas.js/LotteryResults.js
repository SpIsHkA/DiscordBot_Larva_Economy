const { model, Schema } = require('mongoose');

const lotteryResultsSchema = new Schema({
    week: { type: Number, required: true },
    winners: { type: [String], required: true },
    prize: { type: Number, required: true },
    date: { type: Date, required: true }
});

const LotteryResults = model('LotteryResults', lotteryResultsSchema);

module.exports = LotteryResults;
