import { ChatInputCommandInteraction, ErrorEvent, SlashCommandBuilder } from 'discord.js'
import { SlashCommand } from '../types/types.js'
import { getUser } from '../drizzle/controllers/UserController.js'

const balanceCommand: SlashCommand = {
    data: new SlashCommandBuilder()
        .setName('balance')
        .setDescription('check your balance'),
    async execute(interaction: ChatInputCommandInteraction) {
        const user_id = interaction.user.id
        try {
            const user = await getUser(user_id)
            await interaction.reply(`Your balance is $${user.balance}`)
        }
        catch (err) {
            console.error(err)
            await interaction.reply("ERROR: " + err.message ?? err)
        }

    }
}

export default balanceCommand;