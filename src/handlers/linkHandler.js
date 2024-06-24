const Discord = require("discord.js");

const ValidChannels = ["603465167724085269"];

/**
 *
 * @param {Discord.GuildMember} member
 * @param {*} channel
 * @param {*} content
 */
const IsURLValid = (member, channel, content) => {
  if (!member) return true;

  if (member.hasPermission(["ADMINISTRATOR"])) return true;

  if (content.includes("http")) {
    if (!ValidChannels.includes(channel.id)) return false;
  }

  return true;
};

module.exports = { IsURLValid };
