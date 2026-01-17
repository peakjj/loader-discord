import { SlashCommandBuilder } from 'discord.js';
import mysql from 'mysql2/promise';

// Creates an object with the data required by Discord's API to create a SlashCommand
const create = () => {
	const command = new SlashCommandBuilder()
		.setName('geninvite')
		.setDescription('generate an invite')
		.addIntegerOption(option =>
			option.setName('count')
				.setDescription('how many invites')
				.setRequired(true)
		);

	return command.toJSON();
};

async function insertIntoDatabase(codes) {
	const connection = await mysql.createConnection({
		host: 'localhost',
		user: 'root',
		password: 'Paska213',
		database: 'loader'
	});

	try {
		const placeholders = codes.map(() => '(?)').join(',');
		const [rows] = await connection.execute(`INSERT INTO registration_codes (code) VALUES ${placeholders}`, codes);
	} catch (error) {
		console.error('Insert failed:', error);
	} finally {
		await connection.end();
	}
}


function generatestring() {
	const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	let result = '';
	for (let i = 0; i < 10; i++) {
		result += characters.charAt(Math.floor(Math.random() * characters.length));
	}
	return result;
}

function generateinvite(count) {
	const codes = [];
	for (let i = 0; i < count; i++) {
		codes.push(generatestring());
	}
	insertIntoDatabase(codes);
	return codes;
}

// Called by the interactionCreate event listener when the corresponding command is invoked
const invoke = (interaction) => {
	const count = interaction.options.getInteger('count');

	if (count > 0) {
		const codes = generateinvite(count);
		const codeList = codes.join('\n');
		console.log(`generated ${count} invites`);
		interaction.reply({ content: `invites:\n${codeList}`, ephemeral: false });
	} else {
		interaction.reply({ content: 'not positive', ephemeral: true });
	}
};

export { create, invoke };