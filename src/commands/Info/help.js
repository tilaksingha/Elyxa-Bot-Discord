const {
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const fs = require("fs");
const path = require("path");

module.exports = {
  name: "help",
  aliases: ["h"],
  description: "Displays the bot's help menu",
  category: "Info",

  run: async (client, message, args, prefix) => {

    const categories = {};
    const basePath = path.join(__dirname, "..");
    const folders = fs.readdirSync(basePath);

    for (const folder of folders) {
      const folderPath = path.join(basePath, folder);
      if (!fs.statSync(folderPath).isDirectory()) continue;

      const files = fs.readdirSync(folderPath).filter(f => f.endsWith(".js"));
      const commands = files.map(f => {
        const cmd = require(path.join(folderPath, f));
        return cmd.name || f.replace(".js", "");
      });
      categories[folder] = commands;
    }

    const totalCmds = Object.values(categories).flat().length;

    const overviewEmbed = new EmbedBuilder()
      .setColor("#353956")
      .setAuthor({
        name: "Elyxa Help Module",
        iconURL: client.user.displayAvatarURL(),
      })
      .setThumbnail(client.user.displayAvatarURL({ size: 256 }))
      .setDescription(`
 Hey **${message.author.username}**, I am **Elyxa Music**

> <:dot:1489151103051239567> **Prefix:** \`${prefix}\`
> <:dot:1489151103051239567> **Total Commands:** \`${totalCmds}\`
> <:dot:1489151103051239567> Use \`${prefix}help\` to see all commands.
> <:dot:1489151103051239567> **Developer** <@761459615408979989>

__Use the dropdown menu to explore categories.__
`)
      .addFields(
        {
          name: "Categories",
          value: [
            "> <:config:1489151268726374521> `:` Config",
            "> <:filters:1499439571648381041> `:` Filters",
            "> <:info:1489151388830142524> `:` Info  ",
            "> <:music:1489151512713367814> `:` Music",
            "> <:owner:1489151600680370206> `:` Owner",
            "> <:playlist:1489151697371533413> `:` Playlist <:new1:1499904554953605351><:new2:1499904594904350902>",
            "> <:premium:1489151775872122911> `:` Premium ",
            "> <:purge:1489151866964152371> `:` Purge ",
            "> <:server:1489151955992576092> `:` Server <:update_1:1499904247200747590><:update_2:1499904288229560451>",
            "> <:spotify:1489152034891370576> `:` Spotify <:update_1:1499904247200747590><:update_2:1499904288229560451>"
          ].join("\n"),
          inline: true,
        },/*
        {
          name: "<a:shiningcrown:1456453140718293145> __Commands__",
          value: [
            "> **Moderation**",
            "> **Admin**",
            "> **Giveaway**",
            "> **Welcome**",
            "> **Extra**",
            "> **Fun**"
          ].join("\n"),
          inline: true,
        },*/
      )
        .setImage("https://cdn.discordapp.com/attachments/1470013516256772314/1499431376452325486/k3pf56t.png?ex=69f4c5ca&is=69f3744a&hm=235d7ad05da67dcb825a7c3a522a5cbf8cdb5b33a4e02e82daf5d7e59690f4ee&")
      .setFooter({
        text: "Elyxa is Love",
        iconURL: message.author.displayAvatarURL(),
      });

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId("help_category")
      .setPlaceholder("Select Main category")
      .addOptions(
        Object.keys(categories).map(cat => ({
          label: cat,
          value: cat,
          description: `${cat} commands`,
        }))
      );

    const menuRow = new ActionRowBuilder().addComponents(selectMenu);

    const buttons = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("home")
        .setLabel("Home")
        .setStyle(ButtonStyle.Secondary),

      new ButtonBuilder()
        .setCustomId("delete")
        .setLabel("Close")  // .setLabel("Delete")
        .setStyle(ButtonStyle.Danger),

      new ButtonBuilder()
        .setCustomId("all_commands")
        .setLabel("View All") // .setLabel("All Commands")
        .setStyle(ButtonStyle.Primary),

      new ButtonBuilder()
        .setLabel("Hosting")
        .setStyle(ButtonStyle.Link)
          .setURL("https://dsc.gg/xitcore")
    );

    const msg = await message.channel.send({
      embeds: [overviewEmbed],
      components: [buttons, menuRow],
    });

    const collector = msg.createMessageComponentCollector({
      filter: (i) => i.user.id === message.author.id,
      time: 180000,
    });

    collector.on("collect", async (interaction) => {
      const id = interaction.customId;

      if (id === "home") {
        return interaction.update({
          embeds: [overviewEmbed],
          components: [buttons, menuRow],
        });
      }

      if (id === "delete") {
        collector.stop();
        return msg.delete().catch(() => {});
      }

      if (id === "help_category") {
        const category = interaction.values[0];
        const cmds = categories[category] || [];

        const catEmbed = new EmbedBuilder()
          .setColor("#353959")
          .setAuthor({
            name: `${category} Commands`,
            iconURL: client.user.displayAvatarURL(),
          })
          .setThumbnail(client.user.displayAvatarURL({ size: 256 }))
          .setDescription(
            cmds.length ? cmds.map(c => `\`${c}\``).join(", ") : "_No commands available_"
          )
            .setImage("https://cdn.discordapp.com/attachments/1470013516256772314/1499431376452325486/k3pf56t.png?ex=69f4c5ca&is=69f3744a&hm=235d7ad05da67dcb825a7c3a522a5cbf8cdb5b33a4e02e82daf5d7e59690f4ee&")
          .setFooter({
            text: "Use dropdown to switch categories.",
            iconURL: interaction.user.displayAvatarURL(),
          });

        return interaction.update({
          embeds: [catEmbed],
          components: [buttons, menuRow],
        });
      }

      if (id === "all_commands") {
        const allEmbed = new EmbedBuilder()
          .setColor("#353959")
          .setAuthor({
            name: "✨ Elyxa Commands",
            iconURL: client.user.displayAvatarURL(),
          })
          .setThumbnail(client.user.displayAvatarURL({ size: 256 }))
          .setDescription("> Below is a complete list of all commands by category.\n")
          .addFields(
            Object.entries(categories).map(([cat, cmds]) => ({
              name: `<a:shiningcrown:1456453140718293145> ${cat} Commands`,
              value: cmds.length > 0
                ? cmds.map(c => `\`${c}\``).join(", ")
                : "_No commands available_",
              inline: false,
            }))
          )
            .setImage("https://cdn.discordapp.com/attachments/1470013516256772314/1499431376452325486/k3pf56t.png?ex=69f4c5ca&is=69f3744a&hm=235d7ad05da67dcb825a7c3a522a5cbf8cdb5b33a4e02e82daf5d7e59690f4ee&")
          .setFooter({
            text: "Elyxa is Love",
            iconURL: message.author.displayAvatarURL(),
          });

        return interaction.update({
          embeds: [allEmbed],
          components: [buttons, menuRow],
        });
      }
    });

    collector.on("end", () => {
      msg.edit({ components: [] }).catch(() => {});
    });
  },
};
