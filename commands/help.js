"use strict";

const fs = require("fs");
const { InfoMessage, ErrorMessage } = require("./sharedfiles/classes.js");
const bot = require("../config.js");

module.exports = {
    name: "help",
    usage: "[command name]",
    args: 0,
    category: "Info",
    description: "...wait, what are you doing here?",
    execute(message, args) {
        const { commands } = bot;
        const adminCommands = [], eventCommands = [], miscCommands = [], configCommands = [], gameplayCommands = [], infoCommands = [];
        commands.forEach(function (command) {
            switch (command.category) {
                case "Admin":
                    adminCommands.push(`\`${command.name}\``);
                    break;
                case "Events":
                    eventCommands.push(`\`${command.name}\``);
                    break;
                case "Gameplay":
                    gameplayCommands.push(`\`${command.name}\``);
                    break;
                case "Info":
                    infoCommands.push(`\`${command.name}\``);
                    break;
                case "Configuration":
                    configCommands.push(`\`${command.name}\``);
                    break;
                case "Miscellaneous":
                    miscCommands.push(`\`${command.name}\``);
                    break;
                default:
                    break;
            }
        });

        if (!args.length || !isNaN(args[0])) {
            let infoMessage = new InfoMessage({
                channel: message.channel,
                title: "Cloned Drives Commands",
                desc: "Use `cd-help <command name>` to learn more about a specific command.",
                author: message.author,
                fields: [
                    { name: "Info", value: infoCommands.join(", ") },
                    { name: "Gameplay", value: gameplayCommands.join(", ") },
                    { name: "Configuration", value: configCommands.join(", ") },
                    { name: "Miscellaneous", value: miscCommands.join(", ") }
                ]
            });
            // if (message.member.roles.cache.has("917685033995751435")) {
            //     infoMessage.addFields({ name: "Events", value: eventCommands.join(", ") });
            // }
            if (message.member.roles.cache.has("711790752853655563")) {
                infoMessage.addFields({ name: "Admin", value: adminCommands.join(", ") });
            }
            return infoMessage.sendMessage();
        }
        else {
            const commandName = args[0].toLowerCase();
            const command = commands.get(commandName) || commands.find(c => c.aliases && c.aliases.includes(commandName));
            if (!command) {
                let commandFiles = fs.readdirSync("./commands").filter(file => file.endsWith(".js")).map(file => file.replace(".js", ""));
                const errorMessage = new ErrorMessage({
                    channel: message.channel,
                    title: "Error, 404 command not found.",
                    desc: "It looks like this command doesn't exist. Try referring to the command list.",
                    author: message.author
                }).displayClosest(commandName, commandFiles);
                return errorMessage.sendMessage();
            }

            switch (command.category) {
                case "Admin":
                    if (!message.member.roles.cache.has("711790752853655563")) {
                        return accessDenied("711790752853655563");
                    }
                case "Events":
                    if (!message.member.roles.cache.has("917685033995751435")) {
                        return accessDenied("917685033995751435");
                    }
                default:
                    break;
            }
            
            let aliases = command.aliases ? command.aliases.join(", ") : "None";
            let cooldown = command.cooldown ? command.cooldown : 1;
            let syntax = "";
            if (typeof command.usage === "object") {
                for (let i = 0; i < command.usage.length; i++) {
                    syntax += `\`cd-${command.name} ${command.usage[i]}\`\n`;
                }
            }
            else {
                syntax = `\`cd-${command.name}\`\n`;
            }

            const infoMessage = new InfoMessage({
                channel: message.channel,
                title: `cd-${command.name}`,
                desc: "Info about this command:",
                author: message.author,
                fields: [
                    { name: "Aliases", value: aliases, inline: true },
                    { name: "Category", value: command.category, inline: true },
                    { name: "Cooldown", value: `${cooldown} second(s)`, inline: true },
                    { name: "Syntax", value: syntax },
                    { name: "Description", value: command.description }
                ],
                footer: "Arguments in <angle brackets> are necessary while arguments in [square brackets] are optional."
            });
            return infoMessage.sendMessage();
        }

        function accessDenied(roleID) {
            const errorMessage = new ErrorMessage({
                channel: message.channel,
                title: "Error, you may not view info about this command.",
                desc: `You don't have the <@&${roleID}> role, which is required to view this command.`,
                author: message.author
            });
            return errorMessage.sendMessage();
        }
    }
};