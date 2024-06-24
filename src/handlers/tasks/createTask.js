const Discord = require("discord.js");

module.exports = {
  name: "createdailytask",
  aliases: ["cdt"],
  permissionsRequired: ["MANAGE_GUILD"],
  argsRequired: 0,

  execute: (message, args, client) => {
    client.con.query(`SELECT * FROM DailyTasks`, (err, tasks) => {
      if (err) return console.error(err);

      client.con.query(`SELECT * FROM Weapons`, (err, weapons) => {
        if (err) return console.error(err);

        const Required = {
          Amount: null,
          Reward: null,
          Description: null,
          Requirements: null,
        };

        message.channel.send(
          "To create the daily task, enter the amount of kills required first!\nIf you want to cancel this action just type cancel.",
        );

        const collector = message.channel.createMessageCollector(
          (msg) => msg.author.id === message.author.id,
          { time: 60000 * 5 },
        );

        let isCanceled = false;

        collector.on("collect", (msg, collected) => {
          const { content } = msg;

          if (content.toLowerCase() === "cancel") {
            message.channel.send("Stopped listening!");
            isCanceled = true;
            collector.stop();
            return;
          }

          if (!Required.Amount) {
            const amount = parseInt(content);

            if (isNaN(amount))
              return msg.channel.send("Sorry, this isn't a number");

            if (amount < 10 || amount > 1000)
              return msg.channel.send(
                "Please set the amount of kills realistic",
              );

            Required.Amount = amount;

            msg.channel.send(
              "Please set the reward for finishing that daily task.",
            );
          } else if (!Required.Reward) {
            const amount = parseInt(content);

            if (isNaN(amount))
              return msg.channel.send("Sorry, this isn't a number");

            if (amount < 50 || amount > 100000)
              return msg.channel.send("Please make the reward fair");

            Required.Reward = amount;

            msg.channel.send(
              `Please set the requirement.\nThe requirements must be typed out like this 'AKM, M4A1, AWP'.\nHere are a list of weapons you can use: ${weapons.map((w) => w.Name).join(", ")}`,
            );
          } else if (!Required.Requirements) {
            const weaponsToUse = content
              .split(", ")
              .map((w) => w.toUpperCase());

            const isLegit =
              weaponsToUse.length > 0
                ? weaponsToUse.length <= weapons.length
                : false;

            if (!isLegit)
              return msg.channel.send(
                "You specified more weapons than available, waduhek",
              );

            const temp = [];
            let IS_WRONG = false;

            weaponsToUse.forEach((w) => {
              if (
                temp.includes(w) ||
                !weapons.map((weapon) => weapon.Name.toUpperCase()).includes(w)
              ) {
                IS_WRONG = true;
              } else {
                temp.push(w);
              }
            });

            const weaponIds = [];

            weaponsToUse.forEach((w) => {
              weaponIds.push(
                weapons.find(
                  (weapon) => weapon.Name.toUpperCase() === w.toUpperCase(),
                ).Id,
              );
            });

            if (IS_WRONG)
              return msg.channel.send(
                "Duplicate weapon or not existing weapon found!",
              );

            tasks.forEach((t) => {
              if (
                t.Requirements === weaponsToUse.join(", ") &&
                t.Amount === Required.Amount
              )
                IS_WRONG = true;
            });

            if (IS_WRONG)
              return msg.channel.send("Duplicate daily task found!");

            Required.Requirements = weaponIds.join(", ");
            msg.channel.send("Please set the description of the task now!");
          } else if (!Required.Description) {
            if (content.length > 150 || content.length < 10)
              return msg.channel.send(
                "Description shouldn't be longer than 50 letters and shorter than 10 letters.",
              );

            Required.Description = content;

            collector.stop();
          }
        });

        collector.on("end", (collected) => {
          if (isCanceled) return;

          client.con.query(
            `INSERT INTO DailyTasks (Reward, Currency, Amount, Description, Requirements) VALUES ('${Required.Reward}', '${"SC"}', '${Required.Amount}', '${Required.Description}', '${Required.Requirements}')`,
            (err, updated) => {
              if (err)
                return message.channel.send("Wasn't able to create daily task");

              return message.channel.send(
                `Created new daily task!\nIt owns the Id ${insert.insertId}`,
              );
            },
          );
        });
      });
    });
  },
};
