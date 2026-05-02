const { EmbedBuilder } = require("discord.js");
const Playlist = require("../../models/playlist.js");
const SharedPlaylist = require("../../models/sharedPlaylist.js");
const crypto = require("crypto");

/**
 * 🧩 Generate random verification code
 */
function generateRandomCode(length = 6) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < length; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

module.exports = {
  name: "playlistmove",
  description: "Move or transfer your playlist to another server (with code verification)",
  async execute(client, message, args) {
    const playlistName = args.join(" ");

    if (!playlistName) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(client.color)
            .setDescription("<:icons_cross:1466118143301652584> | Usage: `.playlistmove <playlist name>`"),
        ],
      });
    }

    // Fetch guild playlist data
    const guildData = await Playlist.findOne({ guildId: message.guild.id });
    if (!guildData || !guildData.playlists.length) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(client.color)
            .setDescription("<:Warn:1466122055408681228> | No playlists found for this server."),
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
            .setDescription(`<:icons_cross:1466118143301652584> | Playlist **${playlistName}** not found.`),
        ],
      });
    }

    // ✅ Generate Share ID and Verification Code
    const shareId = crypto.randomBytes(4).toString("hex").toUpperCase();
    const verificationCode = generateRandomCode(6);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes expiry

    // 🗄️ Save to shared playlist database
    await SharedPlaylist.create({
      shareId,
      verificationCode,
      playlist,
      expiresAt,
    });

    // 🎨 Build an aesthetic embed
    const embed = new EmbedBuilder()
      .setColor("#353959")
      .setTitle("Playlist Move Request Created")
      .setThumbnail("https://images-ext-1.discordapp.net/external/nTL51zijUuHprGLkNJxurTnIsIk6QusSkIG2bZ4i9x0/%3Fformat%3Dwebp%26width%3D154%26height%3D154/https/images-ext-1.discordapp.net/external/AZH0LHaHdtQgiPGOcvJJlLBz1elGrFY92p2cqHNj-mg/%253Fformat%253Dwebp%2526width%253D205%2526height%253D205/https/images-ext-1.discordapp.net/external/VCKUxOH1ClbqPKETMazyfJztt1isFIoRxNxbbiwElRs/%25253Fsize%25253D256/https/cdn.discordapp.com/avatars/1432478334209753158/38840bc34bc8b63f483caa00895ac982.webp?format=webp&width=123&height=123")
        .setImage("https://cdn.discordapp.com/attachments/1470013516256772314/1499431376452325486/k3pf56t.png?ex=69f4c5ca&is=69f3744a&hm=235d7ad05da67dcb825a7c3a522a5cbf8cdb5b33a4e02e82daf5d7e59690f4ee&")
      .setDescription(`
> *"Music has no boundaries, it travels with you wherever you go."*

Your playlist **${playlist.name}** is ready to be moved or shared to another server!

**Transfer Details:**
> **Move ID:** \`${shareId}\`
> **Verification Code:** \`${verificationCode}\`
> **Expires In:** 15 minutes

**How to Import it on another server:**
\`\`\`
.playlistimport ${shareId} ${verificationCode}
\`\`\`

This link is *one-time use only* and will auto-expire for safety.
`)
      .setFooter({
        text: `Requested by ${message.author.tag} • Playlist transfer ready`,
        iconURL: message.author.displayAvatarURL(),
      })
      .setTimestamp();

    return message.reply({ embeds: [embed] });
  },
};
