describe('MinesweeperUI', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.useFakeTimers();

    document.body.innerHTML = `
      <div id="board"></div>
      <span id="mine-count"></span>
      <span id="timer"></span>
      <span id="best-score"></span>
      <span id="status-title"></span>
      <span id="status-copy"></span>
      <button id="new-game"></button>
      <button id="ai-step"></button>
      <button data-mode="solo"></button>
      <button data-mode="race"></button>
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
      playWin: jest.fn(),
      playLose: jest.fn(),
      saveScore: jest.fn(),
      loadScore: jest.fn().mockReturnValue({ best: null })
    };

    window.MinesweeperState = {
      create: jest.fn(() => ({
        rows: 3,
        cols: 3,
        mines: 2,
        board: [],
        revealed: 0,
        flags: 0,
        status: "ready",
        mode: "solo",
        difficulty: "medium",
        seconds: 0,
        timerId: null,
        best: null
      }))
    };

    window.MinesweeperGame = {
      createBoard: jest.fn((state) => {
        state.board = Array(9).fill(0).map((_, i) => ({
            index: i, mine: i===0, revealed: false, count: 0, flagged: false
        }));
      }),
      reveal: jest.fn((state, index) => {
        state.board[index].revealed = true;
        if (state.board[index].mine) state.status = 'lost';
      }),
      toggleFlag: jest.fn((state, index) => {
        state.board[index].flagged = !state.board[index].flagged;
        state.flags += state.board[index].flagged ? 1 : -1;
      })
    };

    window.MinesweeperAI = {
      chooseTile: jest.fn(() => 1) // AI chooses index 1
    };
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  test('should boot and render initial state', () => {
    require('../script/ui.js');
    expect(document.querySelector('#board').children.length).toBe(9);
    expect(document.querySelector('#status-title').textContent).toBe('Ready');
  });

  test('clicking tile should reveal it and start timer', () => {
    require('../script/ui.js');
    const board = document.querySelector('#board');
    board.children[1].click(); // click safe tile

    expect(window.MinesweeperGame.reveal).toHaveBeenCalled();
    expect(document.querySelector('#timer').textContent).toBe('0');
    
    // Timer ticks
    jest.advanceTimersByTime(1000);
    expect(document.querySelector('#timer').textContent).toBe('1');
  });

  test('right clicking tile should toggle flag', () => {
    require('../script/ui.js');
    const board = document.querySelector('#board');
    
    board.children[1].dispatchEvent(new MouseEvent('contextmenu'));
    expect(window.MinesweeperGame.toggleFlag).toHaveBeenCalled();
  });

  test('clicking AI step should reveal chosen tile', () => {
    require('../script/ui.js');
    document.querySelector('#ai-step').click();
    
    expect(window.MinesweeperAI.chooseTile).toHaveBeenCalled();
    expect(window.MinesweeperGame.reveal).toHaveBeenCalled();
  });

  test('should handle lost game state', () => {
    require('../script/ui.js');
    const board = document.querySelector('#board');
    
    board.children[0].click(); // click mine
    
    expect(window.GameKit.playLose).toHaveBeenCalled();
    expect(document.querySelector('#status-title').textContent).toBe('Mine hit');
  });

  test('should handle won game state', () => {
    window.MinesweeperGame.reveal = jest.fn((state, index) => {
        state.status = 'won';
    });

    require('../script/ui.js');
    const board = document.querySelector('#board');
    board.children[1].click();
    
    expect(window.GameKit.playWin).toHaveBeenCalled();
    expect(document.querySelector('#status-title').textContent).toBe('Cleared');
    expect(window.GameKit.saveScore).toHaveBeenCalled();
  });
});
