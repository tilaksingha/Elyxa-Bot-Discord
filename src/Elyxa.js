const { ClusterManager, HeartbeatManager } = require("discord-hybrid-sharding");
const { token, shardLogWebhook } = require("./config/config.js");
const axios = require("axios");

const manager = new ClusterManager(`${__dirname}/index.js`, {
    totalShards: 1,
    shardsPerClusters: 1,
    mode: "process",
    token: token,
    respawn: true,
});

manager.extend(
    new HeartbeatManager({
        interval: 2000,
        maxMissedHeartbeats: 5,
    })
);

// Function to send webhook
async function sendShardLog(title, description, color = 0x00ff00) {
    if (!shardLogWebhook) return;

    const embed = {
        title: title,
        description: description,
        color: color,
        timestamp: new Date().toISOString(),
        footer: {
            text: `Total Shards: ${manager.totalShards}`
        }
    };

    try {
        await axios.post(shardLogWebhook, {
            embeds: [embed]
        });
    } catch (err) {
        console.error("Failed to send shard webhook:", err.message);
    }
}

// Shard Events
manager.on("shardCreate", (shard) => {
    console.log(`[Shard] Launched Shard #${shard.id}`);
    sendShardLog(
        "🟢 Shard Launched",
        `Shard **${shard.id}** has been created.`,
        0x00ff00
    );
});

manager.on("shardReconnecting", (shard) => {
    console.log(`[Shard] Shard ${shard.id} Reconnecting...`);
    sendShardLog(
        "🔄 Shard Reconnecting",
        `Shard **${shard.id}** is reconnecting...`,
        0xffaa00
    );
});

manager.on("shardResume", (shard) => {
    console.log(`[Shard] Shard ${shard.id} Resumed`);
    sendShardLog(
        "✅ Shard Resumed Successfully",
        `Shard **${shard.id}** resumed successfully.`,
        0x00ff00
    );
});

manager.on("shardDisconnect", (shard) => {
    console.log(`[Shard] Shard ${shard.id} Disconnected`);
    sendShardLog(
        "⛔ Shard Disconnected",
        `Shard **${shard.id}** disconnected.`,
        0xff0000
    );
});

manager.on("debug", (msg) => console.log(msg));
manager.spawn({ timeout: -1 });