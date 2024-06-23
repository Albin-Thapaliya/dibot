const Discord = require("discord.js");
const Express = require("express");
const mongoose = require("mongoose");

const { BotToken, MongoURI } = require("./config");

mongoose
  .connect(MongoURI, {
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to database"))
  .catch(console.error);

const Client = new Discord.Client();
const App = Express();

const ClanRouter = require("./src/routes/Clan");

App.use("/clan", ClanRouter);

const Server = App.listen(8070, () => {
  console.log(`Listening on port ${Server.address().port}`);
});

Client.on("ready", () => {
  require("./src/lib/Initialize").InitFunctions(Client);

  module.exports = { Client };
});

Client.login(BotToken).catch(console.error);
