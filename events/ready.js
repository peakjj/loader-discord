const once = false;
const name = 'interactionCreate';

// Replace this with the exact role **ID** or **name**
const REQUIRED_ROLE = '1034522697402695786'; // or '123456789012345678'

async function invoke(interaction) {
	if (!interaction.isChatInputCommand()) return;

	try {
		// Check if the member has the required role
		const member = interaction.member;
		const hasRole = member.roles.cache.some(role =>
			role.name === REQUIRED_ROLE || role.id === REQUIRED_ROLE
		);

		if (!hasRole) {
			return interaction.reply({
				content: `[-] no permission`,
				ephemeral: true,
			});
		}

		// Dynamically import and run the command
		const commandModule = await import(`#commands/${interaction.commandName}`);
		await commandModule.invoke(interaction);

	} catch (error) {
		console.error(`[interactionCreate] Error:`, error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: '? Error executing command.', ephemeral: true });
		} else {
			await interaction.reply({ content: '? Error executing command.', ephemeral: true });
		}
	}
}

export { once, name, invoke };
