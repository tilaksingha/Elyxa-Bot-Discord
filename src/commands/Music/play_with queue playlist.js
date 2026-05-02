const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags
} = require("discord.js");
const updateQueue = require("../../handlers/setupQueue.js");
const fetch = require("node-fetch");
const SPOTIFY_CLIENT_ID = "e6f84fbec2b44a77bf35a20c5ffa54b8";
const SPOTIFY_CLIENT_SECRET = "498f461b962443cfaf9539c610e2ea81";

function getSpotifyPlaylistId(url) {
  const match = url.match(/playlist\/([a-zA-Z0-9]+)/);
  return match ? match[1] : null;
}

async function getSpotifyToken() {
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " +
        Buffer.from(
          SPOTIFY_CLIENT_ID + ":" + SPOTIFY_CLIENT_SECRET
        ).toString("base64"),
    },
    body: "grant_type=client_credentials",
  });

  const data = await res.json();
  return data.access_token;
}

async function getSpotifyPlaylistName(playlistId, token) {
  const res = await fetch(
    `https://api.spotify.com/v1/playlists/${playlistId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) return null;
  const data = await res.json();
  return data.name;
}

module.exports = {
  name: "play",
  aliases: ["p"],
  description: "Play a song or playlist",
  category: "Music",
  inVc: true,
  sameVc: true,
  dj: true,
  premium: false,

  run: async (client, message, args, prefix) => {
    const channel = message.member.voice.channel;
    const query = args.join(" ");

    if (!args[0]) {
      const container = new ContainerBuilder()
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`## Missing Query`),
          new TextDisplayBuilder().setContent(`<:icons_cross:1466118143301652584> | Please provide a song name, URL or playlist.`)
        );
      return message.reply({
        components: [container],
        flags: MessageFlags.IsComponentsV2
      });
    }

    if (!client.hasAvailableNodes()) {
      const availableNodes = client.getAvailableNodes();
      if (availableNodes.length === 0) {
        const container = new ContainerBuilder()
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`## Lavalink Error`),
            new TextDisplayBuilder().setContent(`<:icons_cross:1466118143301652584> | No Lavalink nodes are currently available. Please try again in a moment.`)
          );
        return message.reply({
          components: [container],
          flags: MessageFlags.IsComponentsV2
        });
      }
    }

    try {
      const node = client.manager.nodeMap?.values().next().value;
      if (!node) {
        const container = new ContainerBuilder()
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`<:icons_cross:1466118143301652584> | No Lavalink nodes are available!`)
          );
        return message.reply({
          components: [container],
          flags: MessageFlags.IsComponentsV2
        });
      }

      const player = client.manager.createConnection({
        guildId: message.guild.id,
        textChannel: message.channel.id,
        voiceChannel: channel.id,
        volume: 80,
        deaf: true,
      });

      const isUrl = /^https?:\/\//i.test(query);
      const isSpotify = /spotify\.com\/(track|album|playlist)/i.test(query);
      const isYouTube = /youtube\.com|youtu\.be/i.test(query);
      
      let source;
      if (isSpotify) {
        source = "spsearch";
      } else if (isYouTube || isUrl) {
        source = null;
      } else {
        source = "ytmsearch";
      }

      let result;
      let searchAttempts = 0;
      const maxSearchAttempts = 3;
      
      while (searchAttempts < maxSearchAttempts) {
        try {
          const resolveOptions = {
            query: query,
            requester: message.author,
            node: node
          };
          
          if (source) {
            resolveOptions.source = source;
          }
          
          result = await client.manager.resolve(resolveOptions);
          break;
        } catch (searchError) {
          searchAttempts++;
          console.error(`[PLAY_COMMAND] Search attempt ${searchAttempts} failed:`, searchError);
          
          if (searchAttempts >= maxSearchAttempts) {
            throw searchError;
          }
          
          await new Promise(resolve => setTimeout(resolve, 1000 * searchAttempts));
        }
      }

      if (!result.tracks.length) {
        await client.destroyPlayerSafely(message.guild.id);
        const container = new ContainerBuilder()
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`<:icons_cross:1466118143301652584> | No results found for **${query}**.`)
          );
        return message.reply({
          components: [container],
          flags: MessageFlags.IsComponentsV2
        });
      }

      if (result.type === "PLAYLIST" || result.loadType === "playlist") {
        for (const track of result.tracks) {
          track.requester = message.author;
          player.queue.add(track);
        }
        
        if (!player.playing && !player.paused && player.queue.size > 0) {
          await player.play();
        }

        let playlistName = "Spotify Playlist";

        if (isSpotify) {
          const playlistId = getSpotifyPlaylistId(query);
          if (playlistId) {
            try {
              const token = await getSpotifyToken();
              const nameFromApi = await getSpotifyPlaylistName(playlistId, token);
              if (nameFromApi) playlistName = nameFromApi;
            } catch (e) {
              console.error("Spotify API error:", e);
            }
          }
        }

        const playlistUri = isSpotify ? query : (result.playlist?.uri || query);
        
        const playlistContainer = new ContainerBuilder()
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`## Playlist Queued`),
    new TextDisplayBuilder().setContent(
      `<:check:1466333427304497153> | Added **${result.tracks.length}** songs from **${playlistName}**`
    )
          );

        await updateQueue(message.guild, player.queue);
        return message.reply({
          components: [playlistContainer],
          flags: MessageFlags.IsComponentsV2,
          suppressEmbeds: true
        });
      }

      const track = result.tracks[0];
      track.requester = message.author;
      player.queue.add(track);
      
      if (!player.playing && !player.paused) {
        await player.play();
      }

      const trackTitle = track.info?.title || track.title || "Unknown Track";
      const trackUri = track.info?.uri || track.uri || "#";
      const trackAuthor = track.info?.author || track.author || "Unknown Artist";

      const trackContainer = new ContainerBuilder()
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`## Track Queued`),
          new TextDisplayBuilder().setContent(`<:check:1466333427304497153> | [${trackTitle}](${trackUri}) has been added to the queue.\nBy: \`${trackAuthor}\``),
          new TextDisplayBuilder().setContent(`Requested by ${message.author.tag}`)
        );

      const showButtons = player.queue.length >= 2;
      
      if (showButtons) {
        trackContainer.addSeparatorComponents(
          new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
        );
        
        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("upcoming")
            .setLabel("Add as Upcoming")
            .setStyle(ButtonStyle.Secondary),
          new ButtonBuilder()
            .setCustomId("remove_song")
            .setLabel("Remove")
            .setStyle(ButtonStyle.Danger)
        );
        trackContainer.addActionRowComponents(row);
      }

      const sent = await message.reply({
        components: [trackContainer],
        flags: MessageFlags.IsComponentsV2
      });

      if (showButtons) {
        const collector = sent.createMessageComponentCollector({
          time: 10000,
          max: 1,
        });

        collector.on("collect", async (interaction) => {
          if (!interaction.isButton()) return;

          switch (interaction.customId) {
            case "remove_song":
              player.queue.pop();
              const removedContainer = new ContainerBuilder()
                .addTextDisplayComponents(
                  new TextDisplayBuilder().setContent(`<:check:1466333427304497153> | Track removed from queue.`)
                );
              await interaction.update({
                components: [removedContainer],
                flags: MessageFlags.IsComponentsV2
              });
              break;

            case "upcoming":
              const upcomingTrack = player.queue.pop();
              player.queue.splice(0, 0, upcomingTrack);
              const upcomingContainer = new ContainerBuilder()
                .addTextDisplayComponents(
                  new TextDisplayBuilder().setContent(`<:check:1466333427304497153> | Track will play after the current one.`)
                );
              await interaction.update({
                components: [upcomingContainer],
                flags: MessageFlags.IsComponentsV2
              });
              break;
          }
        });

        collector.on("end", async (_, reason) => {
          if (reason === "time") {
            try {
              const expiredContainer = new ContainerBuilder()
                .addTextDisplayComponents(
                  new TextDisplayBuilder().setContent(`## Track Queued`),
                  new TextDisplayBuilder().setContent(`<:check:1466333427304497153> | [${trackTitle}](${trackUri}) has been added to the queue.\nBy: \`${trackAuthor}\``),
                  new TextDisplayBuilder().setContent(`Requested by ${message.author.tag}`)
                );
              await sent.edit({ components: [expiredContainer], flags: MessageFlags.IsComponentsV2 }).catch(() => {});
            } catch (editError) {
            }
          }
        });
      }

      await updateQueue(message.guild, player.queue);
    } catch (error) {
      console.error("[PLAY_COMMAND] Error:", error);
      let errorMessage = "Failed to play the track. Please try again later.";
      
      if (error.message && error.message.includes("No nodes are online")) {
        errorMessage = "Lavalink node is temporarily unavailable. Please try again in a moment.";
      } else if (error.message && error.message.includes("Spotify")) {
        errorMessage = "Failed to load Spotify track. Make sure Spotify plugin is enabled in Lavalink.";
      } else if (error.message) {
        errorMessage = `Playback error: ${error.message}`;
      }
      
      const errorContainer = new ContainerBuilder()
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`## Playback Error`),
          new TextDisplayBuilder().setContent(`<:icons_cross:1466118143301652584> | ${errorMessage}`)
        );
      return message.reply({
        components: [errorContainer],
        flags: MessageFlags.IsComponentsV2
      });
    }
  },
};