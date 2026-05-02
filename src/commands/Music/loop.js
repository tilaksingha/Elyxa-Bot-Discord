const { Message, PermissionFlagsBits, EmbedBuilder } = require("discord.js");

module.exports = {
  name: "loop",
  aliases: ["loopstart"],
  description: `loop a song!`,
  category: "Music",
  cooldown: 5,
  inVc: true,
  sameVc: true,
  premium: false,
  dj: true,
  run: async (client, message, args, prefix, player) => {
    if (!player) {
        const embed = new EmbedBuilder()
          .setDescription("<:icons_cross:1466118143301652584> | No Player Found For This Guild!")
          .setColor(client.config.color);
        return message.channel.send({ embeds: [embed] });
      }

    if (!args[0]) {
      const embed = new EmbedBuilder()
        .setDescription("What mode do you want to loop? current or queue")
        .setColor(client.color);
      return message.reply({ embeds: [embed] });
    }

    if (args == "current") {
      if (player.loop === "none") {
        player.setLoop("track");

        const embed = new EmbedBuilder()
          .setDescription(`<:check:1466333427304497153> | *Song has been:* \`Looped\``)
          .setColor(client.color);

        message.reply({ embeds: [embed] });
      } else {
        player.setLoop("none");

        const embed = new EmbedBuilder()
          .setDescription(`<:check:1466333427304497153> | *Song has been:* \`Unlooped\``)
          .setColor(client.color);

        message.reply({ embeds: [embed] });
      }
    } else if (args == "queue") {
      if (player.loop === "queue") {
        player.setLoop("none");

        const embed = new EmbedBuilder()
          .setDescription(`<:check:1466333427304497153> | *Loop all has been:* \`Disabled\``)
          .setColor(client.color);

        message.reply({ embeds: [embed] });
      } else {
        player.setLoop("queue");

        const embed = new EmbedBuilder()
          .setDescription(`<:check:1466333427304497153> | *Loop all has been:* \`Enabled\``)
          .setColor(client.color);

        message.reply({ embeds: [embed] });
      }
    }
  },
};
