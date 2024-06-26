const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const Coin = require('../../Schemas.js/coin');

// Время в миллисекундах для периода повторного получения подарка (12 часа)
const GIFT_COOLDOWN = 12 * 60 * 60 * 1000;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('claimgift')
        .setDescription('Забирает ежедневный подарок в виде монет'),
    async execute(interaction) {
        const userId = interaction.user.id;

        try {
            // Ищем пользователя в базе данных или создаем новую запись
            let user = await Coin.findOne({ userId: userId });

            if (!user) {
                user = await Coin.create({ userId: userId, coins: 0, lastGiftClaimed: null });
            }

            const currentTime = Date.now();
            const lastGiftClaimed = user.lastGiftClaimed;



            // Проверяем, прошло ли достаточно времени с момента последнего получения подарка
            if (lastGiftClaimed && currentTime - lastGiftClaimed < GIFT_COOLDOWN) {
                const timeRemaining = GIFT_COOLDOWN - (currentTime - lastGiftClaimed);
                const hoursRemaining = Math.floor(timeRemaining / (60 * 60 * 1000));
                const minutesRemaining = Math.floor((timeRemaining % (60 * 60 * 1000)) / (60 * 1000));

                const giftEndEmbed = new EmbedBuilder()
                .setTitle('Ежедневный подарок!')
                .setDescription(`Вы уже забрали свой подарок.`)
                .setColor('#3D4C8D')
                .setFooter({ text: `Повторный подарок будет доступен через ${hoursRemaining} ч. ${minutesRemaining} мин.`});

                return interaction.reply({ embeds: [giftEndEmbed]});
            }

            // Генерируем случайное количество монет для подарка
            const giftCoins = Math.floor(Math.random() * (100 - 50 + 1)) + 50;

            // Обновляем количество монет пользователя и время последнего получения подарка
            user.coins += giftCoins;
            user.lastGiftClaimed = currentTime;
            await user.save();

            const giftEmbed = new EmbedBuilder()
                .setTitle('Ежедневный подарок!')
                .setDescription(`Вы получили ${giftCoins} 🪲.`)
                .setColor('#3D4C8D');

            return interaction.reply({ embeds: [giftEmbed] });
        } catch (error) {
            console.error(error);
            return interaction.reply({ content: 'Произошла ошибка при получении подарка.', ephemeral: true });
        }
    },
};
