import { Interaction, SlashCommandBuilder } from "discord.js";

export type SlashCommand = {
    data: SlashCommandBuilder;
    execute: (interaction: Interaction) => Promise<void>;
}