import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, Collector, ComponentType, EmbedBuilder, SlashCommandBuilder } from 'discord.js'
import { SlashCommand } from '../types/types.js'

const blackjackCommand: SlashCommand = {
    //@ts-ignore
    data: new SlashCommandBuilder()
        .setName('blackjack')
        .setDescription('play blackjack with the dealer'),
    async execute(interaction: ChatInputCommandInteraction) {
        let deck = shuffleDeck()

        let dealerHand = []
        let playerHand = [deck.pop(), deck.pop()]

        const testButton = new ButtonBuilder()
            .setCustomId('hit')
            .setLabel('Hit')
            .setStyle(ButtonStyle.Primary)
        
        const row = new ActionRowBuilder()
            .addComponents(testButton)

        const embedResponse = new EmbedBuilder()
            .setColor('Purple')
            .setTitle('Blackjack')
            .setDescription(`Your hand: ${playerHand.toString()}`)
        
        const response = await interaction.reply({
            embeds: [embedResponse],
            //@ts-ignore
            components: [row]
        })
        
        //A filter to make sure only the user who called the command can use the buttons
        const collectorFilter = i => i.user.id === interaction.user.id; 

        try {
            const collector = response.createMessageComponentCollector({filter: collectorFilter, componentType: ComponentType.Button})

            collector.on('collect', async (interaction) => {
                if(interaction.customId === 'hit') {
                    playerHand = [...playerHand, deck.pop()]
                }
                embedResponse.setDescription(`Your hand: ${playerHand.toString()}`)
                await interaction.update({embeds: [embedResponse]})
            })
        }
        catch (err) {
            await interaction.editReply({content: "failed"})
        }
    }
}

/**
 * Hand = [[1,♥], [2,♣], ...]
 */

/**
 * TODO: Create a deck provider so its not generating a deck every time
 */
const shuffleDeck = () => {
    let deck = []
    const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']
    const suits = ['♠', '♥', '♣', '♦']

    //Generate deck
    ranks.forEach((rank) => {
        suits.forEach((suit) => {
            deck.push([rank, suit])
        })
    })

    //Shuffle deck
    for(let i=0; i<deck.length; i++) {
        const newPosition = Math.floor(Math.random() * deck.length) //Choose random position in the deck
        const temp = deck[newPosition]
        deck[newPosition] = deck[i]
        deck[i] = temp
    }

    // deck.sort(() => Math.random() - 0.5)

    return deck
}

const computeHandValue = (hand: [][]) => {
    
}

export default blackjackCommand;