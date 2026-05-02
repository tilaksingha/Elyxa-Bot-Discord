const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
} = require("discord.js");
const setup = require("../models/SetupSchema.js");

const updateMessage = async (player, client, track) => {
  const updateData = await setup.findOne({ guildId: player.guildId });
  if (updateData) {
    try {
      const channel = await client.channels.fetch(updateData.channelId);
      const message = await channel.messages.fetch(updateData.messageId);
      const title = track
        ? `>>> ${client.emoji.playing} **Now Playing**: **[${
            track.title.length > 50
              ? track.title.slice(0, 50) + "..."
              : track.title || "Unknown Track"
          }](${client.config.ssLink})**\n${client.emoji.requester} **Requestor**: ${
            track.requester || "**Elyxa**"
          } `
        : "__**Join a Voice Channel & Request a Song**__\n**Elevate Your Music Experience with Elyxa**: Join Vc & Request a Song. We are here to Deliver The High Quality Music For You!";

      let embedl = new EmbedBuilder()
        .setColor(client.color)
          .setImage(`https://cdn.discordapp.com/attachments/1470013516256772314/1499431376452325486/k3pf56t.png?ex=69f4c5ca&is=69f3744a&hm=235d7ad05da67dcb825a7c3a522a5cbf8cdb5b33a4e02e82daf5d7e59690f4ee&`)

      let embed = new EmbedBuilder()
        .setColor(client.color)
        .setDescription(title)
        .setImage(`${client.config.setupBgLink}`)
        .setAuthor({
          name: `Elyxa - Requests`,
          iconURL: message.guild.iconURL({ dynamic: true }),
        })
        .setFooter({
          text: `| Thanks for choosing ${client.user.username}`,
            iconURL: `https://cdn.discordapp.com/avatars/1459608349342433422/b0e7578b9de8ec1297795c4aad211e77.png?size=1024`,
        });

      const filterRow = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId("filterSelect")
          .setPlaceholder("Select a filter")
          .addOptions(
            {
              label: "Bass Boost",
              description: "Apply a bass boost filter",
              value: "bassboost",
              emoji: "<:filter:1433864705402863878>",
            },
            {
              label: "Nightcore",
              description: "Apply a nightcore filter",
              value: "nightcore",
              emoji: "<:filter:1433864705402863878>",
            },
            {
              label: "Vaporwave",
              description: "Apply a vaporwave filter",
              value: "vaporwave",
              emoji: "<:filter:1433864705402863878>",
            },
            {
              label: "Tremolo",
              description: "Apply a tremolo filter",
              value: "tremolo",
              emoji: "<:filter:1433864705402863878>",
            },
            {
              label: "Vibrato",
              description: "Apply a vibrato filter",
              value: "vibrato",
              emoji: "<:filter:1433864705402863878>",
            },
            {
              label: "Karaoke",
              description: "Apply a karaoke filter",
              value: "karaoke",
              emoji: "<:filter:1433864705402863878>",
            },
            {
              label: "Distortion",
              description: "Apply a distortion filter",
              value: "distortion",
              emoji: "<:filter:1433864705402863878>",
            },
            {
              label: "None",
              description: "Remove all filters",
              value: "none",
              emoji: "<:filter:1433864705402863878>",
            }
          )
      );

      const row = new ActionRowBuilder()
        .addComponents(
        new ButtonBuilder()
          .setCustomId("setup_vol+")
          .setLabel("Vol+")
          .setStyle(ButtonStyle.Success)
        )
        .addComponents(
        new ButtonBuilder()
          .setCustomId("setup_pause")
          .setLabel(!player.paused ? "Resume" : "Pause")
          .setStyle(ButtonStyle.Primary)
        )
        .addComponents(
         new ButtonBuilder()
           .setCustomId("setup_skip")
           .setLabel("Skip")
           .setStyle(ButtonStyle.Secondary)
        )
        .addComponents(
        new ButtonBuilder()
          .setCustomId("setup_vol-")
          .setLabel("Vol-")
          .setStyle(ButtonStyle.Danger)
        );

      const row2 = new ActionRowBuilder()
        .addComponents(
        new ButtonBuilder()
          .setCustomId("setup_shuffle")
          .setLabel("Shuffle")
          .setStyle(ButtonStyle.Success)
        )
        .addComponents(
        new ButtonBuilder()
          .setCustomId("setup_replay")
          .setLabel("Replay")
          .setStyle(ButtonStyle.Primary)
        )
        .addComponents(
        new ButtonBuilder()
          .setCustomId("setup_clear")
          .setLabel("Clear")
          .setStyle(ButtonStyle.Secondary)
        )
        .addComponents(
        new ButtonBuilder()
          .setCustomId("setup_stop")
          .setLabel("X")
          .setStyle(ButtonStyle.Danger)
        )
      await message.edit({
        embeds: [embedl, embed],
        components: [filterRow, row, row2],
      });
    } catch (error) {
      console.error("Error editing message:", error);
    }
  }
};

module.exports = updateMessage;
