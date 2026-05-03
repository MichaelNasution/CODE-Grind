require('../script/game.js');
require('../script/ai.js');

describe('SnakeAI', () => {
  const { chooseDirection } = window.SnakeAI;

  let state;

  beforeEach(() => {
    window.GameKit = {
      randomInt: jest.fn((min, max) => min) // always returns first option
    };

    state = {
      difficulty: 'easy',
      size: 5,
      snake: [{ x: 2, y: 2 }],
      direction: { x: 1, y: 0 }, // moving right
      food: { x: 4, y: 2 }
    };
  });

  test('should return current direction if no safe moves', () => {
    // Surround snake with itself
    state.snake = [
      { x: 2, y: 2 }, // head
      { x: 3, y: 2 }, // right
      { x: 1, y: 2 }, // left
      { x: 2, y: 3 }, // down
      { x: 2, y: 1 }  // up
    ];
    // No safe moves
    expect(chooseDirection(state)).toEqual({ x: 1, y: 0 });
  });

  describe('easy difficulty', () => {
    test('should return random safe move', () => {
      // Safe moves are Up, Down (Left is backwards, Right is free)
      // randomInt mocked to 0 returns the first safe one
      expect(chooseDirection(state)).not.toBeUndefined();
    });
  });

  describe('medium difficulty', () => {
    test('should move towards food (82% chance)', () => {
      state.difficulty = 'medium';
      jest.spyOn(Math, 'random').mockReturnValue(0.5); // < 0.82
      
      // Food is at 4,2 (Right of 2,2). 
      // Head is 2,2. Safe moves are Right(3,2), Up(2,1), Down(2,3)
      // Right gets us closer.
      expect(chooseDirection(state)).toEqual({ x: 1, y: 0 });
      
      Math.random.mockRestore();
    });

    test('should move random safe if random > 0.82', () => {
      state.difficulty = 'medium';
      jest.spyOn(Math, 'random').mockReturnValue(0.9);
      
      // Should pick first safe move due to mock randomInt
      expect(chooseDirection(state)).not.toBeUndefined();
      
      Math.random.mockRestore();
    });
  });

  describe('hard difficulty', () => {
    test('should move towards food if it leaves future safe moves', () => {
      state.difficulty = 'hard';
      expect(chooseDirection(state)).toEqual({ x: 1, y: 0 });
    });

    test('should avoid moving towards food if it leads to dead end', () => {
      state.difficulty = 'hard';
      
      // Board:
      // Food at 4,2. Head at 2,2.
      // If we move Right to 3,2, we might be trapped.
      // Let's create a trap: 3,1 and 3,3 and 4,2(food) are walls/body. Wait, food is not wall.
      // Trap: body at 3,1, 4,2, 3,3. So 3,2 has no safe moves.
      state.snake = [
        { x: 2, y: 2 }, // head
        { x: 1, y: 2 }, // body
        { x: 3, y: 1 }, // wall
        { x: 4, y: 2 }, // wall
        { x: 3, y: 3 }, // wall
      ];
      // Note: 4,2 is actually the food, but if it's body, then we can't go there next.
      // If we go right to 3,2, our next head is 3,2.
      // From 3,2, next options:
      // Up: 3,1 (body) - unsafe
      // Down: 3,3 (body) - unsafe
      // Right: 4,2 (body) - unsafe
      // Left: 2,2 (previous head, now body) - unsafe
      // So futureSafeCount for moving right would be 0.
      // It should pick something else, like Up (2,1) or Down (2,3).
      
      const move = chooseDirection(state);
      expect(move).not.toEqual({ x: 1, y: 0 }); // Should avoid right
    });
  });
});
