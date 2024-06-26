const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const Coin = require('../../Schemas.js/coin');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('marriage')
        .setDescription('Предложить пожениться другому пользователю')
        .addUserOption(option =>
            option.setName('пользователь')
                .setDescription('Пользователь, которому вы хотите предложить жениться')
                .setRequired(true)
        ),
    async execute(interaction) {
        const targetUser = interaction.options.getUser('пользователь');
        const userId = interaction.user.id;
        const targetUserId = targetUser.id;

        const userCoin = await Coin.findOne({ userId: userId });
        const targetUserCoin = await Coin.findOne({ userId: targetUserId });

        if (userCoin.partnerId || targetUserCoin.partnerId) {
            return interaction.reply({ content: 'Один из пользователей уже состоит в браке.', ephemeral: true });
        }

        const embed = new EmbedBuilder()
            .setTitle('Предложение жениться')
            .setDescription(`${targetUser}, вы хотите жениться на ${interaction.user}?`)
            .setColor('#3D4C8D')
            .setTimestamp();

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`accept_${userId}_${targetUserId}`)
                    .setLabel('Да')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId(`decline_${userId}_${targetUserId}`)
                    .setLabel('Нет')
                    .setStyle(ButtonStyle.Danger)
            );

        await interaction.reply({ embeds: [embed], components: [row] });
    },
};
