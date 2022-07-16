"use strict";

const bot = require("../config/config.js");
const { InfoMessage } = require("../util/classes/classes.js");
const { moneyEmojiID } = require("../util/consts/consts.js");
const carNameGen = require("../util/functions/carNameGen.js");
const serverStatModel = require("../models/serverStatSchema.js");

module.exports = {
    name: "dealership",
    aliases: ["deal", "dealer"],
    usage: [],
    args: 0,
    category: "Gameplay",
    description: "Check what's on sale in the car dealership here!",
    async execute(message) {
        const { dealershipCatalog } = await serverStatModel.findOne({});
        const moneyEmoji = bot.emojis.cache.get(moneyEmojiID);
        const fields = [];
        for (let i = 0; i < dealershipCatalog.length; i++) {
            let currentCar = require(`../cars/${dealershipCatalog[i].carID}`);
            fields.push({
                name: `${i + 1} - ${carNameGen({ currentCar, rarity: true })} (ID: \`${dealershipCatalog[i].carID}\`)`,
                value: `Price: ${moneyEmoji}${dealershipCatalog[i].price.toLocaleString("en")}\nStock Remaining: ${dealershipCatalog[i].stock.toLocaleString("en")}`,
                inline: true
            });
        }

        const dealerMessage = new InfoMessage({
            channel: message.channel,
            title: "Welcome to Cards&Bids, the go-to place for auto enthusiast cards!",
            desc: "The catalog refreshes every day at 11:59p.m. UTC. Buy a car from here using `cd-buycar`!",
            author: message.author,
            fields
        });
        return dealerMessage.sendMessage();
    }
};