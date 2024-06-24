const { LinkAccount } = require("../playfabhandler");

module.exports = {
  name: "link",
  aliases: [],
  permissionsRequired: ["MANAGE_GUILD"],
  argsRequired: 1,

  execute: (message, args, client) => {
    LinkAccount(args[0], (error, success) => {
      if (err) return message.channel.send(error);

      message.channel.send(success);
    });
  },
};
