const ReachedNewLevel = (newXp, oldLevel) => {
  const { Level } = GetLevel(newXp, oldLevel);

  if (Level > oldLevel) return Level;

  return false;
};

const GetLevel = (xp, level) => {
  if (xp >= 50 * level * (level * 2)) return GetLevel(xp, level + 1);

  return { XP: xp, Level: level, Required: 50 * level * (level * 2) };
};

module.exports = { GetLevel, ReachedNewLevel };
