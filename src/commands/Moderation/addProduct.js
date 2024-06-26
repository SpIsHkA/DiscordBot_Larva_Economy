const { SlashCommandBuilder } = require('@discordjs/builders');
const { Product } = require('../../Schemas.js/Models');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('addproduct')
    .setDescription('Добавить или обновить товар в магазине')
    .addStringOption(option => option.setName('name').setDescription('Название товара').setRequired(true))
    .addStringOption(option => option.setName('description').setDescription('Описание товара').setRequired(true))
    .addIntegerOption(option => option.setName('price').setDescription('Цена товара').setRequired(true))
    .addStringOption(option => option.setName('promocodes').setDescription('Промокоды (через запятую)').setRequired(false)),
  
  async execute(interaction) {
    const name = interaction.options.getString('name');
    const description = interaction.options.getString('description');
    const price = interaction.options.getInteger('price');
    const promocodes = interaction.options.getString('promocodes')?.split(',').map(code => code.trim()) || [];
    
    let product = await Product.findOne({ name });

    if (product) {
      // Обновляем существующий товар
      product.description = description;
      product.price = price;
      product.promocodes = [...product.promocodes, ...promocodes];
    } else {
      // Создаем новый товар
      product = new Product({
        name,
        description,
        price,
        promocodes,
      });
    }

    await product.save();
    await interaction.reply(`Товар **${name}** добавлен или обновлен в магазине.`);
  },
};