const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "reset",
  aliases: ["clearfilters", "nofilter", "default"],
  description: "Reset all applied filters and restore normal audio.",
  category: "Filters",
  cooldown: 5,
  inVc: true,
  sameVc: true,
  dj: true,
  voteOnly: false,
  premium: true,

  run: async (client, message, args, prefix, player) => {
    if (!player) {
      const embed = new EmbedBuilder()
        .setDescription("<:icons_cross:1466118143301652584> | No player found in this guild!")
        .setColor(client.config.color);
      return message.reply({ embeds: [embed] });
    }

    try {
      // 🧹 Lavalink v4 compatible payload to reset filters
      const filterData = {
        op: "filters",
        guild_id: message.guild.id, // ✅ correct key
      };

      // 🛰 Safely send the payload to Lavalink / Riffy
      if (player.node && typeof player.node.send === "function") {
        await player.node.send(filterData);
      } else if (client.manager && typeof client.manager.send === "function") {
        await client.manager.send(filterData);
      } else if (client.riffy?.send) {
        await client.riffy.send(filterData);
      } else {
        throw new Error("No valid Lavalink node found to send filter reset data.");
      }

      // 💾 Clear local cache
      player.filters = {};

      // 🔊 Reset volume to default
      await player.setVolume(100);

      // 🔄 Force refresh to immediately clear filters
      player.pause(true);
      await delay(200);
      player.pause(false);

      // ✅ Confirmation embed
      const embed = new EmbedBuilder()
        .setColor("#353959")
        .setDescription("<:check:1466333427304497153> | **All filters have been reset!** Back to clean sound")
        .setFooter({
          text: `Requested by ${message.author.tag}`,
          iconURL: message.author.displayAvatarURL(),
        })
        .setTimestamp();

      return message.reply({ embeds: [embed] });
    } catch (error) {
      console.error("[FILTER] Reset error:", error);
      const embed = new EmbedBuilder()
        .setColor("Red")
        .setDescription(
          "<:icons_cross:1466118143301652584> | Failed to reset filters. Lavalink node may be offline!"
        );
      return message.reply({ embeds: [embed] });
    }
  },
};

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
