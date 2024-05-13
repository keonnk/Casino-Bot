import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js'
import { SlashCommand } from '../types/types.js'
import { getUser, updateBalance } from '../drizzle/controllers/UserController.js'

const rouletteCommand: SlashCommand = {
    //@ts-ignore
    data: new SlashCommandBuilder()
        .setName('roulette')
        .setDescription('play roulette with the dealer')
        .addStringOption((option) => {
            return option.setName('color')
                .setDescription('Choose red (47.3%), black (47.3%), or green (5.26%)!')
                .setRequired(true)
                .addChoices(
                    { name: 'red', value: 'red'},
                    { name: 'black', value: 'black'},
                    { name: 'green', value: 'green'}
                )
        })
        .addNumberOption((option) => {
            return option.setName('wager')
                .setDescription('Amount to be wagered')
                .setRequired(true)
        }),
    async execute(interaction: ChatInputCommandInteraction) {
        const chosenSide = interaction.options.getString('color')
        const wager = interaction.options.getNumber('wager')
        const user_id = interaction.user.id

        try {
            let user = await getUser(user_id)   
            
            if(user.balance < wager) {
                await interaction.reply("You don't have enough for this wager")
                return
            }

            const wheelResult = rollWheel()
    
            let userWon: boolean = false
            if(chosenSide == wheelResult) userWon = true;

            if(userWon && chosenSide != 'Green') {
                user = await updateBalance({user_id, currentBalance: user.balance, amount: wager, isDeposit: true}) //Red and Black pay even 
            }
            else if (userWon && chosenSide === 'Green') {
                user = await updateBalance({user_id, currentBalance: user.balance, amount: (wager * 17), isDeposit: true}) //Green pays 17/1
            }
            else {
                user = await updateBalance({user_id, currentBalance: user.balance, amount: wager, isDeposit: false})
            }
    
            const embedResponse = new EmbedBuilder()
                .setColor(userWon ? 'Green' : 'Red')
                .setTitle(userWon ? 'You won! :grin:' : 'You lost :slight_frown:')
                .setDescription(`Wheel landed on :${wheelResult}_circle:\nYou have $${user.balance}`)
            
            interaction.reply({embeds: [embedResponse]})
        } catch(err) {
            interaction.reply("ERROR: " + err.message ?? err)
        }
        
    }
}

/**
 * There are 38 spaces, including the 2 green spaces
 * Probability to hit a green is 2/38 = 5.26%
 * Probability to hit a red is 18/38 = 47.368%
 * Probability to hit a black is 18/38 = 47.368%
 * Green spaces will be 1 and 2
 * Red spaces will be 3-20
 * Black spaces will be 21-38
 */
const rollWheel = () => {
    const roll = Math.random() * 39 //Generates a random integer between 0 and 38

    if(roll <= 2) {
        return "green"
    }
    else if (roll <= 20) {
        return "red"
    }
    else {
        return "black"
    }
}

export default rouletteCommand;