const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const Coin = require('../../Schemas.js/coin');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('wallet')
        .setDescription('Показывает количество 🪲 и другую информацию.')
        .addUserOption(option =>
            option.setName('пользователь')
                .setDescription('Пользователь, чей кошелек вы хотите увидеть')
                .setRequired(false)),
    async execute(interaction) {
        const userOption = interaction.options.getUser('пользователь');
        const userId = userOption ? userOption.id : interaction.user.id;

        try {
            let user = await Coin.findOne({ userId: userId });

            if (!user) {
                return interaction.reply({ content: 'У этого пользователя нет 🪲', ephemeral: true });
            }

            const partner = user.partnerId ? await interaction.client.users.fetch(user.partnerId) : null;

            const walletEmbed = new EmbedBuilder()
                .setTitle(`${userOption ? userOption.username : interaction.user.username}`)
                .setThumbnail(userOption ? userOption.avatarURL({ dynamic: true }) : interaction.user.avatarURL({ dynamic: true }))
                .addFields(
                    { name: 'Последний подарок', value: user.lastGiftClaimed ? user.lastGiftClaimed.toLocaleString() : 'Не получен', inline: true },
                    { name: 'Активные промокоды', value: user.promocodes.length > 0 ? user.promocodes.map(pc => `**${pc.code}**: ${pc.promocoins} 🪲`).join('\n') : 'Нет активных кодов', inline: true },
                    { name: 'Брак с', value: user.partnerId ? `<@${user.partnerId}>` : 'Нет', inline: true }
                )
                .setColor('#3D4C8D')
                .setTimestamp();

            // Если пользователь не запрашивает чужой кошелек, добавляем информацию о монетах
            if (!userOption || userOption.id === interaction.user.id) {
                walletEmbed.setDescription(`У вас ${user.coins} 🪲`);
            } else {
                walletEmbed.setDescription('Информация о кошельке другого пользователя.');
            }

            return interaction.reply({ embeds: [walletEmbed] });
        } catch (error) {
            console.error(error);
            return interaction.reply({ content: 'Произошла ошибка при получении информации о кошельке.', ephemeral: true });
        }
    },
};
