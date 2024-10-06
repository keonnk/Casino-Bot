import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
} from "discord.js";
import { SlashCommand } from "../types/types.js";
import { getUser } from "../drizzle/controllers/UserController.js";
import createErrorEmbed from "../utils/CreateErrorEmbed.js";
import { addCommasToNumber } from "../utils/utils.js";

const balanceCommand: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("balance")
    .setDescription("check your balance"),
  async execute(interaction: ChatInputCommandInteraction) {
    const user_id = interaction.user.id;

    const embedResponse = new EmbedBuilder()
      .setTitle("Balance")
      .setColor("Green");

    try {
      const user = await getUser(user_id);
      embedResponse.setDescription(`You currently have **$${addCommasToNumber(user.balance)}**`);
      await interaction.reply({ embeds: [embedResponse] });
    } catch (err) {
      console.error(err);
      await interaction.reply({ embeds: [createErrorEmbed(err)] });
    }
  },
};

export default balanceCommand;
