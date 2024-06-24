const fs = require("fs");
const path = require("path");

const registerCommands = (client) => {
  client.commands = new Map();

  const commandPath = path.join(__dirname, "../commands");
  const commandFiles = fs
    .readdirSync(commandPath)
    .filter((file) => file.endsWith(".js"));

  for (const file of commandFiles) {
    const command = require(`../commands/${file}`);
    client.commands.set(command.name, command);
  }

  client.on("messageCreate", (message) => {
    if (!message.content.startsWith(config.Prefix) || message.author.bot)
      return;

    const args = message.content.slice(config.Prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command =
      client.commands.get(commandName) ||
      client.commands.find(
        (cmd) => cmd.aliases && cmd.aliases.includes(commandName),
      );

    if (!command) return;

    try {
      command.execute(message, args, client);
    } catch (error) {
      console.error(error);
      message.reply("there was an error trying to execute that command!");
    }
  });
};

module.exports = { registerCommands };
