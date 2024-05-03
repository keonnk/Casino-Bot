import { Client, Collection, Events, GatewayIntentBits, IntentsBitField } from 'discord.js';
import config from './config.js';
import fs from 'fs'

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        // IntentsBitField.Flags.Guilds,
        // IntentsBitField.Flags.GuildMembers,
        // IntentsBitField.Flags.GuildMessages,
        // IntentsBitField.Flags.MessageContent,
    ]
});

client.on('ready', (c) => {
    console.log(`${c.user.tag} is online!`)
});

const commandFolder = fs.readdirSync('./dist/commands').filter(file => file.endsWith('.js'))
const commands = new Collection()

/**
 * Command Loader
 * Will import all commands in the 'commands' folder into the commands collection for later use
 */
for (const file of commandFolder) {
    let command = await import('./commands/' + file)
    command = command.default

    if('data' in command && 'execute' in command) {
        commands.set(command.data.name, command)
    }
    else {
        console.log(`The command at ${file} is missing a required "data" or "execute" property`)
    }
}

/**
 * Command Handler
 * An event listener that listens for interactions
 * The interaction commandName will be compared with the commands collection from above
 * If there's a match, the execute function for the particular command will be run
 */
client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = commands.get(interaction.commandName)

    if(!command) {
        console.error(`No command matching ${interaction.commandName} was found`)
        return;
    }

    try {
        //@ts-ignore
        await command.execute(interaction)
    }
    catch(err) {
        console.error(err)
        if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
    }
})

client.login(config.token);

