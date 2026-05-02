const {
  Message,
  PermissionFlagsBits,
  EmbedBuilder,
  ButtonStyle,
  ButtonBuilder,
  ActionRowBuilder,
} = require("discord.js");

module.exports = {
  name: "vote",
  description: "Vote for Elyxa",
  // userPermissions: PermissionFlagsBits.SendMessages,
  // botPermissions: PermissionFlagsBits.SendMessages,
  category: "Info",
  cooldown: 5,

  run: async (client, message, args, prefix) => {
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel("Vote On DBL")
        .setStyle(ButtonStyle.Link)
        .setEmoji("<a:dance:1466334919851638939>")
        .setURL(`https://dsc.gg/xitcore`)
    );
    const embed = new EmbedBuilder()
    .setAuthor({
        name: `Vote Me!`,
        iconURL: client.user.displayAvatarURL(),
      })
      .setColor(client.color)
      .setDescription(
        "**Vote for Elyxa on Top.gg to support its growth and development! Help us bring new features and improvements to this amazing bot that enhances your Discord experience. Your votes make a difference!**"
      );

    return message.reply({ embeds: [embed], components: [row] });
  },
};
