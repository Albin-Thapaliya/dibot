const Discord = require("discord.js");
const Express = require("express");
const mongoose = require("mongoose");
const mysql = require("mysql");
const bodyParser = require("body-parser");
const cors = require("cors");

const {
  BotToken,
  MongoURI,
  MySQLHost,
  MySQLPassword,
  MySQLUser,
} = require("./config");

const con = mysql.createConnection({
  user: MySQLUser,
  password: MySQLPassword,
  host: MySQLHost,
});

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
const GameRouter = require("./src/routes/Game");

App.use(bodyParser.json());
App.use(cors());

App.use((req, res, next) => {
  req["con"] = con;

  next();
});

App.use("/clan", ClanRouter);
App.use("/game", GameRouter);

const Server = App.listen(8070, () => {
  console.log(`Listening on port ${Server.address().port}`);
});

Client.on("ready", () => {
  require("./src/lib/Initialize").InitFunctions(Client);

  module.exports = { Client };
});

Client.login(BotToken).catch(console.error);
