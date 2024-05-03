import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js'
import { SlashCommand } from '../types/pingType.js'

const pingCommand: SlashCommand = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('ping the bot'),
    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.reply("Currently online!")
    }
}

export default pingCommand;