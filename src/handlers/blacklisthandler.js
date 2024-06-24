const { Client } = require("../../index");

const BlacklistedWords = new Array();

const InitializeList = () => {
  Client.con.query(`SELECT * FROM Blacklist`, (err, words) => {
    if (err) return console.error(err);

    words.forEach((w) => {
      BlacklistedWords.push(w);
    });
  });
};

const Add = (wordObj) => {
  BlacklistedWords.push(wordObj);
};

const Remove = (id) => {
  const index = BlacklistedWords.findIndex((w) => w.Id === id);
  BlacklistedWords.splice(index, 1);
};

const IsWordBlacklisted = (message) => {
  let IS_BLACKLISTED = false;

  BlacklistedWords.forEach((w) => {
    if (message.includes(w.Word)) IS_BLACKLISTED = true;
  });

  return IS_BLACKLISTED;
};

InitializeList();

module.exports = { IsWordBlacklisted, Add, Remove };
