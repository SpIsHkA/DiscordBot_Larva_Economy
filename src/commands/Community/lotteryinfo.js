const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const LotteryTickets = require('../../Schemas.js/LotteryTickets');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('lotteryinfo')
        .setDescription('Показывает текущую информацию о лотерее.'),
    async execute(interaction) {
        try {
            const tickets = await LotteryTickets.find();
            const totalTickets = tickets.reduce((acc, ticket) => acc + ticket.tickets, 0);
            const uniqueUsers = [...new Set(tickets.map(ticket => ticket.userId))].length;
            const prizePool = totalTickets * 10; // 10 🪲 за каждый билет

            const lotteryInfoEmbed = new EmbedBuilder()
                .setTitle('Информация о лотерее')
                .setDescription(`Всего билетов: ${totalTickets}\nУчастников: ${uniqueUsers}\nПризовой фонд: ${prizePool} 🪲`)
                .setColor('#3D4C8D');

            return interaction.reply({ embeds: [lotteryInfoEmbed] });
        } catch (error) {
            console.error(error);
            return interaction.reply({ content: 'Произошла ошибка при получении информации о лотерее.', ephemeral: true });
        }
    }
};
