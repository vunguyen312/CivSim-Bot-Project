const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");
const clanModel = require('../../models/clanSchema');
const profileModel = require('../../models/profileSchema');

module.exports = {
    cooldown: 30,
    data: new SlashCommandBuilder()
        .setName('invite')
        .setDescription('Invite someone to join a civilization!')
        .addUserOption(option =>
            option
            .setName('user')
            .setDescription('The user to invite.')
            .setRequired(true))
        .setDMPermission(false),
    async execute(interaction, profileData){

        if(interaction.options.getUser('user').bot === true){
            return interaction.reply({ content: `You can't invite bots to civilizations!`, ephemeral: true });
        }

        const clanData = await clanModel.findOne({ clanName: profileData.allegiance });
        const targetData = await profileModel.findOne({ userID: interaction.options.getUser('user').id });

        //Checks so the game doesn't break

        if(!clanData){
            return interaction.reply({ content: 'Error while requesting clan data.', ephemeral: true });
        }
        else if(!targetData){
            return interaction.reply({ content: `User isn't logged in the database. Get them to run any command.`, ephemeral:true });
        }
        else if(!profileData.allegiance){
            return interaction.reply({ content: `Hm... It appears you're not in a civilization.`, ephemeral: true});
        }
        else if(targetData.allegiance){
            return interaction.reply({ content: `The user you're trying to invite is already in a civilization.`, ephemeral: true});
        }

        const embed = new EmbedBuilder()
        .setColor('Blue')
        .setTitle(`🛡️ ${interaction.user.tag} has invited ${interaction.options.getUser('user').username} to join ${clanData.clanName}!`);

        //Check which button user pressed

        const accept = new ButtonBuilder()
			.setCustomId('accept')
			.setLabel('Accept ✔️')
			.setStyle(ButtonStyle.Success);

		const decline = new ButtonBuilder()
			.setCustomId('decline')
			.setLabel('Decline ❌')
			.setStyle(ButtonStyle.Danger);

        const row = new ActionRowBuilder()
            .addComponents(decline, accept);
    

        const response = await interaction.reply({ 
            embeds: [embed],
            components: [row]
        });

        //Filter out anybody that's not our invite's recipient

        const userFilter = i => i.user.id === interaction.options.getUser('user').id;

        try {

            //Set a timer for the user to accept the invite

            const confirm = await response.awaitMessageComponent({ filter: userFilter, time: 60_000 });

            //Check if the user accepted or declined

            if (confirm.customId === 'accept') {

            //Updates the database

            await profileModel.findOneAndUpdate(
                {
                    userID: interaction.options.getUser('user').id,
                },
                {
                    allegiance: clanData.clanName,
                    rank: 'Baron'
                }
            );
            await clanModel.findOneAndUpdate(
                {
                    clanName: profileData.allegiance, 
                },
                {
                    $set: {
                        [`members.Baron.${targetData.userID}`]: targetData.userID
                    }
                }
            );

                embed
                .setTitle(`✔️ Welcome to ${clanData.clanName}`)
                .setFields({ name: '💎 Rank:', value: '*Baron*'})
                .setThumbnail(interaction.options.getUser('user').displayAvatarURL());
                await confirm.update({ embeds: [embed], components: [] });

            } else if (confirm.customId === 'decline') {

                embed.setTitle('❌ Invite has been declined.');
                await confirm.update({ embeds: [embed], components: [] });

            }
        } catch (error) {
            console.log(error);
            embed.setTitle('❌ Invite has expired.');
            return await interaction.editReply({ embeds: [embed], components: [] });
        }
    }
}