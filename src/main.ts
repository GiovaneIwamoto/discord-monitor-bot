import { Client, GatewayIntentBits, REST, Routes } from 'discord.js';
import { DiscordBot, commands } from './bot';
import dotenv from 'dotenv';
import cron from 'node-cron';
dotenv.config();

// Bot Intents
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});
const botInstance = new DiscordBot();

// Create a REST instance to make requests to Discord
const rest = new REST({ version: '10' }).setToken(
  `${process.env.DISCORD_BOT_TOKEN}`,
);

// Synchronize slash commands with Discord
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

// Initialize Discord bot
function initBot() {
  client.once('ready', () => console.log('Bot is ready!'));
  client.login(process.env.DISCORD_BOT_TOKEN);
  client.on('interactionCreate', (interaction) =>
    botInstance.handleCommand(interaction),
  );
}

// Main function
function main() {
  syncronizeCommands();
  initBot();
}
main();

// Add chron to check coin prices
cron.schedule('* * * * *', () => {
  botInstance.getCoinsPrice();
});
