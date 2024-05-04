import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js'
import { SlashCommand } from '../types/types.js'

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
        }),
    async execute(interaction: ChatInputCommandInteraction) {
        const chosenSide = interaction.options.getString('side')
        
        const flippedSide = flipCoin()

        let userWon: boolean = false
        if(chosenSide == flippedSide) userWon = true;

        const embedResponse = new EmbedBuilder()
            .setColor(userWon ? 'Green' : 'Red')
            .setTitle(userWon ? 'You won! :grin:' : 'You lost :slight_frown:')
            .setDescription(`Coin landed on ${flippedSide}`)
        
        interaction.reply({embeds: [embedResponse]})
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