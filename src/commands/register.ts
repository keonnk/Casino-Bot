import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
} from "discord.js";
import { SlashCommand } from "../types/types.js";
import { createUser } from "../drizzle/controllers/UserController.js";
import createErrorEmbed from "../utils/CreateErrorEmbed.js";

const registerCommand: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("register")
    .setDescription("register your user and recieve initial currency"),
  async execute(interaction: ChatInputCommandInteraction) {
    const user_id = interaction.user.id;

    const embedResponse = new EmbedBuilder();

    try {
      await createUser(user_id);
      embedResponse
        .setTitle("User successfully registered!")
        .setColor("Green")
        .setDescription("Your balance is **$1000**");
      await interaction.reply({ embeds: [embedResponse] });
    } catch (err) {
      console.error(err);
      await interaction.reply({ embeds: [createErrorEmbed(err)] });
    }
  },
};

export default registerCommand;
