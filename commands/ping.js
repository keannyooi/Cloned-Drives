/*
 __  ___  _______     ___      .__   __. .__   __. ____    ____ 
|  |/  / |   ____|   /   \     |  \ |  | |  \ |  | \   \  /   / 
|  '  /  |  |__     /  ^  \    |   \|  | |   \|  |  \   \/   /  
|    <   |   __|   /  /_\  \   |  . `  | |  . `  |   \_    _/   
|  .  \  |  |____ /  _____  \  |  |\   | |  |\   |     |  |     
|__|\__\ |_______/__/     \__\ |__| \__| |__| \__|     |__| 	(this is a watermark that proves that these lines of code are mine)
*/

const Discord = require("discord.js-light");
const Canvas = require("canvas");

module.exports = {
    name: "ping",
    usage: "(no arguments required)",
    args: 0,
	isExternal: false,
    adminOnly: false,
	cooldown: 10,
    description: "Shows the current bot and API latency.",
    async execute(message) {
        message.channel.send(`bruh y u ping me
anyway latency = \`${Date.now() - message.createdTimestamp}ms\` while api latency = \`${Math.round(message.client.ws.ping)}ms\`
		`);
		message.client.execList.splice(message.client.execList.indexOf(message.author.id), 1);
    }
}