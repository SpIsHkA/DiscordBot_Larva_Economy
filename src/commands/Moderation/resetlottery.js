const { SlashCommandBuilder } = require('@discordjs/builders');
const LotteryTickets = require('../../Schemas.js/LotteryTickets');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('resetlottery')
        .setDescription('Сбрасывает информацию об участниках и билетах в лотерее.'),
    async execute(interaction) {
        if (!interaction.member.permissions.has('ADMINISTRATOR')) {
            return interaction.reply({ content: 'У вас нет прав для использования этой команды.', ephemeral: true });
        }

        try {
            await LotteryTickets.deleteMany({});
            return interaction.reply({ content: 'Информация о лотерее успешно сброшена.', ephemeral: true });
        } catch (error) {
            console.error('Ошибка при сбросе информации о лотерее:', error);
            return interaction.reply({ content: 'Произошла ошибка при сбросе информации о лотерее.', ephemeral: true });
        }
    }
};
