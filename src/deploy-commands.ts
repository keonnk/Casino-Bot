import config from "./config.js";
import {REST, Routes } from 'discord.js'
import fs from 'fs'
import path from 'path'

/**
 * NOTE: 
 * Only run seperately when slash command definitions change
 * You are able to modify the execute functions without re-running this file
 */

const commandFolder = fs.readdirSync('./commands').filter(file => file.endsWith('.js'))
const commands = []

for (const file of commandFolder) {
    const command = require(file)

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
    
        console.log(`Successfully registered ${data.length} (/) commands`)
    } catch(err) {
        console.error(err)
    }
})
