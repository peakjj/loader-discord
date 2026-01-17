import { SlashCommandBuilder } from 'discord.js';
import mysql from 'mysql2/promise';

const allowedProducts = ['cs2', 'fivem', 'rust', 'fivem_b', 'growtopia', 'tf2'];

const create = () => {
    return new SlashCommandBuilder()
        .setName('addsub')
        .setDescription('add a subscription')
        .addStringOption(option =>
            option.setName('username')
                .setDescription('username of user in loader')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('product')
                .setDescription('product to add subscription for')
                .addChoices(
                    { name: 'cs2', value: 'cs2' },
                    { name: 'fivem', value: 'fivem' },
                    { name: 'rust', value: 'rust' },
                    { name: 'fivem_b', value: 'fivem_b' },
                    { name: 'growtopia', value: 'growtopia' },
                    {name: 'tf2', value: 'tf2'}

                )
            .setRequired(true))
        .addStringOption(option =>
            option.setName('days')
                .setDescription('days or "lifetime"')
                .setRequired(true))

        .toJSON();
};

function getExpiryDate(days) {
    if (days.toLowerCase() === 'lifetime') return "lifetime";

    const numDays = parseInt(days, 10);
    if (isNaN(numDays) || numDays <= 0) return null;

    const expiryDate = new Date();
    expiryDate.setUTCDate(expiryDate.getUTCDate() + numDays);

    // Return ISO string without milliseconds and timezone (YYYY-MM-DDTHH:mm:ss)
    return expiryDate.toISOString().split('.')[0];
}


const addSubscription = async (username, days, product) => {
    const conn = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'Paska213',
        database: 'loader'
    });

    try {
        const expires_at = getExpiryDate(days);

        // Insert or update
        const query = `
            INSERT INTO subscriptions (username, product, expires_at)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE expires_at = VALUES(expires_at)
        `;

        await conn.execute(query, [username, product, expires_at]);
        return true;
    } catch (err) {
        console.error('DB error:', err);
        throw err;
    } finally {
        await conn.end();
    }
};

const invoke = async (interaction) => {
    const username = interaction.options.getString('username');
    const days = interaction.options.getString('days');
    const product = interaction.options.getString('product');

    if (!username || !days || !product) {
        await interaction.reply({ content: '[!] missing params', ephemeral: true });
        return;
    }

    try {
        const success = await addSubscription(username, days, product);
        if (success) {
            await interaction.reply({ content: `[+] sub added for ${username} on product ${product} with duration: ${days}`, ephemeral: false });
        } else {
            await interaction.reply({ content: `[!] failure for ${username}.`, ephemeral: true });
        }
    } catch (error) {
        await interaction.reply({ content: `[!] something went wrong: ${error.message}`, ephemeral: true });
    }
};

export { create, invoke };
