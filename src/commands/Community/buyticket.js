const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const LotteryTickets = require('../../Schemas.js/LotteryTickets');
const Coin = require('../../Schemas.js/coin');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('buyticket')
        .setDescription('Покупает билет для участия в еженедельной лотерее.')
        .addIntegerOption(option => option.setName('quantity').setDescription('Количество билетов для покупки').setRequired(true)),
    async execute(interaction) {
        const userId = interaction.user.id;
        const quantity = interaction.options.getInteger('quantity');
        const ticketPrice = 10;
        const totalPrice = quantity * ticketPrice;

        try {
            const user = await Coin.findOne({ userId });

            if (!user || user.coins < totalPrice) {
                return interaction.reply({ content: 'У вас недостаточно 🪲 для покупки билетов.', ephemeral: true });
            }

            user.coins -= totalPrice;
            await user.save();

            const existingTicket = await LotteryTickets.findOne({ userId });

            if (existingTicket) {
                existingTicket.tickets += quantity;
                await existingTicket.save();
            } else {
                const newTicket = new LotteryTickets({
                    userId,
                    tickets: quantity
                });
                await newTicket.save();
            }

            const purchaseEmbed = new EmbedBuilder()
                .setTitle('Билеты куплены')
                .setDescription(`Вы успешно купили ${quantity} билетов на лотерею за ${totalPrice} 🪲. Удачи!`)
                .setColor('#3D4C8D');

            return interaction.reply({ embeds: [purchaseEmbed] });
        } catch (error) {
            console.error(error);
            return interaction.reply({ content: 'Произошла ошибка при покупке билетов.', ephemeral: true });
        }
    }
};
