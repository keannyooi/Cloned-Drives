const Discord = require("discord.js-light");

module.exports = {
    name: "fuse",
    aliases: ["f"],
    usage: "<car name goes here>",
    args: true,
    adminOnly: false,
    description: "Converts a car inside your garage into fuse tokens.",
    async execute(message, args) {
		const db = message.client.db;
		const playerData = await db.get(`acc${message.author.id}`);
        const garage = playerData.garage;
        var carName = args[0].toLowerCase();
        var index = 0;
        const searchResults = [];
        const fuseEmoji = message.guild.emojis.cache.find(emoji => emoji.name === "fuse");
        const filter = response => {
            return response.author.id === message.author.id;
        };
        const emojiFilter = (reaction, user) => {
            return (reaction.emoji.name === "✅" || reaction.emoji.name === "❎") && user.id === message.author.id;
        };

        for (i = 1; i < args.length; i++) {
            carName += (" " + args[i].toLowerCase());
        }

		if (garage.length <= 5) {
			const errorMessage = new Discord.MessageEmbed()
                .setColor("#fc0303")
                .setAuthor(message.author.tag, message.author.displayAvatarURL({ format: "png", dynamic: true }))
                .setTitle("HOLD ON RIGHT THERE!")
                .setDescription("You can't do anything without more than 5 cars. Please don't fuse any more cars and build up your garage!")
                .setTimestamp();
            return message.channel.send(errorMessage);
		}

        var counter = 0;
        var searched = 0;
        while (counter < garage.length) {
            var currentCar = require(`./cars/${garage[counter].carFile}`);
            var currentName = currentCar["make"].toLowerCase() + " " + currentCar["model"].toLowerCase() + " " + currentCar["modelYear"];
            if (currentName.includes(carName)) {
                console.log("found!");
                console.log(currentName)
                searchResults[searched] = { car: garage[counter], index: counter };
                searched++;
            }
            counter++;
        }

        if (searched > 0) {
            var currentCar = searchResults[0].car.carFile;
            if (searched > 1) {
                var carList = "";
                for (i = 1; i <= searchResults.length; i++) {
                    const car = require(`./cars/${searchResults[i - 1].car.carFile}`);
                    carList += `${i} - ` + car["make"] + " " + car["model"] + " (" + car["modelYear"] + `) [${searchResults[i - 1].car.gearingUpgrade}${searchResults[i - 1].car.engineUpgrade}${searchResults[i - 1].car.chassisUpgrade}]\n`;
                }

                const infoScreen = new Discord.MessageEmbed()
                    .setColor("#34aeeb")
                    .setAuthor(message.author.tag, message.author.displayAvatarURL({ format: "png", dynamic: true }))
                    .setTitle("Multiple cars found, please type one of the following.")
                    .setDescription(carList)
                    .setTimestamp();

                message.channel.send(infoScreen).then(() => {
                    message.channel.awaitMessages(filter, {
                        max: 1,
                        time: 30000,
                        errors: ['time']
                    })
                        .then(collected => {
                            if (isNaN(collected.first().content) || parseInt(collected.first()) > searchResults.length) {
                                const errorMessage = new Discord.MessageEmbed()
                                    .setColor("#fc0303")
                                    .setAuthor(message.author.tag, message.author.displayAvatarURL({ format: "png", dynamic: true }))
                                    .setTitle("Error, invalid integer provided.")
                                    .setDescription("It looks like your response was either not a number or not part of the selection.")
                                    .setTimestamp();
                                return message.channel.send(errorMessage);
                            }
                            else {
                                currentCar = searchResults[parseInt(collected.first()) - 1].car;
                                index = searchResults[parseInt(collected.first()) - 1].index;
                                fuse(currentCar, index);
                            }
                        })
                        .catch(() => {
                            const cancelMessage = new Discord.MessageEmbed()
                                .setColor("#34aeeb")
                                .setAuthor(message.author.tag, message.author.displayAvatarURL({ format: "png", dynamic: true }))
                                .setTitle("Action cancelled automatically.")
                                .setTimestamp();
                            return message.channel.send(cancelMessage);
                        });
                });
            }
            else {
                index = searchResults[0].index;
                fuse(searchResults[0].car, index);
            }
        }
        else {
            const errorMessage = new Discord.MessageEmbed()
                .setColor("#fc0303")
                .setAuthor(message.author.tag, message.author.displayAvatarURL({ format: "png", dynamic: true }))
                .setTitle("Error, it looks like you don't have that car.")
                .setDescription("oof")
                .setTimestamp();
            return message.channel.send(errorMessage);
        }

        function fuse(currentCar, index) {
            const car = require(`./cars/${currentCar.carFile}`);
            const currentName = `${car["make"]} ${car["model"]} (${car["modelYear"]}) [${garage[index].gearingUpgrade}${garage[index].engineUpgrade}${garage[index].chassisUpgrade}]`;

            const confirmationMessage = new Discord.MessageEmbed()
                .setColor("#34aeeb")
                .setAuthor(message.author.tag, message.author.displayAvatarURL({ format: "png", dynamic: true }))
                .setTitle(`Are you sure you want to fuse your ${currentName}?`)
                .setDescription("React with ✅ to proceed or ❎ to cancel.")
                .setImage(car["card"])
                .setTimestamp();
            
            message.channel.send(confirmationMessage).then(reactionMessage => {
                reactionMessage.react("✅");
                reactionMessage.react("❎");
                reactionMessage.awaitReactions(emojiFilter, {
                    max: 1,
                    time: 10000,
                    errors: ['time']
                })
                    .then(async collected => {
                        reactionMessage.reactions.removeAll();
                        if (collected.first().emoji.name === "✅") {
                            playerData.garage.splice(index, 1);

                            var fuseTokens;
                            if (car["rq"] > 79) { //leggie
                                fuseTokens = 12500;
                            }
                            else if (car["rq"] > 64 && car["rq"] <= 79) { //epic
                                fuseTokens = 2500;
                            }
                            else if (car["rq"] > 49 && car["rq"] <= 64) { //ultra
                                fuseTokens = 750;
                            }
                            else if (car["rq"] > 39 && car["rq"] <= 49) { //super
                                fuseTokens = 350;
                            }
                            else if (car["rq"] > 29 && car["rq"] <= 39) { //rare
                                fuseTokens = 100;
                            }
                            else if (car["rq"] > 19 && car["rq"] <= 29) { //uncommon
                                fuseTokens = 30;
                            }
                            else { //common
                                fuseTokens = 10;
                            }

							var y = 0;
							while (y < playerData.garage.length) {
								if (playerData.hand) {
									if (playerData.hand.carFile === currentCar.carFile) {
										playerData.hand = null;
									}
								}
								var i = 0, x = 0;
								while (i < playerData.decks.length) {
									while (x < playerData.decks[i].hand.length) {
										if (playerData.decks[i].hand[x].carFile === currentCar.carFile) {
											playerData.decks[i].hand[x] = "None";
										}
										x++;
									}
									i++;
								}
								y++;
							}

                            playerData.fuseTokens += fuseTokens;
                            await db.set(`acc${message.author.id}`, playerData);
							const currentFuseTokens = playerData.fuseTokens

                            const infoScreen = new Discord.MessageEmbed()
                                .setColor("#03fc24")
                                .setAuthor(message.author.tag, message.author.displayAvatarURL({ format: "png", dynamic: true }))
                                .setTitle(`Successfully fused your ${currentName}!`)
                                .setDescription(`You earned ${fuseEmoji}${fuseTokens}!`)
                                .addField("Your Fuse Tokens", `${fuseEmoji}${currentFuseTokens}`)
                                .setTimestamp();
                            return message.channel.send(infoScreen);
                        }
                        else if (collected.first().emoji.name === "❎") {
                            const cancelMessage = new Discord.MessageEmbed()
                                .setColor("#34aeeb")
                                .setAuthor(message.author.tag, message.author.displayAvatarURL({ format: "png", dynamic: true }))
                                .setTitle("Action cancelled.")
                                .setDescription(`Your ${currentName} stays in your garage.`)
                                .setTimestamp();
                            return message.channel.send(cancelMessage);
                        }
                    })
                    .catch(() => {
                        const cancelMessage = new Discord.MessageEmbed()
                            .setColor("#34aeeb")
                            .setAuthor(message.author.tag, message.author.displayAvatarURL({ format: "png", dynamic: true }))
                            .setTitle("Action cancelled automatically.")
                            .setDescription(`Your ${currentName} stays in your garage.`)
                            .setTimestamp();
                        return message.channel.send(cancelMessage);
                    });
            });
        }
    }
}