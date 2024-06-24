const { Client } = require("../../index");

const fakeDatabase = {
  Blacklist: [
    { Id: 1, Word: "spam" },
    { Id: 2, Word: "ban" },
    { Id: 3, Word: "hack" },
  ],
};

const BlacklistedWords = [];

const InitializeList = () => {
  setTimeout(() => {
    fakeDatabase.Blacklist.forEach((entry) => {
      BlacklistedWords.push(entry);
    });
    console.log("Blacklist initialized:", BlacklistedWords);
  }, 100);
};

const Add = (wordObj) => {
  fakeDatabase.Blacklist.push(wordObj);
  BlacklistedWords.push(wordObj);
  console.log("Word added:", wordObj);
};

const Remove = (id) => {
  const index = BlacklistedWords.findIndex((word) => word.Id === id);
  if (index !== -1) {
    BlacklistedWords.splice(index, 1);
    console.log("Word removed:", id);
  }
};

const IsWordBlacklisted = (message) => {
  return BlacklistedWords.some((word) => message.includes(word.Word));
};

InitializeList();

module.exports = { IsWordBlacklisted, Add, Remove };
