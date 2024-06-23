const Discord = require("discord.js");
const { Client, Connection } = require("../../index");

const { Prefix } = require("../../config");

Client.on("message", (message) => {
  if (message.author.id === Client.user.id) return;

  if (message.channel.type === "dm") return;

  if (!message.content.startsWith(Prefix)) return;

  const content = message.content,
    args = content.split(" ").splice(1, 1),
    invoke = content.split(" ")[0].substr(Prefix.length).toLowerCase();

  const AllCommands = Client.commands.array();

  const index = AllCommands.findIndex(
    (cmd) => cmd.name === invoke || cmd.aliases.includes(invoke),
  );
  if (index === -1) return;

  const command = AllCommands[index];

  if (args.length < command.argsRequired) return;

  if (command.permissionsRequired) {
    const { member } = message;

    if (!member.hasPermission(command.permissionsRequired)) {
      return message.channel.send(
        "Sorry, you don't have the permission to execute this command!",
      );
    }
  }

  command.execute(message, args, Client);
});
