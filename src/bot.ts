import Binance, {
  Binance as BinanceType,
  DailyStatsResult,
} from 'binance-api-node';
import { CacheType, Interaction, TextBasedChannel } from 'discord.js';
import { BotCommands } from './types/bot.types';

export const commands: BotCommands[] = [
  {
    name: 'add_token',
    description: 'Add a token pair to be monitored Ex: /add_token BTC/USDT',
    options: [
      {
        name: 'add_token1',
        description: 'Token to be monitored',
        type: 3,
        required: true,
      },
      {
        name: 'add_token2',
        description: 'Token to be monitored',
        type: 3,
        required: true,
      },
    ],
  },
  {
    name: 'remove_token',
    description:
      'Removes a token pair to let it be monitored Ex: /remove_token BTC/USDT',
    options: [
      {
        name: 'remove_token1',
        description: 'Token to be monitored',
        type: 3,
        required: true,
      },
      {
        name: 'remove_token2',
        description: 'Token to be monitored',
        type: 3,
        required: true,
      },
    ],
  },
  {
    name: 'list_token',
    description: 'List all monitored tokens',
  },
  {
    name: 'set_channel',
    description: 'Set channel to receive notifications',
  },
  {
    name: 'get_all_coins_price',
    description: 'Gets the current price of all monitored tokens',
  },
];

export class DiscordBot {
  private CoinPair: string[];
  private binanceBot: BinanceType;
  private channel: TextBasedChannel | null = null;

  constructor() {
    this.CoinPair = [];
    this.binanceBot = Binance();
  }

  public async handleCommand(interaction: Interaction<CacheType>) {
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;

    if (commandName === 'add_token') {
      await this.addToken(interaction);
      return;
    }
    if (commandName === 'remove_token') {
      await this.removeToken(interaction);
      return;
    }
    if (commandName === 'list_token') {
      await this.listToken(interaction);
      return;
    }
    if (commandName === 'set_channel') {
      await this.setChannel(interaction);
    }
    if (commandName === 'get_all_coins_price') {
      interaction.reply({
        content: 'Getting cotations...',
      });
      await this.getCoinsPrice();
    }
  }

  private async addToken(interaction: Interaction<CacheType>) {
    if (!interaction.isCommand()) return;
    const { options } = interaction;
    const token1 = options.get('add_token1')?.value;
    const token2 = options.get('add_token2')?.value;

    // const userName = interaction.user.username;

    if (!token1 || !token2) {
      await interaction.reply({
        content: 'Enter tokens to be monitored',
      });
      return;
    }
    this.CoinPair.push(`${token1}/${token2}`);

    // console.log(`User ${userName} added token ${token1}/${token2}`);

    await interaction.reply({
      content: `Tokens added successfully! ${token1}/${token2}`,
    });
  }

  private async removeToken(interaction: Interaction<CacheType>) {
    if (!interaction.isCommand()) return;
    const { options } = interaction;
    const token1 = options.get('remove_token1')?.value;
    const token2 = options.get('remove_token2')?.value;

    if (!token1 || !token2) {
      await interaction.reply({
        content: 'Report tokens to be removed',
      });
      return;
    }

    const index = this.CoinPair.indexOf(`${token1}/${token2}`);

    if (index === -1) {
      await interaction.reply({
        content: 'Tokens not found',
      });
      return;
    }

    this.CoinPair.splice(index, 1);

    await interaction.reply({
      content: `Tokens removed successfully! ${token1}/${token2}`,
    });
  }

  private async listToken(interaction: Interaction<CacheType>) {
    if (!interaction.isCommand()) return;
    await interaction.reply({
      content: `Monitored tokens: \n${this.CoinPair.join('\n')}`,
    });
  }

  private async setChannel(interaction: Interaction<CacheType>) {
    if (!interaction.isCommand()) return;
    const { channel } = interaction;
    this.channel = channel;
    await interaction.reply({
      content: `Notification channel set successfully!`,
    });
  }

  public async getCoinsPrice() {
    this.channel?.send('Starting monitoring...');

    for (const coinPair of this.CoinPair) {
      const coinWithouSlash = coinPair.replace('/', '');
      const dailyStatusCoin = (await this.binanceBot.dailyStats({
        symbol: coinWithouSlash,
      })) as DailyStatsResult;
      this.channel?.send(
        `Current price of ${coinPair}: ${dailyStatusCoin.lastPrice}`,
      );
    }
  }
}
