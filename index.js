require('dotenv').config();

const { Client } = require('discord.js');
const isInvitation = require('is-discord-invite');
const client = new Client({ intents: [1, 512, 32768] });


client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', async msg => {
	if (msg.author.bot || msg.channel.type === 'dm') return; // Ignore messages from bots and private messages (user => bot)
	if (msg.content.length <= 10) return; // Ignore messages that have less than 10 characters

	const result = await isInvitation.online(msg.content); // Validate the received message using Discord API v10
	if (!result) return console.log('An error occurred while validating the invitation.');

	if (result.isInvitation) {
		if (result.guild.id === msg.guild.id) {
			await msg.reply('This invitation is associated with this server. No actions have been taken.');
			return console.log(`The user ${msg.author.username} sent an invitation associated with the server where the message was sent`);
		}

		await msg.delete();
		await msg.channel.send(`
			${msg.author}, you cannot send any invitations on this server!
		
			- **Guild name:** ${result.guild.name}
			- **Guild ID:** \`${result.guild.id}\`
			- **Inviter:** ${result.inviter.username} (${result.inviter.global_name})
			- **Inviter ID:** \`${result.inviter.id}\``
		);

		console.log('Message is an invitation!');
	} else {
		console.log('Message is not an invitation.');
	}
});


client.login(process.env.TOKEN);