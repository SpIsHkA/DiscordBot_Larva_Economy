const { SlashCommandBuilder } = require('@discordjs/builders');
const Coin = require('../../Schemas.js/coin');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('viewdb')
    .setDescription('Просмотреть записи в модели Coin'),
  async execute(interaction) {
    try {
      // Получаем все записи из модели Coin
      const records = await Coin.find();

      if (records.length === 0) {
        return interaction.reply({ content: 'Нет записей в модели Coin.', ephemeral: true });
      }

      // Формируем сообщение с записями
      let message = 'Записи в модели Coin:\n';
      records.forEach(record => {
        message += `ID: ${record._id}, UserID: ${record.userId}, Coins: ${record.coins}, promocodes: ${record.promocodes}\n`;
      });

      // Отправляем сообщение с записями
      await interaction.reply({ content: message, ephemeral: true });
    } catch (error) {
      console.error(error);
      return interaction.reply({ content: 'Произошла ошибка при получении записей из модели Coin.', ephemeral: true });
    }
  },
};
