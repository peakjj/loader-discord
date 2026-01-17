import { SlashCommandBuilder } from 'discord.js';
import mysql from 'mysql2/promise';

// Creates an object with the data required by Discord's API to create a SlashCommand
const create = () => {
	const command = new SlashCommandBuilder()
		.setName('getusers')
		.setDescription('get user list')
		/*.addUserOption((option) =>
			option.setName('user').setDescription('Greet someone?')
		);*/

	return command.toJSON();
};

async function fetchAllUsers() {
	const connection = await mysql.createConnection({
		host: 'localhost',
		user: 'root',
		password: 'Paska213',
		database: 'loader'
	});

	try {
		const [rows] = await connection.execute('SELECT * FROM users');
		return rows;
	} catch (error) {
		console.error('Fetch failed:', error);
		return [];
	} finally {
		await connection.end();
	}
}


const invoke = async (interaction) => {
	try {
		const users = await fetchAllUsers();
		if (users.length > 0) {
			const userList = users.map(user => `uid: ${user.uid}, user: ${user.username}`).join('\n');
			interaction.reply({ content: `${userList}`, ephemeral: false });
		} else {
			interaction.reply({ content: 'No users found.', ephemeral: false });
		}
	} catch (error) {
		interaction.reply({ content: 'Failed to fetch users.', ephemeral: false });
		console.error('Interaction failed:', error);
	}
};
export { create, invoke };