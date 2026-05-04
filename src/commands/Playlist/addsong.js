const { EmbedBuilder } = require("discord.js");
const manager = require("../../utils/playlistManager");

module.exports = {
  name: "addsong",
  description: "Add a song to a playlist",

  async execute(client, message, args) {
    const [playlistName, ...songParts] = args;
    const query = songParts.join(" ");

    if (!playlistName || !query) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(client.color)
            .setDescription("<:icons_cross:1466118143301652584> | Usage: `!addsong <playlist> <song name or link>`"),
        ],
      });
    }

    // ✅ Detect user voice channel (optional for validation)
    const node = client.manager.nodeMap?.values().next().value;
    if (!node) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(client.color)
            .setDescription("<:icons_cross:1466118143301652584> | Lavalink node is unavailable! Try again later."),
        ],
      });
    }

    // 🧠 Auto-detect source
    let source = "ytsearch"; // default
    if (/^https?:\/\//.test(query)) {
      if (query.includes("spotify.com")) source = "spsearch";
      else if (query.includes("soundcloud.com")) source = "scsearch";
      else source = "ytmsearch"; // link → usually YT Music
    }

    let songData = null;

    try {
      // 🔎 Resolve song via Lavalink
      const result = await client.manager.resolve({
        query,
        source,
        node,
      });

      // 🎵 Handle no results
      if (!result.tracks || !result.tracks.length) {
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(client.color)
              .setDescription(`<:Warn:1466122055408681228> | No results found for **${query}**.`),
          ],
        });
      }

      // 🎧 Choose first track
      const track = result.tracks[0];
      songData = {
        title: track.info?.title || "Unknown Title",
        url: track.info?.uri || query,
      };

      // 💾 Save song to playlist
      const success = await manager.addSong(message.guild.id, playlistName, songData);
      if (!success) {
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(client.color)
              .setDescription(
                "<:Warn:1466122055408681228> | Playlist not found! Create one using `createplaylist <name>` first."
                
              ),
          ],
        });
      }

      // ✅ Confirmation embed
      const embed = new EmbedBuilder()
        .setColor(client.color)
        .setTitle("Song Added")
        .setDescription(
          `<:check:1466333427304497153> | Added **[${songData.title}](${songData.url})** to playlist **${playlistName}**`
        )
        .setFooter({ text: `Requested by ${message.author.tag}` });

      return message.reply({ embeds: [embed] });
    } catch (err) {
      console.error("[PLAYLIST] Error adding song:", err);
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(client.color)
            .setTitle("<:icons_cross:1466118143301652584> | Error Adding Song")
            .setDescription(
              `Something went wrong while fetching **${query}**.\n\`\`\`${err.message}\`\`\``
            ),
        ],
      });
    }
  },
};
