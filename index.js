const Discord = require("discord.js");
const Express = require("express");
const mysql = require("mysql");
const bodyParser = require("body-parser");
const cors = require("cors");

const {
  BotToken,
  MySQLHost,
  MySQLPassword,
  MySQLUser,
  MySQLDatabase,
} = require("./config");

const con = mysql.createConnection({
  user: MySQLUser,
  password: MySQLPassword,
  host: MySQLHost,
  database: MySQLDatabase,
});

const Client = new Discord.Client();
const App = Express();

const ClanRouter = require("./src/routes/Clan");
const GameRouter = require("./src/routes/Game");
const LinkRouter = require("./src/routes/Link");

App.use(bodyParser.json());
App.use(cors());

App.use((req, res, next) => {
  req["con"] = con;
  req["client"] = Client;

  next();
});

App.use("/clan", ClanRouter);
App.use("/game", GameRouter);
App.use("/linkReqs", LinkRouter);

const Server = App.listen(8070, () => {
  console.log(`Listening on port ${Server.address().port}`);
});

Client.on("ready", () => {
  require("./src/lib/Initialize").InitFunctions(Client);

  Client["con"] = con;

  module.exports = { Client };
});

Client.login(BotToken).catch(console.error);
