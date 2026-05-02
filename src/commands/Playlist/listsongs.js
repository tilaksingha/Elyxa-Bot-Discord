const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const Playlist = require("../../models/playlist.js");

module.exports = {
  name: "listsongs",
  aliases: ["plsongs", "viewsongs"],
  description: "List all songs in a playlist.",
  category: "Music",

  async execute(client, message, args) {
    const playlistName = args.join(" ");
    if (!playlistName) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(client.color)
            .setDescription(
              "<:icons_cross:1466118143301652584> | Please provide a playlist name."
            ),
        ],
      });
    }

    const guildData = await Playlist.findOne({ guildId: message.guild.id });
    if (!guildData || !guildData.playlists?.length) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(client.color)
            .setDescription(
              "<:Warn:1466122055408681228> | No playlists found for this server."
            ),
        ],
      });
    }

    const playlist = guildData.playlists.find(
      (p) => p.name.toLowerCase() === playlistName.toLowerCase()
    );

    if (!playlist) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(client.color)
            .setDescription(
              `<:icons_cross:1466118143301652584> | Playlist **${playlistName}** not found.`
            ),
        ],
      });
    }

    if (!playlist.songs.length) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(client.color)
            .setDescription(
              "<a:playing:1466333567884857425> This playlist is empty."
            ),
        ],
      });
    }

    const songs = playlist.songs.map((song, i) => {
      const title = song.title || song;
      const url =
        typeof song === "object" && song.url && song.url !== "unknown"
          ? song.url
          : null;

      return url
        ? `${i + 1}. [${title}](${url})`
        : `${i + 1}. ${title}`;
    });

    let page = 0;
    const songsPerPage = 10;
    const totalPages = Math.ceil(songs.length / songsPerPage);

    const generateEmbed = (page) => {
      const start = page * songsPerPage;
      const end = start + songsPerPage;

      return new EmbedBuilder()
        .setColor(client.color)
        .setTitle(`Songs in Playlist: ${playlist.name}`)
        .setDescription(songs.slice(start, end).join("\n"))
        .setImage(
          "https://cdn.discordapp.com/attachments/1470013516256772314/1499431376452325486/k3pf56t.png?ex=69f4c5ca&is=69f3744a&hm=235d7ad05da67dcb825a7c3a522a5cbf8cdb5b33a4e02e82daf5d7e59690f4ee&"
        )
        .setFooter({
          text: `Page ${page + 1}/${totalPages} • Requested by ${message.author.tag}`,
          iconURL: message.author.displayAvatarURL(),
        });
    };

    // 🔥 ADDED HOME BUTTON HERE
    const generateButtons = (page) => {
      return new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("prev_page")
          .setLabel("← Back")
          .setStyle(ButtonStyle.Primary)
          .setDisabled(page === 0),

        new ButtonBuilder()
          .setCustomId("home_page")
          .setLabel("Home")
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(page === 0),

        new ButtonBuilder()
          .setCustomId("next_page")
          .setLabel("Next →")
          .setStyle(ButtonStyle.Primary)
          .setDisabled(page === totalPages - 1)
      );
    };

    const msg = await message.reply({
      embeds: [generateEmbed(page)],
      components: [generateButtons(page)],
    });

    const collector = msg.createMessageComponentCollector({
      time: 5 * 60 * 1000,
    });

    collector.on("collect", async (interaction) => {
      if (interaction.user.id !== message.author.id)
        return interaction.reply({
          content: "Only the command user can change pages!",
          ephemeral: true,
        });

      if (interaction.customId === "next_page") page++;
      if (interaction.customId === "prev_page") page--;
      if (interaction.customId === "home_page") page = 0; // 🔥 HOME BUTTON LOGIC

      await interaction.update({
        embeds: [generateEmbed(page)],
        components: [generateButtons(page)],
      });
    });

    collector.on("end", () => {
      msg.edit({ components: [] }).catch(() => {});
    });
  },
};
