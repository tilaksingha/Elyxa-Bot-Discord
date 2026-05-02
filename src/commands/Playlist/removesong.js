const { EmbedBuilder } = require("discord.js");
const manager = require("../../utils/playlistManager");

module.exports = {
  name: "removesong",
  description: "Remove a song from a playlist",

  async execute(client, message, args) {
    const [playlistName, ...songParts] = args;
    const query = songParts.join(" ");

    if (!playlistName || !query) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(client.color)
            .setDescription("<:icons_cross:1466118143301652584> | Usage: `!removesong <playlist> <song name or link>`"),
        ],
      });
    }

    try {
      const success = await manager.removeSong(message.guild.id, playlistName, query);

      if (!success) {
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(client.color)
              .setDescription("<:Warn:1466122055408681228> | Playlist or song not found."),
          ],
        });
      }

      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(client.color)
            .setDescription(`<:check:1466333427304497153> | Removed **${query}** from playlist **${playlistName}**.`),
        ],
      });
    } catch (err) {
      console.error("[PLAYLIST] Error:", err);
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(client.color)
            .setDescription("<:icons_cross:1466118143301652584> | Something went wrong while removing the song."),
        ],
      });
    }
  },
};
