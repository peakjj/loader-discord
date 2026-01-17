import { SlashCommandBuilder } from 'discord.js';
import mysql from 'mysql2/promise';

const deleteSubCommand = () => {
    return new SlashCommandBuilder()
        .setName('delsub')
        .setDescription('delete a subscription')
        .addStringOption(option =>
            option.setName('username')
                .setDescription('username of user in loader')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('product')
                .setDescription('product to delete subscription for')
                .addChoices(
                    { name: 'cs2', value: 'cs2' },
                    { name: 'fivem', value: 'fivem' },
                    { name: 'rust', value: 'rust' },
                    { name: 'fivem_b', value: 'fivem_b' },
                    { name: 'growtopia', value: 'growtopia' },
                    {name: 'tf2', value: 'tf2'}
                )
                .setRequired(true))
        .toJSON();
};

const deleteSubscription = async (username, product) => {
    const conn = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'Paska213',
        database: 'loader'
    });

    try {
        const query = `
            DELETE FROM subscriptions
            WHERE username = ? AND product = ?
        `;

        const [result] = await conn.execute(query, [username, product]);
        return result.affectedRows > 0;
    } catch (err) {
        console.error('DB error:', err);
        throw err;
    } finally {
        await conn.end();
    }
};

const invokeDeleteSub = async (interaction) => {
    const username = interaction.options.getString('username');
    const product = interaction.options.getString('product');

    if (!username || !product) {
        await interaction.reply({ content: '[!] missing params', ephemeral: true });
        return;
    }

    try {
        const success = await deleteSubscription(username, product);
        if (success) {
            await interaction.reply({ content: `[+] deleted sub for ${username} on product ${product}`, ephemeral: false });
        } else {
            await interaction.reply({ content: `[!] no sub found for ${username} on product ${product}`, ephemeral: true });
        }
    } catch (error) {
        await interaction.reply({ content: `[!] error occurred: ${error.message}`, ephemeral: true });
    }
};

export { deleteSubCommand as create, invokeDeleteSub as invoke };
