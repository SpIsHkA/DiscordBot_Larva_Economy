const { model, Schema } = require('mongoose');

const lotteryTicketSchema = new Schema({
    userId: { type: String, required: true },
    tickets: { type: Number, required: true }
});

const LotteryTickets = model('LotteryTickets', lotteryTicketSchema);

module.exports = LotteryTickets;
