import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js'
import { SlashCommand } from '../types/types.js'
import { getUser, updateBalance } from '../drizzle/controllers/UserController.js'

const coinflipCommand: SlashCommand = {
    //@ts-ignore
    data: new SlashCommandBuilder()
        .setName('coinflip')
        .setDescription('play coinflip with the dealer')
        .addStringOption((option) => {
            return option.setName('side')
                .setDescription('Heads or Tails')
                .setRequired(true)
                .addChoices(
                    { name: 'heads', value: 'heads' },
                    { name: 'tails', value: 'tails' }
                )
        })
        .addNumberOption((option) => {
            return option.setName('wager')
                .setDescription('Amount to be wagered')
                .setRequired(true)
        }),
    async execute(interaction: ChatInputCommandInteraction) {
        const chosenSide = interaction.options.getString('side')
        const wager = interaction.options.getNumber('wager')
        const user_id = interaction.user.id

        try {
            let user = await getUser(user_id)
    
            if(user.balance < wager) {
                await interaction.reply("You don't have enough for this wager")
                return
            }
            
            const flippedSide = flipCoin()
    
            let userWon: boolean = false
            if(chosenSide == flippedSide) userWon = true;
    
            if(userWon) {
                user = await updateBalance({user_id, currentBalance: user.balance, amount: wager, isDeposit: true})
            }
            else {
                user = await updateBalance({user_id, currentBalance: user.balance, amount: wager, isDeposit: false})
            }
    
            const embedResponse = new EmbedBuilder()
                .setColor(userWon ? 'Green' : 'Red')
                .setTitle(userWon ? 'You won! :grin:' : 'You lost :slight_frown:')
                .setDescription(`Coin landed on ${flippedSide}\nYou have $${user.balance}`)
            
            await interaction.reply({embeds: [embedResponse]})
        } catch(err) {
            interaction.reply("ERROR: " + err.message ?? err)
        }
    }
}

const flipCoin = () => {
    const r = Math.random() * 101 //Generates a random integer between 0 and 100
    if (r <= 49){
        return 'heads' //True is heads
    }
    else{
        return 'tails' //False (integer between 50-100) is tails
    }
}

export default coinflipCommand;