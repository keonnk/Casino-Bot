import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, Collector, ComponentType, EmbedBuilder, SlashCommandBuilder } from 'discord.js'
import { SlashCommand } from '../types/types.js'

const blackjackCommand: SlashCommand = {
    //@ts-ignore
    data: new SlashCommandBuilder()
        .setName('blackjack')
        .setDescription('play blackjack with the dealer'),
    async execute(interaction: ChatInputCommandInteraction) {
        let deck = shuffleDeck()

        let dealerHand = [deck.pop(), deck.pop()]
        let playerHand = [deck.pop(), deck.pop()]

        const hitButton = new ButtonBuilder()
            .setCustomId('hit')
            .setLabel('Hit')
            .setStyle(ButtonStyle.Primary)

        const standButton = new ButtonBuilder()
            .setCustomId('stand')
            .setLabel('Stand')
            .setStyle(ButtonStyle.Primary)
        
        const row = new ActionRowBuilder()
            .addComponents(hitButton)
            .addComponents(standButton)

        const embedResponse = new EmbedBuilder()
            .setColor('Purple')
            .setTitle('Blackjack')
            .setDescription(
                `Your hand: ${playerHand.toString()}\n 
                value: ${computeHandValue(playerHand)}
                \n\n
                Dealer hand: ${dealerHand[0].toString()}\n
                value: ${computeHandValue(dealerHand)}`
            )
        
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
                    let playerValue = computeHandValue(playerHand)
                    if(playerValue > 21) {
                        embedResponse.setDescription(
                            `Your hand: ${playerHand.toString()}\n 
                            value: ${computeHandValue(playerHand)}
                            \n\n
                            Dealer hand: ${dealerHand[0].toString()}\n
                            value: ${computeHandValue(dealerHand)}
                            \n\n
                            Player busts, dealer wins!`
                        )
                        embedResponse.setColor('Red')
                        await interaction.update({embeds: [embedResponse], components: []})
                    }
                    else {
                        embedResponse.setDescription(
                            `Your hand: ${playerHand.toString()}\n 
                            value: ${computeHandValue(playerHand)}
                            \n\n
                            Dealer hand: ${dealerHand[0].toString()}\n
                            value: ${computeHandValue(dealerHand)}`
                        )
                        await interaction.update({embeds: [embedResponse]})
                    }
                }

                if(interaction.customId === 'stand') {
                    let playerValue = computeHandValue(playerHand)
                    let dealerValue = computeHandValue(dealerHand)

                    while(dealerValue < 17) {
                        dealerHand = [...dealerHand, deck.pop()]
                    }
                    if(dealerValue > 21) {
                        embedResponse.setColor('Green')
                        embedResponse.setDescription(
                            `Your hand: ${playerHand.toString()}\n 
                            value: ${computeHandValue(playerHand)}
                            \n\n
                            Dealer hand: ${dealerHand[0].toString()}\n
                            value: ${computeHandValue(dealerHand)}
                            \n\n
                            Dealer busts, you win!`
                        )
                    }
                    else {
                        if(dealerValue > playerValue) {
                            embedResponse.setColor('Red')
                            embedResponse.setDescription(
                                `Your hand: ${playerHand.toString()}\n 
                                value: ${computeHandValue(playerHand)}
                                \n\n
                                Dealer hand: ${dealerHand[0].toString()}\n
                                value: ${computeHandValue(dealerHand)}
                                \n\n
                                You lose!`
                            )
                        }
                        else {
                            embedResponse.setColor('Green')
                            embedResponse.setDescription(
                                `Your hand: ${playerHand.toString()}\n 
                                value: ${computeHandValue(playerHand)}
                                \n\n
                                Dealer hand: ${dealerHand[0].toString()}\n
                                value: ${computeHandValue(dealerHand)}
                                \n\n
                                You win!`
                            )
                        }
                    }
                    
                    await interaction.update({embeds: [embedResponse], components: []})
                }
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

const computeHandValue = (hand: Array<Array<String>>) => {
    let value = 0
    let aceCount = 0
    hand.forEach((card) => {
        let rank = card[0]

        if(rank === 'A') {
            aceCount++
        }
        else if(rank === 'J' || rank === 'Q' || rank === 'K') {
            value += 10
        }
        else {
            //@ts-ignore
            value += parseInt(rank)
        }
    })

    //Dynamically compute aces after all standard cards
    for(let i=0; i<aceCount; i++) {
        if(value + 11 < 22) { //ace becomes 11 if total is less than 22
            value += 11
        }
        else { //Otherwise, ace is 1
            value += 1
        }
    }

    return value
}

export default blackjackCommand;