const { SlashCommandBuilder } = require('@discordjs/builders');
const { User } = require('discord.js');
const Coin = require('../../Schemas.js/coin');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('addcoins')
    .setDescription('Добавить монеты пользователю')
    .addUserOption(option => option.setName('user').setDescription('Пользователь, которому нужно добавить монеты').setRequired(true))
    .addIntegerOption(option => option.setName('amount').setDescription('Количество монет для добавления').setRequired(true)),
  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const amount = interaction.options.getInteger('amount');

    try {
      // Проверяем, что пользователь существует в базе данных
      let targetUser = await Coin.findOne({ userId: user.id });

      if (!targetUser) {
        targetUser = await Coin.create({ userId: user.id, coins: 0, lastGiftClaimed: null, claimedButtons: [] });
      }

      // Добавляем монеты пользователю
      targetUser.coins += amount;
      await targetUser.save();

      interaction.reply(`Успешно добавлено ${amount} монет пользователю ${user.tag}.`);
    } catch (error) {
      console.error(error);
      return interaction.reply({ content: 'Произошла ошибка при добавлении монет.', ephemeral: true });
    }
  },
};