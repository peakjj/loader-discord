import { SlashCommandBuilder } from 'discord.js';
import mysql from 'mysql2/promise';

// Creates an object with the data required by Discord's API to create a SlashCommand
const create = () => {
	const command = new SlashCommandBuilder()
		.setName('resethwid')
		.setDescription('reset someones hwid')
        .addStringOption(option =>
            option.setName('username')
                .setDescription('whoms hwid')
                .setRequired(true)
        );

	return command.toJSON();
};

const deleteHwidFromDatabase = async (username) => {
	const connection = await mysql.createConnection({
		host: 'localhost',
		user: 'root',
		password: 'Paska213',
		database: 'loader'
	});

    try {
        const [result] = await connection.execute('UPDATE users SET hwid = "notset" WHERE username = ?', [username]);
        return result.affectedRows > 0;
    } catch (error) {
        console.error('Error removing HWID from database:', error);
        throw error;
    } finally {
        await connection.end();
    }
};



const invoke = async (interaction) => {
    const username = interaction.options.getString('username');

    try {
        const success = await deleteHwidFromDatabase(username);
        if (success) {
            interaction.reply({ content: `${username}'s hwid has been reset`, ephemeral: false });
        } else {
            interaction.reply({ content: `user ${username} not found.`, ephemeral: false });
        }
    } catch (error) {
        interaction.reply({ content: 'error', ephemeral: false });
    }
};


export { create, invoke };