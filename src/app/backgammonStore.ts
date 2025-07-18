import { create } from 'zustand';

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

export type Point = number[]; // Array of piece counts for each player
export type Board = Point[];
export type Dice = number[];

const BOARD_SIZE = 24;
const BAR_WHITE = 25;
const BAR_BLACK = 26;
const OFF_WHITE = 27;
const OFF_BLACK = 28;

function initialBoard(): Board {
  const board: Board = Array.from({ length: BOARD_SIZE }, () => [0, 0]);
  
  // Set up initial piece positions
  // Point 0 is white's home board, point 23 is black's home board
  board[0] = [2, 0];   // White pieces
  board[5] = [0, 5];   // Black pieces
  board[7] = [0, 3];   // Black pieces
  board[11] = [5, 0];  // White pieces
  board[12] = [0, 5];  // Black pieces
  board[16] = [3, 0];  // White pieces
  board[18] = [5, 0];  // White pieces
  board[23] = [0, 2];  // Black pieces
  
  return board;
}

function clone(board: Board): Board {
  return board.map(point => [...point]);
}

interface GameStats {
  wins: number;
  losses: number;
  totalGames: number;
}

function loadStats(): GameStats {
  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem('backgammonStats');
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
    localStorage.setItem('backgammonStats', JSON.stringify(stats));
  }
}

function saveGameState(state: any) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('backgammonGameState', JSON.stringify({
      board: state.board,
      turn: state.turn,
      gameState: state.gameState,
      dice: state.dice,
      usedDice: state.usedDice,
      history: state.history,
      historyIndex: state.historyIndex,
      botDifficulty: state.botDifficulty,
      gameMode: state.gameMode,
    }));
  }
}

function loadGameState(): any {
  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem('backgammonGameState');
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {}
    }
  }
  return null;
}

function rollDice(): Dice {
  const die1 = Math.floor(Math.random() * 6) + 1;
  const die2 = Math.floor(Math.random() * 6) + 1;
  return die1 === die2 ? [die1, die1, die1, die1] : [die1, die2];
}

function getValidMoves(board: Board, turn: PlayerColor, dice: Dice, usedDice: number[]): [number, number][] {
  const moves: [number, number][] = [];
  const availableDice = dice.filter(d => !usedDice.includes(d));
  
  for (const die of availableDice) {
    for (let from = 0; from < BOARD_SIZE; from++) {
      const to = turn === PlayerColor.WHITE ? from + die : from - die;
      
      if (to >= 0 && to < BOARD_SIZE) {
        const fromPoint = board[from];
        const toPoint = board[to];
        
        // Check if player has pieces at from point
        const playerIndex = turn === PlayerColor.WHITE ? 0 : 1;
        if (fromPoint[playerIndex] > 0) {
          // Check if destination is valid
          const opponentIndex = turn === PlayerColor.WHITE ? 1 : 0;
          if (toPoint[opponentIndex] <= 1) {
            moves.push([from, to]);
          }
        }
      }
    }
  }
  
  return moves;
}

function makeBotMove(board: Board, turn: PlayerColor, dice: Dice, usedDice: number[], difficulty: BotDifficulty): [number, number] | null {
  const validMoves = getValidMoves(board, turn, dice, usedDice);
  if (validMoves.length === 0) return null;
  
  switch (difficulty) {
    case BotDifficulty.EASY:
      // Random move
      return validMoves[Math.floor(Math.random() * validMoves.length)];
      
    case BotDifficulty.MEDIUM:
      // Sometimes random, sometimes strategic
      if (Math.random() < 0.4) {
        return validMoves[Math.floor(Math.random() * validMoves.length)];
      }
      // Fall through to strategic logic
      
    case BotDifficulty.HARD:
      // Strategic move - prefer moves that capture or protect
      let bestMove = validMoves[0];
      let bestScore = -Infinity;
      
      for (const [from, to] of validMoves) {
        const testBoard = clone(board);
        const playerIndex = turn === PlayerColor.WHITE ? 0 : 1;
        const opponentIndex = turn === PlayerColor.WHITE ? 1 : 0;
        
        // Make the move
        testBoard[from][playerIndex]--;
        testBoard[to][playerIndex]++;
        
        // If capturing opponent piece
        if (testBoard[to][opponentIndex] === 1) {
          testBoard[to][opponentIndex] = 0;
          // Add to bar (simplified)
        }
        
        // Score the position
        let score = 0;
        for (let i = 0; i < BOARD_SIZE; i++) {
          score += testBoard[i][playerIndex] * (turn === PlayerColor.WHITE ? i : (23 - i));
        }
        
        if (score > bestScore) {
          bestScore = score;
          bestMove = [from, to];
        }
      }
      
      return bestMove;
  }
  
  return validMoves[0];
}

interface BackgammonState {
  board: Point[];
  turn: PlayerColor;
  message: string;
  gameState: string;
  history: Point[][];
  historyIndex: number;
  stats: GameStats;
  botDifficulty: BotDifficulty;
  gameMode: GameMode;
  dice: number[];
  usedDice: number[];
  setBoard: (b: Point[]) => void;
  setTurn: (t: PlayerColor) => void;
  setMessage: (m: string) => void;
  setGameState: (s: string) => void;
  setDice: (d: number[]) => void;
  setUsedDice: (d: number[]) => void;
  resetGame: () => void;
  pushHistory: (b: Point[]) => void;
  stepHistory: (dir: 1 | -1) => void;
  updateStats: (result: 'win' | 'loss') => void;
  resetStats: () => void;
  setBotDifficulty: (difficulty: BotDifficulty) => void;
  setGameMode: (mode: GameMode) => void;
  saveGame: () => void;
  loadGame: () => void;
  hasSavedGame: () => boolean;
  rollDice: () => void;
}

export const useBackgammonStore = create<BackgammonState>((set, get) => {
  const savedState = loadGameState();
  const initialState = savedState || {
    board: initialBoard(),
    turn: PlayerColor.WHITE,
    gameState: 'playing',
    dice: [],
    usedDice: [],
    history: [initialBoard()],
    historyIndex: 0,
    botDifficulty: BotDifficulty.MEDIUM,
    gameMode: GameMode.HUMAN_VS_BOT,
  };

  return {
    board: initialState.board,
    turn: initialState.turn,
    message: initialState.gameState === 'playing' ? 'White to roll' : 'Game Over',
    gameState: initialState.gameState,
    dice: initialState.dice,
    usedDice: initialState.usedDice,
    history: initialState.history,
    historyIndex: initialState.historyIndex,
    stats: typeof window !== 'undefined' ? loadStats() : { wins: 0, losses: 0, totalGames: 0 },
    botDifficulty: initialState.botDifficulty,
    gameMode: initialState.gameMode,
    setBoard: (b) => set({ board: b }),
    setTurn: (t) => set({ turn: t }),
    setMessage: (m) => set({ message: m }),
    setGameState: (s) => set({ gameState: s }),
    setDice: (d) => set({ dice: d }),
    setUsedDice: (d) => set({ usedDice: d }),
    resetGame: () => set(state => {
      const newState = {
        board: initialBoard(),
        turn: PlayerColor.WHITE,
        message: 'White to roll',
        gameState: 'playing',
        dice: [],
        usedDice: [],
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
          dice: savedState.dice,
          usedDice: savedState.usedDice,
          history: savedState.history,
          historyIndex: savedState.historyIndex,
          botDifficulty: savedState.botDifficulty,
          gameMode: savedState.gameMode || GameMode.HUMAN_VS_BOT,
          message: savedState.gameState === 'playing' ? 'White to roll' : 'Game Over',
        });
      }
    },
    hasSavedGame: () => {
      return loadGameState() !== null;
    },
    rollDice: () => {
      const { turn, gameState, gameMode } = get();
      if (gameState !== 'playing') return;
      
      const newDice = rollDice();
      set({ dice: newDice, usedDice: [] });
      
      // Bot rolls if it's black's turn and we're in human vs bot mode
      if (turn === PlayerColor.BLACK && gameMode === GameMode.HUMAN_VS_BOT) {
        setTimeout(() => {
          const currentState = get();
          if (currentState.turn === PlayerColor.BLACK && currentState.gameState === 'playing') {
            const botMove = makeBotMove(currentState.board, currentState.turn, currentState.dice, currentState.usedDice, currentState.botDifficulty);
            if (botMove) {
              // Implement bot move logic here
              currentState.setMessage('Black moved');
            }
          }
        }, 1000);
      }
    },
  };
}); 