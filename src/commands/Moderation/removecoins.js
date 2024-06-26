const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const Coin = require('../../Schemas.js/coin');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('removecoins')
        .setDescription('Удаляет все или указанное количество монет у пользователя')
        .addUserOption(option => option.setName('user').setDescription('Пользователь, у которого нужно удалить монеты').setRequired(true))
        .addIntegerOption(option => option.setName('amount').setDescription('Количество монет для удаления (если не указано, удаляет все монеты)')),
    async execute(interaction) {
        const userId = interaction.options.getUser('user').id;
        const amount = interaction.options.getInteger('amount');

        try {
            const user = await Coin.findOne({ userId });
            if (!user) {
                return interaction.reply({ content: 'Указанный пользователь не найден в базе данных.', ephemeral: true });
            }

            if (amount !== null && amount > 0) {
                if (user.coins < amount) {
                    return interaction.reply({ content: 'У пользователя недостаточно монет для удаления указанного количества.', ephemeral: true });
                }
                user.coins -= amount;
            } else {
                user.coins = 0;
            }

            await user.save();

            const message = amount !== null && amount > 0
                ? `Удалено ${amount} монет у пользователя ${interaction.options.getUser('user').username}.`
                : `Все монеты удалены у пользователя ${interaction.options.getUser('user').username}.`;

            const removeEmbed = new EmbedBuilder()
                .setTitle('Удаление монет')
                .setDescription(message)
                .setColor('#3D4C8D');

            return interaction.reply({ embeds: [removeEmbed] });
        } catch (error) {
            console.error(error);
            return interaction.reply({ content: 'Произошла ошибка при удалении монет у пользователя.', ephemeral: true });
        }
    },
};
