const express = require("express");

module.exports = (client) => {
  const Router = express.Router();

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

  const getTasks = (results) => {
    const arr = [];
    const used = new Set();

    while (arr.length < 3 && used.size < results.length) {
      let random = Math.floor(Math.random() * results.length);
      if (!used.has(random)) {
        used.add(random);
        arr.push(results[random].Id);
      }
    }

    return arr;
  };

  const discordMiddleware = (req, res, next) => {
    const id = req.headers["auth"];
    if (client.someModList.includes(id)) {
      next();
    } else {
      return res
        .status(403)
        .json({ Error: "Access denied: Not a staff member", Success: null });
    }
  };

  Router.post("/createTask", discordMiddleware, (req, res) => {
    const { Amount, Currency, Reward, Description, Requirements } = req.body;
    const query =
      "INSERT INTO DailyTasks (Reward, Currency, Amount, Description, Requirements) VALUES (?, ?, ?, ?, ?)";
    const values = [Reward, Currency, Amount, Description, Requirements];

    req.con.query(query, values, (err) => {
      if (err) {
        console.error("Error inserting task:", err);
        return res
          .status(500)
          .json({ Error: "Failed to create new task", Success: null });
      }
      res
        .status(201)
        .json({ Error: null, Success: `Task created successfully!` });
    });
  });

  return Router;
};
