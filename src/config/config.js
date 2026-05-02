// src/config/config.js
require("dotenv").config();

module.exports = {
    // Bot Token
    token: process.env.TOKEN,

    // General Settings
    prefix: process.env.PREFIX || ".",
    color: process.env.COLOR || "#353956",
    ownerIDS: process.env.OWNER_IDS ? process.env.OWNER_IDS.split(",") : ["761459615408979989"],

    // Database
    Mongo: process.env.MONGO_URI,

    // Links & Webhooks
    invite: process.env.INVITE,
    startupWebhook: process.env.STARTUP_WEBHOOK,
    shardLogWebhook: process.env.SHARD_LOG_WEBHOOK,
    noprefixLog: process.env.NOPREFIX_LOG,
    cmd_log: process.env.CMD_LOG,
    error_log: process.env.ERROR_LOG,
    blacklist_log: process.env.BLACKLIST_LOG,
    join_log: process.env.JOIN_LOG,
    leave_log: process.env.LEAVE_LOG,

    // Music & Spotify
    spotiId: process.env.SPOTI_ID,
    spotiSecret: process.env.SPOTI_SECRET,

    // Lavalink Nodes
    nodes: [
        {
            name: 'LavaLink SSL',
            host: 'lava-v4.ajieblogs.eu.org',
            port: 443,
            password: 'https://dsc.gg/ajidevserver',
            secure: true
        },
        {
            name: 'LvaLink Non SSL',
            host: 'lavalink.jirayu.net',
            port: 13592,
            password: 'youshallnotpass',
            secure: false
        }
    ],

    // Others (non-sensitive)
    vote: false,
    image: "https://cdn.discordapp.com/attachments/1470013516256772314/1499431376452325486/k3pf56t.png?ex=69f4c5ca&is=69f3744a&hm=235d7ad05da67dcb825a7c3a522a5cbf8cdb5b33a4e02e82daf5d7e59690f4ee&",
    setupBgLink: "https://bit.ly/elyxamusic",
    ssLink: "https://dsc.gg/xitcore",
    topGg: "https://dsc.gg/xitcore",
    topgg_Api: process.env.TOPGG_API || "",
};