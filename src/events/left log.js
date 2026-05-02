const { EmbedBuilder, WebhookClient } = require("discord.js");
const client = require("..");
const web = new WebhookClient({ url: `${client.config.leave_log}` });

// Default fake users
client.fakeUsers = client.fakeUsers || 0;

module.exports = async (client) => {
  client.on("guildDelete", async (guild) => {
    try {
      // Real Users
      const realUsers = client.guilds.cache.reduce(
        (acc, g) => acc + (g.memberCount || 0),
        0
      );

      // Combined Total
      const totalUsers = realUsers + client.fakeUsers;

      // Total Servers
      const totalGuilds = client.guilds.cache.size;

      // ========== Custom Banner ==========
        const bannerURL = "https://cdn.discordapp.com/attachments/1470013516256772314/1499431376452325486/k3pf56t.png?ex=69f4c5ca&is=69f3744a&hm=235d7ad05da67dcb825a7c3a522a5cbf8cdb5b33a4e02e82daf5d7e59690f4ee&"; // Replace this with your image

      // ========== Embed ==========
      const em = new EmbedBuilder()
        .setTitle(`Guild Left`)
        .setColor(client.color || 0x2b2d31)
        .setAuthor({
          name: `${client.user.username}`,
          iconURL: client.user.displayAvatarURL(),
        })
        .setThumbnail(guild.iconURL({ dynamic: true })) // server icon
        .setImage(bannerURL) // custom banner added
        .addFields([
          {
            name: `Guild Info`,
            value: `Guild Name: ${guild.name}\nGuild Id: ${
              guild.id
            }\nGuild Created: <t:${Math.round(
              guild.createdTimestamp / 1000
            )}:R>\nMemberCount: ${guild.memberCount} Members`,
          },
          {
            name: `Bot Info`,
            value: `**Servers:** ${totalGuilds}\n**Users:** ${totalUsers.toLocaleString()}`,
          },
        ])
        .setTimestamp();

      // Send to webhook
      await web.send({ embeds: [em] });
    } catch (error) {
      console.log("Error sending guild left webhook:", error);
    }
  });
};
