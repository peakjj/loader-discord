import { SlashCommandBuilder } from 'discord.js';
import net from 'net';
import { exec } from 'child_process'; // Import exec for executing shell commands

// Creates an object with the data required by Discord's API to create a SlashCommand
const create = () => {
	const command = new SlashCommandBuilder()
		.setName('status')
		.setDescription('check server health')
	return command.toJSON();
};

const isTcpServerRunning = async (host, port) => {
    return new Promise((resolve, reject) => {
        const socket = new net.Socket();

        socket.setTimeout(2000); // Timeout after 2 seconds
        socket.once('error', (err) => {
            socket.destroy();
            reject(false);
        });

        socket.once('timeout', () => {
            socket.destroy();
            reject(false);
        });

        socket.connect(port, host, () => {
            socket.end();
            resolve(true);
        });
    });
};

const checkServiceStatus = async() => {

    return new Promise((resolve, reject) => {
      exec(`systemctl is-active loader`, (error, stdout, stderr) => {
        if (error) {
          resolve(false);
          return;
        }
  
        const status = stdout.trim();
        resolve(status === 'active');
      });
    });
  }
  

// Called by the interactionCreate event listener when the corresponding command is invoked
const invoke = async (interaction) => {
	try {
        const isRunning = await checkServiceStatus();
        if (isRunning) {
            interaction.reply({ content: '[+] loader server is healthy', ephemeral: false });
        } else {
            interaction.reply({ content: '[!] loader server is down', ephemeral: false });
        }
	} catch (error) {
		interaction.reply({ content: '[!] loader server is down', ephemeral: false });
		console.error('loader server is down', error);
	}
};





export { create, invoke };