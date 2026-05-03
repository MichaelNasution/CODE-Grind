describe('SnakeUI', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.useFakeTimers();

    document.body.innerHTML = `
      <div id="board"></div>
      <span id="score"></span>
      <span id="speed"></span>
      <span id="best"></span>
      <span id="status-title"></span>
      <span id="status-copy"></span>
      <button id="start"></button>
      <button id="reset"></button>
      <button data-mode="solo"></button>
      <button data-mode="ai"></button>
      <button data-difficulty="easy"></button>
      <button data-difficulty="medium"></button>
      <button data-difficulty="hard"></button>
    `;

    // Mock dependencies
    window.GameKit = {
      qs: (selector) => document.querySelector(selector),
      qsa: (selector) => document.querySelectorAll(selector),
      setPressed: jest.fn(),
      playClick: jest.fn(),
      playLose: jest.fn(),
      saveScore: jest.fn(),
      loadScore: jest.fn().mockReturnValue({ best: 0 })
    };

    window.SnakeState = {
      create: jest.fn(() => ({
        size: 5,
        snake: [{ x: 2, y: 2 }],
        direction: { x: 1, y: 0 },
        nextDirection: { x: 1, y: 0 },
        food: { x: 4, y: 2 },
        score: 0,
        speed: 1,
        status: "ready",
        mode: "solo",
        difficulty: "medium",
        loopId: null,
        best: 0
      }))
    };

    window.SnakeGame = {
      key: jest.fn((cell) => `${cell.x},${cell.y}`),
      changeDirection: jest.fn(),
      step: jest.fn()
    };

    window.SnakeAI = {
      chooseDirection: jest.fn(() => ({ x: 0, y: 1 }))
    };
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  test('should boot and render initial state', () => {
    require('../script/ui.js');
    expect(document.querySelector('#board').children.length).toBe(25); // 5x5
  });

  test('start button should initiate game loop', () => {
    require('../script/ui.js');
    document.querySelector('#start').click();

    expect(document.querySelector('#status-title').textContent).toBe('Running');
    expect(window.SnakeGame.step).toHaveBeenCalled();

    // Advance timer to trigger next loop
    jest.advanceTimersByTime(200);
    expect(window.SnakeGame.step).toHaveBeenCalledTimes(2);
  });

  test('should handle AI mode', () => {
    window.SnakeState.create = jest.fn(() => ({
        size: 5,
        snake: [{ x: 2, y: 2 }],
        direction: { x: 1, y: 0 },
        nextDirection: { x: 1, y: 0 },
        food: { x: 4, y: 2 },
        score: 0,
        speed: 1,
        status: "ready",
        mode: "ai",
        difficulty: "medium",
        loopId: null,
        best: 0
    }));

    require('../script/ui.js');
    document.querySelector('#start').click();

    expect(window.SnakeAI.chooseDirection).toHaveBeenCalled();
    expect(window.SnakeGame.changeDirection).toHaveBeenCalled();
  });

  test('should handle loss and save best score', () => {
    window.SnakeGame.step = jest.fn((state) => {
        state.status = 'lost';
        state.score = 50;
    });

    require('../script/ui.js');
    document.querySelector('#start').click();

    expect(window.GameKit.playLose).toHaveBeenCalled();
    expect(window.GameKit.saveScore).toHaveBeenCalledWith('snake', { best: 50 });
    expect(document.querySelector('#status-title').textContent).toBe('Game over');
  });

  test('should respond to keyboard input in solo mode', () => {
    require('../script/ui.js');
    const event = new KeyboardEvent('keydown', { code: 'ArrowUp' });
    document.dispatchEvent(event);

    expect(window.SnakeGame.changeDirection).toHaveBeenCalledWith(expect.anything(), { x: 0, y: -1 });
  });
});
