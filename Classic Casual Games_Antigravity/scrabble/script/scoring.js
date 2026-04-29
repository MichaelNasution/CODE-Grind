(function () {
  "use strict";

  const bonus = {
    "0,0": "tw", "0,7": "tw", "0,14": "tw", "7,0": "tw", "7,14": "tw", "14,0": "tw", "14,7": "tw", "14,14": "tw",
    "1,1": "dw", "2,2": "dw", "3,3": "dw", "4,4": "dw", "10,10": "dw", "11,11": "dw", "12,12": "dw", "13,13": "dw", "7,7": "dw",
    "1,5": "tl", "1,9": "tl", "5,1": "tl", "5,5": "tl", "5,9": "tl", "5,13": "tl", "9,1": "tl", "9,5": "tl", "9,9": "tl", "9,13": "tl", "13,5": "tl", "13,9": "tl",
    "0,3": "dl", "0,11": "dl", "2,6": "dl", "2,8": "dl", "3,0": "dl", "3,7": "dl", "3,14": "dl", "6,2": "dl", "6,6": "dl", "6,8": "dl", "6,12": "dl", "7,3": "dl", "7,11": "dl", "8,2": "dl", "8,6": "dl", "8,8": "dl", "8,12": "dl", "11,0": "dl", "11,7": "dl", "11,14": "dl", "12,6": "dl", "12,8": "dl", "14,3": "dl", "14,11": "dl"
  };

  function scorePlacement(tiles, board) {
    let wordMultiplier = 1;
    const letterScore = tiles.reduce((sum, item) => {
      const key = `${item.row},${item.col}`;
      const tileBonus = board[item.row][item.col] ? null : bonus[key];
      if (tileBonus === "dw") wordMultiplier *= 2;
      if (tileBonus === "tw") wordMultiplier *= 3;
      const letterMultiplier = tileBonus === "dl" ? 2 : tileBonus === "tl" ? 3 : 1;
      return sum + item.tile.value * letterMultiplier;
    }, 0);
    return letterScore * wordMultiplier;
  }

  window.ScrabbleScoring = { bonus, scorePlacement };
})();
