const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const Coin = require('../../Schemas.js/coin');
const COOLDOWN_SECONDS = 30 * 60;
const ROB_CHANCE = 0.3;
const ROB_PENALTY = 1000;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rob')
    .setDescription('Украсть 🪲 у другого пользователя')
    .addUserOption((option) =>
      option.setName('user')
        .setDescription('Пользователь, у которого нужно украсть 🪲')
        .setRequired(true)
    ),
  async execute(interaction) {
    const targetUser = interaction.options.getUser('user');
    const userId = interaction.user.id;

    const user = await Coin.findOne({ userId: userId });
    if (!user) {
      return interaction.reply({ content: 'У вас нет 🪲.', ephemeral: true });
    }

    // Проверяем, достаточно ли у пользователя монет для ограбления
    if (user.coins < ROB_PENALTY) {
      return interaction.reply({ content: `У вас недостаточно 🪲 для начала ограбления. Для ограбления нужно иметь как минимум ${ROB_PENALTY} 🪲.`, ephemeral: true });
    }

    const userCooldown = await Coin.findOne({ userId: userId, cooldown: { $gt: Date.now() } });
    if (userCooldown) {
      const remainingTime = (userCooldown.cooldown - Date.now()) / 1000;
      return interaction.reply({ content: `Подождите еще ${remainingTime.toFixed(0)} секунд перед следующей попыткой украсть 🪲.`, ephemeral: true });
    }

    // Set the cooldown for the user
    const cooldownTime = Date.now() + (COOLDOWN_SECONDS * 1000);
    await Coin.updateOne({ userId: userId }, { cooldown: cooldownTime }, { upsert: true });

    // Проверка, что пользователь не пытается украсть у самого себя
    if (targetUser.id === interaction.user.id) {
      return interaction.reply({ content: 'Вы не можете украсть у себя 🪲.', ephemeral: true });
    }

    try {
      const target = await Coin.findOne({ userId: targetUser.id });

      if (!target) {
        return interaction.reply({ content: 'У целевого пользователя нет 🪲.', ephemeral: true });
      }

      // Шанс украсть 🪲 - 30%
      const chance = Math.random();
      const minStolenCoins = Math.floor(ROB_CHANCE * target.coins);
      const maxStolenCoins = Math.floor(0.1 * target.coins);
      const stolenCoins = chance < ROB_CHANCE ? Math.floor(Math.random() * (maxStolenCoins - minStolenCoins + 1)) + minStolenCoins : 0;

      if (stolenCoins > 0) {
        // Обновляем количество 🪲 у пользователя и целевого пользователя
        user.coins += stolenCoins;
        target.coins -= stolenCoins;
        await user.save();
        await target.save();
        EmbedBuilder
        const embed = new EmbedBuilder()
          .setTitle('Успешное ограбление!')
          .setDescription(`Вы украли ${stolenCoins} 🪲 у пользователя ${targetUser.username}.`)
          .setColor('Green');

        return interaction.reply({ embeds: [embed] });
      } else {
        const embed = new EmbedBuilder()
          .setTitle('Неудачное ограбление')
          .setDescription(`Вы не смогли украсть 🪲 у пользователя ${targetUser.username}. Вас оштрафовали на ${ROB_PENALTY} 🪲`)
          .setColor('Red');

        user.coins -= ROB_PENALTY;
        await user.save();

        return interaction.reply({ embeds: [embed] });
      }
    } catch (error) {
      console.error(error);
      return interaction.reply({ content: 'Произошла ошибка при попытке украсть 🪲.', ephemeral: true });
    }
  },
};
