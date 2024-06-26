const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const Coin = require('../../Schemas.js/coin');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('transfer')
        .setDescription('Переводит 🪲 другому пользователю, комиссия 5%')
        .addUserOption(option => option.setName('recipient').setDescription('Получатель перевода').setRequired(true))
        .addIntegerOption(option => option.setName('amount').setDescription('Количество 🪲 для перевода').setRequired(true)),
    async execute(interaction) {
        const senderId = interaction.user.id;
        const recipientId = interaction.options.getUser('recipient').id;
        const amount = interaction.options.getInteger('amount');
        const commissionRate = 0.05; // 5% комиссия
        const commission = Math.ceil(amount * commissionRate); // Округляем до ближайшего целого
        const totalAmount = amount + commission; // Общая сумма, которую нужно списать с отправителя

        try {
            // Проверяем, есть ли у отправителя достаточное количество 🪲 для перевода с учетом комиссии
            const sender = await Coin.findOne({ userId: senderId });
            if (!sender || sender.coins < totalAmount) {
                return interaction.reply({content: 'У вас недостаточно 🪲 для перевода с учетом комиссии.', ephemeral: true});
            }

            // Находим получателя и обновляем их количество 🪲
            const recipient = await Coin.findOne({ userId: recipientId });
            if (!recipient) {
                return interaction.reply({content: 'Указанный получатель не найден в базе данных.', ephemeral: true});
            }

            sender.coins -= totalAmount;
            recipient.coins += amount;

            await Promise.all([sender.save(), recipient.save()]);

            const transferEmbed = new EmbedBuilder()
                .setTitle('Перевод 🪲')
                .setDescription(`Вы успешно перевели ${amount} 🪲 пользователю ${interaction.options.getUser('recipient').username}. Комиссия за перевод составила ${commission} 🪲.`)
                .setColor('#3D4C8D');

            return interaction.reply({ embeds: [transferEmbed] });
        } catch (error) {
            console.error(error);
            return interaction.reply({ content: 'Произошла ошибка при выполнении перевода 🪲.', ephemeral: true });
        }
    },
};
