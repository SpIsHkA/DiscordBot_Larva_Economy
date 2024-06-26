const { SlashCommandBuilder } = require('@discordjs/builders');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const CustomRole = require('../../Schemas.js/customrole'); // Путь к вашей модели CustomRole

module.exports = {
  data: new SlashCommandBuilder()
    .setName('role')
    .setDescription('Просмотреть список своих кастомных ролей'),
  async execute(interaction) {
    const userId = interaction.user.id;

    try {
      // Ищем все кастомные роли пользователя в базе данных
      const userRoles = await CustomRole.find({ userId });

      if (userRoles.length === 0) {
        // Если у пользователя нет кастомных ролей
        const embed = new EmbedBuilder()
          .setTitle('У вас нет кастомных ролей пока что.')
          .setDescription('Чтобы создать кастомную роль, нажмите на кнопку ниже.')
          .setColor('#8300D3');

        const createRoleButton = new ButtonBuilder()
          .setCustomId('create_custom_role')
          .setLabel('Создать роль')
          .setStyle(ButtonStyle.Success);

        const row = new ActionRowBuilder().addComponents(createRoleButton);

        await interaction.reply({ embeds: [embed], components: [row]});
      } else {
        // Если у пользователя есть кастомные роли
        const embed = new EmbedBuilder()
          .setTitle('Список ваших кастомных ролей')
          .setDescription('Ниже представлен список ваших кастомных ролей:')
          .setColor('#3D4C8D');


        const createRoleButton = new ButtonBuilder()
          .setCustomId('create_custom_role')
          .setLabel('Создать роль')
          .setStyle(ButtonStyle.Success);

        const row = new ActionRowBuilder().addComponents(createRoleButton);

        await interaction.reply({ embeds: [embed], components: [row]});
      }
    } catch (error) {
      console.error(error);
      return interaction.reply({ content: 'Произошла ошибка при выполнении команды.', ephemeral: true });
    }
  },
};
