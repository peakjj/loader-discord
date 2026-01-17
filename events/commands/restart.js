import { SlashCommandBuilder } from 'discord.js';
import net from 'net';
import { exec } from 'child_process'; // Import exec for executing shell commands

// Creates an object with the data required by Discord's API to create a SlashCommand
const create = () => {
	const command = new SlashCommandBuilder()
		.setName('restart')
		.setDescription('restart loader server (lel)')
	return command.toJSON();
};



const checkServiceStatus = async() => {

    return new Promise((resolve, reject) => {
      exec(`sudo systemctl restart loader`, (error, stdout, stderr) => {
        if (error) {
          resolve(false);
          return;
        }
          resolve(true);
      });
    });
  }
  

// Called by the interactionCreate event listener when the corresponding command is invoked
const invoke = async (interaction) => {
	try {
        const isRunning = await checkServiceStatus();
        if (isRunning) {
            interaction.reply({ content: '[+] loader server restarted', ephemeral: false });
        } else {
            interaction.reply({ content: '[!] failed to restart loader server', ephemeral: false });
        }
	} catch (error) {
		interaction.reply({ content: '[!] loader server is down', ephemeral: false });
		console.error('loader server is down', error);
	}
};





export { create, invoke };