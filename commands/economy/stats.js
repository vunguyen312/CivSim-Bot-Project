const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const clanModel = require('../../models/clanSchema');

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('stats')
        .setDescription(`Get the stats of your profile or your civilization's!`)
        .addStringOption(option =>
            option
            .setName('profile')
            .setDescription('Add civ for Civilization Stats or leave blank for Personal Stats.')),
    async execute(interaction, profileData, itemsList){
        const embed = new EmbedBuilder()
        const clanData = await clanModel.findOne({ serverID: interaction.guild.id });

        console.log(itemsList);

        if(!interaction.options.getString('profile')){
            embed
            .setColor('Blue')
            .setTitle(`📈 ${interaction.user.tag}'s Stats`)
            .setDescription(`The stats of user ${interaction.user.tag}`)
            .setFields(
                { name: '🚩 Allegiance:', value: `*${ profileData.allegiance ?? 'None'}*`},
                { name: '🥇 Rank:', value: `*${ profileData.rank }*`},
                { name: '🧈 Gold:', value: `${ profileData.gold }`},
                { name: '💰 Bank:', value: `${ profileData.bank }`},
                { name: '🧑‍🤝‍🧑 Citizens:', value: `${ profileData.citizens }`},
                { name: '📈 Growth Rate:', value: `${ profileData.growthRate } citizen/h`},
                { name: '🏆 Gold Rate:', value: `${ profileData.earnRate } gold/h`},
                { name: '💸 Tax Rate:', value: `${ profileData.taxRate * 100}%`},
            )
            .setThumbnail(interaction.user.displayAvatarURL());
        } else if(profileData.allegiance && interaction.options.getString('profile') === 'civ'){
            embed
            .setColor('Blue')
            .setTitle(`📈 ${profileData.allegiance}'s Stats`)
            .setDescription(`The stats of ${profileData.allegiance}`)
            .setFields(
                { name: '👑 Leader', value: `<@${ clanData.leaderID }>`},
                { name: '🛡️ Members:', value: `${ clanData.members.size }`},
                { name: '🧑‍🤝‍🧑 Citizens:', value: `placeholder`},
                { name: '🌎 Server:', value: `${ clanData.serverID }`}
            )
        } else {
            return interaction.reply({ content: `Missing fields or not apart of any civilization.`, ephemeral: true});
        }

        await interaction.reply({ embeds: [embed] });
    }
}