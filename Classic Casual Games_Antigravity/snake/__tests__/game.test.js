require('../../shared/scripts/utils.js');
require('../script/game.js');

describe('SnakeGame', () => {
  const { resetFood, changeDirection, step, key } = window.SnakeGame;

  let state;

  beforeEach(() => {
    window.GameKit.randomInt = jest.fn(() => 0); // Always returns first open spot
    state = {
      size: 5,
      snake: [{ x: 2, y: 2 }, { x: 1, y: 2 }],
      direction: { x: 1, y: 0 },
      nextDirection: { x: 1, y: 0 },
      food: { x: 4, y: 2 },
      score: 0,
      speed: 1,
      status: 'playing'
    };
  });

  describe('key', () => {
    test('should format cell to string', () => {
      expect(key({ x: 5, y: 10 })).toBe("5,10");
    });
  });

  describe('resetFood', () => {
    test('should place food on an empty cell', () => {
      resetFood(state);
      // Since randomInt is mocked to 0, it picks the first empty spot (0,0)
      expect(state.food).toEqual({ x: 0, y: 0 });
    });
  });

  describe('changeDirection', () => {
    test('should set nextDirection', () => {
      changeDirection(state, { x: 0, y: 1 });
      expect(state.nextDirection).toEqual({ x: 0, y: 1 });
    });

    test('should ignore 180 degree turn', () => {
      // current is {x:1, y:0}. Trying to go left {x:-1, y:0} should be ignored.
      changeDirection(state, { x: -1, y: 0 });
      expect(state.nextDirection).toEqual({ x: 1, y: 0 }); // unchanged
    });
  });

  describe('step', () => {
    test('should move snake forward', () => {
      step(state);
      expect(state.snake[0]).toEqual({ x: 3, y: 2 });
      expect(state.snake[1]).toEqual({ x: 2, y: 2 });
      expect(state.snake.length).toBe(2);
    });

    test('should eat food, grow, and increase score', () => {
      state.snake = [{ x: 3, y: 2 }, { x: 2, y: 2 }]; // next step will hit food at 4,2
      step(state);
      expect(state.snake[0]).toEqual({ x: 4, y: 2 });
      expect(state.snake.length).toBe(3); // grew
      expect(state.score).toBe(10);
      expect(state.food).not.toEqual({ x: 4, y: 2 }); // food moved
    });

    test('should speed up every 50 points', () => {
      state.score = 40;
      state.snake = [{ x: 3, y: 2 }];
      step(state);
      expect(state.score).toBe(50);
      expect(state.speed).toBe(2);
    });

    test('should die on wall collision (right)', () => {
      state.snake = [{ x: 4, y: 2 }];
      step(state);
      expect(state.status).toBe('lost');
    });

    test('should die on wall collision (left)', () => {
      state.snake = [{ x: 0, y: 2 }];
      state.direction = { x: -1, y: 0 };
      state.nextDirection = { x: -1, y: 0 };
      step(state);
      expect(state.status).toBe('lost');
    });

    test('should die on self collision', () => {
      // snake: length 5
      state.snake = [
        { x: 2, y: 2 }, // head
        { x: 2, y: 3 },
        { x: 3, y: 3 },
        { x: 3, y: 2 },
        { x: 3, y: 1 }
      ];
      state.direction = { x: 1, y: 0 };
      state.nextDirection = { x: 1, y: 0 };
      // next step hits {x:3, y:2} which is part of its body
      step(state);
      expect(state.status).toBe('lost');
    });
  });
});
