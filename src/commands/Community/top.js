const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const Coin = require('../../Schemas.js/coin');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('top')
        .setDescription('Просмотреть топ игроков'),
    async execute(interaction) {
        try {
            let allPlayers = await Coin.find().sort({ coins: -1 });
            const playerPosition = await Coin.findOne({ userId: interaction.user.id });
        
            // Если текущий пользователь уже присутствует в топ-10, исключаем его из списка всех игроков
            if (playerPosition) {
                allPlayers = allPlayers.filter(player => player.userId !== interaction.user.id);
            }
        
            // Добавляем текущего пользователя в список всех игроков, если он найден в БД
            if (playerPosition) {
                allPlayers.push(playerPosition);
            }
        
            // Сортируем всех игроков по количеству монет
            allPlayers = allPlayers.sort((a, b) => b.coins - a.coins);
        
            let response = `**Топ игроков по жукам**\nТоп-10\n`;
        
            // Определяем позицию текущего пользователя
            const positionIndex = allPlayers.findIndex(player => player.userId === interaction.user.id);
            const userPosition = positionIndex !== -1 ? positionIndex + 1 : undefined;
        
            for (let i = 0; i < allPlayers.length && i < 10; i++) {
                const player = allPlayers[i];
                const place = getPlaceText(i + 1);
        
                let playerName;
                try {
                    const member = await interaction.guild.members.fetch(player.userId);
                    playerName = member.toString();
                } catch (error) {
                    playerName = `User#${i + 1}`;
                }
        
                response += `${place}. ${playerName} — ${player.coins} 🪲\n`;
            }
        
            // Если пользователь не находится в топ-10, показываем его позицию отдельно
            if (userPosition) {
                const userPlayer = allPlayers[positionIndex];
                const userPlace = getPlaceText(userPosition);
                const userMention = await getUserName(interaction.guild, userPlayer.userId);
        
                response += `\n**Твоя позиция**\n${userPlace}. ${userMention} — ${playerPosition ? playerPosition.coins : 0} 🪲`;
            }
        
            const embed = new EmbedBuilder()
                .setTitle('Топ игроков по жукам')
                .setDescription(response)
                .setColor('#3D4C8D');
        
            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            return interaction.reply({ content: 'Произошла ошибка при выполнении команды.', ephemeral: true });
        }
        
        function getPlaceText(place) {
            if (place === 1) return '**1**';
            if (place === 2) return '**2**';
            if (place === 3) return '**3**';
            return `**${place}**`;
        }
        
        async function getUserName(guild, userId) {
            try {
                const member = await guild.members.fetch(userId);
                return member.toString();
            } catch (error) {
                return `User#${userId}`;
            }
        }
        
    },
};
