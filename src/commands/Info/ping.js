const {
  ContainerBuilder,
  SectionBuilder,
  TextDisplayBuilder,
  ThumbnailBuilder,
  MediaGalleryBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  MessageFlags
} = require("discord.js");
const mongoose = require("mongoose");

module.exports = {
  name: "ping",
  aliases: [],
  description: "Check bot and database latency",
  category: "Info",

  run: async (client, message, args) => {
    try {
      const msg = await message.channel.send("Pinging...");

      const botLatency = msg.createdTimestamp - message.createdTimestamp;
      const apiLatency = Math.round(client.ws.ping);

      const dbStart = Date.now();
      await mongoose.connection.db.admin().ping();
      const dbLatency = Date.now() - dbStart;

      const container = new ContainerBuilder()
        .addSectionComponents(
          new SectionBuilder()
            .addTextDisplayComponents(
              new TextDisplayBuilder().setContent(`## <a:Pingg:1499332972300734464> Pong!`),
              new TextDisplayBuilder().setContent(
                `> <:dot:1490319943860883476> Bot Latency: \`${apiLatency} ms\`\n` +
                `> <:dot:1490319943860883476> Database Latency: \`${dbLatency} ms\`\n` +

                `\n\nPowered by [EllenCloud Hostings](https://dsc.gg/ellencloud) - Fast and Reliable Hosting.`
              )
            )
            .setThumbnailAccessory(
              new ThumbnailBuilder().setURL(client.user.displayAvatarURL({ size: 256 }))
            )
        );

        
      await msg.edit({
        content: "",
        components: [container],
        flags: MessageFlags.IsComponentsV2
      });

    } catch (err) {
      console.error(err);
      message.reply("An error occurred while checking the ping.");
    }
  }
};