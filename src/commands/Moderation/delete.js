const { SlashCommandBuilder } = require('@discordjs/builders');
const mongoose = require('mongoose');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('cleardb')
    .setDescription('Очистить всю базу данных'),
  async execute(interaction) {
    try {
      // Получаем все модели из Mongoose
      const collections = mongoose.connection.collections;

      // Проходим по всем коллекциям и удаляем их данные
      for (const key in collections) {
        const collection = collections[key];
        await collection.deleteMany();
      }

      // Отправляем сообщение о успешном удалении
      await interaction.reply({ content: 'Вся база данных была успешно очищена.', ephemeral: true });
    } catch (error) {
      console.error(error);
      return interaction.reply({ content: 'Произошла ошибка при очистке базы данных.', ephemeral: true });
    }
  },
};
