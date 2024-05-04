import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js'
import { SlashCommand } from '../types/types.js'

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
        }),
    async execute(interaction: ChatInputCommandInteraction) {
        const chosenSide = interaction.options.getString('color')
        
        const wheelResult = rollWheel()

        let userWon: boolean = false
        if(chosenSide == wheelResult) userWon = true;

        const embedResponse = new EmbedBuilder()
            .setColor(userWon ? 'Green' : 'Red')
            .setTitle(userWon ? 'You won! :grin:' : 'You lost :slight_frown:')
            .setDescription(`Wheel landed on :${wheelResult}_circle:`)
        
        interaction.reply({embeds: [embedResponse]})
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