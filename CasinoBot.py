import discord
import random
import time
from discord.ext import commands

client = commands.Bot(command_prefix='!')

# - Functions - #
 
def randomIntAdd():
    a = random.randint(1, 100)
    outStr = str(a)
    b = random.randint(1, 100)
    sum = a + b
    outStr += " + " + str(b) + " = " + str(sum)
    return outStr

def flipCoin():
    r = random.randint(0, 101) #Generates a random integer between 0 and 100
    if r <= 49:
        return True #True is heads
    else:
        return False #False (integer between 50-100) is tails

# - Blackjack functions - #

#Used when an ace is in the hand, called in the handValue() function if it encounters an ace
def aceHandValue(ranks):
    
    #EXPLANATION:
    #Calculates all the aces in the deck as 11, if it's over 21, turns one ace into 1, check again, if its over 21 still, turn the next ace into 1
    #Keep repeating till it's under 21

    ranksL = ranks.copy() #Copies ranks list as to not modify the original, ranksL means local ranks

    #Searching through the deck to find all the positions of aces, and defaults every ace to value 11
    positions = []              
    i = 0
    while i < len(ranksL):
        if ranksL[i] == 'A':
            positions.append(i)
            ranksL[i] = 11
        i += 1

    i = 0
    while i <= len(positions):

        count = 0
        #Looping through the cards to find the count of the current interpretation
        #All the aces are either 1 or 11 depending on what iteration this is, so no need for a case with 'A'
        for j in range(len(ranksL)):
            if ranksL[j] == 'J' or ranksL[j] == 'Q' or ranksL[j] == 'K':
                count += 10
            else:
                count += ranksL[j]

        #If the count is greater then 21, it means that the current interpretation of the aces is wrong
        #It will change an ace into a 1 when it was previously 11 (using the positions list), and set i to the next position in case it needs to be changed next
        if count > 21:
            if i < len(positions): #Checks if it's the last iteration (when all the ace's were turned into 1)
                ranksL[positions[i]] = 1 #If it's not it keeps changing ace's to 1's
                i += 1
            else:
                return count #If it was the last iteration and it was still over 21, it will just return the count

        #Otherwise the interpretation is right, and it returns the count
        else:
            return count

#Counts the value of the passed in cards (assumes the ace is 11 unless it goes over to 21, then it will use it as 1)
def handValue(ranks):

    i = 0
    count = 0

    while i < len(ranks):
        if ranks[i] == 'J' or ranks[i] == 'Q' or ranks[i] == 'K':
            count += 10
        elif ranks[i] == 'A': #Special case with the Ace card (it could be valued at 1 or 11)
            return aceHandValue(ranks) #Special function to handle hands that contain an Ace
        else:
            count += ranks[i]
    
        i += 1

    return count

#Add a card to the passed in hand, simulates picking up from a deck
def dealCard(ranks, suits):
    rank = ['A', 2, 3, 4, 5, 6, 7, 8, 9, 10, 'J', 'Q', 'K']
    suit = ['♠', '♥', '♣', '♦']

    rank = random.choice(rank)
    suit = random.choice(suit)
    ranks.append(rank)
    suits.append(suit)

#Returns a string that will display cards in the proper way
def displayCards(ranks, suits):
    i = 0
    outStr = ""
    while i < len(ranks):
        outStr += str(ranks[i]) + suits[i] + " "
        i += 1
    return outStr

#Returns a string only showing the first card (only used for the bot at the start of the game)
def displayHalfBotCards(botRanks, botSuits):
    return str(botRanks[0]) + botSuits[0] + " ??" #Only showing the first bot card 

#---------------------------------------------------------------------------------------------#

@client.event
async def on_ready():
    print('Logged in as user {0.user}'.format(client))

@client.event
async def on_connect():
    await client.change_presence(status=discord.Status.online, activity=discord.Game("Beep Boop"))
    '''generalChannel = client.get_channel(799181579112808478)
    await generalChannel.send("Bot connected!")'''



# - Test commands - #

@client.command(name="hello")
async def hello(context):
    await context.message.channel.send('Hello!')

@client.command(name="randomAdd")
async def randomAdd(context):
    await context.message.channel.send(randomIntAdd())

@client.command(name="mustard")
async def mustard(context):
    await context.message.channel.send("Ketchup :o")

@client.command(name="embedTest")
async def embed(context):
    myEmbed = discord.Embed(title="First embed", color=0xe416ee)
    myEmbed.add_field(name="over", value="overValue")
    myEmbed.add_field(name="under", value="underValue", inline=False)
    await context.message.channel.send(embed=myEmbed)

#Command that will take 2 numbers as arguments and send the sum
#Ex: 
    # !add 3 5
    # output: 3 + 5 = 8
@client.command(name="add")
async def add(context, arg1, arg2):
    outStr = arg1 + " + " + arg2 + " = "
    Sum = int(arg1) + int(arg2)
    outStr += str(Sum)
    await context.message.channel.send(outStr)



# - Casino Commands - #

@client.command(name="coinflip")
async def coinflip(context, coinSide):

    #NOTE: It doesn't print error when no argument is given, fix that later

    side = flipCoin()
    
    if side == True: #coin flipped heads
        if coinSide == "heads" or coinSide == "Heads":
            winEmbed = discord.Embed(title="You win!  :grin:", description="Coin flipped heads", colour=0x28b463)
            await context.message.channel.send(embed=winEmbed)
        elif coinSide == "tails" or coinSide == "Tails":
            loseEmbed = discord.Embed(title="You lose :slight_frown:", description="Coin flipped heads", colour=0xc0392b)
            await context.message.channel.send(embed=loseEmbed)
        else:
            errorEmbed = discord.Embed(title="Input Error!", description="Please enter the proper input", colour=0xda1ae3)
            await context.message.channel.send(embed=errorEmbed)


    if side == False: #coin flipped tails
        if coinSide == "tails" or coinSide == "Tails":
            winEmbed = discord.Embed(title="You win!  :grin:", description="Coin flipped tails", colour=0x28b463)
            await context.message.channel.send(embed=winEmbed)
        elif coinSide == "heads" or coinSide == "Heads":
            loseEmbed = discord.Embed(title="You lose :slight_frown:", description="Coin flipped tails", colour=0xc0392b)
            await context.message.channel.send(embed=loseEmbed)
        else:
            errorEmbed = discord.Embed(title="Input Error!", description="Please enter the proper input", colour=0xda1ae3)
            await context.message.channel.send(embed=errorEmbed)


@client.command(name="blackjack")
async def blackjack(context):

    #Ranks will be used to hold card number/face, suits will be used to hold suits
    #The same list positon means its the same card
    #Ex: 
        # playerRanks = [2, 'K']
        # playerSuits = ['♣', '♥']
        # players cards are 2♣ and K♥

    playerRanks = []
    playerSuits = []
    botRanks = []
    botSuits = []

    #Adding two cards to the users cards to start
    for i in range(2):
        dealCard(playerRanks, playerSuits)

    #Adding two cards to the bots cards to start
    for i in range(2):
        dealCard(botRanks, botSuits)

    await context.message.channel.send("enter \"hit\" or \"stand\" during play\n")

    while True:

        #Initial Embed that will show at the start and after every player command(if it doesn't end the game)
        initialEmbed = discord.Embed(title="Blackjack", color=0xe416ee)
        initialEmbed.add_field(name="Bot's Cards", value=displayHalfBotCards(botRanks, botSuits))   
        initialEmbed.add_field(name="Player's Cards", value=displayCards(playerRanks, playerSuits), inline=False)
        await context.send(embed=initialEmbed)

        #Waiting for message from the user, also checks if it's the same user that invoked the !blackjack command to make sure no one else can play for them
        response = await client.wait_for('message', check=lambda message: message.author == context.author)

        if response.content == "hit":
            dealCard(playerRanks, playerSuits)
            if handValue(playerRanks) > 21: #Player bust
                innerEmbed = discord.Embed(title="Blackjack", color=discord.Color.red())
                innerEmbed.add_field(name="Bot's Cards", value=displayCards(botRanks, botSuits))   
                innerEmbed.add_field(name="Player's Cards", value=displayCards(playerRanks, playerSuits), inline=False)
                innerEmbed.add_field(name="Player busts! Bot wins!", value="-----------", inline=False) #NOTE:it's not value="" because if it is whitespace it causes an error
                await context.send(embed=innerEmbed)
                break

        elif response.content == "stand":
            while (handValue(botRanks) < 17) and (handValue(botRanks) < handValue(playerRanks)): #Determining whether bot should pick up cards or not
                dealCard(botRanks, botSuits)

            if handValue(botRanks) > 21: #Bot bust
                innerEmbed = discord.Embed(title="Blackjack", color=discord.Color.green())
                innerEmbed.add_field(name="Bot's Cards", value=displayCards(botRanks, botSuits))   
                innerEmbed.add_field(name="Player's Cards", value=displayCards(playerRanks, playerSuits), inline=False)
                innerEmbed.add_field(name="Bot busts! Player wins!", value="-----------", inline=False)
                await context.message.channel.send(embed=innerEmbed)
                break
            else:
                if handValue(botRanks) > handValue(playerRanks): #Bot Wins
                    innerEmbed = discord.Embed(title="Blackjack", color=discord.Color.red())
                    innerEmbed.add_field(name="Bot's Cards", value=displayCards(botRanks, botSuits))   
                    innerEmbed.add_field(name="Player's Cards", value=displayCards(playerRanks, playerSuits), inline=False)
                    innerEmbed.add_field(name="Bot wins!", value="-----------", inline=False)
                    await context.message.channel.send(embed=innerEmbed)
                    break

                elif handValue(botRanks) == handValue(playerRanks): #Push/Draw
                    innerEmbed = discord.Embed(title="Blackjack", color=discord.Color.orange())
                    innerEmbed.add_field(name="Bot's Cards", value=displayCards(botRanks, botSuits))   
                    innerEmbed.add_field(name="Player's Cards", value=displayCards(playerRanks, playerSuits), inline=False)
                    innerEmbed.add_field(name="Push! It was a draw!", value="-----------", inline=False)
                    await context.message.channel.send(embed=innerEmbed)
                    break

                else: #Player wins
                    innerEmbed = discord.Embed(title="Blackjack", color=discord.Color.green())
                    innerEmbed.add_field(name="Bot's Cards", value=displayCards(botRanks, botSuits))   
                    innerEmbed.add_field(name="Player's Cards", value=displayCards(playerRanks, playerSuits), inline=False)
                    innerEmbed.add_field(name="Player wins!", value="-----------", inline=False)
                    await context.message.channel.send(embed=innerEmbed)
                    break
        else:
            await context.message.channel.send("Error! Something went wrong")
            break