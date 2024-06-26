// commands/Moderation/addpromocode.js
const { SlashCommandBuilder } = require(`@discordjs/builders`);
const { EmbedBuilder } = require(`discord.js`)
const Coin = require('../../Schemas.js/coin');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('addpromocode')
    .setDescription('Добавить новый промокод')
    .addStringOption(option =>
      option.setName('code')
        .setDescription('Название промокода')
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option.setName('promocoins')
        .setDescription('Количество монет за промокод')
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option.setName('days')
        .setDescription('Срок действия промокода в днях')
        .setRequired(true)
    ),
  async execute(interaction) {
    const code = interaction.options.getString('code');
    const promocoins = interaction.options.getInteger('promocoins');
    const days = interaction.options.getInteger('days');

    const embed = new EmbedBuilder()
    .setTitle('Промокод создан!')
    .setDescription(`Промокод успешно создан.\n **Название:** ${code}\n **Выдаваемые монеты:** ${promocoins}\n **Срок:** ${days} день`)
    .setColor('#8300D3')

    // Вычисляем дату истечения промокода
    const expiresIn = new Date();
    expiresIn.setDate(expiresIn.getDate() + days);

    try {
      // Создаем новый промокод и добавляем его в массив промокодов в БД
      await Coin.updateOne({}, {
        $push: {
          promocodes: {
            code,
            promocoins,
            duration: days,
            createdAt: new Date(),
            usedUsers: [],
          },
        },
      });

      return interaction.reply({ embeds: [embed]});
    } catch (error) {
      console.error(error);
      return interaction.reply({ content: 'Произошла ошибка при добавлении промокода.', ephemeral: true });
    }
  },
};
