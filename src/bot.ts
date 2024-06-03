import Binance, {
  Binance as BinanceType,
  DailyStatsResult,
} from 'binance-api-node';
import { CacheType, Interaction, TextBasedChannel } from 'discord.js';
import { BotCommands } from './types/bot.types';

export const commands: BotCommands[] = [
  {
    name: 'add_token',
    description:
      'Adiciona um par de tokens para ser monitorado Ex: /add_token BTC/USDT',
    options: [
      {
        name: 'add_token1',
        description: 'Token a ser monitorado',
        type: 3,
        required: true,
      },
      {
        name: 'add_token2',
        description: 'Token a ser monitorado',
        type: 3,
        required: true,
      },
    ],
  },
  {
    name: 'remove_token',
    description:
      'Remove um par de tokens para deixar ser monitorado Ex: /remove_token BTC/USDT',
    options: [
      {
        name: 'remove_token1',
        description: 'Token a ser monitorado',
        type: 3,
        required: true,
      },
      {
        name: 'remove_token2',
        description: 'Token a ser monitorado',
        type: 3,
        required: true,
      },
    ],
  },
  {
    name: 'list_token',
    description: 'Lista todos os tokens monitorados',
  },
  {
    name: 'set_channel',
    description: 'Define o canal para enviar as notificações',
  },
  {
    name: 'get_all_coins_price',
    description: 'Obtém o preço atual de todos os tokens monitorados',
  },
];

export class DiscordBot {
  private CoinPair: string[];
  private binaceBot: BinanceType;
  private channel: TextBasedChannel | null = null;

  constructor() {
    this.CoinPair = [];
    this.binaceBot = Binance();
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
        content: 'Obtendo preços...',
      });
      await this.getCoinsPrice();
    }
  }

  private async addToken(interaction: Interaction<CacheType>) {
    if (!interaction.isCommand()) return;
    const { options } = interaction;
    const token1 = options.get('add_token1')?.value;
    const token2 = options.get('add_token2')?.value;

    if (!token1 || !token2) {
      await interaction.reply({
        content: 'Informe os tokens para serem monitorados',
      });
      return;
    }
    this.CoinPair.push(`${token1}/${token2}`);
    await interaction.reply({
      content: `Tokens adicionados com sucesso! ${token1}/${token2}`,
    });
  }

  private async removeToken(interaction: Interaction<CacheType>) {
    if (!interaction.isCommand()) return;
    const { options } = interaction;
    const token1 = options.get('remove_token1')?.value;
    const token2 = options.get('remove_token2')?.value;

    if (!token1 || !token2) {
      await interaction.reply({
        content: 'Informe os tokens para serem removidos',
      });
      return;
    }

    const index = this.CoinPair.indexOf(`${token1}/${token2}`);

    if (index === -1) {
      await interaction.reply({
        content: 'Tokens não encontrados',
      });
      return;
    }

    this.CoinPair.splice(index, 1);

    await interaction.reply({
      content: `Tokens removidos com sucesso! ${token1}/${token2}`,
    });
  }

  private async listToken(interaction: Interaction<CacheType>) {
    if (!interaction.isCommand()) return;
    await interaction.reply({
      content: `Tokens monitorados: \n${this.CoinPair.join('\n')}`,
    });
  }

  private async setChannel(interaction: Interaction<CacheType>) {
    if (!interaction.isCommand()) return;
    const { channel } = interaction;
    this.channel = channel;
    await interaction.reply({
      content: `Canal de notificação definido com sucesso 🚀!`,
    });
  }

  public async getCoinsPrice() {
    this.channel?.send('Iniciando monitoramento...');

    for (const coinPair of this.CoinPair) {
      const coinWithouSlash = coinPair.replace('/', '');
      const dailyStatusCoin = (await this.binaceBot.dailyStats({
        symbol: coinWithouSlash,
      })) as DailyStatsResult;
      this.channel?.send(
        `Preço atual de ${coinPair}: ${dailyStatusCoin.lastPrice}`,
      );
    }
  }
}
