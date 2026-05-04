const { EmbedBuilder, WebhookClient } = require("discord.js");
const schema = require("../../models/PremiumGuildSchema");

// ✅ Authorized user IDs
const authorizedUsers = ["761459615408979989"];

// ✅ Webhook to log premium removals (same as premiumadd)
const premiumLogWebhook = new WebhookClient({
  url: "https://discord.com/api/webhooks/1499379723225010297/ZHB9W8EGqY7F8QVPVzms5pVM3iF2fIW2KmaX8Gl9vI8QY4ZjZ_7pHJa-vyRfZUX0qPdf" // premium webhook URL
});

module.exports = {
  name: "remprem",
  aliases: ["deletepremium", "premiumremove", "--", "removeprem", "removepremium"],
  description: "Remove Premium from a guild (Owner Only)",
  category: "Owner",
  ownerOnly: true,

  run: async (client, message, args, prefix) => {
    if (!authorizedUsers.includes(message.author.id)) return;

    const guildId = args[0];
    if (!guildId) {
      return message.reply("<:Warn:1466122055408681228> Please specify a guild ID!");
    }

    try {
      const data = await schema.findOne({ Guild: guildId });

      if (!data) {
        return message.reply("<:Warn:1466122055408681228> The guild ID you provided does not have premium.");
      }

      // 🗑️ Delete premium entry
      await schema.deleteOne({ Guild: guildId });

      // 🔍 Try to fetch the guild for embed info
      const guild = client.guilds.cache.get(guildId) || await client.guilds.fetch(guildId).catch(() => null);

      // ✅ Confirmation embed for the command user
      const confirmEmbed = new EmbedBuilder()
        .setTitle("Premium Removed!")
        .setColor("#353956")
        .setDescription(
          `<:icons_cross:1466118143301652584> Premium has been removed from **${
            guild ? guild.name : `Unknown Guild (${guildId})`
          }**`
        )
        .addFields({ name: "Guild ID", value: guildId, inline: true })
        .setFooter({
          text: `Removed by ${message.author.tag}`,
          iconURL: message.author.displayAvatarURL(),
        })
        .setTimestamp();

      await message.reply({ embeds: [confirmEmbed] });

      // 🪄 Webhook log embed
      const logEmbed = new EmbedBuilder()
        .setTitle("Premium Guild Removed")
        .setColor("#FF4444")
        .setThumbnail(guild?.iconURL({ dynamic: true, size: 4096 }) || null)
        .setDescription(
          `Premium has been **removed** from ${
            guild ? `**${guild.name}**` : `Guild ID: ${guildId}`
          }`
        )
        .addFields(
          { name: "Guild ID", value: guildId, inline: true },
          {
            name: "Removed By",
            value: `${message.author.tag} (<@${message.author.id}>)`,
            inline: false,
          }
        )
        .setTimestamp();

      await premiumLogWebhook.send({ embeds: [logEmbed] });

    } catch (err) {
      console.error("[PREMIUM REMOVE ERROR]", err);
      return message.reply("<:icons_cross:1466118143301652584> An error occurred while processing your request.");
    }
  },
};
