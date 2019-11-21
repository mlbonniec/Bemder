import {Client, RichEmbed} from 'discord.js';

const client = new Client();
const token = "YOUR_DISCORD_TOKEN_HERE";

client.on('ready', () => {
	console.log(`Connected with the user ${client.user.tag}!`);
	client.user.setPresence({game: {name: 'at quoting messages.', type: 'PLAYING'}, status: 'online'});
});

client.on('message', async message => {
    if(message.author.bot) return;
    
    const regex = /https:\/\/discordapp\.com\/channels\/[0-9]{18}\/[0-9]{18}\/[0-9]{18}/;
    if(!message.content.match(regex)) return;
    const url = regex.exec(message.content)[0];
    const split = url.split('/');
    if(message.guild.id !== split[4]) return;
    const channel = message.guild.channels.find(c => c.id === split[5]);
    if(!channel) return;
    await channel.fetchMessage(split[6]).then(
        msg => {
            if(msg.embeds.length !== 0) return;
            const embed = new RichEmbed()
                .setAuthor(`${msg.author.username}#${msg.author.discriminator}`, msg.author.avatarURL, url)
                .setThumbnail(msg.author.avatarURL)
                .setTimestamp(new Date())
                .setDescription(msg.content)
                .setColor(msg.author.displayColor)
                .setFooter(`Quoted by ${message.author.username}#${message.author.discriminator} | From #${msg.channel.name}`);

            if (msg.attachments !== undefined && msg.attachments.size <= 25) {
                let nbrattachement = 1;
                msg.attachments.forEach(attachment => {
                    embed.addField(`Attachement ${nbrattachement}`, attachment.url);
                    nbrattachement++;   
                });
            }
            message.channel.send(embed)
                .then(message => message.react(':x:'))
                .catch(err => console.error(err));
        }
    ).catch(() => {return;})
});

client.on('messageReactionAdd', async (reaction, user) => {
    if(reaction.emoji === ':x:' && reaction.message.author === reaction.me) reaction.message.delete();
})

client.login(token);