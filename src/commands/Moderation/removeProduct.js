// src/commands/Moderation/removeProduct.js
const { SlashCommandBuilder } = require('@discordjs/builders');
const { Product } = require('../../Schemas.js/Models');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('removeproduct')
    .setDescription('Удалить товар из магазина')
    .addStringOption(option => option.setName('product_id').setDescription('ID товара для удаления').setRequired(true)),
  
  async execute(interaction) {
    const productId = interaction.options.getString('product_id');

    try {
      const product = await Product.findByIdAndDelete(productId);

      if (!product) {
        return interaction.reply({ content: 'Товар не найден.', ephemeral: true });
      }

      return interaction.reply({ content: `Товар **${product.name}** был успешно удален из магазина.`, ephemeral: true });
    } catch (error) {
      console.error('Error removing product:', error);
      return interaction.reply({ content: 'Произошла ошибка при удалении товара.', ephemeral: true });
    }
  },
};
