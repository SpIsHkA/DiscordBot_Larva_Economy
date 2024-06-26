const { SlashCommandBuilder } = require('@discordjs/builders');
const Coin = require('../../Schemas.js/coin');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('resetcoins')
    .setDescription('Сбросить монеты всех пользователей'),
  async execute(interaction) {
    try {
      // Сбрасываем монеты всех пользователей
      await Coin.updateMany({}, { coins: 0 });

      interaction.reply('Монеты всех пользователей были сброшены.');
    } catch (error) {
      console.error(error);
      interaction.reply('Произошла ошибка при сбросе монет пользователей.');
    }
  },
};
