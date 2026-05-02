const { Message, PermissionFlagsBits, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");

module.exports = {
  name: "partner",
  aliases: ["sponser"],
  description: "Get Bot Sponsers !!",
  // userPermissions: PermissionFlagsBits.SendMessages,
  // botPermissions: PermissionFlagsBits.SendMessages,
  category: "Info",
  cooldown: 5,

  run: async (client, message, args, prefix) => {
    const embed = new EmbedBuilder()
      .setColor(client.color)
      .setTitle(`Elyxa - Partners`)
      .setDescription(`**EllenCloud Hosting - Best Premium and Affordable Hosting**`);

    const button = new ButtonBuilder()
      .setLabel(`Server`)
      .setStyle(ButtonStyle.Link)
      .setEmoji("<:support:1466342166572830793>")
      .setURL(`https://dsc.gg/xitcore`);

    const row = new ActionRowBuilder().addComponents(button);

    return message.reply({
      embeds: [embed],
      components: [row]
    });
  },
};
