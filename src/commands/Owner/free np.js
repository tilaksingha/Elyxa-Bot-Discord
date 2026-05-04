const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const mongoose = require("mongoose");

// === Schema Setup (inline, no need for separate file) ===
const noPrefixSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true },
});
const NoPrefix = mongoose.models.NoPrefix || mongoose.model("NoPrefix", noPrefixSchema);

module.exports = {
  name: "sendnoprefix",
  aliases: ["npbutton"],
  category: "owner",

  run: async (client, message) => {
    if (message.author.id !== "761459615408979989") return;

    const channel = message.guild.channels.cache.get("1434011413705261077");
    if (!channel) return message.reply("Channel not found.");

    // ======= Embed with thumbnail and image =======
    const embed = new EmbedBuilder()
      .setTitle("Claim Your No Prefix Reward!")
      .setDescription(
        "Enjoy **7 days** of No Prefix access to use the bot freely!\n\n" +
          "> You can claim this reward **only once.**\n\n" +
          "> Click the button below to redeem it instantly!"
      )
      .setColor("#8A2BE2")
      .setThumbnail(client.user.displayAvatarURL())
        .setImage("https://cdn.discordapp.com/attachments/1470013516256772314/1499431376452325486/k3pf56t.png?ex=69f4c5ca&is=69f3744a&hm=235d7ad05da67dcb825a7c3a522a5cbf8cdb5b33a4e02e82daf5d7e59690f4ee&") // change to your banner
      .setFooter({
        text: "Offered by EllenMusic",
        iconURL: client.user.displayAvatarURL(),
      });

    const btn = new ButtonBuilder()
      .setCustomId("redeem_noprefix")
      .setLabel("Redeem No Prefix Access")
      .setStyle(ButtonStyle.Secondary);

    const row = new ActionRowBuilder().addComponents(btn);

    await channel.send({ embeds: [embed], components: [row] });
    await message.reply("No Prefix reward message sent.");

    // ============ Interaction Handler ============
    const collector = channel.createMessageComponentCollector({
      filter: (i) => i.customId === "redeem_noprefix",
    });

    collector.on("collect", async (interaction) => {
      try {
        // Check if user already claimed
        const userData = await NoPrefix.findOne({ userId: interaction.user.id });
        if (userData) {
          const alreadyEmbed = new EmbedBuilder()
            .setColor("#FF0000")
            .setTitle("Already Claimed!")
            .setDescription(
              "You’ve already claimed your **7-day No Prefix** reward!"
            )
            .setThumbnail(interaction.user.displayAvatarURL())
            .setFooter({
              text: "EllenMusic Rewards",
              iconURL: client.user.displayAvatarURL(),
            });
          return interaction.reply({ embeds: [alreadyEmbed], ephemeral: true });
        }

        // Create new entry
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 7);

        await NoPrefix.create({
          userId: interaction.user.id,
          expiresAt: expiryDate,
        });

        const successEmbed = new EmbedBuilder()
          .setColor("#353956")
          .setTitle("Reward Redeemed!")
          .setDescription(
            `You’ve successfully activated your **7-day No Prefix** access!\n\n` +
              `> Expires: <t:${Math.floor(
                expiryDate.getTime() / 1000
              )}:R>\n` +
              `> Enjoy using EllenMusic freely!`
          )
          .setThumbnail(interaction.user.displayAvatarURL())
            .setImage("https://cdn.discordapp.com/attachments/1470013516256772314/1499431376452325486/k3pf56t.png?ex=69f4c5ca&is=69f3744a&hm=235d7ad05da67dcb825a7c3a522a5cbf8cdb5b33a4e02e82daf5d7e59690f4ee&") // success banner
          .setFooter({
            text: "EllenMusic Premium Access",
            iconURL: client.user.displayAvatarURL(),
          });

        await interaction.reply({ embeds: [successEmbed], ephemeral: true });
      } catch (err) {
        console.error(err);
        await interaction.reply({
          content: "⚠️ Something went wrong while redeeming your reward.",
          ephemeral: true,
        });
      }
    });
  },
};
