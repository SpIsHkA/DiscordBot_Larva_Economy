const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');


module.exports = {
    data: new SlashCommandBuilder()
    .setName('test')
    .setDescription('Показывает пинг бота и скорость отправки'),
    async execute (interaction) {
//Ping
const startTime = Date.now();
const reply = await interaction.reply('Рассчитываю пинг...');
const endTime = Date.now();
const ping = endTime - startTime;

 // Uptime
const uptime = process.uptime();
const uptimeString = formatUptime(uptime);

const commandCount = interaction.client.commands.size; // Command Count
const memoryUsage = process.memoryUsage().heapUsed / 1024 / 1024; // Memory Usage
const cpuUsage = process.cpuUsage().user / 1000000; // CPU Usage
const botVersion = '17.07.23';  // BOT Version


const embed = new EmbedBuilder()
    .setTitle('Информация о боте')
    .setColor('#8300D3')
    .addFields(
        { name: 'Время работы', value: `> ${uptimeString}`, inline: true },
        { name: 'Пинг', value: `> ${ping}ms`, inline: true },
        { name: 'Количество команд', value: `> ${commandCount}`, inline: true },
        { name: 'Использование памяти', value: `> ${memoryUsage.toFixed(2)} MB`, inline: true },
        { name: 'Использование процессора', value: `> ${cpuUsage.toFixed(2)}%`, inline: true },
        { name: 'Версия бота', value: `> ${botVersion}`, inline: true },
    )

await reply.edit({ content: '', embeds: [embed] });
}
}

// Uptime Abbreviation
function formatUptime(uptime) {
const seconds = Math.floor(uptime % 60);
const minutes = Math.floor((uptime / 60) % 60);
const hours = Math.floor((uptime / (60 * 60)) % 24);
const days = Math.floor(uptime / (60 * 60 * 24));

return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}