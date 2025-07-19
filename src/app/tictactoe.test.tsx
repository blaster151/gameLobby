import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import TicTacToe from './tictactoe';
import {
  useTicTacToeStore,
  Player,
  GameState,
  GameMode,
  BotDifficulty,
  createEmptyBoard,
  cloneBoard,
  checkWinner,
  isBoardFull,
  getAvailableMoves,
  isValidMove,
  makeRandomMove,
  evaluateBoard,
  minimax,
  findBestMove,
  makeBotMove,
  getGameMessage,
} from './tictactoeStore';

// Mock the store
jest.mock('./tictactoeStore', () => ({
  ...jest.requireActual('./tictactoeStore'),
  useTicTacToeStore: jest.fn(),
}));

const mockUseTicTacToeStore = useTicTacToeStore as jest.MockedFunction<typeof useTicTacToeStore>;

describe('TicTacToe Component', () => {
  const defaultMockState = {
    board: createEmptyBoard(),
    currentPlayer: Player.X,
    gameState: GameState.PLAYING,
    gameMode: GameMode.HUMAN_VS_HUMAN,
    botDifficulty: BotDifficulty.MEDIUM,
    stats: { xWins: 5, oWins: 3, draws: 2, totalGames: 10 },
    history: [createEmptyBoard()],
    historyIndex: 0,
    message: "Player X's turn",
    lastMove: null,
    winningLine: null,
    makeMove: jest.fn(),
    resetGame: jest.fn(),
    setGameMode: jest.fn(),
    setBotDifficulty: jest.fn(),
    undoMove: jest.fn(),
    redoMove: jest.fn(),
    updateStats: jest.fn(),
    resetStats: jest.fn(),
    saveGame: jest.fn(),
    loadGame: jest.fn(),
    hasSavedGame: jest.fn(() => false),
  };

  beforeEach(() => {
    mockUseTicTacToeStore.mockReturnValue(defaultMockState);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders the game title and description', () => {
      render(<TicTacToe />);
      
      expect(screen.getByText('Tic-Tac-Toe')).toBeInTheDocument();
      expect(screen.getByText('Classic game with AI opponents')).toBeInTheDocument();
    });

    it('renders the game board with 9 cells', () => {
      render(<TicTacToe />);
      
      const cells = screen.getAllByRole('button').filter(button => 
        button.textContent === '' || button.textContent === 'X' || button.textContent === 'O'
      );
      expect(cells).toHaveLength(9);
    });

    it('renders game controls', () => {
      render(<TicTacToe />);
      
      expect(screen.getByText('New Game')).toBeInTheDocument();
      expect(screen.getByText('Undo')).toBeInTheDocument();
      expect(screen.getByText('Redo')).toBeInTheDocument();
    });

    it('renders game settings', () => {
      render(<TicTacToe />);
      
      expect(screen.getByText('Game Settings')).toBeInTheDocument();
      expect(screen.getByText('Game Mode')).toBeInTheDocument();
      expect(screen.getByText('Move History')).toBeInTheDocument();
    });

    it('renders statistics', () => {
      render(<TicTacToe />);
      
      expect(screen.getByText('Statistics')).toBeInTheDocument();
      expect(screen.getByText('Player X Wins:')).toBeInTheDocument();
      expect(screen.getByText('Player O Wins:')).toBeInTheDocument();
      expect(screen.getByText('Draws:')).toBeInTheDocument();
      expect(screen.getByText('Total Games:')).toBeInTheDocument();
    });

    it('renders how to play section', () => {
      render(<TicTacToe />);
      
      expect(screen.getByText('How to Play')).toBeInTheDocument();
      expect(screen.getByText('Bot Difficulties:')).toBeInTheDocument();
    });
  });

  describe('Game State Display', () => {
    it('displays current player turn', () => {
      mockUseTicTacToeStore.mockReturnValue({
        ...defaultMockState,
        currentPlayer: Player.X,
        gameState: GameState.PLAYING,
        message: "Player X's turn",
      });

      render(<TicTacToe />);
      
      expect(screen.getByText("Player X's turn")).toBeInTheDocument();
      expect(screen.getByText('Current Player:')).toBeInTheDocument();
      expect(screen.getByText('X')).toBeInTheDocument();
    });

    it('displays win message when X wins', () => {
      mockUseTicTacToeStore.mockReturnValue({
        ...defaultMockState,
        gameState: GameState.X_WON,
        message: 'Player X wins!',
        winningLine: [{ row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 2 }],
      });

      render(<TicTacToe />);
      
      expect(screen.getByText('Player X wins!')).toBeInTheDocument();
    });

    it('displays draw message', () => {
      mockUseTicTacToeStore.mockReturnValue({
        ...defaultMockState,
        gameState: GameState.DRAW,
        message: "It's a draw!",
      });

      render(<TicTacToe />);
      
      expect(screen.getByText("It's a draw!")).toBeInTheDocument();
    });
  });

  describe('Game Interactions', () => {
    it('calls makeMove when clicking on empty cell', () => {
      const mockMakeMove = jest.fn();
      mockUseTicTacToeStore.mockReturnValue({
        ...defaultMockState,
        makeMove: mockMakeMove,
        gameState: GameState.PLAYING,
      });

      render(<TicTacToe />);
      
      const cells = screen.getAllByRole('button').filter(button => 
        button.textContent === '' || button.textContent === 'X' || button.textContent === 'O'
      );
      
      fireEvent.click(cells[0]);
      
      expect(mockMakeMove).toHaveBeenCalledWith(0, 0);
    });

    it('does not call makeMove when game is not playing', () => {
      const mockMakeMove = jest.fn();
      mockUseTicTacToeStore.mockReturnValue({
        ...defaultMockState,
        makeMove: mockMakeMove,
        gameState: GameState.X_WON,
      });

      render(<TicTacToe />);
      
      const cells = screen.getAllByRole('button').filter(button => 
        button.textContent === '' || button.textContent === 'X' || button.textContent === 'O'
      );
      
      fireEvent.click(cells[0]);
      
      expect(mockMakeMove).not.toHaveBeenCalled();
    });

    it('calls resetGame when clicking New Game', () => {
      const mockResetGame = jest.fn();
      mockUseTicTacToeStore.mockReturnValue({
        ...defaultMockState,
        resetGame: mockResetGame,
      });

      render(<TicTacToe />);
      
      fireEvent.click(screen.getByText('New Game'));
      
      expect(mockResetGame).toHaveBeenCalled();
    });

    it('calls undoMove when clicking Undo', () => {
      const mockUndoMove = jest.fn();
      mockUseTicTacToeStore.mockReturnValue({
        ...defaultMockState,
        undoMove: mockUndoMove,
        historyIndex: 1, // Can undo
      });

      render(<TicTacToe />);
      
      fireEvent.click(screen.getByText('Undo'));
      
      expect(mockUndoMove).toHaveBeenCalled();
    });

    it('calls redoMove when clicking Redo', () => {
      const mockRedoMove = jest.fn();
      mockUseTicTacToeStore.mockReturnValue({
        ...defaultMockState,
        redoMove: mockRedoMove,
        history: [createEmptyBoard(), createEmptyBoard()],
        historyIndex: 0, // Can redo
      });

      render(<TicTacToe />);
      
      fireEvent.click(screen.getByText('Redo'));
      
      expect(mockRedoMove).toHaveBeenCalled();
    });

    it('calls loadGame when clicking Load Game', () => {
      const mockLoadGame = jest.fn();
      mockUseTicTacToeStore.mockReturnValue({
        ...defaultMockState,
        loadGame: mockLoadGame,
        hasSavedGame: jest.fn(() => true),
      });

      render(<TicTacToe />);
      
      fireEvent.click(screen.getByText('Load Game'));
      
      expect(mockLoadGame).toHaveBeenCalled();
    });

    it('calls resetStats when clicking Reset Statistics', () => {
      const mockResetStats = jest.fn();
      mockUseTicTacToeStore.mockReturnValue({
        ...defaultMockState,
        resetStats: mockResetStats,
      });

      render(<TicTacToe />);
      
      fireEvent.click(screen.getByText('Reset Statistics'));
      
      expect(mockResetStats).toHaveBeenCalled();
    });
  });

  describe('Game Settings', () => {
    it('calls setGameMode when changing game mode', () => {
      const mockSetGameMode = jest.fn();
      mockUseTicTacToeStore.mockReturnValue({
        ...defaultMockState,
        setGameMode: mockSetGameMode,
      });

      render(<TicTacToe />);
      
      const gameModeSelect = screen.getByDisplayValue('Human vs Human');
      fireEvent.change(gameModeSelect, { target: { value: GameMode.HUMAN_VS_BOT } });
      
      expect(mockSetGameMode).toHaveBeenCalledWith(GameMode.HUMAN_VS_BOT);
    });

    it('calls setBotDifficulty when changing bot difficulty', () => {
      const mockSetBotDifficulty = jest.fn();
      mockUseTicTacToeStore.mockReturnValue({
        ...defaultMockState,
        setBotDifficulty: mockSetBotDifficulty,
        gameMode: GameMode.HUMAN_VS_BOT,
      });

      render(<TicTacToe />);
      
      const difficultySelect = screen.getByDisplayValue('Medium');
      fireEvent.change(difficultySelect, { target: { value: BotDifficulty.HARD } });
      
      expect(mockSetBotDifficulty).toHaveBeenCalledWith(BotDifficulty.HARD);
    });

    it('shows bot difficulty selector for bot game modes', () => {
      mockUseTicTacToeStore.mockReturnValue({
        ...defaultMockState,
        gameMode: GameMode.HUMAN_VS_BOT,
      });

      render(<TicTacToe />);
      
      expect(screen.getByText('Bot Difficulty')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Medium')).toBeInTheDocument();
    });

    it('hides bot difficulty selector for human vs human mode', () => {
      mockUseTicTacToeStore.mockReturnValue({
        ...defaultMockState,
        gameMode: GameMode.HUMAN_VS_HUMAN,
      });

      render(<TicTacToe />);
      
      expect(screen.queryByText('Bot Difficulty')).not.toBeInTheDocument();
    });
  });

  describe('Statistics Display', () => {
    it('displays correct statistics', () => {
      const stats = { xWins: 10, oWins: 5, draws: 3, totalGames: 18 };
      mockUseTicTacToeStore.mockReturnValue({
        ...defaultMockState,
        stats,
      });

      render(<TicTacToe />);
      
      expect(screen.getByText('10')).toBeInTheDocument(); // X wins
      expect(screen.getByText('5')).toBeInTheDocument(); // O wins
      expect(screen.getByText('3')).toBeInTheDocument(); // Draws
      expect(screen.getByText('18')).toBeInTheDocument(); // Total games
    });

    it('displays win rates when games have been played', () => {
      const stats = { xWins: 6, oWins: 3, draws: 1, totalGames: 10 };
      mockUseTicTacToeStore.mockReturnValue({
        ...defaultMockState,
        stats,
      });

      render(<TicTacToe />);
      
      expect(screen.getByText('60.0%')).toBeInTheDocument(); // X win rate
      expect(screen.getByText('30.0%')).toBeInTheDocument(); // O win rate
    });
  });

  describe('Board State Display', () => {
    it('displays X and O pieces on board', () => {
      const board = [
        [Player.X, Player.O, null],
        [null, Player.X, Player.O],
        [Player.O, null, Player.X],
      ];
      
      mockUseTicTacToeStore.mockReturnValue({
        ...defaultMockState,
        board,
      });

      render(<TicTacToe />);
      
      expect(screen.getByText('X')).toBeInTheDocument();
      expect(screen.getByText('O')).toBeInTheDocument();
    });

    it('highlights winning line', () => {
      const board = [
        [Player.X, Player.X, Player.X],
        [Player.O, Player.O, null],
        [null, null, null],
      ];
      
      mockUseTicTacToeStore.mockReturnValue({
        ...defaultMockState,
        board,
        gameState: GameState.X_WON,
        winningLine: [{ row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 2 }],
      });

      render(<TicTacToe />);
      
      // The winning cells should have special styling applied
      const cells = screen.getAllByRole('button').filter(button => 
        button.textContent === 'X' || button.textContent === 'O'
      );
      
      // Check that winning cells are present
      expect(cells.length).toBeGreaterThan(0);
    });
  });

  describe('Accessibility', () => {
    it('has proper button roles for game controls', () => {
      render(<TicTacToe />);
      
      expect(screen.getByRole('button', { name: 'New Game' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Undo' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Redo' })).toBeInTheDocument();
    });

    it('has proper labels for form controls', () => {
      render(<TicTacToe />);
      
      expect(screen.getByLabelText('Game Mode')).toBeInTheDocument();
    });

    it('disables undo/redo buttons when appropriate', () => {
      mockUseTicTacToeStore.mockReturnValue({
        ...defaultMockState,
        historyIndex: 0, // Cannot undo
        history: [createEmptyBoard()], // Cannot redo
      });

      render(<TicTacToe />);
      
      const undoButton = screen.getByText('Undo');
      const redoButton = screen.getByText('Redo');
      
      expect(undoButton).toBeDisabled();
      expect(redoButton).toBeDisabled();
    });
  });

  describe('Responsive Design', () => {
    it('renders in a responsive layout', () => {
      render(<TicTacToe />);
      
      // Check that the main container has responsive classes
      const mainContainer = screen.getByText('Tic-Tac-Toe').closest('div');
      expect(mainContainer).toHaveClass('max-w-4xl', 'mx-auto');
    });

    it('has proper grid layout for different screen sizes', () => {
      render(<TicTacToe />);
      
      // Check that the grid container has responsive classes
      const gridContainer = screen.getByText('Game Settings').closest('div')?.parentElement;
      expect(gridContainer).toHaveClass('grid', 'grid-cols-1', 'lg:grid-cols-3');
    });
  });
});

// Test utility functions
describe('TicTacToe Utility Functions', () => {
  describe('createEmptyBoard', () => {
    it('creates a 3x3 board with null values', () => {
      const board = createEmptyBoard();
      
      expect(board).toHaveLength(3);
      expect(board[0]).toHaveLength(3);
      expect(board[1]).toHaveLength(3);
      expect(board[2]).toHaveLength(3);
      
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
          expect(board[row][col]).toBeNull();
        }
      }
    });
  });

  describe('cloneBoard', () => {
    it('creates a deep copy of the board', () => {
      const originalBoard = [
        [Player.X, Player.O, null],
        [null, Player.X, Player.O],
        [Player.O, null, Player.X],
      ];
      
      const clonedBoard = cloneBoard(originalBoard);
      
      expect(clonedBoard).toEqual(originalBoard);
      expect(clonedBoard).not.toBe(originalBoard);
      
      // Modify cloned board should not affect original
      clonedBoard[0][0] = Player.O;
      expect(originalBoard[0][0]).toBe(Player.X);
    });
  });

  describe('checkWinner', () => {
    it('detects horizontal win', () => {
      const board = [
        [Player.X, Player.X, Player.X],
        [Player.O, Player.O, null],
        [null, null, null],
      ];
      
      const result = checkWinner(board);
      
      expect(result.winner).toBe(Player.X);
      expect(result.winningLine).toEqual([
        { row: 0, col: 0 },
        { row: 0, col: 1 },
        { row: 0, col: 2 },
      ]);
    });

    it('detects vertical win', () => {
      const board = [
        [Player.O, Player.X, null],
        [Player.O, Player.X, null],
        [Player.O, null, null],
      ];
      
      const result = checkWinner(board);
      
      expect(result.winner).toBe(Player.O);
      expect(result.winningLine).toEqual([
        { row: 0, col: 0 },
        { row: 1, col: 0 },
        { row: 2, col: 0 },
      ]);
    });

    it('detects diagonal win', () => {
      const board = [
        [Player.X, Player.O, null],
        [Player.O, Player.X, null],
        [null, null, Player.X],
      ];
      
      const result = checkWinner(board);
      
      expect(result.winner).toBe(Player.X);
      expect(result.winningLine).toEqual([
        { row: 0, col: 0 },
        { row: 1, col: 1 },
        { row: 2, col: 2 },
      ]);
    });

    it('returns null when no winner', () => {
      const board = [
        [Player.X, Player.O, Player.X],
        [Player.O, Player.X, Player.O],
        [Player.O, Player.X, Player.O],
      ];
      
      const result = checkWinner(board);
      
      expect(result.winner).toBeNull();
      expect(result.winningLine).toBeNull();
    });
  });

  describe('isBoardFull', () => {
    it('returns true for full board', () => {
      const board = [
        [Player.X, Player.O, Player.X],
        [Player.O, Player.X, Player.O],
        [Player.O, Player.X, Player.O],
      ];
      
      expect(isBoardFull(board)).toBe(true);
    });

    it('returns false for partially filled board', () => {
      const board = [
        [Player.X, Player.O, Player.X],
        [Player.O, null, Player.O],
        [Player.O, Player.X, Player.O],
      ];
      
      expect(isBoardFull(board)).toBe(false);
    });
  });

  describe('getAvailableMoves', () => {
    it('returns all empty positions', () => {
      const board = [
        [Player.X, null, Player.O],
        [null, Player.X, null],
        [Player.O, null, null],
      ];
      
      const moves = getAvailableMoves(board);
      
      expect(moves).toEqual([
        { row: 0, col: 1 },
        { row: 1, col: 0 },
        { row: 1, col: 2 },
        { row: 2, col: 1 },
        { row: 2, col: 2 },
      ]);
    });

    it('returns empty array for full board', () => {
      const board = [
        [Player.X, Player.O, Player.X],
        [Player.O, Player.X, Player.O],
        [Player.O, Player.X, Player.O],
      ];
      
      const moves = getAvailableMoves(board);
      
      expect(moves).toEqual([]);
    });
  });

  describe('isValidMove', () => {
    it('returns true for valid move', () => {
      const board = createEmptyBoard();
      
      expect(isValidMove(board, 0, 0)).toBe(true);
      expect(isValidMove(board, 1, 2)).toBe(true);
    });

    it('returns false for occupied position', () => {
      const board = [
        [Player.X, null, null],
        [null, null, null],
        [null, null, null],
      ];
      
      expect(isValidMove(board, 0, 0)).toBe(false);
    });

    it('returns false for out of bounds position', () => {
      const board = createEmptyBoard();
      
      expect(isValidMove(board, -1, 0)).toBe(false);
      expect(isValidMove(board, 3, 0)).toBe(false);
      expect(isValidMove(board, 0, -1)).toBe(false);
      expect(isValidMove(board, 0, 3)).toBe(false);
    });
  });

  describe('AI Functions', () => {
    describe('makeRandomMove', () => {
      it('returns a valid move from available moves', () => {
        const board = [
          [Player.X, null, Player.O],
          [null, Player.X, null],
          [Player.O, null, null],
        ];
        
        const move = makeRandomMove(board);
        
        expect(move.row).toBeGreaterThanOrEqual(0);
        expect(move.row).toBeLessThan(3);
        expect(move.col).toBeGreaterThanOrEqual(0);
        expect(move.col).toBeLessThan(3);
        expect(board[move.row][move.col]).toBeNull();
      });
    });

    describe('evaluateBoard', () => {
      it('returns 10 for player win', () => {
        const board = [
          [Player.X, Player.X, Player.X],
          [Player.O, Player.O, null],
          [null, null, null],
        ];
        
        expect(evaluateBoard(board, Player.X)).toBe(10);
      });

      it('returns -10 for opponent win', () => {
        const board = [
          [Player.O, Player.O, Player.O],
          [Player.X, Player.X, null],
          [null, null, null],
        ];
        
        expect(evaluateBoard(board, Player.X)).toBe(-10);
      });

      it('returns 0 for no winner', () => {
        const board = [
          [Player.X, Player.O, Player.X],
          [Player.O, Player.X, Player.O],
          [Player.O, Player.X, Player.O],
        ];
        
        expect(evaluateBoard(board, Player.X)).toBe(0);
      });
    });

    describe('findBestMove', () => {
      it('finds winning move when available', () => {
        const board = [
          [Player.X, Player.X, null],
          [Player.O, Player.O, null],
          [null, null, null],
        ];
        
        const move = findBestMove(board, Player.X);
        
        expect(move).toEqual({ row: 0, col: 2 });
      });

      it('blocks opponent winning move', () => {
        const board = [
          [Player.O, Player.O, null],
          [Player.X, null, null],
          [null, null, null],
        ];
        
        const move = findBestMove(board, Player.X);
        
        expect(move).toEqual({ row: 0, col: 2 });
      });
    });

    describe('makeBotMove', () => {
      it('makes random move for easy difficulty', () => {
        const board = createEmptyBoard();
        
        const move = makeBotMove(board, Player.X, BotDifficulty.EASY);
        
        expect(move.row).toBeGreaterThanOrEqual(0);
        expect(move.row).toBeLessThan(3);
        expect(move.col).toBeGreaterThanOrEqual(0);
        expect(move.col).toBeLessThan(3);
      });

      it('makes best move for hard difficulty', () => {
        const board = [
          [Player.X, Player.X, null],
          [Player.O, Player.O, null],
          [null, null, null],
        ];
        
        const move = makeBotMove(board, Player.X, BotDifficulty.HARD);
        
        expect(move).toEqual({ row: 0, col: 2 });
      });
    });
  });

  describe('getGameMessage', () => {
    it('returns correct message for playing state', () => {
      expect(getGameMessage(GameState.PLAYING, Player.X)).toBe("Player X's turn");
      expect(getGameMessage(GameState.PLAYING, Player.O)).toBe("Player O's turn");
    });

    it('returns correct message for win states', () => {
      expect(getGameMessage(GameState.X_WON, Player.X)).toBe('Player X wins!');
      expect(getGameMessage(GameState.O_WON, Player.O)).toBe('Player O wins!');
    });

    it('returns correct message for draw state', () => {
      expect(getGameMessage(GameState.DRAW, Player.X)).toBe("It's a draw!");
    });
  });
}); 