const { Client, GatewayIntentBits } = require("discord.js");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const config = require("./config");
const { InitFunctions } = require("./src/lib/Initialize");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const app = express();
const ClanRouter = require("./src/routes/Clan")(client);
const GameRouter = require("./src/routes/Game")(client);
const LinkRouter = require("./src/routes/Link")(client);

app.use(bodyParser.json());
app.use(cors());
app.use("/clan", ClanRouter);
app.use("/game", GameRouter);
app.use("/linkReqs", LinkRouter);

InitFunctions(client);

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}! Bot is ready!`);
  const server = app.listen(config.port, () => {
    console.log(`Listening on port ${server.address().port}`);
  });
});

client.login(config.BotToken);
module.exports = client;
