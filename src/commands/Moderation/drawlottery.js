const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const LotteryTickets = require('../../Schemas.js/LotteryTickets');
const LotteryResults = require('../../Schemas.js/LotteryResults');
const Coin = require('../../Schemas.js/coin'); // Импортируем вашу главную модель

module.exports = {
    data: new SlashCommandBuilder()
        .setName('drawlottery')
        .setDescription('Проводит розыгрыш лотереи и объявляет победителей.'),
    async execute(interaction) {
        try {
            const tickets = await LotteryTickets.find({});
            if (tickets.length === 0) {
                return interaction.reply({ content: 'Нет билетов для проведения розыгрыша.', ephemeral: true });
            }

            const totalTickets = tickets.reduce((sum, ticket) => sum + ticket.tickets, 0);
            const prizePool = totalTickets * 10; // Допустим, каждый билет стоит 10 монет
            const numWinners = Math.min(3, tickets.length); // Максимум 3 победителя, или меньше, если меньше участников
            const prizePerWinner = Math.floor(prizePool / numWinners);

            const winners = [];
            for (let i = 0; i < numWinners; i++) {
                const randomIndex = Math.floor(Math.random() * tickets.length);
                const winner = tickets[randomIndex];

                if (!winner || !winner.userId) {
                    console.error('Invalid ticket:', winner);
                    continue;
                }

                winners.push(winner.userId);
                tickets.splice(randomIndex, 1);

                // Начисление монет пользователю
                const user = await Coin.findOne({ userId: winner.userId });
                if (user) {
                    user.coins += prizePerWinner;
                    await user.save();
                } else {
                    // Если пользователь не найден, создаем нового
                    const newUser = new Coin({ userId: winner.userId, coins: prizePerWinner });
                    await newUser.save();
                }
            }

            if (winners.length === 0) {
                return interaction.reply({ content: 'Не удалось определить победителей.', ephemeral: true });
            }

            const newResults = new LotteryResults({
                week: new Date().getTime(),
                winners: winners,
                prize: prizePool,
                date: new Date()
            });
            await newResults.save();

            await LotteryTickets.deleteMany({});

            // Формируем сообщение с результатами
            const winnerMentions = winners.map(winnerId => `<@${winnerId}>`).join(', ');
            const embed = new EmbedBuilder()
                .setTitle('Результаты лотереи')
                .setDescription(`Поздравляем победителей: ${winnerMentions}!`)
                .addFields(
                    { name: 'Призовой фонд', value: `${prizePool} 🪲`, inline: true },
                    { name: 'Победители', value: winners.map(winnerId => `<@${winnerId}> получил ${prizePerWinner} 🪲`).join('\n'), inline: true }
                )
                .setColor('#3D4C8D') // Используем указанный цвет
                .setTimestamp();

            return interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Ошибка при проведении лотереи:', error);
            return interaction.reply({ content: 'Произошла ошибка при проведении лотереи.', ephemeral: true });
        }
    }
};
