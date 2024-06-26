const { SlashCommandBuilder } = require('@discordjs/builders');
const Coin = require('../../Schemas.js/coin'); // Путь к вашей модели Coin

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clearroles')
    .setDescription('Удалить все свои кастомные роли'),
  async execute(interaction) {
    const userId = interaction.user.id;

    try {
      // Ищем все кастомные роли пользователя в базе данных
      const userRoles = await Coin.find({ userId });

      if (userRoles.length === 0) {
        // Если у пользователя нет кастомных ролей
        return interaction.reply({ content: 'У вас нет кастомных ролей, которые можно удалить.', ephemeral: true });
      } else {
        // Удаляем все кастомные роли пользователя
        for (const roleData of userRoles) {
          const role = interaction.guild.roles.cache.get(roleData.roleId);
          if (role) {
            await role.delete('Пользователь очистил кастомные роли');
          }
        }

        // Удаляем все документы о кастомных ролях пользователя из базы данных
        await Coin.deleteMany({ userId });

        return interaction.reply({ content: 'Все ваши кастомные роли были успешно удалены.', ephemeral: true });
      }
    } catch (error) {
      console.error(error);
      return interaction.reply({ content: 'Произошла ошибка при выполнении команды.', ephemeral: true });
    }
  },
};
