process.loadEnvFile();

const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const isInvitation = require('is-discord-invite');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });


client.on('clientReady', () => {
	console.log(`Bot logged in as ${client.user.tag}\nMonitoring ${client.guilds.cache.size} servers for invitations...`);
});

client.on('messageCreate', async msg => {
	if (msg.author.bot || msg.channel.isDMBased() || msg.content.length <= 10) return;

	const result = await isInvitation.online(msg.content);
	if (!result) return console.warn('API validation failed');

	if (result.isInvitation) {
		const serverIcon = result.guild.icon ? `https://cdn.discordapp.com/icons/${result.guild.id}/${result.guild.icon}.png` : msg.author.displayAvatarURL();

		if (result.guild.id === msg.guild.id) {
			await msg.reply({ embeds: [new EmbedBuilder()
				.setColor('#00D26A')
				.setAuthor({ name: '✅ Own Server Invitation', iconURL: serverIcon })
				.setDescription('This invitation is associated with this server. No actions have been taken.')] });

			return console.log(`Own server invitation detected: ${msg.author.username} (${msg.author.id}) -> ${msg.guild.name} (${msg.guild.id})`);
		}

		await msg.delete();

		await msg.channel.send({ embeds: [new EmbedBuilder()
			.setColor('#F92F60')
			.setAuthor({ name: '❌ Invitation Detected', iconURL: serverIcon })
			.setDescription(`${msg.author}, you cannot send any invitations on this server!`)
			.addFields(
				{ name: '🏰 Guild Name', value: result.guild.name, inline: true },
				{ name: '🆔 Guild ID', value: `\`${result.guild.id}\``, inline: true },
				{ name: '🆔 Inviter ID', value: `\`${result.inviter.id}\``, inline: true }
			)] });

		console.log(`Invitation deleted: ${msg.author.username} (${msg.author.id}) -> ${result.guild.name} (${msg.guild.id})`);
	}
});


client.login(process.env.TOKEN);