import { Client, Collection, Events, IntentsBitField } from 'discord.js';
import config from './config.js';
import fs from 'fs'

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent
    ]
});

client.on('ready', (c) => {
    console.log(`${c.user.tag} is online!`)
});

/*Command Handler*/
const commandFolder = fs.readdirSync('./commands').filter(file => file.endsWith('.js'))
const commands = new Collection()

for (const file of commandFolder) {
    const command = require(file)

    if('data' in command && 'execute' in command) {
        commands.set(command.data.name, command)
    }
    else {
        console.log(`The command at ${file} is missing a required "data" or "execute" property`)
    }
}

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

