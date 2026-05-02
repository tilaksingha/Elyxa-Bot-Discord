const { EmbedBuilder } = require("discord.js");
const { inspect } = require(`util`);
module.exports = {
    name: "eval",
    aliases: ["jsk","brahmastra"],
    description: "Eval Command",
    category: "Owner",
    ownerOnly: false,
    run: async (client, message, args, prefix) => {
      let sumant = ['761459615408979989'];
      if (!sumant.includes(message.author.id)) return;
        else{
            if(!args[0])
            {
                return message.channel.send({embeds : [new EmbedBuilder().setColor(client.color).setDescription(`<:Warn:1466122055408681228> | Provide me something to evaluate`)]})
            }
            let ok;
            try{
                ok = await eval(args.join(' '));
                ok = inspect(ok,{depth : 0});
            } catch(e) { ok = inspect(e,{depth : 0}) }
            let em = new EmbedBuilder().setColor(client.color).setDescription(`\`\`\`js\n${ok}\`\`\``);
            return message.channel.send({embeds : [em]});
        }
    }
}