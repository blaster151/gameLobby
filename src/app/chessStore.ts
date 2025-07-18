import { create } from 'zustand';

export enum ChessPiece {
  EMPTY = 0,
  WHITE_PAWN = 1,
  WHITE_ROOK = 2,
  WHITE_KNIGHT = 3,
  WHITE_BISHOP = 4,
  WHITE_QUEEN = 5,
  WHITE_KING = 6,
  BLACK_PAWN = 7,
  BLACK_ROOK = 8,
  BLACK_KNIGHT = 9,
  BLACK_BISHOP = 10,
  BLACK_QUEEN = 11,
  BLACK_KING = 12,
}

export enum PlayerColor {
  WHITE = 'white',
  BLACK = 'black',
}

export enum BotDifficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
}

export enum GameMode {
  HUMAN_VS_BOT = 'human_vs_bot',
  HUMAN_VS_HUMAN = 'human_vs_human',
}

export type Cell = ChessPiece;
export type Board = Cell[][];
export type Pos = [number, number] | null;

const BOARD_SIZE = 8;

function initialBoard(): Board {
  const board: Board = Array.from({ length: BOARD_SIZE }, () => Array<Cell>(BOARD_SIZE).fill(ChessPiece.EMPTY));
  
  // Set up black pieces (top)
  board[0] = [
    ChessPiece.BLACK_ROOK, ChessPiece.BLACK_KNIGHT, ChessPiece.BLACK_BISHOP, ChessPiece.BLACK_QUEEN,
    ChessPiece.BLACK_KING, ChessPiece.BLACK_BISHOP, ChessPiece.BLACK_KNIGHT, ChessPiece.BLACK_ROOK
  ];
  board[1] = Array(8).fill(ChessPiece.BLACK_PAWN);
  
  // Set up white pieces (bottom)
  board[6] = Array(8).fill(ChessPiece.WHITE_PAWN);
  board[7] = [
    ChessPiece.WHITE_ROOK, ChessPiece.WHITE_KNIGHT, ChessPiece.WHITE_BISHOP, ChessPiece.WHITE_QUEEN,
    ChessPiece.WHITE_KING, ChessPiece.WHITE_BISHOP, ChessPiece.WHITE_KNIGHT, ChessPiece.WHITE_ROOK
  ];
  
  return board;
}

function clone(board: Board): Board {
  return board.map(row => [...row]);
}

interface GameStats {
  wins: number;
  losses: number;
  totalGames: number;
  currentWinStreak: number;
  bestWinStreak: number;
  averageMovesPerGame: number;
  totalMoves: number;
  fastestWin: number; // in moves
  longestGame: number; // in moves
  lastGameDate: string | null;
  achievements: string[]; // List of unlocked achievement IDs
}

function loadStats(): GameStats {
  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem('chessStats');
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        // Handle migration from old stats format
        if (!parsed.currentWinStreak) {
          return {
            ...parsed,
            currentWinStreak: 0,
            bestWinStreak: 0,
            averageMovesPerGame: 0,
            totalMoves: 0,
            fastestWin: 0,
            longestGame: 0,
            lastGameDate: null,
            achievements: [], // Ensure achievements is an array
          };
        }
        return parsed;
      } catch {}
    }
  }
  return { 
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
    achievements: [], // Ensure achievements is an array
  };
}

function saveStats(stats: GameStats) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('chessStats', JSON.stringify(stats));
  }
}

function saveGameState(state: any) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('chessGameState', JSON.stringify({
      board: state.board,
      turn: state.turn,
      gameState: state.gameState,
      history: state.history,
      historyIndex: state.historyIndex,
      botDifficulty: state.botDifficulty,
      gameMode: state.gameMode,
    }));
  }
}

function loadGameState(): any {
  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem('chessGameState');
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {}
    }
  }
  return null;
}

interface ChessState {
  board: Board;
  selected: Pos;
  turn: PlayerColor;
  message: string;
  gameState: string;
  history: Board[];
  historyIndex: number;
  stats: GameStats;
  botDifficulty: BotDifficulty;
  gameMode: GameMode;
  lastMove: [number, number, number, number] | null;
  pendingPromotion: [number, number] | null;
  setBoard: (b: Board) => void;
  setSelected: (p: Pos) => void;
  setTurn: (t: PlayerColor) => void;
  setMessage: (m: string) => void;
  setGameState: (s: string) => void;
  setLastMove: (move: [number, number, number, number] | null) => void;
  setPendingPromotion: (pos: [number, number] | null) => void;
  resetGame: () => void;
  pushHistory: (b: Board) => void;
  stepHistory: (dir: 1 | -1) => void;
  updateStats: (result: 'win' | 'loss', moveCount?: number) => void;
  resetStats: () => void;
  setBotDifficulty: (difficulty: BotDifficulty) => void;
  setGameMode: (mode: GameMode) => void;
  saveGame: () => void;
  loadGame: () => void;
  hasSavedGame: () => boolean;
}

export const useChessStore = create<ChessState>((set, get) => {
  const savedState = loadGameState();
  const initialState = savedState || {
    board: initialBoard(),
    turn: PlayerColor.WHITE,
    gameState: 'playing',
    history: [initialBoard()],
    historyIndex: 0,
    botDifficulty: BotDifficulty.MEDIUM,
    gameMode: GameMode.HUMAN_VS_BOT,
  };

  return {
    board: initialState.board,
    selected: null,
    turn: initialState.turn,
    message: initialState.gameState === 'playing' ? 'White to move' : 'Game Over',
    gameState: initialState.gameState,
    history: initialState.history,
    historyIndex: initialState.historyIndex,
    stats: typeof window !== 'undefined' ? loadStats() : { 
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
      achievements: [], // Ensure achievements is an array
    },
    botDifficulty: initialState.botDifficulty,
    gameMode: initialState.gameMode,
    lastMove: null,
    pendingPromotion: null,
    setBoard: (b) => set({ board: b }),
    setSelected: (p) => set({ selected: p }),
    setTurn: (t) => set({ turn: t }),
    setMessage: (m) => set({ message: m }),
    setGameState: (s) => set({ gameState: s }),
    setLastMove: (move) => set({ lastMove: move }),
    setPendingPromotion: (pos) => set({ pendingPromotion: pos }),
    resetGame: () => set(state => {
      const newState = {
        board: initialBoard(),
        selected: null,
        turn: PlayerColor.WHITE,
        message: 'White to move',
        gameState: 'playing',
        history: [initialBoard()],
        historyIndex: 0,
        stats: state.stats,
        botDifficulty: state.botDifficulty,
        gameMode: state.gameMode,
      };
      saveStats(state.stats);
      return newState;
    }),
    pushHistory: (b) => {
      const { history, historyIndex } = get();
      const newHistory = history.slice(0, historyIndex + 1).concat([clone(b)]);
      set({ history: newHistory, historyIndex: newHistory.length - 1 });
    },
    stepHistory: (dir) => {
      const { history, historyIndex, setBoard } = get();
      const newIndex = Math.max(0, Math.min(history.length - 1, historyIndex + dir));
      set({ historyIndex: newIndex });
      setBoard(clone(history[newIndex]));
    },
    updateStats: (result, moveCount = 0) => {
      const { stats } = get();
      const isWin = result === 'win';
      const newWinStreak = isWin ? stats.currentWinStreak + 1 : 0;
      const newBestStreak = Math.max(stats.bestWinStreak, newWinStreak);
      const newTotalMoves = stats.totalMoves + moveCount;
      const newTotalGames = stats.totalGames + 1;
      const newWins = isWin ? stats.wins + 1 : stats.wins;
      
      // Check for achievements
      const newAchievements = [...stats.achievements];
      
      // First Win achievement
      if (newWins === 1 && !newAchievements.includes('first_win')) {
        newAchievements.push('first_win');
      }
      
      // Win Streak achievements
      if (newWinStreak === 3 && !newAchievements.includes('win_streak_3')) {
        newAchievements.push('win_streak_3');
      }
      if (newWinStreak === 5 && !newAchievements.includes('win_streak_5')) {
        newAchievements.push('win_streak_5');
      }
      if (newWinStreak === 10 && !newAchievements.includes('win_streak_10')) {
        newAchievements.push('win_streak_10');
      }
      
      // Total Games achievements
      if (newTotalGames === 10 && !newAchievements.includes('games_10')) {
        newAchievements.push('games_10');
      }
      if (newTotalGames === 50 && !newAchievements.includes('games_50')) {
        newAchievements.push('games_50');
      }
      if (newTotalGames === 100 && !newAchievements.includes('games_100')) {
        newAchievements.push('games_100');
      }
      
      // Fast Win achievement
      if (isWin && moveCount <= 10 && !newAchievements.includes('fast_win')) {
        newAchievements.push('fast_win');
      }
      
      // Marathon achievement
      if (moveCount >= 50 && !newAchievements.includes('marathon')) {
        newAchievements.push('marathon');
      }
      
      const newStats = {
        ...stats,
        totalGames: newTotalGames,
        wins: newWins,
        losses: result === 'loss' ? stats.losses + 1 : stats.losses,
        currentWinStreak: newWinStreak,
        bestWinStreak: newBestStreak,
        totalMoves: newTotalMoves,
        averageMovesPerGame: newTotalGames > 0 ? Math.round(newTotalMoves / newTotalGames) : 0,
        fastestWin: isWin && (stats.fastestWin === 0 || moveCount < stats.fastestWin) ? moveCount : stats.fastestWin,
        longestGame: moveCount > stats.longestGame ? moveCount : stats.longestGame,
        lastGameDate: new Date().toISOString(),
        achievements: newAchievements,
      };
      set({ stats: newStats });
      saveStats(newStats);
    },
    resetStats: () => {
      const zeroStats = { 
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
        achievements: [], // Ensure achievements is an array
      };
      set({ stats: zeroStats });
      saveStats(zeroStats);
    },
    setBotDifficulty: (difficulty) => set({ botDifficulty: difficulty }),
    setGameMode: (mode) => set({ gameMode: mode }),
    saveGame: () => {
      const state = get();
      saveGameState(state);
    },
    loadGame: () => {
      const savedState = loadGameState();
      if (savedState) {
        set({
          board: savedState.board,
          turn: savedState.turn,
          gameState: savedState.gameState,
          history: savedState.history,
          historyIndex: savedState.historyIndex,
          botDifficulty: savedState.botDifficulty,
          gameMode: savedState.gameMode || GameMode.HUMAN_VS_BOT,
          message: savedState.gameState === 'playing' ? 'White to move' : 'Game Over',
        });
      }
    },
    hasSavedGame: () => {
      return loadGameState() !== null;
    },
  };
}); 