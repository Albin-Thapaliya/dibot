const Devs = [
  // add dev id here
];

module.exports = {
  name: "deletedailytask",
  aliases: ["ddt"],
  permissionsRequired: ["MANAGE_GUILD"],
  argsRequired: 1,
  format: `+ddt <Id>`,

  execute: (message, args, client) => {
    const Id = parseInt(args[0]);

    if (!Devs.includes(message.author.id))
      return message.channel.send("You can't use this command");

    if (isNaN(Id)) return message.channel.send("Id must be a number!");

    client.con.query(
      `DELETE FROM DailyTasks WHERE Id='${Id}'`,
      (err, deleted) => {
        if (err)
          return message.channel.send(
            `There is not daily task referencing this Id`,
          );

        message.channel.send(`Removed daily task with Id of ${Id}`);
      },
    );
  },
};
