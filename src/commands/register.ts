import { ChatInputCommandInteraction, ErrorEvent, SlashCommandBuilder } from 'discord.js'
import { SlashCommand } from '../types/types.js'
import { createUser } from '../drizzle/controllers/UserController.js'

const registerCommand: SlashCommand = {
    data: new SlashCommandBuilder()
        .setName('register')
        .setDescription('register your user and recieve initial currency'),
    async execute(interaction: ChatInputCommandInteraction) {
        const user_id = interaction.user.id
        try {
            await createUser(user_id)
            await interaction.reply("User successfully registered! Your balance is $1000")
        }
        catch (err) {
            console.error(err)
            await interaction.reply("ERROR: " + err.message ?? err)
        }

    }
}

export default registerCommand;