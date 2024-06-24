const { Client } = require("../../index");

const { AddXP } = require("../handlers/rankHandler");
const { IsWordBlacklisted } = require("./blacklisthandler");
const { IsURLValid } = require("./linkHandler");

const { Prefix } = require("../../config");

Client.on("message", (message) => {
  if (message.author.id === Client.user.id) return;

  if (message.channel.type === "dm") return;

  if (!message.content.startsWith(Prefix)) {
    if (IsWordBlacklisted(message.content)) return message.delete();

    if (!IsURLValid(message.member, message.channel, message.content))
      return message.delete();

    AddXP(Client, message);
    return;
  }

  const content = message.content,
    args = content.split(" ").splice(1, content.split(" ").length - 1),
    invoke = content.split(" ")[0].substr(Prefix.length).toLowerCase();

  const AllCommands = Client.commands.array();

  const index = AllCommands.findIndex(
    (cmd) => cmd.name === invoke || cmd.aliases.find((a) => a === invoke),
  );
  if (index === -1) return;

  const command = AllCommands[index];

  if (args.length < command.argsRequired)
    return message.channel.send(
      "Wrong arguments provided, use it like this: `" +
        (command.format ? command.format : `+${command.name}`) +
        "`",
    );

  if (command.permissionsRequired) {
    if (!message.member) {
      return;
    }
    const { member } = message;

    if (!member.hasPermission(command.permissionsRequired)) {
      return message.channel.send(
        "Sorry, you don't have the permission to execute this command!",
      );
    }
  }

  command.execute(message, args, Client);
});
