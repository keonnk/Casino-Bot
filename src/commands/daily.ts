import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js'
import { SlashCommand } from '../types/types.js'
import { getUser, giveDailyBalance } from '../drizzle/controllers/UserController.js'

const dailyCommand: SlashCommand = {
    data: new SlashCommandBuilder()
        .setName('daily')
        .setDescription('receive currency daily!'),
    async execute(interaction: ChatInputCommandInteraction) {
        const user_id = interaction.user.id

        let user = await getUser(user_id)
        const currentTime = new Date()

        if (((currentTime.getDate() / 1000) - (user.lastDaily.getTime() / 1000)) > 86400) { //86400 seconds for each 24 hours
            user = await giveDailyBalance(user_id)
            await interaction.reply(`Daily claimed! You now have $${user.balance}`)
        }
        else {
            //TODO: Display how many hours and minutes are left before they can claim
            await interaction.reply("You cannot claim your daily reward yet!")
        }
    }
}

export default dailyCommand;