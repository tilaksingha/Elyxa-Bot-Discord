const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "stop",
  description: `Stops the player and clears the queue.`,
  category: "Music",
  cooldown: 5,
  inVc: true,
  sameVc: true,
  dj: true,

  run: async (client, message, args, prefix, player) => {
    if (!player) {
      return message.channel.send({
        embeds: [
          new EmbedBuilder()
            .setDescription("<:icons_cross:1466118143301652584> No active player found in this server.")
            .setColor(client.color)
        ]
      });
    }

    // 🧹 Cleanup
    player.setLoop("none");
    player.isAutoplay = false;
    player.queue.clear();

    // 🧼 Delete Now Playing message
    const nowPlayingMessage = player.data.nplaying;
    if (nowPlayingMessage) {
      const channel = client.channels.cache.get(nowPlayingMessage.channelId);
      if (channel) {
        const msg = await channel.messages.fetch(nowPlayingMessage.id).catch(() => null);
        if (msg && msg.deletable) {
          await msg.delete().catch(() => {});
        }
      }
      delete player.data.nplaying;
    }

    // 🔁 Skip or Destroy
    if (player.queue.size === 0) {
      // Use the safe player destruction method
      await client.destroyPlayerSafely(player.guildId);
    } else {
      player.stop();
    }

    // ✅ Send embed with footer
    return message.channel.send({
      embeds: [
        new EmbedBuilder()
          .setColor(client.color)
          .setDescription(`<:check:1466333427304497153>  Music playback has been **stopped** and the queue has been **cleared**.`)
          .setFooter({
            text: `Thank you for using Elyxa! Feel free to queue more tracks anytime.`,
            iconURL: client.user.displayAvatarURL()
          })
      ]
    });
  }
};