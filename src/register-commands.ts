import { REST, Routes } from 'discord.js';
import config from './config.js';

const commands = [
    {
        name: 'ping',
        description: 'pings the bot',
    },
]

const rest = new REST({version: '10'}).setToken(config.token);

(async () => {
    try {
        console.log('Registering slash commands')

        await rest.put(
            Routes.applicationGuildCommands(), //client_id and guild_id
            {body: commands}
        )

        console.log('Slash commands were registered successfully')
    } catch (error) {
        console.log(error)
    }
})