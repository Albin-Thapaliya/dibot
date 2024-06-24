
# Discord Bot Setup Guide

This guide explains how to set up and run a Discord bot using Node.js. This bot includes dynamic command loading and initialization of event handlers.

## Prerequisites

Before you start, make sure you have the following installed:
- Node.js
- npm (usually comes with Node.js)

You will also need a Discord bot token. You can get this token from the Discord Developer Portal.

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Albin-Thapaliya/dibot.git
   cd dibot
   ```

2. Install the required packages:
   ```bash
   npm install
   ```

3. Create a `.env` file at the root of your project and add your Discord bot token:
   ```plaintext
   DISCORD_TOKEN=your_bot_token_here
   ```

## File Structure

- `index.js`: Main entry point for the bot.
- `src/handlers/tasks/`: Directory containing task handlers for commands.
- `src/handlers/`: Directory containing additional event handlers.
- `src/lib/InitFunctions.js`: Module for initializing commands and handlers.

## Initialization Module

### `src/lib/InitFunctions.js`

This module is responsible for loading command modules and event handlers dynamically.

```javascript
const fs = require("fs");
const Discord = require("discord.js");

const InitFunctions = (Client) => {
  console.log("Loading modules");

  fs.readdir("src/handlers/tasks", (err, files) => {
    if (err) {
      console.error("Failed to read directory 'src/handlers/tasks':", err);
      return;
    }

    Client.commands = new Discord.Collection();

    files.forEach((f) => {
      try {
        const command = require(`../handlers/tasks/${f}`);
        Client.commands.set(command.name, command);
      } catch (loadError) {
        console.error(`Failed to load command ${f}:`, loadError);
      }
    });

    fs.readdir("src/handlers", (err, handlers) => {
      if (err) {
        console.error("Failed to read directory 'src/handlers':", err);
        return;
      }

      handlers = handlers.filter((h) => h.split(".").length > 1);

      handlers.forEach((h, index) => {
        try {
          require(`../handlers/${h}`);
          console.log(`Loaded module: ${h} - ${index + 1}`);
        } catch (loadError) {
          console.error(`Failed to load handler ${h}:`, loadError);
        }
      });
    });
  });
};

module.exports = { InitFunctions };
```

## Running the Bot

To start the bot, run the following command in your terminal:

```bash
node index.js
```

This command will initiate the bot and connect it to Discord using the token provided in your `.env` file.

## Contributing

Contributions are welcome! Feel free to fork the repository and submit pull requests.

## License

This project is open-sourced under the MIT License. See the LICENSE file for more details.