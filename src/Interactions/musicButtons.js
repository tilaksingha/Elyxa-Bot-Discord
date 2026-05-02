const { InteractionType } = require("discord.js");

module.exports = async (client, interaction) => {
  if (interaction.type !== InteractionType.MessageComponent) return;

  const allowedCustomIds = ["play_now", "upcoming", "remove_song"];
  if (!allowedCustomIds.includes(interaction.customId)) return;

  try {
    await interaction.reply({
      content: "❗This button is no longer active or already handled.",
      ephemeral: true,
    });
  } catch (e) {
    
  }
};