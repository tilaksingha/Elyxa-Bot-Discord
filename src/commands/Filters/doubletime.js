const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "doubletime",
  aliases: ["dt", "fast"],
  description: "Toggle the DoubleTime filter for the current song.",
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
      if (!player.filters) player.filters = {};

      // 🔍 Detect if DoubleTime is already active
      const isActive = player.filters.timescale?.speed === 1.165;

      // 🎛 Lavalink v4 payload
      const filterData = {
        op: "filters",
        guild_id: message.guild.id, // ✅ correct key for Lavalink v4
        timescale: isActive
          ? { speed: 1.0, pitch: 1.0, rate: 1.0 } // Turn OFF
          : { speed: 1.165, pitch: 1.0, rate: 1.0 }, // Turn ON (DoubleTime)
      };

      // 🛰 Send safely to Lavalink/Riffy node
      if (player.node && typeof player.node.send === "function") {
        await player.node.send(filterData);
      } else if (client.manager && typeof client.manager.send === "function") {
        await client.manager.send(filterData);
      } else if (client.riffy?.send) {
        await client.riffy.send(filterData);
      } else {
        throw new Error("No valid Lavalink node found to send filter data.");
      }

      // 💾 Cache the current filter locally
      player.filters.timescale = filterData.timescale;

      // 🔄 Apply immediately
      player.pause(true);
      await delay(200);
      player.pause(false);

      // 🎨 Response embed
      const embed = new EmbedBuilder()
        .setColor(isActive ? "#FF5555" : "#353959")
        .setDescription(
          isActive
            ? "<:icons_cross:1466118143301652584> | **DoubleTime filter disabled.** Back to normal tempo"
            : "<:check:1466333427304497153> | **DoubleTime filter enabled!** Everything just got faster"
        )
        .setFooter({
          text: `Requested by ${message.author.tag}`,
          iconURL: message.author.displayAvatarURL(),
        })
        .setTimestamp();

      return message.reply({ embeds: [embed] });
    } catch (error) {
      console.error("[FILTER] DoubleTime error:", error);
      const embed = new EmbedBuilder()
        .setColor("Red")
        .setDescription(
          "<:icons_cross:1466118143301652584> | Failed to toggle DoubleTime filter. Lavalink node may be offline!"
        );
      return message.reply({ embeds: [embed] });
    }
  },
};

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
