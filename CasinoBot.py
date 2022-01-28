import discord
import os
from discord.ext import commands
import random
import sqlite3

client = commands.Bot(command_prefix='!')

connection = sqlite3.connect("balance.db") #Creating a connection with the database for holding user balance
balance_DB = connection.cursor()


# - Coinflip functions- #

def flipCoin():
    r = random.randint(0, 101) #Generates a random integer between 0 and 100
    if r <= 49:
        return True #True is heads
    else:
        return False #False (integer between 50-100) is tails


# - Roulette functions - #

def roll():
    #There are 38 spaces, including the 2 green's
    #Probability to hit a green is 2/38 = 5.26%
    #Probability to hit a red is 18/38 = 47.368%
    #Probability to hit a black is 18/38 = 47.368%

    #Green spaces will be 1 and 2
    #Red spaces will be 3-20
    #Black spaces will be 21-38

    roll = random.randint(1, 38)

    if roll <= 2:    #Rolled green
        return "green"
    elif roll <= 20: #Rolled red
        return "red"
    else:            #Rolled black, (equivilent to elif roll <= 38)
        return "black"

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
        outStr += str(ranks[i]) + suits[i] + "  "
        i += 1
    return outStr

#Returns a string only showing the first card (only used for the bot at the start of the game)
def displayHalfBotCards(botRanks, botSuits):
    return str(botRanks[0]) + botSuits[0] + " ??" #Only showing the first bot card 

def depositPlayer(amount, userName):
  balance_DB.execute("UPDATE Users SET balance = balance + ? WHERE userID = ?", (amount, userName))
  connection.commit()

def withdrawalPlayer(amount, userName):
  balanceList = balance_DB.execute("SELECT balance FROM Users WHERE userID = ?", (userName,)).fetchone()
  balance = int(balanceList[0])
  if balance < amount:
    return False
  else:
    balance_DB.execute("UPDATE Users SET balance = balance - ? WHERE userID = ?", (amount, userName))
    connection.commit()
    return True

#---------------------------------------------------------------------------------------------#

@client.event
async def on_ready():
    print('Logged in as user {0.user}'.format(client))

@client.event
async def on_connect():
    await client.change_presence(status=discord.Status.online, activity=discord.Game("Gambling"))
    

# - Logisitcal commands - #

@client.command(name="balance")
async def balance(context):
    userName = context.author.name
    balance = balance_DB.execute("SELECT balance FROM Users WHERE userID = ?", (userName,)).fetchone()
    balanceStr = str(balance[0]) #Line above returns a list with one element, so taking the first and only element
    balanceEmbed = discord.Embed(title="$ Balance $", description="$"+balanceStr, colour=0x28b463)
    await context.message.channel.send(embed=balanceEmbed)


#Used to initialize a new user into the database (starts with $1000)
#Will also be used to reset a users balance to $1000
@client.command(name="create")
async def createAccount(context):
  userName = context.author.name
  balance = 1000
  balance_DB.execute("INSERT INTO Users VALUES (?, ?);", (userName, balance)) #Make this UNIQUE
  connection.commit()
  infoEmbed = discord.Embed(title="Account created, you have $1000!")
  await context.message.channel.send(embed=infoEmbed)

# - Casino Commands - #

@client.command(name="coinflip")
async def coinflip(context, coinSide, userBet):

    #NOTE: It doesn't print error when no argument is given, fix that later

    side = flipCoin()
    userName = context.author.name
    userBet = int(userBet)
    withdrawalValidity = withdrawalPlayer(userBet, userName)

    if withdrawalValidity == True:  #withdrawing money in advanced, to check if there is enough

      if side == True: #coin flipped heads
          if coinSide == "heads" or coinSide == "Heads":
              winEmbed = discord.Embed(title="You win!  :grin:", description="Coin flipped heads", colour=0x28b463)
              winningAmount = userBet * 2
              depositPlayer(winningAmount, userName) #giving the winning player double their initial bet
              await context.message.channel.send(embed=winEmbed)
          elif coinSide == "tails" or coinSide == "Tails":
              loseEmbed = discord.Embed(title="You lose :slight_frown:", description="Coin flipped heads", colour=0xc0392b)
              await context.message.channel.send(embed=loseEmbed)
          else:
              errorEmbed = discord.Embed(title="Input Error!", description="Please enter the proper input", colour=0xda1ae3)
              depositPlayer(userBet, userName) #Refunding the player
              await context.message.channel.send(embed=errorEmbed)


      if side == False: #coin flipped tails
          if coinSide == "tails" or coinSide == "Tails":
              winEmbed = discord.Embed(title="You win!  :grin:", description="Coin flipped tails", colour=0x28b463)
              winningAmount = userBet * 2
              depositPlayer(winningAmount, userName) #giving the winning player double their initial bet
              await context.message.channel.send(embed=winEmbed)
          elif coinSide == "heads" or coinSide == "Heads":
              loseEmbed = discord.Embed(title="You lose :slight_frown:", description="Coin flipped tails", colour=0xc0392b)
              await context.message.channel.send(embed=loseEmbed)
          else:
              errorEmbed = discord.Embed(title="Input Error!", description="Please enter the proper input", colour=0xda1ae3)
              depositPlayer(userBet, userName) #Refunding the player
              await context.message.channel.send(embed=errorEmbed)

    else: 
      errorEmbed = discord.Embed(title="Not enough balance!", colour=0xda1ae3)
      await context.message.channel.send(embed=errorEmbed)

@client.command(name="blackjack")
async def blackjack(context, userBet):

    #Ranks will be used to hold card number/face, suits will be used to hold suits
    #The same list positon means its the same card
    #Ex: 
        # playerRanks = [2, 'K']
        # playerSuits = ['♣', '♥']
        # players cards are 2♣ and K♥

    #NOTE: It doesn't print error when no argument is given, fix that later
    
    userName = context.author.name
    userBet = int(userBet)
    withdrawalValidity = withdrawalPlayer(userBet, userName)

    if withdrawalValidity == True:  #withdrawing money in advanced, to check if there is enough

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
          initialEmbed.add_field(name="Your Cards", value=displayCards(playerRanks, playerSuits), inline=False)
          await context.send(embed=initialEmbed)

          #Waiting for message from the user, also checks if it's the same user that invoked the !blackjack command to make sure no one else can play for them
          response = await client.wait_for('message', check=lambda message: message.author == context.author)

          if response.content == "hit":
              dealCard(playerRanks, playerSuits)
              if handValue(playerRanks) > 21: #Player bust
                  innerEmbed = discord.Embed(title="Blackjack", color=discord.Color.red())
                  innerEmbed.add_field(name="Bot's Cards", value=displayCards(botRanks, botSuits))   
                  innerEmbed.add_field(name="Your Cards", value=displayCards(playerRanks, playerSuits), inline=False)
                  innerEmbed.add_field(name="You bust! Bot wins!", value=":slight_frown:", inline=False) #NOTE:it's not value="" because if it is whitespace it causes an error
                  await context.send(embed=innerEmbed)
                  break

          elif response.content == "stand":
              while (handValue(botRanks) < 17) and (handValue(botRanks) < handValue(playerRanks)): #Determining whether bot should pick up cards or not
                  dealCard(botRanks, botSuits)

              if handValue(botRanks) > 21: #Bot bust
                  innerEmbed = discord.Embed(title="Blackjack", color=discord.Color.green())
                  innerEmbed.add_field(name="Bot's Cards", value=displayCards(botRanks, botSuits))   
                  innerEmbed.add_field(name="Your Cards", value=displayCards(playerRanks, playerSuits), inline=False)
                  innerEmbed.add_field(name="Bot busts! You win!", value=":grin:", inline=False)
                  depositPlayer(userBet*2, userName)
                  await context.message.channel.send(embed=innerEmbed)
                  break
              else:
                  if handValue(botRanks) > handValue(playerRanks): #Bot Wins
                      innerEmbed = discord.Embed(title="Blackjack", color=discord.Color.red())
                      innerEmbed.add_field(name="Bot's Cards", value=displayCards(botRanks, botSuits))   
                      innerEmbed.add_field(name="Your Cards", value=displayCards(playerRanks, playerSuits), inline=False)
                      innerEmbed.add_field(name="Bot wins!", value=":slight_frown:", inline=False)
                      await context.message.channel.send(embed=innerEmbed)
                      break

                  elif handValue(botRanks) == handValue(playerRanks): #Push/Draw
                      innerEmbed = discord.Embed(title="Blackjack", color=discord.Color.orange())
                      innerEmbed.add_field(name="Bot's Cards", value=displayCards(botRanks, botSuits))   
                      innerEmbed.add_field(name="Your Cards", value=displayCards(playerRanks, playerSuits), inline=False)
                      innerEmbed.add_field(name="Push! It was a draw!", value=":open_mouth:", inline=False)
                      depositPlayer(userBet, userName) #Gives the same amount back cause of push
                      await context.message.channel.send(embed=innerEmbed)
                      break

                  else: #Player wins
                      innerEmbed = discord.Embed(title="Blackjack", color=discord.Color.green())
                      innerEmbed.add_field(name="Bot's Cards", value=displayCards(botRanks, botSuits))   
                      innerEmbed.add_field(name="Your Cards", value=displayCards(playerRanks, playerSuits), inline=False)
                      innerEmbed.add_field(name="You win!", value=":grin:", inline=False)
                      depositPlayer(userBet*2, userName)
                      await context.message.channel.send(embed=innerEmbed)
                      break
          else:
              await context.message.channel.send("Error! Something went wrong")
              continue

    else: 
      errorEmbed = discord.Embed(title="Not enough balance!", colour=0xda1ae3)
      await context.message.channel.send(embed=errorEmbed)
        
@client.command(name="roulette")
async def roulette(context, userBet):
    
  initialEmbed = discord.Embed(title="Roulette", color=0xe416ee)
  initialEmbed.add_field( 
  name="Type red, black, or green to play!", 
  value="Probability to roll a :red_circle: (red) is 18/38 = 47.368%\n  Probability to roll a :black_circle: (black) is 18/38 = 47.368%\n Probability to roll a :green_circle: (green) is 2/38 = 5.26%"
  )
  await context.message.channel.send(embed=initialEmbed)

  userName = context.author.name
  userBet = int(userBet)
  withdrawalValidity = withdrawalPlayer(userBet, userName)

  if withdrawalValidity == True:  #withdrawing money in advanced, to check if there is enough
    
    while True:

      #Waiting for message from the user, also checks if it's the same user that invoked the !roulette command to make sure no one else can play for them
      bet = await client.wait_for('message', check=lambda message: message.author == context.author)

      rollColor = roll() #rolls red, black, or green

      if bet.content != "red" and bet.content != "black" and bet.content != "green": #Wrong input
          errorEmbed = discord.Embed(title="Enter a proper input!", color=discord.Color.gold())
          await context.message.channel.send(embed=errorEmbed)
          continue

      if bet.content == rollColor: #Player wins
          winEmbed = discord.Embed(title="You win!", color=discord.Color.green())
          results = "Rolled a " + rollColor + "!"
          winEmbed.add_field(name=results, value=":grin:")
          depositPlayer(userBet*2, userName)
          await context.message.channel.send(embed=winEmbed)
          break

      else: #Player loses
          loseEmbed = discord.Embed(title="You lose", color=discord.Color.red())
          results = "Rolled a " + rollColor + "!"
          loseEmbed.add_field(name=results, value=":slight_frown:")
          await context.message.channel.send(embed=loseEmbed)
          break
  
  else: 
    errorEmbed = discord.Embed(title="Not enough balance!", colour=0xda1ae3)
    await context.message.channel.send(embed=errorEmbed)


# Admin commands #

@client.command(name="showDatabase")
async def showDatabase(context):
  DBlist = (balance_DB.execute("SELECT * FROM Users").fetchall())
  str1 = ''
  for i in range(len(DBlist)):  #Converting the 2D list entries into a string with \n seperating every inner list
    str1 = str1 + str(DBlist[i]) + "\n"
  infoEmbed = discord.Embed(title="$ Balance Database $", description=str1)
  await context.message.channel.send(embed=infoEmbed)

@client.command(name="resetDatabase")
async def resetDatabase(context):
  balance_DB.execute("DROP TABLE IF EXISTS Users")
  balance_DB.execute("CREATE TABLE Users (userID int, balance int)")
  connection.commit()
  infoEmbed = discord.Embed(title="Database Reset!")
  await context.message.channel.send(embed=infoEmbed)

#TEST
@client.command(name="getName")
async def getName(context):
  nameEmbed = discord.Embed(title=context.author.name)
  await context.message.channel.send(embed=nameEmbed)

client.run(os.getenv('TOKEN'))