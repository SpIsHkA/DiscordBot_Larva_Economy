const { SlashCommandBuilder } = require(`@discordjs/builders`);
const { EmbedBuilder } = require(`discord.js`);
const Coin = require('../../Schemas.js/coin');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('promocode')
    .setDescription('Использовать промокод')
    .addStringOption(option =>
      option.setName('code')
        .setDescription('Промокод для использования')
        .setRequired(true)
    ),
  async execute(interaction) {
    const userId = interaction.user.id;
    const code = interaction.options.getString('code');

    try {
      // Находим промокод в массиве промокодов в БД по его названию
      const coinData = await Coin.findOne({});
      const promocode = coinData.promocodes.find(promo => promo.code === code);

      if (!promocode) {
        return interaction.reply({ content: 'Промокод не найден или уже истек.', ephemeral: true });
      }

      // Проверяем, истек ли промокод
      if (promocode.createdAt.getTime() + promocode.duration * 24 * 60 * 60 * 1000 < Date.now()) {
        return interaction.reply({ content: 'Промокод уже истек.', ephemeral: true });
      }

      // Проверяем, использовал ли пользователь промокод ранее
      if (promocode.usedUsers.includes(userId)) {
        return interaction.reply({ content: 'Вы уже использовали этот промокод.', ephemeral: true });
      }

      // Проверяем, есть ли пользователь в базе данных
      let user = await Coin.findOne({ userId: userId });
      if (!user) {
        // Если пользователя нет, добавляем его в базу данных
        user = new Coin({ userId: userId, coins: 0 });
        await user.save();
      }

      // Обновляем количество монет у пользователя и добавляем его в список использовавших промокод
      const updatedUsedUsers = [...promocode.usedUsers, userId];
      await Coin.updateOne(
        { 'promocodes.code': code },
        { $set: { 'promocodes.$.usedUsers': updatedUsedUsers } }
      );

      // Обновляем количество монет у пользователя
      await Coin.updateOne(
        { userId },
        { $inc: { coins: promocode.promocoins } }
      );

      const embed = new EmbedBuilder()
        .setTitle('Промокод активирован!')
        .setDescription(`Вы успешно использовали промокод **${code}**. Вам добавлено **${promocode.promocoins} валюты**.`)
        .setColor('#3D4C8D');

      return interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      return interaction.reply({ content: 'Произошла ошибка при использовании промокода.', ephemeral: true });
    }
  },
};
