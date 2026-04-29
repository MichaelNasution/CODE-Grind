(function () {
  "use strict";

  const words = [
    "AI", "AID", "AIM", "AIR", "ANT", "ART", "BAR", "BARD", "BEAR", "BIRD", "BOARD", "BRAIN", "CARD", "CARE", "CAT", "CODE", "CORE", "DATA", "DEAL", "DEAR", "DOG", "DRAG", "EARN", "EAST", "GAME", "GEAR", "GRID", "HARD", "HERO", "IDEA", "KING", "LANE", "LEAD", "LEARN", "LOGIC", "MINE", "MOVE", "NODE", "OPEN", "PLAY", "POINT", "QUEEN", "RACK", "RACE", "READ", "ROAD", "SCORE", "SMART", "SNAKE", "STAR", "START", "STONE", "TABLE", "TILE", "TRAIN", "TREE", "TURN", "WORD"
  ];
  const set = new Set(words);

  function isValid(word) {
    return set.has(word.toUpperCase());
  }

  function fromRack(letters) {
    const counts = countLetters(letters);
    return words.filter((word) => {
      const needed = countLetters(word.split(""));
      return Object.keys(needed).every((letter) => needed[letter] <= (counts[letter] || 0));
    });
  }

  function countLetters(letters) {
    return letters.reduce((acc, letter) => {
      acc[letter] = (acc[letter] || 0) + 1;
      return acc;
    }, {});
  }

  window.ScrabbleDictionary = { words, isValid, fromRack };
})();
