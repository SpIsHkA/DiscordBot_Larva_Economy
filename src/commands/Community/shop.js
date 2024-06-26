const { SlashCommandBuilder } = require('@discordjs/builders');
const { Product } = require('../../Schemas.js/Models');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('shop')
    .setDescription('Показать товары в магазине'),
  
  async execute(interaction) {
    const products = await Product.find();

    if (products.length === 0) {
      return interaction.reply({ content: 'Магазин пуст.', ephemeral: true });
    }

    const embeds = [];
    const components = [];

    products.forEach(product => {
      const stock = product.promocodes.length;
      if (stock > 0) {
        const embed = new EmbedBuilder()
          .setTitle(product.name)
          .setDescription(product.description)
          .addFields({ name: 'Цена', value: `${product.price} 🪲`, inline: true })
          .addFields({ name: 'Осталось', value: `${stock} шт.`, inline: true })
          .setColor('#3D4C8D');

        embeds.push(embed);

        const component = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId(`buy_${product._id}`)
            .setLabel(`Купить ${product.name}`)
            .setStyle(ButtonStyle.Success)
        );

        components.push(component);
      }
    });

    if (embeds.length === 0) {
      return interaction.reply({ content: 'Магазин пуст.', ephemeral: true });
    }

    await interaction.reply({ embeds, components });
  },
};