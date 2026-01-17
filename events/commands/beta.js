import { SlashCommandBuilder } from 'discord.js';
import mysql from 'mysql2/promise';

// Creates an object with the data required by Discord's API to create a SlashCommand
const create = () => {
	const command = new SlashCommandBuilder()
		.setName('beta')
		.setDescription('set beta status')
        .addStringOption(option =>
            option.setName('username')
                .setDescription('whoms hwid')
                .setRequired(true)
        )
        .addBooleanOption(option =>
            option.setName('status')
                .setDescription('true /false')
                .setRequired(true)
        );
	return command.toJSON();
};

const setbeta = async (username, status) => {
	const connection = await mysql.createConnection({
		host: 'localhost',
		user: 'root',
		password: 'Paska213',
		database: 'loader'
	});

    try {
        const [result] = await connection.execute('UPDATE users SET beta = ? WHERE username = ?', [status ? 1 : 0, username]);
        return result.affectedRows > 0;
    } catch (error) {
        console.error('Error setting beta status in database:', error);
        throw error;
    } finally {
        await connection.end();
    }
};



const invoke = async (interaction) => {
    const username = interaction.options.getString('username');
    const status = interaction.options.getBoolean('status');

    try {
        const success = await setbeta(username, status);
        if (success) {
            interaction.reply({ content: `set beta for ${username} to ${status}`, ephemeral: false });
        } else {
            interaction.reply({ content: `user ${username} not found`, ephemeral: false });
        }
    } catch (error) {
        interaction.reply({ content: 'error', ephemeral: false });
    }
};


export { create, invoke };