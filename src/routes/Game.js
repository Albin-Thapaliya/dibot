const { createIndexes } = require("../schema/ClanSchema");

const Router = require("express").Router();

const ListOfDiscordMods = [
  // add your admin discord id
];

class Task {
  constructor(reward, currency, amount, description, requirements) {
    this.Reward = reward;
    this.Currency = currency;
    this.Amount = amount;
    this.Description = description;
    this.Requirements = requirements;
  }
}

class YourTask extends Task {
  constructor(
    status,
    id,
    reward,
    currency,
    amount,
    description,
    requirements,
    completed,
  ) {
    super(reward, currency, amount, description, requirements);
    this.Id = id;
    this.Status = status;
    this.IsCompleted = completed;
  }
}

class DailyReward {
  constructor(currency, amount) {
    this.Currency = currency;
    this.Reward = amount;
  }
}

const GetTasks = (results) => {
  const arr = new Array();
  const used = new Array();

  while (arr.length < 3) {
    let random = GetNumber(results, used);
    used.push(random);

    arr.push(results[random].Id);
  }

  return arr;
};

const GetNumber = (tasksArr, used) => {
  let random = Math.floor(Math.random() * tasksArr.length);

  if (used.includes(random)) return GetNumber(tasksArr, used);

  random = random >= tasksArr.length ? random - 1 : random;

  if (used.includes(random)) return GetNumber(tasksArr, used);

  return random;
};

const DiscordMiddleWare = (req, res, next) => {
  const id = req.headers["auth"];

  if (ListOfDiscordMods.includes(id)) next();
  else return res.status(404).json({ Error: "No staff member", Success: null });
};

Router.post("/createTask", DiscordMiddleWare, (req, res) => {
  const { Amount, Currency, Reward, Description, Requirements } = req.body;

  req.con.query(
    `INSERT INTO DailyTasks (Reward, Currency, Amount, Description, Requirements) VALUES ('${Reward}', '${Currency}', '${Amount}', '${Description}', '${Requirements}')`,
    (err, updated) => {
      if (err)
        return res
          .status(404)
          .json({ Error: "Wasn't able to create new task", Success: null });

      return res.status(201).json({ Error: null, Success: `Created task!` });
    },
  );
});

Router.post("/getTasks", (req, res) => {
  const { playfabId } = req.body;

  req.con.query(
    `SELECT * FROM Players WHERE PlayFabId='${playfabId}'`,
    (err, players) => {
      if (err)
        return res
          .status(404)
          .json({ Error: "Wasn't able to get player", Success: null });

      if (players.length <= 0)
        return res
          .status(404)
          .json({ Error: "Wasn't able to get player", Success: null });

      const player = players[0];

      const tasks = player.Tasks.split(", ");
      const status = player.Status.split(", ");
      const completed = player.Claimed.split(", ");

      req.con.query(
        `SELECT * FROM DailyTasks WHERE Id IN ('${tasks.join('"', '"')}')`,
        (err, dailyTasks) => {
          if (err)
            return res
              .status(404)
              .json({ Error: "Wasn't able to get daily tasks", Success: null });

          if (dailyTasks.length <= 0)
            return res.status(404).json({
              Error: "No daily tasks available, talk to the admin asap!",
              Success: null,
            });

          const myTasks = [];

          dailyTasks.forEach((daily) => {
            tasks.forEach((mytask, j) => {
              if (t == d.Id) {
                myTasks.push(
                  new YourTask(
                    parseInt(status[j]),
                    parseInt(daily.Id),
                    daily.Reward,
                    daily.Currency,
                    daily.Amount,
                    daily.Description,
                    daily.Requirements,
                    parseInt(completed[j]) === 1 ? true : false,
                  ),
                );
              }
            });
          });

          return res.status(201).json({ Error: null, Success: myTasks });
        },
      );
    },
  );
});

Router.post("/updateTask", (req, res) => {
  const { playfabId, taskName } = req.body;

  req.con.query(
    `SELECT * FROM Players WHERE PlayFabId='${playfabId}'`,
    (err, players) => {
      if (err)
        return res
          .status(404)
          .json({ Error: "Wasn't able to get player", Success: null });

      if (players.length <= 0)
        return res
          .status(404)
          .json({ Error: "Wasn't able to get player", Success: null });

      const player = players[0];
      const taskIds = player.Tasks.split(", ");
      const status = player.Status.split(", ");

      const add = [0, 0, 0];
      let proofCount = 0;

      req.con.query(
        `SELECT Id FROM Weapons WHERE Name='${taskName}'`,
        (err, weapons) => {
          if (err)
            return res
              .status(404)
              .json({ Error: "Wasn't able to get weapon", Success: null });

          if (weapons.length <= 0)
            return res
              .status(404)
              .json({ Error: "Wasn't able to get weapon", Success: null });

          const weaponId = weapons[0].Id;

          req.con.query(
            `SELECT Id, Requirements FROM DailyTasks WHERE Id IN ('${$taskIds[0]}', '${taskIds[1]}', '${taskIds[2]}')`,
            (err, dailyTasks) => {
              if (err)
                return res.status(404).json({
                  Error: "Wasn't able to get daily tasks",
                  Success: null,
                });

              if (dailyTasks.length <= 0)
                return res.status(404).json({
                  Error: "No daily tasks available, talk to the admin asap!",
                  Success: null,
                });

              taskIds.forEach((t, i) => {
                dailyTasks.forEach((d, j) => {
                  if (
                    parseInt(dailyTasks[j].Id) === parseInt(taskIds[i]) &&
                    dailyTasks[j].Requirements.split(", ").includes(weaponId)
                  ) {
                    add[i] = 1;
                    proofCount++;
                  }
                });
              });

              if (proofCount === 0)
                return res.status(404).json({
                  Error: "This task doesn't exist in your data",
                  Success: null,
                });

              add.forEach((a, index) => {
                status[index] = parseInt(status[index]) + a;
              });

              req.con.query(
                `UPDATE Players SET Status='${status.join(", ")}' WHERE PlayFabId='${playfabId}'`,
                (err, result) => {
                  if (err)
                    return res
                      .status(404)
                      .json({ Error: "Wasn't able to update", Success: null });

                  return res.status(201).json({ Error: null, Success: null });
                },
              );
            },
          );
        },
      );
    },
  );
});

Router.post("/checkTasks", (req, res) => {
  const { playfabId, dateTime } = req.body;

  req.con.query(
    `SELECT * FROM Players WHERE PlayFabId='${playfabId}'`,
    (err, players) => {
      if (err)
        return res
          .status(404)
          .json({ Error: "Wasn't able to get player", Success: null });

      if (players.length <= 0) {
        req.con.query("SELECT * FROM DailyTasks", (err, dailyTasks) => {
          if (err)
            return res.status(404).json({
              Error: "Wasn't able to retrieve daily tasks",
              Success: null,
            });

          if (dailyTasks.length <= 0)
            return res
              .status(404)
              .json({ Error: "No daily tasks available", Success: null });

          const tasks = GetTasks(tasks);

          req.con.query(
            `INSERT INTO Players (TaskUpdate, PlayFabId, Tasks, Status, Claimed) VALUES ('${dateTime}', '${playfabId}', '${tasks.join(", ")}', '0, 0, 0', '0, 0, 0')`,
            (err, updated) => {
              if (err)
                return res.status(404).json({
                  Error: "Wasn't able to set the player entry",
                  Success: null,
                });

              return res.status(201).json({ Error: null, Success: null });
            },
          );
        });
      } else if (players.length > 0) {
        if (parseInt(dateTime) - parseInt(players[0].TaskUpdate) >= 86400) {
          req.con.query("SELECT * FROM DailyTasks", (err, dailyTasks) => {
            if (err)
              return res.status(404).json({
                Error: "Wasn't able to retrieve daily tasks",
                Success: null,
              });

            if (dailyTasks.length <= 0)
              return res
                .status(404)
                .json({ Error: "No daily tasks available", Success: null });

            const tasks = GetTasks(tasks);

            req.con.query(
              `UPDATE Players SET TaskUpdate='${dateTime}', Tasks='${tasks.join(", ")}', Status='0, 0, 0', Claimed='0, 0, 0' WHERE PlayFabId='${playfabId}'`,
              (err, updated) => {
                if (err)
                  return res.status(404).json({
                    Error: "Wasn't able to update your daily tasks",
                    Success: null,
                  });

                return res.status(201).json({ Error: null, Success: null });
              },
            );
          });
        }
      }
    },
  );
});

module.exports = Router;
