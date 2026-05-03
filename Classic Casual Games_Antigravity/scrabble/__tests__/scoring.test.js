require('../script/scoring.js');

describe('ScrabbleScoring.scorePlacement', () => {
  const { scorePlacement, bonus } = window.ScrabbleScoring;

  test('should calculate score for a single word without multipliers', () => {
    const word = [
      { tile: { value: 1 }, isNew: true, row: 1, col: 2 }, // No bonus at 1,2
      { tile: { value: 2 }, isNew: true, row: 1, col: 3 }, // No bonus at 1,3
      { tile: { value: 3 }, isNew: true, row: 1, col: 4 }  // No bonus at 1,4
    ];
    // Total = 1 + 2 + 3 = 6
    expect(scorePlacement([word], 3)).toBe(6);
  });

  test('should apply double letter score (dl) correctly', () => {
    const word = [
      { tile: { value: 1 }, isNew: true, row: 0, col: 3 }, // 'dl' at 0,3 => 1 * 2 = 2
      { tile: { value: 2 }, isNew: true, row: 0, col: 4 }  // No bonus at 0,4
    ];
    // Total = 2 + 2 = 4
    expect(scorePlacement([word], 2)).toBe(4);
  });

  test('should apply triple letter score (tl) correctly', () => {
    const word = [
      { tile: { value: 1 }, isNew: true, row: 1, col: 5 }, // 'tl' at 1,5 => 1 * 3 = 3
      { tile: { value: 2 }, isNew: true, row: 1, col: 6 }  // No bonus at 1,6
    ];
    // Total = 3 + 2 = 5
    expect(scorePlacement([word], 2)).toBe(5);
  });

  test('should apply double word score (dw) correctly', () => {
    const word = [
      { tile: { value: 1 }, isNew: true, row: 1, col: 1 }, // 'dw' at 1,1 => multiplier * 2
      { tile: { value: 2 }, isNew: true, row: 1, col: 2 }  // No bonus
    ];
    // Letters = 1 + 2 = 3. Multiplier = 2. Total = 6
    expect(scorePlacement([word], 2)).toBe(6);
  });

  test('should apply triple word score (tw) correctly', () => {
    const word = [
      { tile: { value: 1 }, isNew: true, row: 0, col: 0 }, // 'tw' at 0,0 => multiplier * 3
      { tile: { value: 2 }, isNew: true, row: 0, col: 1 }  // No bonus
    ];
    // Letters = 1 + 2 = 3. Multiplier = 3. Total = 9
    expect(scorePlacement([word], 2)).toBe(9);
  });

  test('should apply Bingo bonus if 7 tiles are new', () => {
    const word = [];
    const safeCols = [1, 2, 4, 5, 6, 8, 9];
    for (let i = 0; i < 7; i++) {
      word.push({ tile: { value: 1 }, isNew: true, row: 0, col: safeCols[i] }); // no bonuses
    }
    // Letters = 7 * 1 = 7. Bingo = 50. Total = 57
    expect(scorePlacement([word], 7)).toBe(57);
  });

  test('should only apply bonuses to new tiles', () => {
    const word = [
      { tile: { value: 1 }, isNew: false, row: 0, col: 0 }, // 'tw' at 0,0 but not new => 1, multiplier 1
      { tile: { value: 2 }, isNew: true, row: 0, col: 3 }   // 'dl' at 0,3 => 2 * 2 = 4
    ];
    // Total = 1 + 4 = 5
    expect(scorePlacement([word], 1)).toBe(5);
  });

  test('should calculate multiple words correctly', () => {
    const word1 = [
      { tile: { value: 1 }, isNew: true, row: 1, col: 1 }, // 'dw'
      { tile: { value: 2 }, isNew: true, row: 1, col: 2 }
    ]; // (1 + 2) * 2 = 6
    const word2 = [
      { tile: { value: 1 }, isNew: true, row: 1, col: 1 }, // 'dw' (intersects)
      { tile: { value: 3 }, isNew: true, row: 2, col: 1 }
    ]; // (1 + 3) * 2 = 8
    
    // Total = 6 + 8 = 14
    expect(scorePlacement([word1, word2], 3)).toBe(14);
  });

  test('should handle empty words safely (negative scenario)', () => {
    expect(scorePlacement([], 0)).toBe(0);
  });

  test('should handle word with missing tile value gracefully (should perhaps error or be 0)', () => {
    const word = [
      { tile: { value: NaN }, isNew: true, row: 1, col: 2 },
    ];
    // In current implementation, NaN += NaN will result in NaN
    expect(Number.isNaN(scorePlacement([word], 1))).toBe(true);
  });
});
