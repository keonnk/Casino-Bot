import config from "./config.js";
import {REST, Routes } from 'discord.js'
import fs from 'fs'

/**
 * NOTE: 
 * Only run seperately when slash command definitions change
 * You are able to modify the execute functions without re-running this file
 */

const commandFolder = fs.readdirSync('./dist/commands').filter(file => file.endsWith('.js'))
const commands = []

for (const file of commandFolder) {
    let command = await import('./commands/' + file)
    command = command.default

    if('data' in command && 'execute' in command) {
        commands.push(command.data.toJSON())
    }
    else {
        console.log(`The command at ${file} is missing a required "data" or "execute" property`)
    }
}

const rest = new REST().setToken(config.token);

(async () => {
    try {
        console.log(`Registering ${commands.length} (/) commands`)
    
        const data = await rest.put(
            Routes.applicationCommands(config.client_id),
            {body: commands},
        );
    
        //@ts-ignore
        console.log(`Successfully registered ${data.length} (/) commands`)
    } catch(err) {
        console.error(err)
    }
})();
