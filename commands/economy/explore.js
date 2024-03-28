const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const profileModel = require('../../models/profileSchema');
const { modifyValue } = require('../../utilities/dbQuery');
const { jsonMap } = require('../../utilities/jsonParse');

module.exports = {
    cooldown: 30,
    data: new SlashCommandBuilder()
        .setName('explore')
        .setDescription(`Explore and bring back some loot.`),
    syntax: '/explore',
    conditions: [],
    async execute(interaction, profileData) {

        const lootTable = jsonMap.loot.data.lootTable;

        const randomLoot = lootTable[Math.floor(Math.random() * (lootTable.length - 1))];
        
        //TODO:
        //Add exploration paths to this command

        const embed = new EmbedBuilder()
        .setColor(randomLoot.amount > 0 ? "Green" : "Red")
        .setTitle(`📝 Exploration Results`)
        .setDescription(randomLoot.msg)
        .setFields(
            { name: randomLoot.amount > 0 ? '🧈 Gold Deposited:' : '🧈 Gold Taken:', value: `${ randomLoot.amount }`, inline: true},
            { name: '\u200B', value: '\u200B', inline: true },
            { name: '💰 New Balance:', value: `${ profileData.gold + randomLoot.amount }`, inline: true }
        )
        .setThumbnail(interaction.user.displayAvatarURL());

        await modifyValue(
            { userID: interaction.user.id },
            { $inc: { gold: randomLoot.amount } }
        );

        await interaction.reply({ embeds: [embed] });
    }
}