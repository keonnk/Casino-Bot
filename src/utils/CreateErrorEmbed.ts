import { EmbedBuilder } from "discord.js";

export default function createErrorEmbed(err: any) {
  const errorEmbed = new EmbedBuilder()
    .setTitle("ERROR")
    .setColor("Red")
    .setDescription(err.message ?? err);

  return errorEmbed;
}
