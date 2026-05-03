// Mock dependencies
window.GameKit = {
  randomInt: jest.fn((min, max) => min) // always return first move for predictability
};

window.ChessGame = {
  allLegalMoves: jest.fn(),
  applyMove: jest.fn(),
  evaluate: jest.fn(),
  toFEN: jest.fn(),
  parseUCIMove: jest.fn()
};

window.StockfishEngine = {
  isReady: jest.fn(),
  init: jest.fn(),
  getBestMove: jest.fn()
};

require('../script/ai.js');

describe('ChessAI', () => {
  const { chooseMove, chooseMoveAsync } = window.ChessAI;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockState = {
    difficulty: 'easy',
    board: Array(64).fill(null),
    status: 'playing'
  };

  test('chooseMove should return a move using the built-in AI', () => {
    // Setup 2 legal moves
    const move1 = { from: 0, to: 1 };
    const move2 = { from: 2, to: 3 };
    
    // Depth 1 means it will call allLegalMoves once for black, 
    // then for each move it calls evaluate()
    window.ChessGame.allLegalMoves.mockReturnValueOnce([move1, move2]);
    
    // For move1 evaluation
    window.ChessGame.evaluate.mockReturnValueOnce(10);
    // For move2 evaluation
    window.ChessGame.evaluate.mockReturnValueOnce(5);

    const bestMove = chooseMove(mockState);
    
    // It should pick move1 because 10 > 5
    expect(bestMove).toEqual(move1);
    expect(window.ChessGame.applyMove).toHaveBeenCalledTimes(2);
  });

  test('chooseMoveAsync should call chooseMove if difficulty is not stockfish', async () => {
    const state = { ...mockState, difficulty: 'medium' };
    
    const move1 = { from: 8, to: 16 };
    window.ChessGame.allLegalMoves.mockReturnValue([move1]);
    window.ChessGame.evaluate.mockReturnValue(0);

    const move = await chooseMoveAsync(state);
    expect(move).toEqual(move1);
  });

  test('chooseMoveAsync should use Stockfish if difficulty is stockfish', async () => {
    const state = { ...mockState, difficulty: 'stockfish' };
    
    window.StockfishEngine.isReady.mockReturnValue(false);
    window.StockfishEngine.init.mockResolvedValue(true);
    window.StockfishEngine.getBestMove.mockResolvedValue('e2e4');
    window.ChessGame.toFEN.mockReturnValue('fen_string');
    window.ChessGame.parseUCIMove.mockReturnValue({ from: 52, to: 36 });

    const move = await chooseMoveAsync(state);
    
    expect(window.StockfishEngine.init).toHaveBeenCalled();
    expect(window.StockfishEngine.getBestMove).toHaveBeenCalledWith('fen_string', 15);
    expect(move).toEqual({ from: 52, to: 36 });
  });

  test('chooseMoveAsync returns null if stockfish returns invalid move', async () => {
    const state = { ...mockState, difficulty: 'stockfish' };
    
    window.StockfishEngine.isReady.mockReturnValue(true);
    window.StockfishEngine.getBestMove.mockResolvedValue('(none)');
    
    const move = await chooseMoveAsync(state);
    expect(move).toBeNull();
  });
});
