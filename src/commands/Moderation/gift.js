// commands/Moderation/gift.js
const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const Gift = require('../../Schemas.js/Gift');
const { v4: uuidv4 } = require('uuid'); // Пакет для генерации уникальных ID

module.exports = {
    data: new SlashCommandBuilder()
        .setName('gift')
        .setDescription('Создает подарок для участников.')
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('Количество монет в подарке.')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('receivers')
                .setDescription('Количество пользователей, которые могут получить подарок.')
                .setRequired(true)),
    async execute(interaction) {
        const amount = interaction.options.getInteger('amount');
        const receivers = interaction.options.getInteger('receivers');

        const giftId = uuidv4();

        const newGift = new Gift({
            giftId,
            amount,
            receivers,
        });

        await newGift.save();

        const giftEmbed = new EmbedBuilder()
            .setTitle('🎁 Подарок!')
            .setDescription(`Нажмите на кнопку ниже, чтобы получить ${amount} 🪲. Осталось мест: ${receivers}`)
            .setColor('#3D4C8D')
            .setTimestamp();

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`claim-gift-${giftId}`)
                    .setLabel('Получить 🪲')
                    .setStyle(ButtonStyle.Primary)
            );

        await interaction.reply({ embeds: [giftEmbed], components: [row] });
    },
};
