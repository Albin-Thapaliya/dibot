const fs = require("fs");
const Discord = require("discord.js");

/**
 *
 * @param {Discord.Client} Client
 */
const InitFunctions = (Client) => {
  console.log("Loading modules");

  fs.readdir("src/handlers/tasks", (err, files) => {
    if (err) return console.error(err);

    Client["commands"] = new Discord.Collection();

    files.forEach((f) => {
      Client.commands.set(f.split(".")[0], require(`../handlers/tasks/${f}`));
    });

    fs.readdir("src/handlers", (err, handlers) => {
      if (err) return console.error(err);

      handlers = handlers.filter((h) => h.split(".").length > 1);

      handlers.forEach((h, index) => {
        require(`../handlers/${h}`);
        console.log(`Loaded module: ${h} - ${index + 1}`);
      });
    });
  });
};

module.exports = { InitFunctions };
