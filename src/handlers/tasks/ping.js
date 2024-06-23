const { model } = require("../../schema/ClanSchema");

module.exports = {
  name: "ping",
  aliases: ["p"],
  permissionsRequired: ["MANAGE_GUILD"],
  execute: (msg, args, client) => {
    msg.channel.send("Pong!");
  },
};
