const { createIndexes } = require("../schema/ClanSchema");

const Router = require("express").Router();

const ListOfDiscordMods = [
  // soon adding list
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

module.exports = Router;
