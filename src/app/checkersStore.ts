import { create } from 'zustand';

export enum PlayerType {
  EMPTY = 0,
  PLAYER = 1,
  BOT = 2,
}

export enum BotDifficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
}

export type Cell = PlayerType;
export type Board = Cell[][];
export type Pos = [number, number] | null;

const BOARD_SIZE = 8;

function initialBoard(): Board {
  const board: Board = Array.from({ length: BOARD_SIZE }, () => Array<Cell>(BOARD_SIZE).fill(PlayerType.EMPTY));
  for (let y = 0; y < 3; y++) for (let x = (y + 1) % 2; x < BOARD_SIZE; x += 2) board[y][x] = PlayerType.BOT;
  for (let y = BOARD_SIZE - 3; y < BOARD_SIZE; y++) for (let x = (y + 1) % 2; x < BOARD_SIZE; x += 2) board[y][x] = PlayerType.PLAYER;
  return board;
}

function clone(board: Board): Board {
  return board.map(row => [...row]);
}

interface GameStats {
  wins: number;
  losses: number;
  totalGames: number;
}

interface CheckersState {
  board: Board;
  selected: Pos;
  turn: PlayerType;
  message: string;
  gameState: string;
  history: Board[];
  historyIndex: number;
  stats: GameStats;
  botDifficulty: BotDifficulty;
  setBoard: (b: Board) => void;
  setSelected: (p: Pos) => void;
  setTurn: (t: PlayerType) => void;
  setMessage: (m: string) => void;
  setGameState: (s: string) => void;
  resetGame: () => void;
  pushHistory: (b: Board) => void;
  stepHistory: (dir: 1 | -1) => void;
  updateStats: (result: 'win' | 'loss') => void;
  resetStats: () => void;
  setBotDifficulty: (difficulty: BotDifficulty) => void;
  saveGame: () => void;
  loadGame: () => void;
  hasSavedGame: () => boolean;
}

function loadStats(): GameStats {
  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem('checkersStats');
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {}
    }
  }
  return { wins: 0, losses: 0, totalGames: 0 };
}
function saveStats(stats: GameStats) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('checkersStats', JSON.stringify(stats));
  }
}

function saveGameState(state: any) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('checkersGameState', JSON.stringify({
      board: state.board,
      turn: state.turn,
      gameState: state.gameState,
      history: state.history,
      historyIndex: state.historyIndex,
      botDifficulty: state.botDifficulty,
    }));
  }
}

function loadGameState(): any {
  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem('checkersGameState');
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {}
    }
  }
  return null;
}

export const useCheckersStore = create<CheckersState>((set, get) => {
  const savedState = loadGameState();
  const initialState = savedState || {
    board: initialBoard(),
    turn: PlayerType.PLAYER,
    gameState: 'playing',
    history: [initialBoard()],
    historyIndex: 0,
    botDifficulty: BotDifficulty.MEDIUM,
  };

  return {
    board: initialState.board,
    selected: null,
    turn: initialState.turn,
    message: initialState.gameState === 'playing' ? 'Your move!' : 'Game Over',
    gameState: initialState.gameState,
    history: initialState.history,
    historyIndex: initialState.historyIndex,
    stats: typeof window !== 'undefined' ? loadStats() : { wins: 0, losses: 0, totalGames: 0 },
    botDifficulty: initialState.botDifficulty,
    setBoard: (b) => set({ board: b }),
    setSelected: (p) => set({ selected: p }),
    setTurn: (t) => set({ turn: t }),
    setMessage: (m) => set({ message: m }),
    setGameState: (s) => set({ gameState: s }),
    resetGame: () => set(state => {
      const newState = {
        board: initialBoard(),
        selected: null,
        turn: PlayerType.PLAYER,
        message: 'Your move!',
        gameState: 'playing',
        history: [initialBoard()],
        historyIndex: 0,
        stats: state.stats,
        botDifficulty: state.botDifficulty,
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
    updateStats: (result) => {
      const { stats } = get();
      const newStats = {
        ...stats,
        totalGames: stats.totalGames + 1,
        wins: result === 'win' ? stats.wins + 1 : stats.wins,
        losses: result === 'loss' ? stats.losses + 1 : stats.losses,
      };
      set({ stats: newStats });
      saveStats(newStats);
    },
    resetStats: () => {
      const zeroStats = { wins: 0, losses: 0, totalGames: 0 };
      set({ stats: zeroStats });
      saveStats(zeroStats);
    },
    setBotDifficulty: (difficulty) => set({ botDifficulty: difficulty }),
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
          message: savedState.gameState === 'playing' ? 'Your move!' : 'Game Over',
        });
      }
    },
    hasSavedGame: () => {
      return loadGameState() !== null;
    },
  };
}); 