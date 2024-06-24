const { LinkAccount } = require("../playfabhandler");

module.exports = {
  name: "link",
  aliases: ["sign"],
  permissionsRequired: ["MANAGE_GUILD"],
  argsRequired: 1,
  format: `+link <email>`,

  execute: (message, args, client) => {
    const email = args[0];

    if (email.toLowerCase() === "none")
      return message.channel.send(
        "No account found associated with this email",
      );

    LinkAccount(args[0], message.author.id, (error, success) => {
      if (error) return message.channel.send(error);

      message.channel.send(success);
    });
  },
};
