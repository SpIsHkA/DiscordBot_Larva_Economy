// src/commands/Moderation/listProducts.js
const { SlashCommandBuilder } = require('@discordjs/builders');
const { Product } = require('../../Schemas.js/Models');
const { EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('listproducts')
    .setDescription('Показать список всех товаров с их идентификаторами'),
  
  async execute(interaction) {
    try {
      const products = await Product.find();

      if (products.length === 0) {
        return interaction.reply({ content: 'В магазине нет товаров.', ephemeral: true });
      }

      const productEmbeds = products.map(product => {
        const embed = new EmbedBuilder()
          .setTitle(product.name)
          .setDescription(product.description)
          .addFields(
            { name: 'Цена', value: `${product.price} монет`, inline: true },
            { name: 'ID товара', value: `${product._id}`, inline: true },
            { name: 'Осталось', value: `${product.promocodes.length} шт.`, inline: true }
          )
          .setColor('#3D4C8D'); // Используем указанный вами цвет

        return embed;
      });

      await interaction.reply({ embeds: productEmbeds});
    } catch (error) {
      console.error('Error fetching product list:', error);
      await interaction.reply({ content: 'Произошла ошибка при получении списка товаров.'});
    }
  },
};
