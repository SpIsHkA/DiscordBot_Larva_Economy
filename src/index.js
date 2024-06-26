const { Client, GatewayIntentBits, EmbedBuilder, PermissionsBitField, Permissions, MessageManager, Embed, Collection, ActivityType, SelectMenuBuilder, ActionRowBuilder, ButtonBuilder, Events, Intents, ModalBuilder, TextInputBuilder, TextInputStyle, ButtonStyle, InteractionType } = require(`discord.js`);
const fs = require('fs');
const cron = require('node-cron');
const Coin = require('./Schemas.js/coin');
const { Product } = require('./Schemas.js/Models');
const Gift = require('./Schemas.js/Gift');


const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessageReactions] });
const prefix = ';';

// Чтение всех файлов команд из папки commands
const commandFiles = fs.readdirSync('./src/commands').filter(file => file.endsWith('.js'));

// Регистрация каждой команды
for (const file of commandFiles) {
  const command = require(`./src/commands/${file}`);
  client.commands.set(command.data.name, command);
}


client.commands = new Collection();

require('dotenv').config();

const functions = fs.readdirSync("./src/functions").filter(file => file.endsWith(".js"));
const eventFiles = fs.readdirSync("./src/events").filter(file => file.endsWith(".js"));
const commandFolders = fs.readdirSync("./src/commands");

const process = require('node:process');

process.on('unhandledRejection', async (reason, promise) => {
  console.log('Необработанный отказ:', promise, 'Причина:', reason);
});

process.on('uncaughtException', (err) => {
  console.log('Перехваченое исключение:', err)
});

process.on('uncaughtExceptionMonitor', (err, origin) => {
  console.log('Перехваченое исключение монитор', err, origin)
});

(async () => {
  for (file of functions) {
    require(`./functions/${file}`)(client);
  }
  client.handleEvents(eventFiles, "./src/events");
  client.handleCommands(commandFolders, "./src/commands");
  client.login(process.env.token)
})();

client.on('ready', async () => {
  console.log('Бот в сети!');

  client.user.setActivity({
    name: 'Larva Games',
    type: ActivityType.Watching
  });

})



client.on('messageCreate', async (message) => {
  // Проверяем, чтобы сообщение было не от бота
  if (message.author.bot) return;

  // Генерируем случайное количество 🪲 от 1 до 10
  const coinsToAdd = Math.floor(Math.random() * 10) + 1;

  try {
    let user = await Coin.findOne({ userId: message.author.id });

    if (!user) {
      user = new Coin({ userId: message.author.id, coins: 0 });
    }

    user.coins += coinsToAdd;
    await user.save();

    console.log(`Пользователь ${message.author.tag} получил ${coinsToAdd} 🪲. Всего 🪲 ${user.coins}`);
  } catch (error) {
    console.error(error);
  }
});

/*
client.on('interactionCreate', async (interaction) => {
  if (interaction.isButton()) {
    if (interaction.customId === 'create_custom_role') {
      const authorId = interaction.user.id;

      // Создаем модальное окно для ввода названия и цвета роли
      const modal = new ModalBuilder()
        .setTitle('Создание кастомной роли')
        .setCustomId(`create_custom_role_modal-${authorId}`);

      const role_name = new TextInputBuilder()
        .setCustomId('role_name')
        .setLabel('Название роли')
        .setPlaceholder('Название роли')
        .setRequired(true)
        .setMinLength(1)
        .setMaxLength(32)
        .setStyle(TextInputStyle.Short);

      const role_color = new TextInputBuilder()
        .setCustomId('role_color')
        .setLabel('Цвет роли в формате HEX (#ffffff)')
        .setPlaceholder('Например: #ff0000')
        .setRequired(true)
        .setMinLength(7)
        .setMaxLength(7)
        .setStyle(TextInputStyle.Short);

      const roleNameRow = new ActionRowBuilder().addComponents(role_name);
      const roleColorRow = new ActionRowBuilder().addComponents(role_color);

      modal.addComponents(roleNameRow, roleColorRow);

      // Показываем модальное окно
      await interaction.showModal(modal);

      const response = await interaction.awaitModalSubmit({ time: 300000 });
      const roleNameInput = response.fields.getTextInputValue("role_name");
      const roleColorInput = response.fields.getTextInputValue("role_color");


      await Coin.findOneAndUpdate({ userId: authorId }, { roleName: roleNameInput, roleColor: roleColorInput });

      await response.deferUpdate();

      const confirmButton = new ButtonBuilder()
        .setCustomId('confirm_role')
        .setLabel('Подтвердить')
        .setStyle(ButtonStyle.Success);

      const row = new ActionRowBuilder().addComponents(confirmButton);

      const embed = new EmbedBuilder()
        .setColor(`${roleColorInput}`)
        .setTitle(`Вы действительно хотите купить эту кастомную роль за 100000🪲?`)
        .addFields(
          { name: "Название", value: roleNameInput },
          { name: "Цвет", value: roleColorInput },
        )
        .setTimestamp()

      await interaction.followUp({ embeds: [embed], components: [row], ephemeral: true });
    }
  }
});

client.on('interactionCreate', async (interaction) => {
  if (interaction.isButton()) {
    // If the user clicked the "confirm_role" button
    if (interaction.customId === 'confirm_role') {
      const authorId = interaction.user.id;

      // Find the user in the database by their ID
      const user = await Coin.findOne({ userId: authorId });

      // Check if the user has enough coins (at least 5000)
      if (!user || user.coins < 100000) {
        return interaction.reply({ content: 'У вас недостаточно монет для покупки роли.', ephemeral: true });
      }

      // Find the role with the same name on the server
      const existingRole = interaction.guild.roles.cache.find(role => role.name === user.roleName);

      if (existingRole) {
        // Notify the user that the role already exists
        await interaction.reply({ content: `Роль с названием "${user.roleName}" уже существует на сервере.`, ephemeral: true });
      } else {
        // Create a new role with the specified data
        const newRole = await interaction.guild.roles.create({
          name: user.roleName,
          color: user.roleColor,
        });

        // Give the role to the user
        await interaction.member.roles.add(newRole);

        const expirationTimeInMinutes = 43200; // Set the desired time in minutes
        const expirationTimeInMillis = expirationTimeInMinutes * 60000;

        // Calculate the expiration date for the role
        const expirationDate = new Date(Date.now() + expirationTimeInMillis);

        // Set the expiration date in the user's document
        user.roleExpiration = expirationDate;
        await user.save();

        // Deduct 5000 coins from the user's balance
        user.coins -= 100000;
        await user.save();

        // Send a message to the user about the successful purchase
        await interaction.reply({ content: `Вы успешно купили кастомную роль за 5000 монет.`, ephemeral: true });

        cron.schedule('* * * * *', async () => {
          try {
            const users = await Coin.find({ roleExpiration: { $lt: new Date() } });

            for (const user of users) {
              const guild = client.guilds.cache.get('1096364345002315779');
              const member = guild.members.cache.get(user.userId);

              if (!member) {
                console.log(`Member with ID ${user.userId} not found in the guild.`);
                // Remove the role from the database if the member is not found in the guild
                await Coin.deleteOne({ userId: user.userId });
                continue;
              }

              const existingRole = guild.roles.cache.find(role => role.name === user.roleName);

              if (existingRole) {
                const requiredCoins = 1200; // Количество монет, необходимых для продления роли

                // Проверяем, что у пользователя достаточно монет для продления роли
                if (user.coins >= requiredCoins) {
                  // При продлении роли также обновляем дату окончания действия
                  const expirationTimeInMinutes = 43200; // Установите желаемое время в минутах
                  const expirationTimeInMillis = expirationTimeInMinutes * 60000;
                  const newExpirationDate = new Date(Date.now() + expirationTimeInMillis);

                  // Продлить роль для пользователя
                  await member.roles.add(existingRole);

                  // Обновить дату окончания роли в базе данных
                  user.roleExpiration = newExpirationDate;
                  await user.save();

                  // Списать 1200 монет у пользователя
                  user.coins -= requiredCoins;
                  await user.save();
                } else {
                  console.log(`User with ID ${user.userId} doesn't have enough coins to extend the role.`);
                  // Удалить роль из базы данных и с сервера
                  await Coin.deleteOne({ userId: user.userId });
                  await member.roles.remove(existingRole);
                }
              } else {
                console.log(`Role with name "${user.roleName}" not found on the server.`);
                // Удалить роль из базы данных, так как она не найдена на сервере
                await Coin.deleteOne({ userId: user.userId });
              }
            }
          } catch (error) {
            console.error('Ошибка при проверке и продлении ролей:', error);
          }
        });


      }
    }
  }
});
*/
client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand() && !interaction.isButton()) return;

  const { commandName, customId } = interaction;

  if (commandName === 'claimgift' && interaction.isButton()) {
    // Обработка нажатия на кнопку получения подарка
    if (!(interaction instanceof MessageButtonInteraction)) return;

    // Получаем информацию о пользователе и подарке из базы данных
    const userId = interaction.user.id;
    const user = await Coin.findOne({ userId });

    if (!user || user.claimedUsers.includes(userId)) {
      // Пользователь уже получал подарок
      await interaction.reply({ content: 'Вы уже забрали свой подарок.', ephemeral: true });
    } else {
      // Пользователь получает подарок
      user.claimedUsers.push(userId);
      user.coins += user.giftAmount;
      await user.save();

      const remainingReceivers = user.giftReceivers - 1;

      const embed = new EmbedBuilder()
        .setTitle(interaction.options.getString('title'))
        .setDescription(`Вы получили ${user.giftAmount} монет. Осталось использований: ${remainingReceivers}.`);

      // Обновляем описание в эмбеде и отключаем кнопку, если не осталось получателей
      interaction.message.edit({ embeds: [embed], components: [interaction.message.components[0].components[0].setDisabled(remainingReceivers === 0)] });
      await interaction.reply({ content: 'Вы успешно получили подарок!', ephemeral: true });
    }
  }
});

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isButton()) return;

  const [action, productId] = interaction.customId.split('_');

  if (action === 'buy') {
    try {
      const product = await Product.findById(productId);
      if (!product) {
        return interaction.reply({ content: 'Товар не найден.', ephemeral: true });
      }

      const stock = product.promocodes.length;
      if (stock === 0) {
        return interaction.reply({ content: 'Товара нет в наличии.', ephemeral: true });
      }

      // Проверка баланса пользователя
      const userId = interaction.user.id;
      const userCoin = await Coin.findOne({ userId });
      if (!userCoin || userCoin.coins < product.price) {
        return interaction.reply({ content: 'У вас недостаточно монет для покупки этого товара.', ephemeral: true });
      }

      // Вычитаем стоимость товара из баланса пользователя
      userCoin.coins -= product.price;
      await userCoin.save();

      // Промокод
      const promocode = product.promocodes.shift();
      await product.save();

      // Отправка сообщения пользователю
      await interaction.user.send(`Вы купили **${product.name}**. Ваш промокод: \`${promocode}\``);

      // Ответ на взаимодействие
      await interaction.reply({ content: 'Покупка совершена. Промокод отправлен в личные сообщения.', ephemeral: true });
    } catch (error) {
      console.error('Error processing purchase:', error);
      await interaction.reply({ content: 'Произошла ошибка при покупке товара.', ephemeral: true });
    }
  }
});


client.on('interactionCreate', async interaction => {
  if (interaction.isCommand()) {
    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(error);
      //await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
  } else if (interaction.isButton()) {
    const customId = interaction.customId;

    if (customId.startsWith('claim-gift-')) {
      const giftId = customId.split('claim-gift-')[1];
      const userId = interaction.user.id;

      try {
        const gift = await Gift.findOne({ giftId });

        if (!gift) {
          return interaction.reply({ content: 'Подарок больше не доступен.', ephemeral: true });
        }

        if (gift.claimedUsers.includes(userId)) {
          return interaction.reply({ content: 'Вы уже получили этот подарок.', ephemeral: true });
        }

        if (gift.claimedUsers.length >= gift.receivers) {
          return interaction.reply({ content: 'Все подарки уже получены.', ephemeral: true });
        }

        gift.claimedUsers.push(userId);
        await gift.save();

        let receiver = await Coin.findOne({ userId: userId });

        if (!receiver) {
          receiver = new Coin({ userId: userId, coins: gift.amount });
        } else {
          receiver.coins += gift.amount;
        }

        await receiver.save();

        const remainingReceivers = gift.receivers - gift.claimedUsers.length;
        const giftEmbed = new EmbedBuilder()
          .setTitle('🎁 Подарок!')
          .setDescription(`Нажмите на кнопку ниже, чтобы получить ${gift.amount} 🪲. Осталось мест: ${remainingReceivers}`)
          .setColor('#3D4C8D')
          .setTimestamp();

        const row = new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
              .setCustomId(`claim-gift-${giftId}`)
              .setLabel('Получить 🪲')
              .setStyle(ButtonStyle.Primary)
              .setDisabled(remainingReceivers === 0)
          );

        await interaction.update({ embeds: [giftEmbed], components: [row] });

        return interaction.followUp({ content: `Вы получили ${gift.amount} 🪲!`, ephemeral: true });
      } catch (error) {
        console.error(error);
        return interaction.reply({ content: 'Произошла ошибка при получении подарка.', ephemeral: true });
      }
    }
  }
});


client.on('interactionCreate', async interaction => {
  if (interaction.isCommand()) {
    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
      await command.execute(interaction, client);
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: 'There was an error executing that command!', ephemeral: true });
    }
  } else if (interaction.isButton()) {
    const customId = interaction.customId;

    if (customId.startsWith('accept_') || customId.startsWith('decline_')) {
      // Логика обработки кнопок предложений
      const [action, proposerId, targetId] = customId.split('_');

      if (interaction.user.id !== targetId) {
        return interaction.reply({ content: 'Это предложение не для вас.', ephemeral: true });
      }

      const proposer = await client.users.fetch(proposerId);
      const target = await client.users.fetch(targetId);

      if (action === 'accept') {
        await Coin.updateOne({ userId: proposerId }, { partnerId: targetId });
        await Coin.updateOne({ userId: targetId }, { partnerId: proposerId });

        await interaction.reply({ content: `${proposer} и ${target} теперь женаты! 🎉` });
      } else if (action === 'decline') {
        await interaction.reply({ content: `${target} отклонил(а) предложение ${proposer}.` });
      }
    }
  }
});