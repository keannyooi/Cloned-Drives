/*
 __  ___  _______     ___      .__   __. .__   __. ____    ____ 
|  |/  / |   ____|   /   \     |  \ |  | |  \ |  | \   \  /   / 
|  '  /  |  |__     /  ^  \    |   \|  | |   \|  |  \   \/   /  
|    <   |   __|   /  /_\  \   |  . `  | |  . `  |   \_    _/   
|  .  \  |  |____ /  _____  \  |  |\   | |  |\   |     |  |     
|__|\__\ |_______/__/     \__\ |__| \__| |__| \__|     |__| 	(this is a watermark that proves that these lines of code are mine)
*/

const Discord = require("discord.js-light");

module.exports = {
    name: "removetrophies",
	aliases: ["rmvtrophies"],
    usage: "<username> <amount here>",
    args: 2,
	isExternal: false,
    adminOnly: true,
    description: "Removes a certain amount of trophies from someone.",
    execute(message, args) {
		const db = message.client.db;
        const trophyEmoji = message.client.emojis.cache.get("775636479145148418");
        
        const filter = response => {
            return response.author.id === message.author.id;
        };

        if (message.mentions.users.first()) {
			if (!message.mentions.users.first().bot) {
				removeStuff(message.mentions.users.first());
			}
			else {
				message.client.execList.splice(message.client.execList.indexOf(message.author.id), 1);
				const errorMessage = new Discord.MessageEmbed()
					.setColor("#fc0303")
					.setAuthor(message.author.tag, message.author.displayAvatarURL({ format: "png", dynamic: true }))
					.setTitle("Error, user requested is a bot.")
					.setDescription("Bots can't play Cloned Drives.")
					.setTimestamp();
				return message.channel.send(errorMessage);
			}
		}
		else {
			let userName = args[0].toLowerCase();
			let userList = [];
			message.guild.members.cache.forEach(User => {
				if ((User.displayName.toLowerCase().includes(userName) || User.user.username.toLowerCase().includes(userName)) && !User.user.bot) {
					userList.push(User.user);
				}
			});

			if (userList.length > 1) {
				let textList = "";
				for (i = 1; i <= userList.length; i++) {
					textList += `${i} - ${userList[i - 1].tag}\n`;
				}

				if (textList.length > 2048) {
					message.client.execList.splice(message.client.execList.indexOf(message.author.id), 1);
					const errorMessage = new Discord.MessageEmbed()
						.setColor("#fc0303")
						.setAuthor(message.author.tag, message.author.displayAvatarURL({ format: "png", dynamic: true }))
						.setTitle("Error, too many search results.")
						.setDescription("Due to Discord's embed limitations, the bot isn't able to show the full list of search results. Try again with a more specific keyword.")
						.setTimestamp();
					return message.channel.send(errorMessage);
				}

				const infoScreen = new Discord.MessageEmbed()
					.setColor("#34aeeb")
					.setAuthor(message.author.tag, message.author.displayAvatarURL({ format: "png", dynamic: true }))
					.setTitle("Multiple users found, please type one of the following.")
					.setDescription(textList)
					.setTimestamp();

				message.channel.send(infoScreen).then(currentMessage => {
					message.channel.awaitMessages(filter, {
						max: 1,
						time: 30000,
						errors: ["time"]
					})
						.then(collected => {
							collected.first().delete();
							if (isNaN(collected.first().content) || parseInt(collected.first().content) > userList.length || parseInt(collected.first().content) < 1) {
								message.client.execList.splice(message.client.execList.indexOf(message.author.id), 1);
								const errorMessage = new Discord.MessageEmbed()
									.setColor("#fc0303")
									.setAuthor(message.author.tag, message.author.displayAvatarURL({ format: "png", dynamic: true }))
									.setTitle("Error, invalid integer provided.")
									.setDescription("It looks like your response was either not a number or not part of the selection.")
									.setTimestamp();
								return currentMessage.edit(errorMessage);
							}
							else {
								removeStuff(userList[parseInt(collected.first().content) - 1], currentMessage);
							}
						})
						.catch(() => {
							message.client.execList.splice(message.client.execList.indexOf(message.author.id), 1);
							const cancelMessage = new Discord.MessageEmbed()
								.setColor("#34aeeb")
								.setAuthor(message.author.tag, message.author.displayAvatarURL({ format: "png", dynamic: true }))
								.setTitle("Action cancelled automatically.")
								.setTimestamp();
							return currentMessage.edit(cancelMessage);
						});
				});
			}
			else if (userList.length > 0) {
				removeStuff(userList[0]);
			}
			else {
				message.client.execList.splice(message.client.execList.indexOf(message.author.id), 1);
				const errorMessage = new Discord.MessageEmbed()
					.setColor("#fc0303")
					.setAuthor(message.author.tag, message.author.displayAvatarURL({ format: "png", dynamic: true }))
					.setTitle("Error, 404 user not found.")
					.setDescription("It looks like this user isn't in this server.")
					.setTimestamp();
				return message.channel.send(errorMessage);
			}
		}

		async function removeStuff(user, currentMessage) {
			const amount = Math.ceil(parseInt(args[1]));
			if (isNaN(amount)) {
				message.client.execList.splice(message.client.execList.indexOf(message.author.id), 1);
				const errorMessage = new Discord.MessageEmbed()
					.setColor("#fc0303")
					.setAuthor(message.author.tag, message.author.displayAvatarURL({ format: "png", dynamic: true }))
					.setTitle("Error, trophy amount provided is not a number.")
					.setDescription("The amount of trophies you want to remove should always be a number, i.e: `133`, `7`, etc.")
					.setTimestamp();
				if (currentMessage) {
					return currentMessage.edit(errorMessage);
				}
				else {
					return message.channel.send(errorMessage);
				}
			}
			else if (amount < 1) {
				message.client.execList.splice(message.client.execList.indexOf(message.author.id), 1);
				const errorMessage = new Discord.MessageEmbed()
					.setColor("#fc0303")
					.setAuthor(message.author.tag, message.author.displayAvatarURL({ format: "png", dynamic: true }))
					.setTitle("Error, trophy amount provided is less than or equal to 0.")
					.setDescription("The amount of trophies you want to remove should always be bigger than 0.")
					.setTimestamp();
				if (currentMessage) {
					return currentMessage.edit(errorMessage);
				}
				else {
					return message.channel.send(errorMessage);
				}
			}

			let trophies = await db.get(`acc${user.id}.trophies`);
			if (amount <= trophies) {
				trophies -= amount;
				await db.set(`acc${user.id}.trophies`, trophies);
				message.client.execList.splice(message.client.execList.indexOf(message.author.id), 1);

				const infoScreen = new Discord.MessageEmbed()
					.setColor('#03fc24')
					.setAuthor(message.author.tag, message.author.displayAvatarURL({ format: "png", dynamic: true }))
					.setTitle(`Successfully removed ${trophyEmoji}${amount} from ${user.username}'s cash balance!`)
					.setDescription(`Current Trophy Balance: ${trophyEmoji}${trophies}`)
					.setTimestamp();
				if (currentMessage) {
					return currentMessage.edit(infoScreen);
				}
				else {
					return message.channel.send(infoScreen);
				}
			}
			else {
				message.client.execList.splice(message.client.execList.indexOf(message.author.id), 1);
				const errorMessage = new Discord.MessageEmbed()
					.setColor("#fc0303")
					.setAuthor(message.author.tag, message.author.displayAvatarURL({ format: "png", dynamic: true }))
					.setTitle("Error, a user's balance cannot be in the negatives.")
					.setDescription("The amount of trophies that can be taken away should not be bigger than the user's trophy balance")
					.addFields(
						{ name: `${user.username}'s trophy Balance`, value: `${trophyEmoji}${trophies}`, inline: true },
						{ name: "Amount You Are Tyring to Take Away", value: `${trophyEmoji}${amount}`, inline: true }
					)
					.setTimestamp();
				if (currentMessage) {
					return currentMessage.edit(errorMessage);
				}
				else {
					return message.channel.send(errorMessage);
				}
			}
		}
    }
}