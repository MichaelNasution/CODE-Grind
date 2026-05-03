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
    // Trap snake at corner
    state.snake = [
      { x: 0, y: 0 }, // head
      { x: 1, y: 0 },
      { x: 1, y: 1 },
      { x: 0, y: 1 },
      { x: 0, y: 2 }, // tail (moves away, but we're walled in by 0,1)
      { x: 1, y: 2 }
    ];
    state.direction = { x: -1, y: 0 }; // moving left into corner
    // Safe moves: None. Up is wall. Left is wall. Right is body(1,0). Down is body(0,1).
    expect(chooseDirection(state)).toEqual({ x: -1, y: 0 });
  });

  describe('easy difficulty', () => {
    test('should return random safe move', () => {
      expect(chooseDirection(state)).not.toBeUndefined();
    });
  });

  describe('medium difficulty', () => {
    test('should move towards food (82% chance)', () => {
      state.difficulty = 'medium';
      jest.spyOn(Math, 'random').mockReturnValue(0.5); 
      expect(chooseDirection(state)).toEqual({ x: 1, y: 0 });
      Math.random.mockRestore();
    });

    test('should move random safe if random > 0.82', () => {
      state.difficulty = 'medium';
      jest.spyOn(Math, 'random').mockReturnValue(0.9);
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
      // Head at 2,2. Food at 3,2.
      // If moving right to 3,2, next options from 3,2: 
      // Up, Down, Right are all body walls. Left is previous head.
      state.food = { x: 3, y: 2 };
      state.snake = [
        { x: 2, y: 2 }, // head
        { x: 1, y: 2 }, // body
        // create a cup around 3,2
        { x: 3, y: 1 },
        { x: 4, y: 2 },
        { x: 3, y: 3 },
        { x: 0, y: 0 }, // extra tails so they don't move away to open paths
        { x: 0, y: 1 }
      ];
      const move = chooseDirection(state);
      expect(move).not.toEqual({ x: 1, y: 0 }); // avoid right
    });
  });
});
