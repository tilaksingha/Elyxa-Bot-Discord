const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonStyle,
  ButtonBuilder
} = require("discord.js");

module.exports = {
  name: "leaveserver",
  aliases: ["gl", "gleave"],
  cooldown: 5,
  category: "owner",
  usage: "<server_id>",
  description: "Makes the bot leave a specified server.",
  args: true,
  owner: true,

  execute: async (client, message, args) => {
    try {
      // ✅ OWNER CHECK
      const owners = client.config.owners || ["761459615408979989"];
      if (!owners.includes(message.author.id)) {
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setDescription("❌ You are not authorized to use this command.")
              .setColor("Red"),
          ],
        });
      }

      // ✅ GET SERVER
      const serverId = args[0];
      if (!serverId) {
        return message.reply("❌ Provide a server ID.");
      }

      let guild = client.guilds.cache.get(serverId);
      if (!guild) {
        try {
          guild = await client.guilds.fetch(serverId);
        } catch {
          return message.reply({
            embeds: [
              new EmbedBuilder()
                .setDescription(`❌ Server not found: \`${serverId}\``)
                .setColor("Red"),
            ],
          });
        }
      }

      // ✅ CONFIRMATION MESSAGE
      const confirmEmbed = new EmbedBuilder()
        .setTitle("⚠️ Confirmation Required")
        .setDescription(
          `Are you sure you want me to leave:\n**${guild.name}** (\`${guild.id}\`)?`
        )
        .setColor("Yellow");

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("confirm_leave")
          .setLabel("Yes")
          .setStyle(ButtonStyle.Danger),

        new ButtonBuilder()
          .setCustomId("cancel_leave")
          .setLabel("Cancel")
          .setStyle(ButtonStyle.Secondary)
      );

      const msg = await message.reply({
        embeds: [confirmEmbed],
        components: [row],
      });

      // ✅ COLLECTOR
      const collector = msg.createMessageComponentCollector({
        filter: (i) => i.user.id === message.author.id,
        time: 15000,
      });

      collector.on("collect", async (interaction) => {
        try {
          if (interaction.customId === "confirm_leave") {
            await interaction.update({
              embeds: [
                new EmbedBuilder()
                  .setDescription(`🚪 Leaving **${guild.name}**...`)
                  .setColor("Orange"),
              ],
              components: [],
            });

            await guild.leave();
          }

          if (interaction.customId === "cancel_leave") {
            await interaction.update({
              embeds: [
                new EmbedBuilder()
                  .setDescription("❌ Action cancelled.")
                  .setColor("Blue"),
              ],
              components: [],
            });
          }

          collector.stop();
        } catch (err) {
          console.error("Collector Error:", err);
        }
      });

      collector.on("end", async (collected) => {
        if (collected.size === 0) {
          await msg.edit({
            embeds: [
              new EmbedBuilder()
                .setDescription("⌛ You did not respond in time.")
                .setColor("Red"),
            ],
            components: [],
          });
        }
      });

    } catch (error) {
      console.error("LeaveServer Error:", error);

      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(`❌ Error:\n\`\`\`${error.message}\`\`\``)
            .setColor("Red"),
        ],
      });
    }
  },
};
