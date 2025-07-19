import { useChessStore, ChessPiece, PlayerColor, BotDifficulty, GameMode } from './chessStore';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('Chess Store', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockReturnValue(null);
    localStorageMock.setItem.mockClear();
    localStorageMock.getItem.mockClear();
    
    // Reset the store to initial state
    useChessStore.setState({
      board: useChessStore.getState().board,
      selected: null,
      turn: PlayerColor.WHITE,
      message: 'White to move',
      gameState: 'playing',
      history: [useChessStore.getState().board],
      historyIndex: 0,
      stats: { 
        wins: 0, 
        losses: 0, 
        totalGames: 0, 
        currentWinStreak: 0,
        bestWinStreak: 0,
        averageMovesPerGame: 0,
        totalMoves: 0,
        fastestWin: 0,
        longestGame: 0,
        lastGameDate: null,
        achievements: [],
      },
      botDifficulty: BotDifficulty.MEDIUM,
      gameMode: GameMode.HUMAN_VS_BOT,
      lastMove: null,
      pendingPromotion: null,
    });
  });

  describe('Initial State', () => {
    it('should initialize with correct board setup', () => {
      const state = useChessStore.getState();
      
      // Check board dimensions
      expect(state.board).toHaveLength(8);
      expect(state.board[0]).toHaveLength(8);
      
      // Check black pieces on first row
      expect(state.board[0][0]).toBe(ChessPiece.BLACK_ROOK);
      expect(state.board[0][1]).toBe(ChessPiece.BLACK_KNIGHT);
      expect(state.board[0][2]).toBe(ChessPiece.BLACK_BISHOP);
      expect(state.board[0][3]).toBe(ChessPiece.BLACK_QUEEN);
      expect(state.board[0][4]).toBe(ChessPiece.BLACK_KING);
      expect(state.board[0][5]).toBe(ChessPiece.BLACK_BISHOP);
      expect(state.board[0][6]).toBe(ChessPiece.BLACK_KNIGHT);
      expect(state.board[0][7]).toBe(ChessPiece.BLACK_ROOK);
      
      // Check black pawns on second row
      for (let col = 0; col < 8; col++) {
        expect(state.board[1][col]).toBe(ChessPiece.BLACK_PAWN);
      }
      
      // Check white pawns on seventh row
      for (let col = 0; col < 8; col++) {
        expect(state.board[6][col]).toBe(ChessPiece.WHITE_PAWN);
      }
      
      // Check white pieces on eighth row
      expect(state.board[7][0]).toBe(ChessPiece.WHITE_ROOK);
      expect(state.board[7][1]).toBe(ChessPiece.WHITE_KNIGHT);
      expect(state.board[7][2]).toBe(ChessPiece.WHITE_BISHOP);
      expect(state.board[7][3]).toBe(ChessPiece.WHITE_QUEEN);
      expect(state.board[7][4]).toBe(ChessPiece.WHITE_KING);
      expect(state.board[7][5]).toBe(ChessPiece.WHITE_BISHOP);
      expect(state.board[7][6]).toBe(ChessPiece.WHITE_KNIGHT);
      expect(state.board[7][7]).toBe(ChessPiece.WHITE_ROOK);
      
      // Check empty squares in middle
      for (let row = 2; row < 6; row++) {
        for (let col = 0; col < 8; col++) {
          expect(state.board[row][col]).toBe(ChessPiece.EMPTY);
        }
      }
    });

    it('should initialize with white to move', () => {
      const state = useChessStore.getState();
      expect(state.turn).toBe(PlayerColor.WHITE);
    });

    it('should initialize with playing game state', () => {
      const state = useChessStore.getState();
      expect(state.gameState).toBe('playing');
    });

    it('should initialize with correct message', () => {
      const state = useChessStore.getState();
      expect(state.message).toBe('White to move');
    });

    it('should initialize with empty selection', () => {
      const state = useChessStore.getState();
      expect(state.selected).toBeNull();
    });

    it('should initialize with empty history', () => {
      const state = useChessStore.getState();
      expect(state.history).toHaveLength(1);
      expect(state.historyIndex).toBe(0);
    });

    it('should initialize with default bot difficulty', () => {
      const state = useChessStore.getState();
      expect(state.botDifficulty).toBe(BotDifficulty.MEDIUM);
    });

    it('should initialize with default game mode', () => {
      const state = useChessStore.getState();
      expect(state.gameMode).toBe(GameMode.HUMAN_VS_BOT);
    });

    it('should initialize with empty last move', () => {
      const state = useChessStore.getState();
      expect(state.lastMove).toBeNull();
    });

    it('should initialize with empty pending promotion', () => {
      const state = useChessStore.getState();
      expect(state.pendingPromotion).toBeNull();
    });
  });

  describe('State Management', () => {
    it('should set board correctly', () => {
      const newBoard = Array(8).fill(null).map(() => Array(8).fill(ChessPiece.EMPTY));
      newBoard[0][0] = ChessPiece.WHITE_PAWN;
      
      useChessStore.getState().setBoard(newBoard);
      
      expect(useChessStore.getState().board).toBe(newBoard);
    });

    it('should set selected position correctly', () => {
      const position: [number, number] = [3, 4];
      
      useChessStore.getState().setSelected(position);
      
      expect(useChessStore.getState().selected).toEqual(position);
    });

    it('should set turn correctly', () => {
      useChessStore.getState().setTurn(PlayerColor.BLACK);
      
      expect(useChessStore.getState().turn).toBe(PlayerColor.BLACK);
    });

    it('should set message correctly', () => {
      const message = 'Check!';
      
      useChessStore.getState().setMessage(message);
      
      expect(useChessStore.getState().message).toBe(message);
    });

    it('should set game state correctly', () => {
      useChessStore.getState().setGameState('checkmate');
      
      expect(useChessStore.getState().gameState).toBe('checkmate');
    });

    it('should set last move correctly', () => {
      const move: [number, number, number, number] = [6, 0, 4, 0];
      
      useChessStore.getState().setLastMove(move);
      
      expect(useChessStore.getState().lastMove).toEqual(move);
    });

    it('should set pending promotion correctly', () => {
      const position: [number, number] = [0, 0];
      
      useChessStore.getState().setPendingPromotion(position);
      
      expect(useChessStore.getState().pendingPromotion).toEqual(position);
    });

    it('should set bot difficulty correctly', () => {
      useChessStore.getState().setBotDifficulty(BotDifficulty.HARD);
      
      expect(useChessStore.getState().botDifficulty).toBe(BotDifficulty.HARD);
    });

    it('should set game mode correctly', () => {
      useChessStore.getState().setGameMode(GameMode.HUMAN_VS_HUMAN);
      
      expect(useChessStore.getState().gameMode).toBe(GameMode.HUMAN_VS_HUMAN);
    });
  });

  describe('Game Reset', () => {
    it('should reset game to initial state', () => {
      // Modify the board first
      const modifiedBoard = useChessStore.getState().board.map(row => [...row]);
      modifiedBoard[0][0] = ChessPiece.EMPTY;
      useChessStore.getState().setBoard(modifiedBoard);
      
      // Change some state
      useChessStore.getState().setTurn(PlayerColor.BLACK);
      useChessStore.getState().setSelected([3, 4]);
      useChessStore.getState().setMessage('Modified state');
      
      // Reset the game
      useChessStore.getState().resetGame();
      
      const state = useChessStore.getState();
      expect(state.turn).toBe(PlayerColor.WHITE);
      expect(state.selected).toBeNull();
      expect(state.message).toBe('White to move');
      expect(state.gameState).toBe('playing');
      expect(state.history).toHaveLength(1);
      expect(state.historyIndex).toBe(0);
      
      // Check that board is reset to initial state
      expect(state.board[0][0]).toBe(ChessPiece.BLACK_ROOK);
      expect(state.board[6][0]).toBe(ChessPiece.WHITE_PAWN);
    });

    it('should preserve stats when resetting game', () => {
      const originalStats = {
        wins: 5,
        losses: 3,
        totalGames: 8,
        currentWinStreak: 2,
        bestWinStreak: 4,
        averageMovesPerGame: 25,
        totalMoves: 200,
        fastestWin: 15,
        longestGame: 45,
        lastGameDate: '2023-01-01T00:00:00.000Z',
        achievements: ['first_win'],
      };
      
      useChessStore.setState({ stats: originalStats });
      
      useChessStore.getState().resetGame();
      
      expect(useChessStore.getState().stats).toEqual(originalStats);
    });
  });

  describe('History Management', () => {
    it('should push board to history', () => {
      const initialState = useChessStore.getState();
      const newBoard = initialState.board.map(row => [...row]);
      newBoard[6][0] = ChessPiece.EMPTY;
      newBoard[4][0] = ChessPiece.WHITE_PAWN;
      
      useChessStore.getState().pushHistory(newBoard);
      
      const state = useChessStore.getState();
      expect(state.history).toHaveLength(2);
      expect(state.historyIndex).toBe(1);
      expect(state.history[1]).toEqual(newBoard);
    });

    it('should step history forward', () => {
      // Add a move to history first
      const newBoard = useChessStore.getState().board.map(row => [...row]);
      newBoard[6][0] = ChessPiece.EMPTY;
      newBoard[4][0] = ChessPiece.WHITE_PAWN;
      useChessStore.getState().pushHistory(newBoard);
      
      // Step back
      useChessStore.getState().stepHistory(-1);
      
      const state = useChessStore.getState();
      expect(state.historyIndex).toBe(0);
      expect(state.board).toEqual(state.history[0]);
    });

    it('should step history backward', () => {
      // Add a move to history first
      const newBoard = useChessStore.getState().board.map(row => [...row]);
      newBoard[6][0] = ChessPiece.EMPTY;
      newBoard[4][0] = ChessPiece.WHITE_PAWN;
      useChessStore.getState().pushHistory(newBoard);
      
      // Step back then forward
      useChessStore.getState().stepHistory(-1);
      useChessStore.getState().stepHistory(1);
      
      const state = useChessStore.getState();
      expect(state.historyIndex).toBe(1);
      expect(state.board).toEqual(state.history[1]);
    });

    it('should not step history beyond bounds', () => {
      // Try to step back when at beginning
      useChessStore.getState().stepHistory(-1);
      
      let state = useChessStore.getState();
      expect(state.historyIndex).toBe(0);
      
      // Try to step forward when at end
      useChessStore.getState().stepHistory(1);
      
      state = useChessStore.getState();
      expect(state.historyIndex).toBe(0);
    });

    it('should truncate history when making new moves after undo', () => {
      // Add two moves to history
      const board1 = useChessStore.getState().board.map(row => [...row]);
      board1[6][0] = ChessPiece.EMPTY;
      board1[4][0] = ChessPiece.WHITE_PAWN;
      useChessStore.getState().pushHistory(board1);
      
      const board2 = board1.map(row => [...row]);
      board2[1][0] = ChessPiece.EMPTY;
      board2[3][0] = ChessPiece.BLACK_PAWN;
      useChessStore.getState().pushHistory(board2);
      
      // Undo one move
      useChessStore.getState().stepHistory(-1);
      
      // Add a new move (should truncate the future history)
      const board3 = board1.map(row => [...row]);
      board3[6][1] = ChessPiece.EMPTY;
      board3[4][1] = ChessPiece.WHITE_PAWN;
      useChessStore.getState().pushHistory(board3);
      
      const state = useChessStore.getState();
      expect(state.history).toHaveLength(2);
      expect(state.historyIndex).toBe(1);
    });
  });

  describe('Statistics Management', () => {
    it('should update stats correctly for a win', () => {
      useChessStore.getState().updateStats('win', 20);
      
      const stats = useChessStore.getState().stats;
      expect(stats.wins).toBe(1);
      expect(stats.losses).toBe(0);
      expect(stats.totalGames).toBe(1);
      expect(stats.currentWinStreak).toBe(1);
      expect(stats.bestWinStreak).toBe(1);
      expect(stats.totalMoves).toBe(20);
      expect(stats.averageMovesPerGame).toBe(20);
      expect(stats.fastestWin).toBe(20);
      expect(stats.longestGame).toBe(20);
      expect(stats.lastGameDate).toBeTruthy();
    });

    it('should update stats correctly for a loss', () => {
      useChessStore.getState().updateStats('loss', 30);
      
      const stats = useChessStore.getState().stats;
      expect(stats.wins).toBe(0);
      expect(stats.losses).toBe(1);
      expect(stats.totalGames).toBe(1);
      expect(stats.currentWinStreak).toBe(0);
      expect(stats.bestWinStreak).toBe(0);
      expect(stats.totalMoves).toBe(30);
      expect(stats.averageMovesPerGame).toBe(30);
      expect(stats.fastestWin).toBe(0);
      expect(stats.longestGame).toBe(30);
      expect(stats.lastGameDate).toBeTruthy();
    });

    it('should track win streaks correctly', () => {
      // Win first game
      useChessStore.getState().updateStats('win', 20);
      let stats = useChessStore.getState().stats;
      expect(stats.currentWinStreak).toBe(1);
      expect(stats.bestWinStreak).toBe(1);
      
      // Win second game
      useChessStore.getState().updateStats('win', 25);
      stats = useChessStore.getState().stats;
      expect(stats.currentWinStreak).toBe(2);
      expect(stats.bestWinStreak).toBe(2);
      
      // Lose third game
      useChessStore.getState().updateStats('loss', 30);
      stats = useChessStore.getState().stats;
      expect(stats.currentWinStreak).toBe(0);
      expect(stats.bestWinStreak).toBe(2);
      
      // Win fourth game
      useChessStore.getState().updateStats('win', 15);
      stats = useChessStore.getState().stats;
      expect(stats.currentWinStreak).toBe(1);
      expect(stats.bestWinStreak).toBe(2);
    });

    it('should track fastest win correctly', () => {
      // First win
      useChessStore.getState().updateStats('win', 20);
      let stats = useChessStore.getState().stats;
      expect(stats.fastestWin).toBe(20);
      
      // Faster win
      useChessStore.getState().updateStats('win', 15);
      stats = useChessStore.getState().stats;
      expect(stats.fastestWin).toBe(15);
      
      // Slower win
      useChessStore.getState().updateStats('win', 25);
      stats = useChessStore.getState().stats;
      expect(stats.fastestWin).toBe(15);
    });

    it('should track longest game correctly', () => {
      // First game
      useChessStore.getState().updateStats('loss', 30);
      let stats = useChessStore.getState().stats;
      expect(stats.longestGame).toBe(30);
      
      // Longer game
      useChessStore.getState().updateStats('win', 45);
      stats = useChessStore.getState().stats;
      expect(stats.longestGame).toBe(45);
      
      // Shorter game
      useChessStore.getState().updateStats('loss', 20);
      stats = useChessStore.getState().stats;
      expect(stats.longestGame).toBe(45);
    });

    it('should calculate average moves per game correctly', () => {
      useChessStore.getState().updateStats('win', 20);
      useChessStore.getState().updateStats('loss', 30);
      useChessStore.getState().updateStats('win', 25);
      
      const stats = useChessStore.getState().stats;
      expect(stats.totalMoves).toBe(75);
      expect(stats.totalGames).toBe(3);
      expect(stats.averageMovesPerGame).toBe(25);
    });

    it('should reset stats correctly', () => {
      // Add some stats first
      useChessStore.getState().updateStats('win', 20);
      useChessStore.getState().updateStats('loss', 30);
      
      // Reset stats
      useChessStore.getState().resetStats();
      
      const stats = useChessStore.getState().stats;
      expect(stats).toEqual({
        wins: 0,
        losses: 0,
        totalGames: 0,
        currentWinStreak: 0,
        bestWinStreak: 0,
        averageMovesPerGame: 0,
        totalMoves: 0,
        fastestWin: 0,
        longestGame: 0,
        lastGameDate: null,
        achievements: [],
      });
    });
  });

  describe('Achievement System', () => {
    it('should unlock first win achievement', () => {
      useChessStore.getState().updateStats('win', 20);
      
      const stats = useChessStore.getState().stats;
      expect(stats.achievements).toContain('first_win');
    });

    it('should unlock win streak achievements', () => {
      // Win 3 games in a row
      useChessStore.getState().updateStats('win', 20);
      useChessStore.getState().updateStats('win', 25);
      useChessStore.getState().updateStats('win', 30);
      
      let stats = useChessStore.getState().stats;
      expect(stats.achievements).toContain('win_streak_3');
      
      // Win 2 more games
      useChessStore.getState().updateStats('win', 35);
      useChessStore.getState().updateStats('win', 40);
      
      stats = useChessStore.getState().stats;
      expect(stats.achievements).toContain('win_streak_5');
    });

    it('should unlock total games achievements', () => {
      // Play 10 games
      for (let i = 0; i < 10; i++) {
        useChessStore.getState().updateStats('loss', 20);
      }
      
      let stats = useChessStore.getState().stats;
      expect(stats.achievements).toContain('games_10');
      
      // Play 40 more games
      for (let i = 0; i < 40; i++) {
        useChessStore.getState().updateStats('loss', 20);
      }
      
      stats = useChessStore.getState().stats;
      expect(stats.achievements).toContain('games_50');
    });

    it('should unlock fast win achievement', () => {
      useChessStore.getState().updateStats('win', 10);
      
      const stats = useChessStore.getState().stats;
      expect(stats.achievements).toContain('fast_win');
    });

    it('should unlock marathon achievement', () => {
      useChessStore.getState().updateStats('loss', 50);
      
      const stats = useChessStore.getState().stats;
      expect(stats.achievements).toContain('marathon');
    });

    it('should not duplicate achievements', () => {
      // Win first game
      useChessStore.getState().updateStats('win', 10);
      let stats = useChessStore.getState().stats;
      const firstWinCount = stats.achievements.filter(a => a === 'first_win').length;
      expect(firstWinCount).toBe(1);
      
      // Win another game
      useChessStore.getState().updateStats('win', 15);
      stats = useChessStore.getState().stats;
      const firstWinCountAfter = stats.achievements.filter(a => a === 'first_win').length;
      expect(firstWinCountAfter).toBe(1);
    });
  });

  describe('Game Persistence', () => {
    it('should save game state to localStorage', () => {
      const state = useChessStore.getState();
      state.saveGame();
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'chessGameState',
        expect.stringContaining('"board"')
      );
    });

    it('should load game state from localStorage', () => {
      const savedState = {
        board: Array(8).fill(null).map(() => Array(8).fill(ChessPiece.EMPTY)),
        turn: PlayerColor.BLACK,
        gameState: 'checkmate',
        history: [Array(8).fill(null).map(() => Array(8).fill(ChessPiece.EMPTY))],
        historyIndex: 0,
        botDifficulty: BotDifficulty.HARD,
        gameMode: GameMode.HUMAN_VS_HUMAN,
      };
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify(savedState));
      
      useChessStore.getState().loadGame();
      
      const state = useChessStore.getState();
      expect(state.turn).toBe(PlayerColor.BLACK);
      expect(state.gameState).toBe('checkmate');
      expect(state.botDifficulty).toBe(BotDifficulty.HARD);
      expect(state.gameMode).toBe(GameMode.HUMAN_VS_HUMAN);
    });

    it('should handle missing saved game gracefully', () => {
      localStorageMock.getItem.mockReturnValue(null);
      
      const initialState = useChessStore.getState();
      useChessStore.getState().loadGame();
      
      const state = useChessStore.getState();
      expect(state.turn).toBe(initialState.turn);
      expect(state.gameState).toBe(initialState.gameState);
    });

    it('should handle invalid saved game gracefully', () => {
      localStorageMock.getItem.mockReturnValue('invalid json');
      
      const initialState = useChessStore.getState();
      useChessStore.getState().loadGame();
      
      const state = useChessStore.getState();
      expect(state.turn).toBe(initialState.turn);
      expect(state.gameState).toBe(initialState.gameState);
    });

    it('should check for saved game correctly', () => {
      localStorageMock.getItem.mockReturnValue(null);
      expect(useChessStore.getState().hasSavedGame()).toBe(false);
      
      localStorageMock.getItem.mockReturnValue('{"board":[]}');
      expect(useChessStore.getState().hasSavedGame()).toBe(true);
    });
  });

  describe('Board Utility Functions', () => {
    it('should create initial board with correct piece placement', () => {
      const board = useChessStore.getState().board;
      
      // Check all pieces are in correct positions
      expect(board[0][0]).toBe(ChessPiece.BLACK_ROOK);
      expect(board[0][7]).toBe(ChessPiece.BLACK_ROOK);
      expect(board[7][0]).toBe(ChessPiece.WHITE_ROOK);
      expect(board[7][7]).toBe(ChessPiece.WHITE_ROOK);
      
      expect(board[0][1]).toBe(ChessPiece.BLACK_KNIGHT);
      expect(board[0][6]).toBe(ChessPiece.BLACK_KNIGHT);
      expect(board[7][1]).toBe(ChessPiece.WHITE_KNIGHT);
      expect(board[7][6]).toBe(ChessPiece.WHITE_KNIGHT);
      
      expect(board[0][2]).toBe(ChessPiece.BLACK_BISHOP);
      expect(board[0][5]).toBe(ChessPiece.BLACK_BISHOP);
      expect(board[7][2]).toBe(ChessPiece.WHITE_BISHOP);
      expect(board[7][5]).toBe(ChessPiece.WHITE_BISHOP);
      
      expect(board[0][3]).toBe(ChessPiece.BLACK_QUEEN);
      expect(board[7][3]).toBe(ChessPiece.WHITE_QUEEN);
      
      expect(board[0][4]).toBe(ChessPiece.BLACK_KING);
      expect(board[7][4]).toBe(ChessPiece.WHITE_KING);
    });

    it('should clone board correctly', () => {
      const originalBoard = useChessStore.getState().board;
      const clonedBoard = originalBoard.map(row => [...row]);
      
      // Modify cloned board
      clonedBoard[0][0] = ChessPiece.EMPTY;
      
      // Original should remain unchanged
      expect(originalBoard[0][0]).toBe(ChessPiece.BLACK_ROOK);
      expect(clonedBoard[0][0]).toBe(ChessPiece.EMPTY);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle empty board state', () => {
      const emptyBoard = Array(8).fill(null).map(() => Array(8).fill(ChessPiece.EMPTY));
      useChessStore.getState().setBoard(emptyBoard);
      
      const state = useChessStore.getState();
      expect(state.board).toEqual(emptyBoard);
    });

    it('should handle null selected position', () => {
      useChessStore.getState().setSelected(null);
      
      const state = useChessStore.getState();
      expect(state.selected).toBeNull();
    });

    it('should handle invalid board dimensions gracefully', () => {
      // This test ensures the store can handle edge cases
      // The actual board validation would be in the UI layer
      expect(() => {
        useChessStore.getState().setBoard([]);
      }).not.toThrow();
    });

    it('should handle statistics with zero games', () => {
      const stats = useChessStore.getState().stats;
      expect(stats.averageMovesPerGame).toBe(0);
      expect(stats.fastestWin).toBe(0);
      expect(stats.longestGame).toBe(0);
    });

    it('should handle localStorage errors gracefully', () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });
      
      // Should not throw error
      expect(() => {
        useChessStore.getState().saveGame();
      }).not.toThrow();
    });
  });

  describe('Game Mode Transitions', () => {
    it('should transition from human vs bot to human vs human', () => {
      useChessStore.getState().setGameMode(GameMode.HUMAN_VS_HUMAN);
      
      const state = useChessStore.getState();
      expect(state.gameMode).toBe(GameMode.HUMAN_VS_HUMAN);
    });

    it('should maintain game state when changing modes', () => {
      const originalBoard = useChessStore.getState().board;
      const originalTurn = useChessStore.getState().turn;
      
      useChessStore.getState().setGameMode(GameMode.HUMAN_VS_HUMAN);
      
      const state = useChessStore.getState();
      expect(state.board).toEqual(originalBoard);
      expect(state.turn).toBe(originalTurn);
    });
  });

  describe('Bot Difficulty Settings', () => {
    it('should change bot difficulty correctly', () => {
      useChessStore.getState().setBotDifficulty(BotDifficulty.EASY);
      expect(useChessStore.getState().botDifficulty).toBe(BotDifficulty.EASY);
      
      useChessStore.getState().setBotDifficulty(BotDifficulty.HARD);
      expect(useChessStore.getState().botDifficulty).toBe(BotDifficulty.HARD);
    });

    it('should maintain other state when changing difficulty', () => {
      const originalBoard = useChessStore.getState().board;
      const originalTurn = useChessStore.getState().turn;
      
      useChessStore.getState().setBotDifficulty(BotDifficulty.HARD);
      
      const state = useChessStore.getState();
      expect(state.board).toEqual(originalBoard);
      expect(state.turn).toBe(originalTurn);
    });
  });
}); 