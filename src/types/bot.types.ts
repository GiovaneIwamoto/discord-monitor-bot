export type BotCommands = {
  name: string;
  description: string;
  options?: BotCommands[];
  required?: boolean;
  type?: number;
};
