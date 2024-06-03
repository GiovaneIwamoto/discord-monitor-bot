import { Client, GatewayIntentBits, REST, Routes } from 'discord.js';
import dotenv from 'dotenv';
import { DiscordBot, commands } from './bot';
import cron from 'node-cron';
dotenv.config();

// Cria uma instância do bot
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});
const botInstance = new DiscordBot();

// Cria uma instância do REST para realizar requisições ao Discord
const rest = new REST({ version: '10' }).setToken(
  `${process.env.DISCORD_BOT_TOKEN}`,
);

// Sincroniza os comandos de slash com o Discord
async function syncronizeCommands() {
  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(
      Routes.applicationCommands(`${process.env.DISCORD_APPLICATION_ID}`),
      {
        body: commands,
      },
    );

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
}
// Inicializa o bot
function initBot() {
  client.once('ready', () => console.log('Bot is ready!'));
  client.login(process.env.DISCORD_BOT_TOKEN);
  client.on('interactionCreate', (interaction) =>
    botInstance.handleCommand(interaction),
  );
}

// Função principal
function main() {
  syncronizeCommands();
  initBot();
}
main();

//adicionar o chron para verificar o preço das moedas
cron.schedule('* * * * *', () => {
  botInstance.getCoinsPrice();
});
