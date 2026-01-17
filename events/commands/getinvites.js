import { SlashCommandBuilder } from 'discord.js';
import mysql from 'mysql2/promise';

// Creates an object with the data required by Discord's API to create a SlashCommand
const create = () => {
	const command = new SlashCommandBuilder()
		.setName('getinvites')
		.setDescription('get all active invites');

	return command.toJSON();
};

async function fetchInvites() {
	const connection = await mysql.createConnection({
		host: 'localhost',
		user: 'root',
		password: 'Paska213',
		database: 'loader'
	});

	try {
		const [rows] = await connection.execute('SELECT code FROM registration_codes');
		return rows;
	} catch (error) {
		console.error('Fetch failed:', error);
		return [];
	} finally {
		await connection.end();
	}
}


// Called by the interactionCreate event listener when the corresponding command is invoked
const invoke = async (interaction) => {
	try {
		const invites = await fetchInvites();
		if (invites.length > 0) {
			const inviteList = invites.map(invite => `invite: ${invite.code}`).join('\n');
			interaction.reply({ content: `${inviteList}`, ephemeral: false });
		} else {
			interaction.reply({ content: 'No invite codes found.', ephemeral: false });
		}
	} catch (error) {
		interaction.reply({ content: 'Failed to fetch invite codes.', ephemeral: false });
		console.error('Interaction failed:', error);
	}
};

export { create, invoke };