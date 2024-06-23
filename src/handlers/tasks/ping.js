module.exports = {
  name: "ping",
  aliases: ["p"],
  permissionsRequired: ["MANAGE_GUILD"],
  argsRequired: 0,

  execute: (message, args, client) => {
    message.channel.send("Pong");
  },
};
