const {
  Message,
  EmbedBuilder,
  ButtonStyle,
  ButtonBuilder,
  ActionRowBuilder,
} = require("discord.js");

module.exports = {
  name: "invite",
  aliases: ["inv"],
  description: "invite me",
  category: "Info",
  cooldown: 5,

  run: async (client, message, args, prefix) => {

    const embed = new EmbedBuilder()
      .setColor("#353959")
      .setTitle("Invite Elyxa")
      .setDescription("Invite me to your server for **high-quality music!**")// Thumbnail
        .setImage("https://cdn.discordapp.com/attachments/1470013516256772314/1499431376452325486/k3pf56t.png?ex=69f4c5ca&is=69f3744a&hm=235d7ad05da67dcb825a7c3a522a5cbf8cdb5b33a4e02e82daf5d7e59690f4ee&"); // Banner Image

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel("Invite Elyxa")
        .setStyle(ButtonStyle.Link)
        .setURL(
          `https://discord.com/oauth2/authorize?client_id=1467607886581465181`
        ),
      new ButtonBuilder()
        .setLabel("Support Server")
        .setStyle(ButtonStyle.Link)
        .setURL(client.config.ssLink)
    );

    message.reply({
      embeds: [embed],
      components: [row]
    });
  },
};
