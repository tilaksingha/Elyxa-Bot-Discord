const { readdirSync } = require("fs");
const { white, green } = require("chalk");
const { WebhookClient, EmbedBuilder } = require("discord.js");

module.exports = async (client) => {
  // Create webhook client
  const webhook = new WebhookClient({
    url: "https://discord.com/api/webhooks/1499379253391790162/pIRXiC1eUC29ZaQ4DtmVEuz4MGhaSAH7YRmO-5BVNoVucBxCilEdiekoQic-B0atlUAM" // startup webhook URL
  });

  try {
    // Load commands dynamically
    readdirSync("./src/commands/").forEach((dir) => {
      const commands = readdirSync(`./src/commands/${dir}`).filter((f) =>
        f.endsWith(".js")
      );

      for (const cmd of commands) {
        const command = require(`../commands/${dir}/${cmd}`);
        if (command.name) {
          client.mcommands.set(command.name, command);
        } else {
          console.log(`${cmd} is not ready`);
        }
      }
    });

    console.log(
      white("[") + green("INFO") + white("] ") + green("Command ") + white("Events") + green(" Loaded!")
    );
  } catch (error) {
    console.log(error);
  }

  // Create embed for startup message (manual description)
  const embed = new EmbedBuilder()
    .setColor("#ffffff")
    .setTitle("Elyxa Startup Initiated")
    .setDescription(
      "> Commands Loaded\n" +
      "> Riffy Initialized\n" +
      "> Database Connected\n" +
      "> Elyxa Ready\n" +
      "> Event Listeners Registered\n" +
      "> Webhook Connected"
    )
      .setThumbnail("https://cdn.discordapp.com/attachments/1484738509477777689/1499448620376784956/bd86vn9.png?ex=69f4d5d9&is=69f38459&hm=2911ad44cc11082f5281fc64d05e0598685471a8bc9f397aecf775b0dffad53e&") // replace with your bot thumbnail
      .setImage("https://cdn.discordapp.com/attachments/1470013516256772314/1499431376452325486/k3pf56t.png?ex=69f4c5ca&is=69f3744a&hm=235d7ad05da67dcb825a7c3a522a5cbf8cdb5b33a4e02e82daf5d7e59690f4ee&") // replace with your banner/image
    .setFooter({ text: "Elyxa is Love", iconURL: client.user?.displayAvatarURL() })
    .setTimestamp();

  // Send the embed to the webhook
  webhook.send({ embeds: [embed] });
};
