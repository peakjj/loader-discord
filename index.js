import fs from 'fs';
import { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

import axios from 'axios';
import path from 'path';
import net from 'net';
import {exec} from 'child_process';
// Create a new Client with the Guilds intent
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

// Fetch all js files in ./events
const events = fs
	.readdirSync('./events')
	.filter((file) => file.endsWith('.js'));

// Check for an event and execute the corresponding file in ./events
for (let event of events) {
	const eventFile = await import(`#events/${event}`);
	// But first check if it's an event emitted once
	if (eventFile.once) {
		client.once(eventFile.name, (...args) => {
			eventFile.invoke(...args);
		});
	} else {
		client.on(eventFile.name, (...args) => {
			eventFile.invoke(...args);
		});
	}
}

function getFileName(fileName) {
  return path.basename(fileName.split('?')[0]);  // Clean the file name by removing query parameters
}

function getFileExtension(fileName) {
  const cleanFileName = fileName.split('?')[0];  // Clean file name
  return cleanFileName.split('.').pop();  // Extract the file extension
}

async function updateFile(fileUrl, filePath) {
  try {
    // Check if the file already exists, if yes, delete it
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Download the new file and save it to the desired path
    const response = await axios.get(fileUrl, { responseType: 'stream' });
    response.data.pipe(fs.createWriteStream(filePath));

    response.data.on('end', () => {
    });

    response.data.on('error', (error) => {
    });
  } catch (error) {
    console.error('Error handling file:', error);
  }
}

client.on('messageCreate', async (message) => {
  if (message.author.bot || message.channel.id !== "1394675023532527719") return;

  // Check if the message has attachments
  if (message.attachments.size > 0) {

    message.attachments.forEach(async (attachment) => {
      const fileUrl = attachment.url;
      const fileName = getFileName(attachment.name);  // Get the clean file name
      const extension = getFileExtension(fileName);  // Get the file extension
      const filenamereal = fileName.toLowerCase();  // Normalize the file name to lowercase

      if (extension === 'dll') {
        const filePath = "/home/karpo/!LOADER/files/jordan carter hook beta.dll";
        await updateFile(fileUrl, filePath);
        message.reply('[+] pushed update');
      } else if (extension === 'exe') {
        if (filenamereal === '129.exe') {
          const filePath = "/home/karpo/!LOADER/files/129.exe";
          await updateFile(fileUrl, filePath);


          const embed = new EmbedBuilder()
          .setTitle('[+] 129hack cs2 update')
          .addFields(
            {name: "changelog", value: message.content ? message.content : 'no changelog'}
          )
          .setColor(0x00ff00)
          .setTimestamp();

          await sendToTargetChannel(embed, message);

          message.reply('[+] pushed update');
        } else if (filenamereal === 'fivem.exe') {
          const filePath = "/home/karpo/!LOADER/files/fivem.exe";
          await updateFile(fileUrl, filePath);

          const embed = new EmbedBuilder()
          .setTitle('[+] niktiware fivem update')
          .addFields(
            {name: "changelog", value: message.content ? message.content : 'no changelog'}
          )
          .setColor(0x00ff00)
          .setTimestamp();
          
          await sendToTargetChannel(embed, message);

          message.reply('[+] pushed update');
        }
         else if (filenamereal === 'tfdopa.exe') {
          const filePath = "/home/karpo/!LOADER/files/tfdopa.exe";
          await updateFile(fileUrl, filePath);

          const embed = new EmbedBuilder()
          .setTitle('[+] pubstomper.cc tf2 update')
          .addFields(
            {name: "changelog", value: message.content ? message.content : 'no changelog'}
          )
          .setColor(0x00ff00)
          .setTimestamp();
          
          await sendToTargetChannel(embed, message);

          message.reply('[+] pushed update');
        }
      }
    });

  }
});

async function sendToTargetChannel(embed, msg) {
  const targetChannelId = '1393249967757463663'; // Replace with the actual channel ID
  const targetChannel = await msg.guild.channels.fetch(targetChannelId);
  
  if (targetChannel) {
    await targetChannel.send({
      embeds: [embed],  // Send the embed
    });

  } else {
    console.error('Target channel not found');
  }
}


/*const isTcpServerRunning = async (host, port) => {
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
};*/


const checkServiceStatus = async() => {

  return new Promise((resolve, reject) => {
    exec(`systemctl is-active server`, (error, stdout, stderr) => {
      if (error) {
        resolve(false);
        return;
      }

      const status = stdout.trim();
      resolve(status === 'active');
    });
  });
}

let status = "loader server down";
const setBotStatus = async () => {
  try {
     // const isRunning = await isTcpServerRunning("109.204.232.191", 8080);
      const isRunning = await checkServiceStatus();
      if (isRunning) {
        status = "loader server healthy";
        client.user.setPresence({ activities: [{ name: 'loader server healthy' }], status: 'online' });
      } else {
        status = "loader server down";
        client.user.setPresence({ activities: [{ name: 'loader server down' }], status: 'dnd' });

      }
  } catch (error) {
    console.log(error);
    client.user.setPresence({ activities: [{ name: 'loader server down' }], status: 'dnd' });

  }
};

const getLastModifiedTime = (filePath) => {
  try {
      const stats = fs.statSync(filePath);
      const date = new Date(stats.mtime);

      // Format date as Day.Month.Year
      const day = date.getDate();
      const month = date.getMonth() + 1; // Months are zero-based
      const year = date.getFullYear();

      // Format time as Military Hour.Minute
      const hour = date.getHours().toString().padStart(2, '0'); // Ensure two digits for hour
      const minute = date.getMinutes().toString().padStart(2, '0'); // Ensure two digits for minute

      // Return the formatted date and time in Military format
      return `${day}.${month}.${year} / ${hour}.${minute}`;
  } catch (error) {
      return 'Not found or access error';
  }
};

const messageIdFile = './messageId.txt'; // Path to save the message ID
const channelId = '1393249938061660291'; // Replace with your channel ID

const downloadFile = "/home/karpo/!LOADER/files/overwolf_autoupdate.exe"; // Replace with your actual file path


client.once('ready', async () => {
  console.log("checking server");
 /* client.user.setBanner('./banner.jpg')
    .then(user => console.log(`banner set`))
    .catch(console.error);*/
  setBotStatus();
    setInterval(setBotStatus, 120000); // 30000 ms = 30 seconds
    let messageId = null;

    // Check if a messageId already exists in the file
    if (fs.existsSync(messageIdFile)) {
        messageId = fs.readFileSync(messageIdFile, 'utf-8');
    }

    const channel = await client.channels.fetch(channelId);
    
    // If there's an existing message ID, delete that message
    if (messageId) {
        try {
            const oldMessage = await channel.messages.fetch(messageId);
            await oldMessage.delete();
            console.log('Deleted old message');
        } catch (error) {
            console.log('Old message not found, it may have already been deleted');
        }
    }
    let color2 = 0xFF0000;
    if(status == "loader server healthy") {
      color2 = 0x00ff00;
    }
    // Create a new embed

    let fivemModified = getLastModifiedTime("/home/karpo/!LOADER/files/fivem.exe");
    let cs2Modified = getLastModifiedTime("/home/karpo/!LOADER/files/129.exe");
    let gtModified = getLastModifiedTime("/home/karpo/!LOADER/files/tfdopa.exe");

    const embed = new EmbedBuilder()
    .setTitle(status)
    //.setDescription(status)
        .setColor(color2)
        .addFields(
          { name: 'fivem last update: ', value: fivemModified },
          { name: 'cs2 last update: ', value: cs2Modified },
          { name: 'tf2 last update: ', value: gtModified }
      )
        .setTimestamp();

        const downloadButton = new ButtonBuilder()
        .setCustomId('download_button') // ID to identify button action
        .setLabel('download loader') // Button label
        .setStyle(ButtonStyle.Success) // Primary color style

    // Create an Action Row for the button
    const row = new ActionRowBuilder().addComponents(downloadButton);
    // Send a new embed
    const message = await channel.send({
      embeds: [embed],
      components: [row]
  });

      client.on('interactionCreate', async interaction => {
        if (!interaction.isButton()) return;
      
        if (interaction.customId === 'download_button') {
            try {
                // Defer the reply (no message in chat) until the file is ready
                await interaction.deferReply();
            
                // Send the file without a visible message in the chat (attachment only)
                await interaction.editReply({
                    files: [downloadFile], // Path to your downloadable file
                    ephemeral: true // This ensures only the user who clicked sees the file
                });
              
                // Optionally, delete the reply message after a short delay (not showing in the chat)
                setTimeout(async () => {
                    await interaction.deleteReply(); // This deletes the reply and removes it from chat
                }, 30000); // 1 second delay before deleting
              
            } catch (error) {
                console.log('Error sending file:', error);
                await interaction.editReply({ content: 'There was an error sending the file.' });
            }
        }
    });

    // Save the new message ID
    fs.writeFileSync(messageIdFile, message.id);

    // Update the embed in 30 seconds
    setInterval(async () => {
      let color = 0xFF0000;
      if(status == "loader server healthy") {
        color = 0x00ff00;
      }
      fivemModified = getLastModifiedTime("/home/karpo/!LOADER/files/fivem.exe");
      cs2Modified = getLastModifiedTime("/home/karpo/!LOADER/files/129.exe");
      gtModified = getLastModifiedTime("/home/karpo/!LOADER/files/tfdopa.exe");
        const updatedEmbed = new EmbedBuilder()
          .setTitle(status)
            //.setDescription(status)
            .setColor(color)
            .addFields(
              { name: 'fivem updated: ', value: fivemModified },
              { name: 'cs2 updated: ', value: cs2Modified },
              { name: 'tf2 updated: ', value: gtModified }
          )
            .setTimestamp();

        // Edit the message
        await message.edit({ embeds: [updatedEmbed] });
    }, 30000);
});

client.login('TOKEN')
