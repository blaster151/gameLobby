import { create } from 'zustand';

export enum Player {
  X = 'X',
  O = 'O',
}

export enum GameState {
  PLAYING = 'playing',
  X_WON = 'x_won',
  O_WON = 'o_won',
  DRAW = 'draw',
}

export enum BotDifficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
}

export enum GameMode {
  HUMAN_VS_HUMAN = 'human_vs_human',
  HUMAN_VS_BOT = 'human_vs_bot',
  BOT_VS_BOT = 'bot_vs_bot',
}

export type Board = (Player | null)[][];

export interface GameStats {
  xWins: number;
  oWins: number;
  draws: number;
  totalGames: number;
}

export interface TicTacToeState {
  board: Board;
  currentPlayer: Player;
  gameState: GameState;
  gameMode: GameMode;
  botDifficulty: BotDifficulty;
  stats: GameStats;
  history: Board[];
  historyIndex: number;
  message: string;
  lastMove: { row: number; col: number } | null;
  winningLine: { row: number; col: number }[] | null;
  
  // Actions
  makeMove: (row: number, col: number) => void;
  resetGame: () => void;
  setGameMode: (mode: GameMode) => void;
  setBotDifficulty: (difficulty: BotDifficulty) => void;
  undoMove: () => void;
  redoMove: () => void;
  updateStats: (result: 'x_won' | 'o_won' | 'draw') => void;
  resetStats: () => void;
  saveGame: () => void;
  loadGame: () => void;
  hasSavedGame: () => boolean;
}

// Utility functions
function createEmptyBoard(): Board {
  return Array(3).fill(null).map(() => Array(3).fill(null));
}

function cloneBoard(board: Board): Board {
  return board.map(row => [...row]);
}

function checkWinner(board: Board): { winner: Player | null; winningLine: { row: number; col: number }[] | null } {
  // Check rows
  for (let row = 0; row < 3; row++) {
    if (board[row][0] && board[row][0] === board[row][1] && board[row][0] === board[row][2]) {
      return {
        winner: board[row][0],
        winningLine: [{ row, col: 0 }, { row, col: 1 }, { row, col: 2 }]
      };
    }
  }
  
  // Check columns
  for (let col = 0; col < 3; col++) {
    if (board[0][col] && board[0][col] === board[1][col] && board[0][col] === board[2][col]) {
      return {
        winner: board[0][col],
        winningLine: [{ row: 0, col }, { row: 1, col }, { row: 2, col }]
      };
    }
  }
  
  // Check diagonals
  if (board[0][0] && board[0][0] === board[1][1] && board[0][0] === board[2][2]) {
    return {
      winner: board[0][0],
      winningLine: [{ row: 0, col: 0 }, { row: 1, col: 1 }, { row: 2, col: 2 }]
    };
  }
  
  if (board[0][2] && board[0][2] === board[1][1] && board[0][2] === board[2][0]) {
    return {
      winner: board[0][2],
      winningLine: [{ row: 0, col: 2 }, { row: 1, col: 1 }, { row: 2, col: 0 }]
    };
  }
  
  return { winner: null, winningLine: null };
}

function isBoardFull(board: Board): boolean {
  return board.every(row => row.every(cell => cell !== null));
}

function getAvailableMoves(board: Board): { row: number; col: number }[] {
  const moves: { row: number; col: number }[] = [];
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      if (board[row][col] === null) {
        moves.push({ row, col });
      }
    }
  }
  return moves;
}

function isValidMove(board: Board, row: number, col: number): boolean {
  return row >= 0 && row < 3 && col >= 0 && col < 3 && board[row][col] === null;
}

// AI functions
function makeRandomMove(board: Board): { row: number; col: number } {
  const availableMoves = getAvailableMoves(board);
  return availableMoves[Math.floor(Math.random() * availableMoves.length)];
}

function evaluateBoard(board: Board, player: Player): number {
  const { winner } = checkWinner(board);
  
  if (winner === player) return 10;
  if (winner === (player === Player.X ? Player.O : Player.X)) return -10;
  return 0;
}

function minimax(board: Board, depth: number, isMaximizing: boolean, player: Player): number {
  const { winner } = checkWinner(board);
  
  if (winner === player) return 10 - depth;
  if (winner === (player === Player.X ? Player.O : Player.X)) return depth - 10;
  if (isBoardFull(board)) return 0;
  
  if (isMaximizing) {
    let bestScore = -Infinity;
    const availableMoves = getAvailableMoves(board);
    
    for (const move of availableMoves) {
      const newBoard = cloneBoard(board);
      newBoard[move.row][move.col] = player;
      const score = minimax(newBoard, depth + 1, false, player);
      bestScore = Math.max(bestScore, score);
    }
    
    return bestScore;
  } else {
    let bestScore = Infinity;
    const availableMoves = getAvailableMoves(board);
    
    for (const move of availableMoves) {
      const newBoard = cloneBoard(board);
      newBoard[move.row][move.col] = player === Player.X ? Player.O : Player.X;
      const score = minimax(newBoard, depth + 1, true, player);
      bestScore = Math.min(bestScore, score);
    }
    
    return bestScore;
  }
}

function findBestMove(board: Board, player: Player): { row: number; col: number } {
  let bestScore = -Infinity;
  let bestMove = { row: -1, col: -1 };
  const availableMoves = getAvailableMoves(board);
  
  for (const move of availableMoves) {
    const newBoard = cloneBoard(board);
    newBoard[move.row][move.col] = player;
    const score = minimax(newBoard, 0, false, player);
    
    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }
  
  return bestMove;
}

function makeBotMove(board: Board, player: Player, difficulty: BotDifficulty): { row: number; col: number } {
  switch (difficulty) {
    case BotDifficulty.EASY:
      return makeRandomMove(board);
      
    case BotDifficulty.MEDIUM:
      // 50% chance of random move, 50% chance of smart move
      if (Math.random() < 0.5) {
        return makeRandomMove(board);
      }
      // Fall through to hard difficulty
      
    case BotDifficulty.HARD:
      return findBestMove(board, player);
      
    default:
      return makeRandomMove(board);
  }
}

function getGameMessage(gameState: GameState, currentPlayer: Player): string {
  switch (gameState) {
    case GameState.PLAYING:
      return `Player ${currentPlayer}'s turn`;
    case GameState.X_WON:
      return 'Player X wins!';
    case GameState.O_WON:
      return 'Player O wins!';
    case GameState.DRAW:
      return "It's a draw!";
    default:
      return '';
  }
}

function loadStats(): GameStats {
  if (typeof window === 'undefined') {
    return { xWins: 0, oWins: 0, draws: 0, totalGames: 0 };
  }
  
  try {
    const saved = localStorage.getItem('tictactoe-stats');
    return saved ? JSON.parse(saved) : { xWins: 0, oWins: 0, draws: 0, totalGames: 0 };
  } catch {
    return { xWins: 0, oWins: 0, draws: 0, totalGames: 0 };
  }
}

function saveStats(stats: GameStats) {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem('tictactoe-stats', JSON.stringify(stats));
  } catch (error) {
    console.error('Failed to save stats:', error);
  }
}

function saveGameState(state: any) {
  if (typeof window === 'undefined') return;
  
  try {
    const gameState = {
      board: state.board,
      currentPlayer: state.currentPlayer,
      gameState: state.gameState,
      gameMode: state.gameMode,
      botDifficulty: state.botDifficulty,
      timestamp: Date.now(),
    };
    localStorage.setItem('tictactoe-saved-game', JSON.stringify(gameState));
  } catch (error) {
    console.error('Failed to save game:', error);
  }
}

function loadGameState(): any {
  if (typeof window === 'undefined') return null;
  
  try {
    const saved = localStorage.getItem('tictactoe-saved-game');
    if (!saved) return null;
    
    const gameState = JSON.parse(saved);
    const oneDay = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    
    // Check if saved game is older than 24 hours
    if (Date.now() - gameState.timestamp > oneDay) {
      localStorage.removeItem('tictactoe-saved-game');
      return null;
    }
    
    return gameState;
  } catch {
    return null;
  }
}

function hasSavedGame(): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    const saved = localStorage.getItem('tictactoe-saved-game');
    if (!saved) return false;
    
    const gameState = JSON.parse(saved);
    const oneDay = 24 * 60 * 60 * 1000;
    
    return Date.now() - gameState.timestamp <= oneDay;
  } catch {
    return false;
  }
}

// Main store
export const useTicTacToeStore = create<TicTacToeState>((set, get) => ({
  board: createEmptyBoard(),
  currentPlayer: Player.X,
  gameState: GameState.PLAYING,
  gameMode: GameMode.HUMAN_VS_HUMAN,
  botDifficulty: BotDifficulty.MEDIUM,
  stats: loadStats(),
  history: [createEmptyBoard()],
  historyIndex: 0,
  message: "Player X's turn",
  lastMove: null,
  winningLine: null,
  
  makeMove: (row: number, col: number) => {
    const { board, currentPlayer, gameState, gameMode, botDifficulty } = get();
    
    if (gameState !== GameState.PLAYING || !isValidMove(board, row, col)) {
      return;
    }
    
    // Make the move
    const newBoard = cloneBoard(board);
    newBoard[row][col] = currentPlayer;
    
    // Check for winner
    const { winner, winningLine } = checkWinner(newBoard);
    let newGameState = GameState.PLAYING;
    
    if (winner) {
      newGameState = winner === Player.X ? GameState.X_WON : GameState.O_WON;
    } else if (isBoardFull(newBoard)) {
      newGameState = GameState.DRAW;
    }
    
    // Update history
    const { history, historyIndex } = get();
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newBoard);
    
    set({
      board: newBoard,
      currentPlayer: currentPlayer === Player.X ? Player.O : Player.X,
      gameState: newGameState,
      history: newHistory,
      historyIndex: newHistory.length - 1,
      message: getGameMessage(newGameState, currentPlayer === Player.X ? Player.O : Player.X),
      lastMove: { row, col },
      winningLine,
    });
    
    // Handle bot moves
    if (newGameState === GameState.PLAYING) {
      const nextPlayer = currentPlayer === Player.X ? Player.O : Player.X;
      const shouldBotMove = 
        (gameMode === GameMode.HUMAN_VS_BOT && nextPlayer === Player.O) ||
        (gameMode === GameMode.BOT_VS_BOT);
      
      if (shouldBotMove) {
        setTimeout(() => {
          const botMove = makeBotMove(newBoard, nextPlayer, botDifficulty);
          get().makeMove(botMove.row, botMove.col);
        }, 500); // Small delay for better UX
      }
    }
    
    // Update stats if game ended
    if (newGameState !== GameState.PLAYING) {
      const result = newGameState === GameState.X_WON ? 'x_won' : 
                    newGameState === GameState.O_WON ? 'o_won' : 'draw';
      get().updateStats(result);
    }
  },
  
  resetGame: () => {
    const { gameMode, botDifficulty } = get();
    const newBoard = createEmptyBoard();
    
    set({
      board: newBoard,
      currentPlayer: Player.X,
      gameState: GameState.PLAYING,
      history: [newBoard],
      historyIndex: 0,
      message: "Player X's turn",
      lastMove: null,
      winningLine: null,
    });
    
    // Start bot vs bot game if needed
    if (gameMode === GameMode.BOT_VS_BOT) {
      setTimeout(() => {
        const botMove = makeBotMove(newBoard, Player.X, botDifficulty);
        get().makeMove(botMove.row, botMove.col);
      }, 500);
    }
  },
  
  setGameMode: (mode: GameMode) => {
    set({ gameMode: mode });
    get().resetGame();
  },
  
  setBotDifficulty: (difficulty: BotDifficulty) => {
    set({ botDifficulty: difficulty });
  },
  
  undoMove: () => {
    const { history, historyIndex } = get();
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const newBoard = history[newIndex];
      const { winner, winningLine } = checkWinner(newBoard);
      const newGameState = winner ? 
        (winner === Player.X ? GameState.X_WON : GameState.O_WON) :
        isBoardFull(newBoard) ? GameState.DRAW : GameState.PLAYING;
      
      set({
        board: newBoard,
        currentPlayer: newIndex % 2 === 0 ? Player.X : Player.O,
        gameState: newGameState,
        historyIndex: newIndex,
        message: getGameMessage(newGameState, newIndex % 2 === 0 ? Player.X : Player.O),
        lastMove: null,
        winningLine,
      });
    }
  },
  
  redoMove: () => {
    const { history, historyIndex } = get();
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      const newBoard = history[newIndex];
      const { winner, winningLine } = checkWinner(newBoard);
      const newGameState = winner ? 
        (winner === Player.X ? GameState.X_WON : GameState.O_WON) :
        isBoardFull(newBoard) ? GameState.DRAW : GameState.PLAYING;
      
      set({
        board: newBoard,
        currentPlayer: newIndex % 2 === 0 ? Player.X : Player.O,
        gameState: newGameState,
        historyIndex: newIndex,
        message: getGameMessage(newGameState, newIndex % 2 === 0 ? Player.X : Player.O),
        lastMove: null,
        winningLine,
      });
    }
  },
  
  updateStats: (result: 'x_won' | 'o_won' | 'draw') => {
    const { stats } = get();
    const newStats = { ...stats };
    
    switch (result) {
      case 'x_won':
        newStats.xWins++;
        break;
      case 'o_won':
        newStats.oWins++;
        break;
      case 'draw':
        newStats.draws++;
        break;
    }
    
    newStats.totalGames++;
    saveStats(newStats);
    set({ stats: newStats });
  },
  
  resetStats: () => {
    const newStats = { xWins: 0, oWins: 0, draws: 0, totalGames: 0 };
    saveStats(newStats);
    set({ stats: newStats });
  },
  
  saveGame: () => {
    const { board, currentPlayer, gameState, gameMode, botDifficulty } = get();
    saveGameState({ board, currentPlayer, gameState, gameMode, botDifficulty });
  },
  
  loadGame: () => {
    const savedGame = loadGameState();
    if (savedGame) {
      set({
        board: savedGame.board,
        currentPlayer: savedGame.currentPlayer,
        gameState: savedGame.gameState,
        gameMode: savedGame.gameMode,
        botDifficulty: savedGame.botDifficulty,
        history: [savedGame.board],
        historyIndex: 0,
        message: getGameMessage(savedGame.gameState, savedGame.currentPlayer),
        lastMove: null,
        winningLine: null,
      });
    }
  },
  
  hasSavedGame: () => hasSavedGame(),
}));

// Export utility functions for testing
export {
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
  loadStats,
  saveStats,
  saveGameState,
  loadGameState,
  hasSavedGame,
}; 