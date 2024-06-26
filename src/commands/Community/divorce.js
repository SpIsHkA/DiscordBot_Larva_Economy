const { SlashCommandBuilder } = require('@discordjs/builders');
const Coin = require('../../Schemas.js/coin');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('divorce')
        .setDescription('Развестись с текущим партнером.'),
    async execute(interaction) {
        const userId = interaction.user.id;
        const userCoin = await Coin.findOne({ userId: userId });

        if (!userCoin.partnerId) {
            return interaction.reply({ content: 'Вы не состоите в браке.', ephemeral: true });
        }

        const partnerId = userCoin.partnerId;
        await Coin.updateOne({ userId: userId }, { partnerId: null });
        await Coin.updateOne({ userId: partnerId }, { partnerId: null });

        await interaction.reply({ content: `Вы развелись с <@${partnerId}>.` });
    },
};
