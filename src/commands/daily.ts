import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
} from "discord.js";
import { SlashCommand } from "../types/types.js";
import {
  getUser,
  giveDailyBalance,
} from "../drizzle/controllers/UserController.js";
import createErrorEmbed from "../utils/CreateErrorEmbed.js";
import { addCommasToNumber } from "../utils/utils.js";

const dailyCommand: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("daily")
    .setDescription("receive currency daily!"),
  async execute(interaction: ChatInputCommandInteraction) {
    const user_id = interaction.user.id;

    const embedResponse = new EmbedBuilder();

    try {
      let user = await getUser(user_id);
      const currentTime = new Date();
      let timeDifference =
        (currentTime.getTime() - user.lastDaily.getTime()) / 1000; //converting to seconds

      if (timeDifference >= 86400) {
        //86400 seconds in each 24 hours
        user = await giveDailyBalance(user_id);
        embedResponse
          .setTitle("Daily claimed!")
          .setColor("Green")
          .setDescription(`You currently have **$${addCommasToNumber(user.balance)}**`);
        await interaction.reply({ embeds: [embedResponse] });
      } else {
        let timeLeft = (86400 - timeDifference) / 60 / 60; //converting to hours
        let isHours = true;

        if (timeLeft < 1) {
          timeLeft *= 60; //converting back to minutes
          isHours = false;
        }

        embedResponse
          .setColor("Red")
          .setDescription(
            `You cannot claim your daily reward for another ${timeLeft.toFixed(
              0
            )} ${isHours ? "hours!" : "minutes!"}`
          );

        await interaction.reply({ embeds: [embedResponse] });
      }
    } catch (err) {
      console.error(err);
      await interaction.reply({ embeds: [createErrorEmbed(err)] });
    }
  },
};

export default dailyCommand;
