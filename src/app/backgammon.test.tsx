import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Backgammon from './backgammon';
import { 
  useBackgammonStore, 
  GameMode, 
  PlayerColor, 
  BotDifficulty,
  hasPiecesOnBar,
  canReenterFromBar,
  getBarReentryMoves,
  canUseBothDice,
  validateHigherDieFirst,
  getHigherDieFirstMessage,
  enforceHigherDieFirst,
  getValidMovesForDie,
  hitPiece,
  isBlot,
  canHitBlot,
  BOARD_CONSTANTS,
  getBoardPointRepresentation,
  isBarPoint,
  isOffBoardPoint,
  isSpecialPoint,
  getPointLabel,
  getPointStyle,
  canClickPoint,
  canBearOff,
  validateBarReentryMove,
  executeBarReentryMove,
  getAllBlots,
  getBlotCount,
  isPointVulnerable,
  getVulnerableBlots,
  getBlotRiskLevel,
  getBlotProtectionMoves,
  getBlotAttackMoves,
  getBlotStrategicValue,
  getBlotStatusMessage,
  hasAllPiecesBorneOff,
  isGammonWin,
  isBackgammonWin,
  getWinType,
  getWinMessage,
  calculateWinPoints,
  getGameEndState
} from './backgammonStore';

// Mock the store
const mockUseBackgammonStore = jest.fn();

jest.mock('./backgammonStore', () => ({
  useBackgammonStore: mockUseBackgammonStore,
  GameMode: {
    HUMAN_VS_BOT: 'human_vs_bot',
    HUMAN_VS_HUMAN: 'human_vs_human',
  },
  PlayerColor: {
    WHITE: 'white',
    BLACK: 'black',
  },
  BotDifficulty: {
    EASY: 'easy',
    MEDIUM: 'medium',
    HARD: 'hard',
  },
  canBearOff: jest.fn(),
  isAllPiecesInHomeBoard: jest.fn(),
  getBearingOffMoves: jest.fn(),
  validateBearingOffMove: jest.fn(),
  hasPiecesOnBar: jest.fn(),
  canReenterFromBar: jest.fn(),
  getBarReentryMoves: jest.fn(),
  validateBarReentryMove: jest.fn(),
  executeBarReentryMove: jest.fn(),
  hitPiece: jest.fn(),
  isBlot: jest.fn(),
  canHitBlot: jest.fn(),
  canUseBothDice: jest.fn(),
  validateHigherDieFirst: jest.fn(),
  getHigherDieFirstMessage: jest.fn(),
  enforceHigherDieFirst: jest.fn(),
  getValidMovesForDie: jest.fn(),
  BOARD_CONSTANTS: {
    BOARD_SIZE: 24,
    BAR_WHITE: 25,
    BAR_BLACK: 26,
    OFF_WHITE: 27,
    OFF_BLACK: 28,
  },
  getBoardPointRepresentation: jest.fn(),
  isBarPoint: jest.fn(),
  isOffBoardPoint: jest.fn(),
  isSpecialPoint: jest.fn(),
  getPointLabel: jest.fn(),
  getPointStyle: jest.fn(),
  canClickPoint: jest.fn(),
  canBearOff: jest.fn(),
  getAllBlots: jest.fn(),
  getBlotCount: jest.fn(),
  isPointVulnerable: jest.fn(),
  getVulnerableBlots: jest.fn(),
  getBlotRiskLevel: jest.fn(),
  getBlotProtectionMoves: jest.fn(),
  getBlotAttackMoves: jest.fn(),
  getBlotStrategicValue: jest.fn(),
  getBlotStatusMessage: jest.fn(),
  hasAllPiecesBorneOff: jest.fn(),
  isGammonWin: jest.fn(),
  isBackgammonWin: jest.fn(),
  getWinType: jest.fn(),
  getWinMessage: jest.fn(),
  calculateWinPoints: jest.fn(),
  getGameEndState: jest.fn(),
}));

// Mock Next.js Link
jest.mock('next/link', () => {
  return function MockLink({ children, href, ...props }: any) {
    return React.createElement('a', { href, ...props }, children);
  };
});

// Mock Tutorial component
jest.mock('./components/Tutorial', () => {
  return function MockTutorial({ onClose }: any) {
    return React.createElement('div', { 'data-testid': 'tutorial' }, 'Tutorial');
  };
});

// Mock tutorials data
jest.mock('./data/tutorials', () => ({
  backgammonTutorial: {
    title: 'Backgammon Tutorial',
    steps: [],
  },
}));

describe('Backgammon Bar Re-entry System', () => {
  const mockStore = {
    boardState: {
      board: Array.from({ length: 24 }, () => [0, 0]),
      bar: [0, 0] as [number, number],
      offBoard: [0, 0] as [number, number],
    },
    turn: PlayerColor.WHITE,
    message: 'White to roll',
    gameState: 'playing',
    dice: [3, 4],
    usedDice: [],
    history: [],
    historyIndex: 0,
    stats: { wins: 0, losses: 0, totalGames: 0 },
    botDifficulty: BotDifficulty.MEDIUM,
    gameMode: GameMode.HUMAN_VS_BOT,
    setBoardState: jest.fn(),
    setTurn: jest.fn(),
    setMessage: jest.fn(),
    setGameState: jest.fn(),
    setDice: jest.fn(),
    setUsedDice: jest.fn(),
    resetGame: jest.fn(),
    pushHistory: jest.fn(),
    stepHistory: jest.fn(),
    updateStats: jest.fn(),
    resetStats: jest.fn(),
    setBotDifficulty: jest.fn(),
    setGameMode: jest.fn(),
    saveGame: jest.fn(),
    loadGame: jest.fn(),
    hasSavedGame: jest.fn(),
    rollDice: jest.fn(),
  };

  beforeEach(() => {
    mockUseBackgammonStore.mockReturnValue(mockStore);
    jest.clearAllMocks();
  });

  describe('Bar State Tracking', () => {
    test('detects when white has pieces on bar', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [2, 0] as [number, number], // White has 2 pieces on bar
        offBoard: [0, 0] as [number, number],
      };
      
      const result = hasPiecesOnBar(boardState, PlayerColor.WHITE);
      expect(result).toBe(true);
    });

    test('detects when black has pieces on bar', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [0, 1] as [number, number], // Black has 1 piece on bar
        offBoard: [0, 0] as [number, number],
      };
      
      const result = hasPiecesOnBar(boardState, PlayerColor.BLACK);
      expect(result).toBe(true);
    });

    test('detects when no pieces are on bar', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [0, 0], // No pieces on bar
        offBoard: [0, 0],
      };
      
      const result = hasPiecesOnBar(boardState, PlayerColor.WHITE);
      expect(result).toBe(false);
    });
  });

  describe('Bar Re-entry Validation', () => {
    test('allows white re-entry when opponent has less than 2 pieces', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [1, 0], // White has 1 piece on bar
        offBoard: [0, 0],
      };
      
      // Set up opponent with 1 piece at re-entry point (point 21 for die 3)
      boardState.board[20] = [0, 1]; // Black has 1 piece at point 21
      
      const result = canReenterFromBar(boardState, PlayerColor.WHITE, 3);
      expect(result).toBe(true);
    });

    test('prevents white re-entry when opponent has 2 or more pieces', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [1, 0], // White has 1 piece on bar
        offBoard: [0, 0],
      };
      
      // Set up opponent with 2 pieces at re-entry point (point 21 for die 3)
      boardState.board[20] = [0, 2]; // Black has 2 pieces at point 21
      
      const result = canReenterFromBar(boardState, PlayerColor.WHITE, 3);
      expect(result).toBe(false);
    });

    test('allows black re-entry when opponent has less than 2 pieces', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [0, 1], // Black has 1 piece on bar
        offBoard: [0, 0],
      };
      
      // Set up opponent with 1 piece at re-entry point (point 3 for die 3)
      boardState.board[2] = [1, 0]; // White has 1 piece at point 3
      
      const result = canReenterFromBar(boardState, PlayerColor.BLACK, 3);
      expect(result).toBe(true);
    });

    test('prevents re-entry when no pieces are on bar', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [0, 0], // No pieces on bar
        offBoard: [0, 0],
      };
      
      const result = canReenterFromBar(boardState, PlayerColor.WHITE, 3);
      expect(result).toBe(false);
    });
  });

  describe('Bar Re-entry Move Generation', () => {
    test('generates re-entry moves for white when pieces are on bar', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [1, 0], // White has 1 piece on bar
        offBoard: [0, 0],
      };
      
      // Set up valid re-entry points
      boardState.board[20] = [0, 1]; // Point 21 (die 3)
      boardState.board[19] = [0, 1]; // Point 20 (die 4)
      
      const dice = [3, 4];
      const usedDice: number[] = [];
      
      const moves = getBarReentryMoves(boardState, PlayerColor.WHITE, dice, usedDice);
      expect(moves.length).toBe(2);
      expect(moves.some(([from, to]) => to === 20)).toBe(true); // Point 21
      expect(moves.some(([from, to]) => to === 19)).toBe(true); // Point 20
    });

    test('generates re-entry moves for black when pieces are on bar', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [0, 1], // Black has 1 piece on bar
        offBoard: [0, 0],
      };
      
      // Set up valid re-entry points
      boardState.board[2] = [1, 0]; // Point 3 (die 3)
      boardState.board[3] = [1, 0]; // Point 4 (die 4)
      
      const dice = [3, 4];
      const usedDice: number[] = [];
      
      const moves = getBarReentryMoves(boardState, PlayerColor.BLACK, dice, usedDice);
      expect(moves.length).toBe(2);
      expect(moves.some(([from, to]) => to === 2)).toBe(true); // Point 3
      expect(moves.some(([from, to]) => to === 3)).toBe(true); // Point 4
    });

    test('does not generate re-entry moves when no pieces are on bar', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [0, 0], // No pieces on bar
        offBoard: [0, 0],
      };
      
      const dice = [3, 4];
      const usedDice: number[] = [];
      
      const moves = getBarReentryMoves(boardState, PlayerColor.WHITE, dice, usedDice);
      expect(moves.length).toBe(0);
    });
  });

  describe('Bar Re-entry Execution', () => {
    test('executes white re-entry move correctly', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [1, 0], // White has 1 piece on bar
        offBoard: [0, 0],
      };
      
      // Set up re-entry point with opponent piece
      boardState.board[20] = [0, 1]; // Black has 1 piece at point 21
      
      const newState = executeBarReentryMove(boardState, 25, 20, PlayerColor.WHITE);
      
      expect(newState.bar[0]).toBe(0); // White piece removed from bar
      expect(newState.board[20][0]).toBe(1); // White piece added to point 21
      expect(newState.board[20][1]).toBe(0); // Black piece hit and sent to bar
      expect(newState.bar[1]).toBe(1); // Black piece added to bar
    });

    test('executes black re-entry move correctly', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [0, 1], // Black has 1 piece on bar
        offBoard: [0, 0],
      };
      
      // Set up re-entry point with opponent piece
      boardState.board[2] = [1, 0]; // White has 1 piece at point 3
      
      const newState = executeBarReentryMove(boardState, 25, 2, PlayerColor.BLACK);
      
      expect(newState.bar[1]).toBe(0); // Black piece removed from bar
      expect(newState.board[2][1]).toBe(1); // Black piece added to point 3
      expect(newState.board[2][0]).toBe(0); // White piece hit and sent to bar
      expect(newState.bar[0]).toBe(1); // White piece added to bar
    });

    test('executes re-entry without hitting opponent piece', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [1, 0], // White has 1 piece on bar
        offBoard: [0, 0],
      };
      
      // Set up empty re-entry point
      boardState.board[20] = [0, 0]; // Empty point 21
      
      const newState = executeBarReentryMove(boardState, 25, 20, PlayerColor.WHITE);
      
      expect(newState.bar[0]).toBe(0); // White piece removed from bar
      expect(newState.board[20][0]).toBe(1); // White piece added to point 21
      expect(newState.board[20][1]).toBe(0); // No black piece
      expect(newState.bar[1]).toBe(0); // No black piece on bar
    });
  });

  describe('Hit Piece Functionality', () => {
    test('hits opponent piece and sends to bar', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [0, 0],
        offBoard: [0, 0],
      };
      
      // Set up opponent piece to be hit
      boardState.board[10] = [0, 1]; // Black piece at point 11
      
      const newState = hitPiece(boardState, 10, PlayerColor.WHITE);
      
      expect(newState.board[10][1]).toBe(0); // Black piece removed from point
      expect(newState.bar[1]).toBe(1); // Black piece added to bar
    });

    test('handles multiple pieces on bar correctly', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [1, 2] as [number, number], // White has 1, Black has 2 on bar
        offBoard: [0, 0] as [number, number],
      };
      
      // Set up a black piece (blot) at point 10
      boardState.board[9] = [0, 1]; // Black has 1 piece at point 10
      
      const result = hitPiece(boardState, 9, PlayerColor.WHITE);
      
      // Black piece should be removed from the board
      expect(result.board[9][1]).toBe(0);
      
      // Black bar should be incremented
      expect(result.bar[1]).toBe(3);
      
      // White bar should remain unchanged
      expect(result.bar[0]).toBe(1);
    });

    test('does not affect pieces when no hit occurs', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [0, 0] as [number, number],
        offBoard: [0, 0] as [number, number],
      };
      
      // Set up a black piece (not a blot) at point 5
      boardState.board[4] = [0, 2]; // Black has 2 pieces at point 5 (not a blot)
      
      const result = hitPiece(boardState, 4, PlayerColor.WHITE);
      
      // Black pieces should remain on the board
      expect(result.board[4][1]).toBe(2);
      
      // Bar should remain unchanged
      expect(result.bar[1]).toBe(0);
    });
  });

  describe('Blot Detection', () => {
    test('identifies single pieces as blots', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [0, 0] as [number, number],
        offBoard: [0, 0] as [number, number],
      };
      
      // Set up single pieces
      boardState.board[0] = [1, 0]; // White single piece
      boardState.board[5] = [0, 1]; // Black single piece
      
      expect(isBlot(boardState, 0, PlayerColor.WHITE)).toBe(true);
      expect(isBlot(boardState, 5, PlayerColor.BLACK)).toBe(true);
    });

    test('does not identify multiple pieces as blots', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [0, 0] as [number, number],
        offBoard: [0, 0] as [number, number],
      };
      
      // Set up multiple pieces
      boardState.board[0] = [2, 0]; // White has 2 pieces
      boardState.board[5] = [0, 3]; // Black has 3 pieces
      
      expect(isBlot(boardState, 0, PlayerColor.WHITE)).toBe(false);
      expect(isBlot(boardState, 5, PlayerColor.BLACK)).toBe(false);
    });

    test('does not identify empty points as blots', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [0, 0] as [number, number],
        offBoard: [0, 0] as [number, number],
      };
      
      expect(isBlot(boardState, 0, PlayerColor.WHITE)).toBe(false);
      expect(isBlot(boardState, 0, PlayerColor.BLACK)).toBe(false);
    });
  });

  describe('Can Hit Blot Function', () => {
    test('allows hitting opponent blots', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [0, 0] as [number, number],
        offBoard: [0, 0] as [number, number],
      };
      
      // Set up opponent blot at destination
      boardState.board[5] = [0, 1]; // Black blot at point 6
      
      const result = canHitBlot(boardState, 0, 5, PlayerColor.WHITE);
      expect(result).toBe(true);
    });

    test('prevents hitting when opponent has multiple pieces', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [0, 0] as [number, number],
        offBoard: [0, 0] as [number, number],
      };
      
      // Set up opponent with multiple pieces at destination
      boardState.board[5] = [0, 2]; // Black has 2 pieces at point 6
      
      const result = canHitBlot(boardState, 0, 5, PlayerColor.WHITE);
      expect(result).toBe(false);
    });

    test('prevents hitting own pieces', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [0, 0] as [number, number],
        offBoard: [0, 0] as [number, number],
      };
      
      // Set up own piece at destination
      boardState.board[5] = [1, 0]; // White piece at point 6
      
      const result = canHitBlot(boardState, 0, 5, PlayerColor.WHITE);
      expect(result).toBe(false);
    });
  });

  describe('Move Execution with Hit Pieces', () => {
    test('executes move and hits opponent blot', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [0, 0] as [number, number],
        offBoard: [0, 0] as [number, number],
      };
      
      // Set up white piece at point 1 and black blot at point 4
      boardState.board[0] = [1, 0]; // White piece at point 1
      boardState.board[3] = [0, 1]; // Black blot at point 4
      
      // Simulate move from point 1 to point 4 (using die 3)
      const newBoardState = { ...boardState };
      newBoardState.board[0][0]--; // Remove white piece from point 1
      newBoardState.board[3][0]++; // Add white piece to point 4
      
      // Handle hit piece
      if (isBlot(newBoardState, 3, PlayerColor.BLACK)) {
        const updatedState = hitPiece(newBoardState, 3, PlayerColor.WHITE);
        newBoardState.board = updatedState.board;
        newBoardState.bar = updatedState.bar;
      }
      
      // Verify results
      expect(newBoardState.board[0][0]).toBe(0); // White piece removed from point 1
      expect(newBoardState.board[3][0]).toBe(1); // White piece added to point 4
      expect(newBoardState.board[3][1]).toBe(0); // Black piece removed from point 4
      expect(newBoardState.bar[1]).toBe(1); // Black piece added to bar
    });

    test('executes move without hitting when opponent has multiple pieces', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [0, 0] as [number, number],
        offBoard: [0, 0] as [number, number],
      };
      
      // Set up white piece at point 1 and black with multiple pieces at point 4
      boardState.board[0] = [1, 0]; // White piece at point 1
      boardState.board[3] = [0, 2]; // Black has 2 pieces at point 4
      
      // Simulate move from point 1 to point 4 (using die 3)
      const newBoardState = { ...boardState };
      newBoardState.board[0][0]--; // Remove white piece from point 1
      newBoardState.board[3][0]++; // Add white piece to point 4
      
      // Handle hit piece (should not hit since black has multiple pieces)
      if (isBlot(newBoardState, 3, PlayerColor.BLACK)) {
        const updatedState = hitPiece(newBoardState, 3, PlayerColor.WHITE);
        newBoardState.board = updatedState.board;
        newBoardState.bar = updatedState.bar;
      }
      
      // Verify results
      expect(newBoardState.board[0][0]).toBe(0); // White piece removed from point 1
      expect(newBoardState.board[3][0]).toBe(1); // White piece added to point 4
      expect(newBoardState.board[3][1]).toBe(2); // Black pieces remain at point 4
      expect(newBoardState.bar[1]).toBe(0); // No pieces added to bar
    });
  });

  describe('UI Integration', () => {
    test('shows bar status when pieces are hit', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [0, 1] as [number, number], // Black has 1 piece on bar
        offBoard: [0, 0] as [number, number],
      };
      
      mockStore.boardState = boardState;
      (hasPiecesOnBar as jest.Mock).mockReturnValue(true);
      
      render(<Backgammon />);
      
      expect(screen.getByText(/Black has 1 piece\(s\) on bar/)).toBeInTheDocument();
    });

    test('shows bar re-entry warning when pieces are on bar', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [0, 2] as [number, number], // Black has 2 pieces on bar
        offBoard: [0, 0] as [number, number],
      };
      
      mockStore.boardState = boardState;
      mockStore.turn = PlayerColor.BLACK;
      (hasPiecesOnBar as jest.Mock).mockReturnValue(true);
      
      render(<Backgammon />);
      
      expect(screen.getByText(/Black has 2 piece\(s\) on bar/)).toBeInTheDocument();
      expect(screen.getByText(/Must re-enter before making other moves/)).toBeInTheDocument();
    });
  });

  describe('Game Flow with Hit Pieces', () => {
    test('player must re-enter from bar after being hit', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [0, 1] as [number, number], // Black has 1 piece on bar
        offBoard: [0, 0] as [number, number],
      };
      
      mockStore.boardState = boardState;
      mockStore.turn = PlayerColor.BLACK;
      (hasPiecesOnBar as jest.Mock).mockReturnValue(true);
      (getBarReentryMoves as jest.Mock).mockReturnValue([[25, 20]]); // Can re-enter at point 21
      
      render(<Backgammon />);
      
      // Should show bar re-entry warning
      expect(screen.getByText(/Must re-enter before making other moves/)).toBeInTheDocument();
    });

    test('player can continue normal moves after re-entering from bar', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [0, 0] as [number, number], // No pieces on bar
        offBoard: [0, 0] as [number, number],
      };
      
      mockStore.boardState = boardState;
      mockStore.turn = PlayerColor.BLACK;
      (hasPiecesOnBar as jest.Mock).mockReturnValue(false);
      
      render(<Backgammon />);
      
      // Should not show bar re-entry warning
      expect(screen.queryByText(/Must re-enter before making other moves/)).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    test('handles multiple hits in sequence', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [0, 0] as [number, number],
        offBoard: [0, 0] as [number, number],
      };
      
      // Set up multiple blots
      boardState.board[0] = [1, 0]; // White piece at point 1
      boardState.board[3] = [0, 1]; // Black blot at point 4
      boardState.board[6] = [0, 1]; // Black blot at point 7
      
      // First hit
      let newState = hitPiece(boardState, 3, PlayerColor.WHITE);
      expect(newState.bar[1]).toBe(1);
      
      // Second hit
      newState = hitPiece(newState, 6, PlayerColor.WHITE);
      expect(newState.bar[1]).toBe(2);
    });

    test('handles hit pieces when bar already has pieces', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [0, 3] as [number, number], // Black already has 3 pieces on bar
        offBoard: [0, 0] as [number, number],
      };
      
      // Set up a black blot
      boardState.board[5] = [0, 1]; // Black blot at point 6
      
      const result = hitPiece(boardState, 5, PlayerColor.WHITE);
      
      expect(result.bar[1]).toBe(4); // Should increment to 4
    });

    test('handles hit pieces for both players', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [0, 0] as [number, number],
        offBoard: [0, 0] as [number, number],
      };
      
      // Set up white and black blots
      boardState.board[0] = [1, 0]; // White blot at point 1
      boardState.board[5] = [0, 1]; // Black blot at point 6
      
      // White hits black
      let newState = hitPiece(boardState, 5, PlayerColor.WHITE);
      expect(newState.bar[1]).toBe(1); // Black piece on bar
      
      // Black hits white
      newState = hitPiece(newState, 0, PlayerColor.BLACK);
      expect(newState.bar[0]).toBe(1); // White piece on bar
    });
  });

  describe('Bot AI Integration', () => {
    test('bot considers hitting opponent blots as strategic moves', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [0, 0] as [number, number],
        offBoard: [0, 0] as [number, number],
      };
      
      // Set up bot piece and opponent blot
      boardState.board[0] = [0, 1]; // Black (bot) piece at point 1
      boardState.board[3] = [1, 0]; // White blot at point 4
      
      mockStore.boardState = boardState;
      mockStore.turn = PlayerColor.BLACK;
      mockStore.botDifficulty = BotDifficulty.HARD;
      (canHitBlot as jest.Mock).mockReturnValue(true);
      
      render(<Backgammon />);
      
      // Bot should consider hitting the blot
      expect(canHitBlot).toHaveBeenCalled();
    });
  });
}); 

describe('Backgammon Higher Die First Rule', () => {
  const mockStore = {
    boardState: {
      board: Array.from({ length: 24 }, () => [0, 0]),
      bar: [0, 0],
      offBoard: [0, 0],
    },
    turn: PlayerColor.WHITE,
    message: 'White to roll',
    gameState: 'playing',
    dice: [3, 4],
    usedDice: [],
    history: [],
    historyIndex: 0,
    stats: { wins: 0, losses: 0, totalGames: 0 },
    botDifficulty: BotDifficulty.MEDIUM,
    gameMode: GameMode.HUMAN_VS_BOT,
    setBoardState: jest.fn(),
    setTurn: jest.fn(),
    setMessage: jest.fn(),
    setGameState: jest.fn(),
    setDice: jest.fn(),
    setUsedDice: jest.fn(),
    resetGame: jest.fn(),
    pushHistory: jest.fn(),
    stepHistory: jest.fn(),
    updateStats: jest.fn(),
    resetStats: jest.fn(),
    setBotDifficulty: jest.fn(),
    setGameMode: jest.fn(),
    saveGame: jest.fn(),
    loadGame: jest.fn(),
    hasSavedGame: jest.fn(),
    rollDice: jest.fn(),
  };

  beforeEach(() => {
    mockUseBackgammonStore.mockReturnValue(mockStore);
    jest.clearAllMocks();
  });

  describe('Both Dice Usage Detection', () => {
    test('detects when both dice can be used', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [0, 0],
        offBoard: [0, 0],
      };
      
      // Set up pieces that can use both dice 3 and 4
      boardState.board[0] = [2, 0]; // White pieces at point 1
      boardState.board[3] = [0, 0]; // Empty point 4
      boardState.board[4] = [0, 0]; // Empty point 5
      
      const dice = [3, 4];
      
      const result = canUseBothDice(boardState, PlayerColor.WHITE, dice);
      expect(result).toBe(true);
    });

    test('detects when only one die can be used', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [0, 0],
        offBoard: [0, 0],
      };
      
      // Set up pieces that can only use die 3
      boardState.board[0] = [2, 0]; // White pieces at point 1
      boardState.board[3] = [0, 2]; // Black pieces at point 4 (blocking die 4)
      
      const dice = [3, 4];
      
      const result = canUseBothDice(boardState, PlayerColor.WHITE, dice);
      expect(result).toBe(false);
    });

    test('detects when neither die can be used', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [0, 0],
        offBoard: [0, 0],
      };
      
      // Set up pieces that cannot use either die
      boardState.board[0] = [2, 0]; // White pieces at point 1
      boardState.board[3] = [0, 2]; // Black pieces at point 4 (blocking die 3)
      boardState.board[4] = [0, 2]; // Black pieces at point 5 (blocking die 4)
      
      const dice = [3, 4];
      
      const result = canUseBothDice(boardState, PlayerColor.WHITE, dice);
      expect(result).toBe(false);
    });
  });

  describe('Higher Die First Validation', () => {
    test('allows using higher die first', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [0, 0],
        offBoard: [0, 0],
      };
      
      // Set up pieces that can use both dice
      boardState.board[0] = [2, 0]; // White pieces at point 1
      
      const dice = [3, 4];
      const usedDice: number[] = [];
      const move: [number, number] = [0, 4]; // Using die 4 (higher die)
      
      const result = validateHigherDieFirst(boardState, PlayerColor.WHITE, dice, usedDice, move);
      expect(result).toBe(true);
    });

    test('prevents using lower die when higher die is available', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [0, 0],
        offBoard: [0, 0],
      };
      
      // Set up pieces that can use both dice
      boardState.board[0] = [2, 0]; // White pieces at point 1
      
      const dice = [3, 4];
      const usedDice: number[] = [];
      const move: [number, number] = [0, 3]; // Using die 3 (lower die)
      
      const result = validateHigherDieFirst(boardState, PlayerColor.WHITE, dice, usedDice, move);
      expect(result).toBe(false);
    });

    test('allows using lower die when higher die has no valid moves', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [0, 0],
        offBoard: [0, 0],
      };
      
      // Set up pieces that can only use die 3
      boardState.board[0] = [2, 0]; // White pieces at point 1
      boardState.board[4] = [0, 2]; // Black pieces at point 5 (blocking die 4)
      
      const dice = [3, 4];
      const usedDice: number[] = [];
      const move: [number, number] = [0, 3]; // Using die 3 (only available die)
      
      const result = validateHigherDieFirst(boardState, PlayerColor.WHITE, dice, usedDice, move);
      expect(result).toBe(true);
    });

    test('allows any move when only one die is available', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [0, 0],
        offBoard: [0, 0],
      };
      
      boardState.board[0] = [2, 0]; // White pieces at point 1
      
      const dice = [3]; // Only one die
      const usedDice: number[] = [];
      const move: [number, number] = [0, 3];
      
      const result = validateHigherDieFirst(boardState, PlayerColor.WHITE, dice, usedDice, move);
      expect(result).toBe(true);
    });

    test('allows any move after first die is used', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [0, 0],
        offBoard: [0, 0],
      };
      
      boardState.board[0] = [2, 0]; // White pieces at point 1
      
      const dice = [3, 4];
      const usedDice = [4]; // Higher die already used
      const move: [number, number] = [0, 3]; // Using lower die
      
      const result = validateHigherDieFirst(boardState, PlayerColor.WHITE, dice, usedDice, move);
      expect(result).toBe(true);
    });
  });

  describe('Bar Re-entry with Higher Die First', () => {
    test('enforces higher die first for bar re-entry', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [1, 0], // White has 1 piece on bar
        offBoard: [0, 0],
      };
      
      // Set up re-entry points
      boardState.board[20] = [0, 1]; // Point 21 (die 3) - can re-enter
      boardState.board[19] = [0, 1]; // Point 20 (die 4) - can re-enter
      
      const dice = [3, 4];
      const usedDice: number[] = [];
      
      // Should prioritize die 4 (higher die) for re-entry
      const moves = enforceHigherDieFirst(boardState, PlayerColor.WHITE, dice, usedDice);
      expect(moves.some(([from, to]) => to === 19)).toBe(true); // Point 20 (die 4)
    });

    test('allows lower die re-entry when higher die is blocked', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [1, 0], // White has 1 piece on bar
        offBoard: [0, 0],
      };
      
      // Set up re-entry points
      boardState.board[20] = [0, 2]; // Point 21 (die 3) - blocked
      boardState.board[19] = [0, 1]; // Point 20 (die 4) - can re-enter
      
      const dice = [3, 4];
      const usedDice: number[] = [];
      
      // Should allow die 4 re-entry since die 3 is blocked
      const moves = enforceHigherDieFirst(boardState, PlayerColor.WHITE, dice, usedDice);
      expect(moves.some(([from, to]) => to === 19)).toBe(true); // Point 20 (die 4)
    });
  });

  describe('Bearing Off with Higher Die First', () => {
    test('enforces higher die first for bearing off', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [0, 0],
        offBoard: [0, 0],
      };
      
      // Set up pieces in home board for bearing off
      boardState.board[18] = [1, 0]; // Point 19 (can bear off with die 5)
      boardState.board[20] = [1, 0]; // Point 21 (can bear off with die 3)
      
      const dice = [3, 5];
      const usedDice: number[] = [];
      
      // Should prioritize die 5 (higher die) for bearing off
      const moves = enforceHigherDieFirst(boardState, PlayerColor.WHITE, dice, usedDice);
      expect(moves.some(([from, to]) => from === 18 && to === 24)).toBe(true); // Point 19 with die 5
    });
  });

  describe('Move Generation for Single Die', () => {
    test('generates moves for specific die', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [0, 0],
        offBoard: [0, 0],
      };
      
      boardState.board[0] = [2, 0]; // White pieces at point 1
      
      const moves = getValidMovesForDie(boardState, PlayerColor.WHITE, 3);
      expect(moves.length).toBe(1);
      expect(moves[0]).toEqual([0, 3]); // Point 1 to point 4
    });

    test('returns empty array when no moves available for die', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [0, 0],
        offBoard: [0, 0],
      };
      
      boardState.board[0] = [2, 0]; // White pieces at point 1
      boardState.board[3] = [0, 2]; // Black pieces at point 4 (blocking)
      
      const moves = getValidMovesForDie(boardState, PlayerColor.WHITE, 3);
      expect(moves.length).toBe(0);
    });
  });

  describe('UI Integration', () => {
    test('shows higher die first warning when rule applies', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [0, 0],
        offBoard: [0, 0],
      };
      
      boardState.board[0] = [2, 0]; // White pieces at point 1
      boardState.board[4] = [0, 2]; // Black pieces at point 5 (blocking die 4)
      
      mockStore.boardState = boardState;
      mockStore.dice = [3, 4];
      (canUseBothDice as jest.Mock).mockReturnValue(false);
      (getHigherDieFirstMessage as jest.Mock).mockReturnValue('⚠️ Must use higher die (4) first!');
      
      render(<Backgammon />);
      
      expect(screen.getByText(/Must use higher die \(4\) first!/)).toBeInTheDocument();
    });

    test('shows info message when only lower die can be used', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [0, 0],
        offBoard: [0, 0],
      };
      
      boardState.board[0] = [2, 0]; // White pieces at point 1
      boardState.board[4] = [0, 2]; // Black pieces at point 5 (blocking die 4)
      
      mockStore.boardState = boardState;
      mockStore.dice = [3, 4];
      (canUseBothDice as jest.Mock).mockReturnValue(false);
      (getHigherDieFirstMessage as jest.Mock).mockReturnValue('ℹ️ Only lower die (3) can be used.');
      
      render(<Backgammon />);
      
      expect(screen.getByText(/Only lower die \(3\) can be used/)).toBeInTheDocument();
    });

    test('does not show warning when both dice can be used', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [0, 0],
        offBoard: [0, 0],
      };
      
      boardState.board[0] = [2, 0]; // White pieces at point 1
      
      mockStore.boardState = boardState;
      mockStore.dice = [3, 4];
      (canUseBothDice as jest.Mock).mockReturnValue(true);
      (getHigherDieFirstMessage as jest.Mock).mockReturnValue('');
      
      render(<Backgammon />);
      
      expect(screen.queryByText(/Must use higher die/)).not.toBeInTheDocument();
    });
  });

  describe('Move Validation in UI', () => {
    test('prevents invalid lower die move', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [0, 0],
        offBoard: [0, 0],
      };
      
      boardState.board[0] = [2, 0]; // White pieces at point 1
      
      mockStore.boardState = boardState;
      mockStore.dice = [3, 4];
      (validateHigherDieFirst as jest.Mock).mockReturnValue(false);
      
      render(<Backgammon />);
      
      // Simulate invalid move (would be handled by the component logic)
      expect(validateHigherDieFirst).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    test('handles doubles correctly', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [0, 0],
        offBoard: [0, 0],
      };
      
      boardState.board[0] = [2, 0]; // White pieces at point 1
      
      const dice = [3, 3, 3, 3]; // Doubles
      const usedDice: number[] = [];
      
      // With doubles, all dice are the same value, so rule doesn't apply
      const result = canUseBothDice(boardState, PlayerColor.WHITE, dice);
      expect(result).toBe(true);
    });

    test('handles single die roll', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [0, 0],
        offBoard: [0, 0],
      };
      
      boardState.board[0] = [2, 0]; // White pieces at point 1
      
      const dice = [3]; // Single die
      const usedDice: number[] = [];
      
      // With single die, rule doesn't apply
      const result = canUseBothDice(boardState, PlayerColor.WHITE, dice);
      expect(result).toBe(true);
    });

    test('handles no valid moves for either die', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [0, 0],
        offBoard: [0, 0],
      };
      
      boardState.board[0] = [2, 0]; // White pieces at point 1
      boardState.board[3] = [0, 2]; // Black pieces at point 4 (blocking die 3)
      boardState.board[4] = [0, 2]; // Black pieces at point 5 (blocking die 4)
      
      const dice = [3, 4];
      const usedDice: number[] = [];
      
      const moves = enforceHigherDieFirst(boardState, PlayerColor.WHITE, dice, usedDice);
      expect(moves.length).toBe(0);
    });
  });

  describe('Bot AI Integration', () => {
    test('bot respects higher die first rule', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [0, 0],
        offBoard: [0, 0],
      };
      
      boardState.board[0] = [2, 0]; // White pieces at point 1
      boardState.board[4] = [0, 2]; // Black pieces at point 5 (blocking die 4)
      
      mockStore.boardState = boardState;
      mockStore.turn = PlayerColor.BLACK;
      mockStore.botDifficulty = BotDifficulty.HARD;
      (canUseBothDice as jest.Mock).mockReturnValue(false);
      
      render(<Backgammon />);
      
      // Bot should respect the higher die first rule
      expect(canUseBothDice).toHaveBeenCalled();
    });
  });
}); 

describe('Backgammon Hit Piece System', () => {
  const mockStore = {
    boardState: {
      board: Array.from({ length: 24 }, () => [0, 0]),
      bar: [0, 0] as [number, number],
      offBoard: [0, 0] as [number, number],
    },
    turn: PlayerColor.WHITE,
    message: 'White to roll',
    gameState: 'playing',
    dice: [3, 4],
    usedDice: [],
    history: [],
    historyIndex: 0,
    stats: { wins: 0, losses: 0, totalGames: 0 },
    botDifficulty: BotDifficulty.MEDIUM,
    gameMode: GameMode.HUMAN_VS_BOT,
    setBoardState: jest.fn(),
    setTurn: jest.fn(),
    setMessage: jest.fn(),
    setGameState: jest.fn(),
    setDice: jest.fn(),
    setUsedDice: jest.fn(),
    resetGame: jest.fn(),
    pushHistory: jest.fn(),
    stepHistory: jest.fn(),
    updateStats: jest.fn(),
    resetStats: jest.fn(),
    setBotDifficulty: jest.fn(),
    setGameMode: jest.fn(),
    saveGame: jest.fn(),
    loadGame: jest.fn(),
    hasSavedGame: jest.fn(),
    rollDice: jest.fn(),
  };

  beforeEach(() => {
    mockUseBackgammonStore.mockReturnValue(mockStore);
    jest.clearAllMocks();
  });

  describe('Hit Piece Function', () => {
    test('moves hit piece to bar instead of disappearing', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [0, 0] as [number, number],
        offBoard: [0, 0] as [number, number],
      };
      
      // Set up a black piece (blot) at point 5
      boardState.board[4] = [0, 1]; // Black has 1 piece at point 5
      
      const result = hitPiece(boardState, 4, PlayerColor.WHITE);
      
      // Black piece should be removed from the board
      expect(result.board[4][1]).toBe(0);
      
      // Black piece should be added to the bar
      expect(result.bar[1]).toBe(1);
      
      // White bar should remain unchanged
      expect(result.bar[0]).toBe(0);
    });

    test('handles multiple pieces on bar correctly', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [1, 2] as [number, number], // White has 1, Black has 2 on bar
        offBoard: [0, 0] as [number, number],
      };
      
      // Set up a black piece (blot) at point 10
      boardState.board[9] = [0, 1]; // Black has 1 piece at point 10
      
      const result = hitPiece(boardState, 9, PlayerColor.WHITE);
      
      // Black piece should be removed from the board
      expect(result.board[9][1]).toBe(0);
      
      // Black bar should be incremented
      expect(result.bar[1]).toBe(3);
      
      // White bar should remain unchanged
      expect(result.bar[0]).toBe(1);
    });

    test('does not affect pieces when no hit occurs', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [0, 0] as [number, number],
        offBoard: [0, 0] as [number, number],
      };
      
      // Set up a black piece (not a blot) at point 5
      boardState.board[4] = [0, 2]; // Black has 2 pieces at point 5 (not a blot)
      
      const result = hitPiece(boardState, 4, PlayerColor.WHITE);
      
      // Black pieces should remain on the board
      expect(result.board[4][1]).toBe(2);
      
      // Bar should remain unchanged
      expect(result.bar[1]).toBe(0);
    });
  });

  describe('Blot Detection', () => {
    test('identifies single pieces as blots', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [0, 0] as [number, number],
        offBoard: [0, 0] as [number, number],
      };
      
      // Set up single pieces
      boardState.board[0] = [1, 0]; // White single piece
      boardState.board[5] = [0, 1]; // Black single piece
      
      expect(isBlot(boardState, 0, PlayerColor.WHITE)).toBe(true);
      expect(isBlot(boardState, 5, PlayerColor.BLACK)).toBe(true);
    });

    test('does not identify multiple pieces as blots', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [0, 0] as [number, number],
        offBoard: [0, 0] as [number, number],
      };
      
      // Set up multiple pieces
      boardState.board[0] = [2, 0]; // White has 2 pieces
      boardState.board[5] = [0, 3]; // Black has 3 pieces
      
      expect(isBlot(boardState, 0, PlayerColor.WHITE)).toBe(false);
      expect(isBlot(boardState, 5, PlayerColor.BLACK)).toBe(false);
    });

    test('does not identify empty points as blots', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [0, 0] as [number, number],
        offBoard: [0, 0] as [number, number],
      };
      
      expect(isBlot(boardState, 0, PlayerColor.WHITE)).toBe(false);
      expect(isBlot(boardState, 0, PlayerColor.BLACK)).toBe(false);
    });
  });

  describe('Can Hit Blot Function', () => {
    test('allows hitting opponent blots', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [0, 0] as [number, number],
        offBoard: [0, 0] as [number, number],
      };
      
      // Set up opponent blot at destination
      boardState.board[5] = [0, 1]; // Black blot at point 6
      
      const result = canHitBlot(boardState, 0, 5, PlayerColor.WHITE);
      expect(result).toBe(true);
    });

    test('prevents hitting when opponent has multiple pieces', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [0, 0] as [number, number],
        offBoard: [0, 0] as [number, number],
      };
      
      // Set up opponent with multiple pieces at destination
      boardState.board[5] = [0, 2]; // Black has 2 pieces at point 6
      
      const result = canHitBlot(boardState, 0, 5, PlayerColor.WHITE);
      expect(result).toBe(false);
    });

    test('prevents hitting own pieces', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [0, 0] as [number, number],
        offBoard: [0, 0] as [number, number],
      };
      
      // Set up own piece at destination
      boardState.board[5] = [1, 0]; // White piece at point 6
      
      const result = canHitBlot(boardState, 0, 5, PlayerColor.WHITE);
      expect(result).toBe(false);
    });
  });

  describe('Move Execution with Hit Pieces', () => {
    test('executes move and hits opponent blot', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [0, 0] as [number, number],
        offBoard: [0, 0] as [number, number],
      };
      
      // Set up white piece at point 1 and black blot at point 4
      boardState.board[0] = [1, 0]; // White piece at point 1
      boardState.board[3] = [0, 1]; // Black blot at point 4
      
      // Simulate move from point 1 to point 4 (using die 3)
      const newBoardState = { ...boardState };
      newBoardState.board[0][0]--; // Remove white piece from point 1
      newBoardState.board[3][0]++; // Add white piece to point 4
      
      // Handle hit piece
      if (isBlot(newBoardState, 3, PlayerColor.BLACK)) {
        const updatedState = hitPiece(newBoardState, 3, PlayerColor.WHITE);
        newBoardState.board = updatedState.board;
        newBoardState.bar = updatedState.bar;
      }
      
      // Verify results
      expect(newBoardState.board[0][0]).toBe(0); // White piece removed from point 1
      expect(newBoardState.board[3][0]).toBe(1); // White piece added to point 4
      expect(newBoardState.board[3][1]).toBe(0); // Black piece removed from point 4
      expect(newBoardState.bar[1]).toBe(1); // Black piece added to bar
    });

    test('executes move without hitting when opponent has multiple pieces', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [0, 0] as [number, number],
        offBoard: [0, 0] as [number, number],
      };
      
      // Set up white piece at point 1 and black with multiple pieces at point 4
      boardState.board[0] = [1, 0]; // White piece at point 1
      boardState.board[3] = [0, 2]; // Black has 2 pieces at point 4
      
      // Simulate move from point 1 to point 4 (using die 3)
      const newBoardState = { ...boardState };
      newBoardState.board[0][0]--; // Remove white piece from point 1
      newBoardState.board[3][0]++; // Add white piece to point 4
      
      // Handle hit piece (should not hit since black has multiple pieces)
      if (isBlot(newBoardState, 3, PlayerColor.BLACK)) {
        const updatedState = hitPiece(newBoardState, 3, PlayerColor.WHITE);
        newBoardState.board = updatedState.board;
        newBoardState.bar = updatedState.bar;
      }
      
      // Verify results
      expect(newBoardState.board[0][0]).toBe(0); // White piece removed from point 1
      expect(newBoardState.board[3][0]).toBe(1); // White piece added to point 4
      expect(newBoardState.board[3][1]).toBe(2); // Black pieces remain at point 4
      expect(newBoardState.bar[1]).toBe(0); // No pieces added to bar
    });
  });

  describe('UI Integration', () => {
    test('shows bar status when pieces are hit', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [0, 1] as [number, number], // Black has 1 piece on bar
        offBoard: [0, 0] as [number, number],
      };
      
      mockStore.boardState = boardState;
      (hasPiecesOnBar as jest.Mock).mockReturnValue(true);
      
      render(<Backgammon />);
      
      expect(screen.getByText(/Black has 1 piece\(s\) on bar/)).toBeInTheDocument();
    });

    test('shows bar re-entry warning when pieces are on bar', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [0, 2] as [number, number], // Black has 2 pieces on bar
        offBoard: [0, 0] as [number, number],
      };
      
      mockStore.boardState = boardState;
      mockStore.turn = PlayerColor.BLACK;
      (hasPiecesOnBar as jest.Mock).mockReturnValue(true);
      
      render(<Backgammon />);
      
      expect(screen.getByText(/Black has 2 piece\(s\) on bar/)).toBeInTheDocument();
      expect(screen.getByText(/Must re-enter before making other moves/)).toBeInTheDocument();
    });
  });

  describe('Game Flow with Hit Pieces', () => {
    test('player must re-enter from bar after being hit', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [0, 1] as [number, number], // Black has 1 piece on bar
        offBoard: [0, 0] as [number, number],
      };
      
      mockStore.boardState = boardState;
      mockStore.turn = PlayerColor.BLACK;
      (hasPiecesOnBar as jest.Mock).mockReturnValue(true);
      (getBarReentryMoves as jest.Mock).mockReturnValue([[25, 20]]); // Can re-enter at point 21
      
      render(<Backgammon />);
      
      // Should show bar re-entry warning
      expect(screen.getByText(/Must re-enter before making other moves/)).toBeInTheDocument();
    });

    test('player can continue normal moves after re-entering from bar', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [0, 0] as [number, number], // No pieces on bar
        offBoard: [0, 0] as [number, number],
      };
      
      mockStore.boardState = boardState;
      mockStore.turn = PlayerColor.BLACK;
      (hasPiecesOnBar as jest.Mock).mockReturnValue(false);
      
      render(<Backgammon />);
      
      // Should not show bar re-entry warning
      expect(screen.queryByText(/Must re-enter before making other moves/)).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    test('handles multiple hits in sequence', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [0, 0] as [number, number],
        offBoard: [0, 0] as [number, number],
      };
      
      // Set up multiple blots
      boardState.board[0] = [1, 0]; // White piece at point 1
      boardState.board[3] = [0, 1]; // Black blot at point 4
      boardState.board[6] = [0, 1]; // Black blot at point 7
      
      // First hit
      let newState = hitPiece(boardState, 3, PlayerColor.WHITE);
      expect(newState.bar[1]).toBe(1);
      
      // Second hit
      newState = hitPiece(newState, 6, PlayerColor.WHITE);
      expect(newState.bar[1]).toBe(2);
    });

    test('handles hit pieces when bar already has pieces', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [0, 3] as [number, number], // Black already has 3 pieces on bar
        offBoard: [0, 0] as [number, number],
      };
      
      // Set up a black blot
      boardState.board[5] = [0, 1]; // Black blot at point 6
      
      const result = hitPiece(boardState, 5, PlayerColor.WHITE);
      
      expect(result.bar[1]).toBe(4); // Should increment to 4
    });

    test('handles hit pieces for both players', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [0, 0] as [number, number],
        offBoard: [0, 0] as [number, number],
      };
      
      // Set up white and black blots
      boardState.board[0] = [1, 0]; // White blot at point 1
      boardState.board[5] = [0, 1]; // Black blot at point 6
      
      // White hits black
      let newState = hitPiece(boardState, 5, PlayerColor.WHITE);
      expect(newState.bar[1]).toBe(1); // Black piece on bar
      
      // Black hits white
      newState = hitPiece(newState, 0, PlayerColor.BLACK);
      expect(newState.bar[0]).toBe(1); // White piece on bar
    });
  });

  describe('Bot AI Integration', () => {
    test('bot considers hitting opponent blots as strategic moves', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [0, 0] as [number, number],
        offBoard: [0, 0] as [number, number],
      };
      
      // Set up bot piece and opponent blot
      boardState.board[0] = [0, 1]; // Black (bot) piece at point 1
      boardState.board[3] = [1, 0]; // White blot at point 4
      
      mockStore.boardState = boardState;
      mockStore.turn = PlayerColor.BLACK;
      mockStore.botDifficulty = BotDifficulty.HARD;
      (canHitBlot as jest.Mock).mockReturnValue(true);
      
      render(<Backgammon />);
      
      // Bot should consider hitting the blot
      expect(canHitBlot).toHaveBeenCalled();
    });
  });
}); 

describe('Backgammon Enhanced Board Representation', () => {
  const mockStore = {
    boardState: {
      board: Array.from({ length: 24 }, () => [0, 0]),
      bar: [0, 0] as [number, number],
      offBoard: [0, 0] as [number, number],
    },
    turn: PlayerColor.WHITE,
    message: 'White to roll',
    gameState: 'playing',
    dice: [3, 4],
    usedDice: [],
    history: [],
    historyIndex: 0,
    stats: { wins: 0, losses: 0, totalGames: 0 },
    botDifficulty: BotDifficulty.MEDIUM,
    gameMode: GameMode.HUMAN_VS_BOT,
    setBoardState: jest.fn(),
    setTurn: jest.fn(),
    setMessage: jest.fn(),
    setGameState: jest.fn(),
    setDice: jest.fn(),
    setUsedDice: jest.fn(),
    resetGame: jest.fn(),
    pushHistory: jest.fn(),
    stepHistory: jest.fn(),
    updateStats: jest.fn(),
    resetStats: jest.fn(),
    setBotDifficulty: jest.fn(),
    setGameMode: jest.fn(),
    saveGame: jest.fn(),
    loadGame: jest.fn(),
    hasSavedGame: jest.fn(),
    rollDice: jest.fn(),
  };

  beforeEach(() => {
    mockUseBackgammonStore.mockReturnValue(mockStore);
    jest.clearAllMocks();
  });

  describe('Board Constants', () => {
    test('exports correct board constants', () => {
      expect(BOARD_CONSTANTS.BOARD_SIZE).toBe(24);
      expect(BOARD_CONSTANTS.BAR_WHITE).toBe(25);
      expect(BOARD_CONSTANTS.BAR_BLACK).toBe(26);
      expect(BOARD_CONSTANTS.OFF_WHITE).toBe(27);
      expect(BOARD_CONSTANTS.OFF_BLACK).toBe(28);
    });
  });

  describe('Board Point Representation', () => {
    test('returns regular board points correctly', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [0, 0] as [number, number],
        offBoard: [0, 0] as [number, number],
      };
      
      boardState.board[5] = [2, 1]; // White: 2, Black: 1 at point 6
      
      const result = getBoardPointRepresentation(boardState, 5);
      expect(result).toEqual([2, 1]);
    });

    test('returns bar representation correctly', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [3, 2] as [number, number], // White: 3, Black: 2 on bar
        offBoard: [0, 0] as [number, number],
      };
      
      const result = getBoardPointRepresentation(boardState, BOARD_CONSTANTS.BAR_WHITE);
      expect(result).toEqual([3, 2]);
    });

    test('returns off-board representation correctly', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [0, 0] as [number, number],
        offBoard: [5, 3] as [number, number], // White: 5, Black: 3 borne off
      };
      
      const whiteOffResult = getBoardPointRepresentation(boardState, BOARD_CONSTANTS.OFF_WHITE);
      expect(whiteOffResult).toEqual([5, 0]);
      
      const blackOffResult = getBoardPointRepresentation(boardState, BOARD_CONSTANTS.OFF_BLACK);
      expect(blackOffResult).toEqual([0, 3]);
    });

    test('returns empty array for invalid point indices', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [0, 0] as [number, number],
        offBoard: [0, 0] as [number, number],
      };
      
      const result = getBoardPointRepresentation(boardState, 100);
      expect(result).toEqual([0, 0]);
    });
  });

  describe('Point Type Detection', () => {
    test('identifies bar points correctly', () => {
      expect(isBarPoint(BOARD_CONSTANTS.BAR_WHITE)).toBe(true);
      expect(isBarPoint(BOARD_CONSTANTS.BAR_BLACK)).toBe(true);
      expect(isBarPoint(5)).toBe(false);
      expect(isBarPoint(BOARD_CONSTANTS.OFF_WHITE)).toBe(false);
    });

    test('identifies off-board points correctly', () => {
      expect(isOffBoardPoint(BOARD_CONSTANTS.OFF_WHITE)).toBe(true);
      expect(isOffBoardPoint(BOARD_CONSTANTS.OFF_BLACK)).toBe(true);
      expect(isOffBoardPoint(5)).toBe(false);
      expect(isOffBoardPoint(BOARD_CONSTANTS.BAR_WHITE)).toBe(false);
    });

    test('identifies special points correctly', () => {
      expect(isSpecialPoint(BOARD_CONSTANTS.BAR_WHITE)).toBe(true);
      expect(isSpecialPoint(BOARD_CONSTANTS.BAR_BLACK)).toBe(true);
      expect(isSpecialPoint(BOARD_CONSTANTS.OFF_WHITE)).toBe(true);
      expect(isSpecialPoint(BOARD_CONSTANTS.OFF_BLACK)).toBe(true);
      expect(isSpecialPoint(5)).toBe(false);
    });
  });

  describe('Point Labels', () => {
    test('returns correct labels for regular points', () => {
      expect(getPointLabel(0)).toBe('1');
      expect(getPointLabel(5)).toBe('6');
      expect(getPointLabel(23)).toBe('24');
    });

    test('returns correct labels for special points', () => {
      expect(getPointLabel(BOARD_CONSTANTS.BAR_WHITE)).toBe('Bar');
      expect(getPointLabel(BOARD_CONSTANTS.BAR_BLACK)).toBe('Bar');
      expect(getPointLabel(BOARD_CONSTANTS.OFF_WHITE)).toBe('White Off');
      expect(getPointLabel(BOARD_CONSTANTS.OFF_BLACK)).toBe('Black Off');
    });

    test('returns empty string for invalid points', () => {
      expect(getPointLabel(100)).toBe('');
    });
  });

  describe('Point Styles', () => {
    test('returns correct styles for bar points', () => {
      const barStyle = getPointStyle(BOARD_CONSTANTS.BAR_WHITE);
      expect(barStyle.background).toBe('#8B0000');
      expect(barStyle.border).toBe('2px solid #660000');
      expect(barStyle.cursor).toBe('pointer');
    });

    test('returns correct styles for off-board points', () => {
      const whiteOffStyle = getPointStyle(BOARD_CONSTANTS.OFF_WHITE);
      expect(whiteOffStyle.background).toBe('#f0f0f0');
      expect(whiteOffStyle.border).toBe('2px solid #ccc');
      expect(whiteOffStyle.cursor).toBe('pointer');
      
      const blackOffStyle = getPointStyle(BOARD_CONSTANTS.OFF_BLACK);
      expect(blackOffStyle.background).toBe('#333');
      expect(blackOffStyle.border).toBe('2px solid #666');
      expect(blackOffStyle.cursor).toBe('pointer');
    });

    test('returns correct styles for regular points', () => {
      const regularStyle = getPointStyle(5);
      expect(regularStyle.background).toBe('#DEB887');
      expect(regularStyle.border).toBe('1px solid #666');
      expect(regularStyle.cursor).toBe('pointer');
    });
  });

  describe('Point Clickability', () => {
    test('allows clicking bar when player has pieces on bar', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [1, 0] as [number, number], // White has 1 piece on bar
        offBoard: [0, 0] as [number, number],
      };
      
      (hasPiecesOnBar as jest.Mock).mockReturnValue(true);
      
      const result = canClickPoint(boardState, BOARD_CONSTANTS.BAR_WHITE, PlayerColor.WHITE);
      expect(result).toBe(true);
    });

    test('prevents clicking bar when player has no pieces on bar', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [0, 0] as [number, number], // No pieces on bar
        offBoard: [0, 0] as [number, number],
      };
      
      (hasPiecesOnBar as jest.Mock).mockReturnValue(false);
      
      const result = canClickPoint(boardState, BOARD_CONSTANTS.BAR_WHITE, PlayerColor.WHITE);
      expect(result).toBe(false);
    });

    test('allows clicking off-board when player can bear off', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [0, 0] as [number, number],
        offBoard: [0, 0] as [number, number],
      };
      
      (canBearOff as jest.Mock).mockReturnValue(true);
      
      const result = canClickPoint(boardState, BOARD_CONSTANTS.OFF_WHITE, PlayerColor.WHITE);
      expect(result).toBe(true);
    });

    test('prevents clicking off-board when player cannot bear off', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [0, 0] as [number, number],
        offBoard: [0, 0] as [number, number],
      };
      
      (canBearOff as jest.Mock).mockReturnValue(false);
      
      const result = canClickPoint(boardState, BOARD_CONSTANTS.OFF_WHITE, PlayerColor.WHITE);
      expect(result).toBe(false);
    });

    test('allows clicking regular points when player has pieces', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [0, 0] as [number, number],
        offBoard: [0, 0] as [number, number],
      };
      
      boardState.board[5] = [2, 0]; // White has 2 pieces at point 6
      
      const result = canClickPoint(boardState, 5, PlayerColor.WHITE);
      expect(result).toBe(true);
    });

    test('prevents clicking regular points when player has no pieces', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [0, 0] as [number, number],
        offBoard: [0, 0] as [number, number],
      };
      
      boardState.board[5] = [0, 2]; // Only black pieces at point 6
      
      const result = canClickPoint(boardState, 5, PlayerColor.WHITE);
      expect(result).toBe(false);
    });
  });

  describe('UI Integration', () => {
    test('renders bar with correct piece counts', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [2, 1] as [number, number], // White: 2, Black: 1 on bar
        offBoard: [0, 0] as [number, number],
      };
      
      mockStore.boardState = boardState;
      (canClickPoint as jest.Mock).mockReturnValue(true);
      
      render(<Backgammon />);
      
      expect(screen.getByText('White: 2')).toBeInTheDocument();
      expect(screen.getByText('Black: 1')).toBeInTheDocument();
    });

    test('renders off-board areas with correct piece counts', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [0, 0] as [number, number],
        offBoard: [3, 2] as [number, number], // White: 3, Black: 2 borne off
      };
      
      mockStore.boardState = boardState;
      (canClickPoint as jest.Mock).mockReturnValue(true);
      
      render(<Backgammon />);
      
      expect(screen.getByText('Pieces: 3')).toBeInTheDocument();
      expect(screen.getByText('Pieces: 2')).toBeInTheDocument();
    });

    test('shows click instructions for bar when pieces are on bar', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [1, 0] as [number, number], // White has 1 piece on bar
        offBoard: [0, 0] as [number, number],
      };
      
      mockStore.boardState = boardState;
      (canClickPoint as jest.Mock).mockReturnValue(true);
      
      render(<Backgammon />);
      
      expect(screen.getByText('Click to re-enter')).toBeInTheDocument();
    });

    test('shows click instructions for off-board when bearing off is possible', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [0, 0] as [number, number],
        offBoard: [0, 0] as [number, number],
      };
      
      mockStore.boardState = boardState;
      (canClickPoint as jest.Mock).mockReturnValue(true);
      
      render(<Backgammon />);
      
      expect(screen.getByText('Click to bear off')).toBeInTheDocument();
    });
  });

  describe('Move Handling with Enhanced Board', () => {
    test('handles bar re-entry moves correctly', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [1, 0] as [number, number], // White has 1 piece on bar
        offBoard: [0, 0] as [number, number],
      };
      
      mockStore.boardState = boardState;
      mockStore.dice = [3, 4];
      (hasPiecesOnBar as jest.Mock).mockReturnValue(true);
      (getBarReentryMoves as jest.Mock).mockReturnValue([[BOARD_CONSTANTS.BAR_WHITE, 20]]);
      
      render(<Backgammon />);
      
      // Should handle bar clicks correctly
      expect(hasPiecesOnBar).toHaveBeenCalled();
    });

    test('handles bearing off moves correctly', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [0, 0] as [number, number],
        offBoard: [0, 0] as [number, number],
      };
      
      mockStore.boardState = boardState;
      (canBearOff as jest.Mock).mockReturnValue(true);
      
      render(<Backgammon />);
      
      // Should handle off-board clicks correctly
      expect(canBearOff).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    test('handles empty board state correctly', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [0, 0] as [number, number],
        offBoard: [0, 0] as [number, number],
      };
      
      const result = getBoardPointRepresentation(boardState, 5);
      expect(result).toEqual([0, 0]);
    });

    test('handles maximum piece counts correctly', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [15, 15] as [number, number], // Maximum pieces on bar
        offBoard: [15, 15] as [number, number], // Maximum pieces borne off
      };
      
      const barResult = getBoardPointRepresentation(boardState, BOARD_CONSTANTS.BAR_WHITE);
      expect(barResult).toEqual([15, 15]);
      
      const offResult = getBoardPointRepresentation(boardState, BOARD_CONSTANTS.OFF_WHITE);
      expect(offResult).toEqual([15, 0]);
    });

    test('handles invalid point indices gracefully', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [0, 0] as [number, number],
        offBoard: [0, 0] as [number, number],
      };
      
      const result = getBoardPointRepresentation(boardState, -1);
      expect(result).toEqual([0, 0]);
      
      const result2 = getBoardPointRepresentation(boardState, 100);
      expect(result2).toEqual([0, 0]);
    });
  });
}); 

describe('Backgammon Enhanced Blot Concept', () => {
  const mockStore = {
    boardState: {
      board: Array.from({ length: 24 }, () => [0, 0]),
      bar: [0, 0] as [number, number],
      offBoard: [0, 0] as [number, number],
    },
    turn: PlayerColor.WHITE,
    message: 'White to roll',
    gameState: 'playing',
    dice: [3, 4],
    usedDice: [],
    history: [],
    historyIndex: 0,
    stats: { wins: 0, losses: 0, totalGames: 0 },
    botDifficulty: BotDifficulty.MEDIUM,
    gameMode: GameMode.HUMAN_VS_BOT,
    setBoardState: jest.fn(),
    setTurn: jest.fn(),
    setMessage: jest.fn(),
    setGameState: jest.fn(),
    setDice: jest.fn(),
    setUsedDice: jest.fn(),
    resetGame: jest.fn(),
    pushHistory: jest.fn(),
    stepHistory: jest.fn(),
    updateStats: jest.fn(),
    resetStats: jest.fn(),
    setBotDifficulty: jest.fn(),
    setGameMode: jest.fn(),
    saveGame: jest.fn(),
    loadGame: jest.fn(),
    hasSavedGame: jest.fn(),
    rollDice: jest.fn(),
  };

  beforeEach(() => {
    mockUseBackgammonStore.mockReturnValue(mockStore);
    jest.clearAllMocks();
  });

  describe('Blot Detection', () => {
    test('identifies all blots for a player', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [0, 0] as [number, number],
        offBoard: [0, 0] as [number, number],
      };
      
      // Set up multiple blots
      boardState.board[0] = [1, 0]; // White blot at point 1
      boardState.board[5] = [1, 0]; // White blot at point 6
      boardState.board[10] = [0, 1]; // Black blot at point 11
      boardState.board[15] = [2, 0]; // White has 2 pieces (not a blot)
      
      const whiteBlots = getAllBlots(boardState, PlayerColor.WHITE);
      const blackBlots = getAllBlots(boardState, PlayerColor.BLACK);
      
      expect(whiteBlots).toEqual([0, 5]);
      expect(blackBlots).toEqual([10]);
    });

    test('returns empty array when no blots exist', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [0, 0] as [number, number],
        offBoard: [0, 0] as [number, number],
      };
      
      // Set up pieces but no blots
      boardState.board[0] = [2, 0]; // White has 2 pieces
      boardState.board[5] = [0, 3]; // Black has 3 pieces
      
      const whiteBlots = getAllBlots(boardState, PlayerColor.WHITE);
      const blackBlots = getAllBlots(boardState, PlayerColor.BLACK);
      
      expect(whiteBlots).toEqual([]);
      expect(blackBlots).toEqual([]);
    });

    test('counts blots correctly', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [0, 0] as [number, number],
        offBoard: [0, 0] as [number, number],
      };
      
      // Set up multiple blots
      boardState.board[0] = [1, 0]; // White blot
      boardState.board[5] = [1, 0]; // White blot
      boardState.board[10] = [0, 1]; // Black blot
      boardState.board[15] = [0, 1]; // Black blot
      
      expect(getBlotCount(boardState, PlayerColor.WHITE)).toBe(2);
      expect(getBlotCount(boardState, PlayerColor.BLACK)).toBe(2);
    });
  });

  describe('Blot Vulnerability Analysis', () => {
    test('identifies vulnerable blots correctly', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [0, 0] as [number, number],
        offBoard: [0, 0] as [number, number],
      };
      
      // Set up a white blot at point 5
      boardState.board[4] = [1, 0]; // White blot at point 5
      // Set up black pieces that can reach the blot
      boardState.board[1] = [0, 2]; // Black pieces at point 2 (can reach point 5 with die 3)
      
      const isVulnerable = isPointVulnerable(boardState, 4, PlayerColor.WHITE);
      expect(isVulnerable).toBe(true);
    });

    test('identifies non-vulnerable blots correctly', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [0, 0] as [number, number],
        offBoard: [0, 0] as [number, number],
      };
      
      // Set up a white blot at point 23 (far end)
      boardState.board[22] = [1, 0]; // White blot at point 23
      // Set up black pieces that cannot reach the blot
      boardState.board[0] = [0, 2]; // Black pieces at point 1 (too far)
      
      const isVulnerable = isPointVulnerable(boardState, 22, PlayerColor.WHITE);
      expect(isVulnerable).toBe(false);
    });

    test('finds all vulnerable blots', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [0, 0] as [number, number],
        offBoard: [0, 0] as [number, number],
      };
      
      // Set up multiple white blots
      boardState.board[4] = [1, 0]; // White blot at point 5 (vulnerable)
      boardState.board[10] = [1, 0]; // White blot at point 11 (not vulnerable)
      boardState.board[22] = [1, 0]; // White blot at point 23 (not vulnerable)
      
      // Set up black pieces that can reach point 5
      boardState.board[1] = [0, 2]; // Black pieces at point 2 (can reach point 5 with die 3)
      
      const vulnerableBlots = getVulnerableBlots(boardState, PlayerColor.WHITE);
      expect(vulnerableBlots).toEqual([4]); // Only point 5 is vulnerable
    });
  });

  describe('Blot Risk Assessment', () => {
    test('assesses high risk blots correctly', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [0, 0] as [number, number],
        offBoard: [0, 0] as [number, number],
      };
      
      // Set up a white blot at point 5
      boardState.board[4] = [1, 0]; // White blot at point 5
      // Set up multiple black pieces that can reach the blot
      boardState.board[1] = [0, 3]; // Black has 3 pieces at point 2 (can reach point 5 with die 3)
      boardState.board[2] = [0, 2]; // Black has 2 pieces at point 3 (can reach point 5 with die 2)
      
      const riskLevel = getBlotRiskLevel(boardState, 4, PlayerColor.WHITE);
      expect(riskLevel).toBe('high');
    });

    test('assesses medium risk blots correctly', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [0, 0] as [number, number],
        offBoard: [0, 0] as [number, number],
      };
      
      // Set up a white blot at point 5
      boardState.board[4] = [1, 0]; // White blot at point 5
      // Set up black pieces that can reach the blot
      boardState.board[1] = [0, 2]; // Black has 2 pieces at point 2 (can reach point 5 with die 3)
      
      const riskLevel = getBlotRiskLevel(boardState, 4, PlayerColor.WHITE);
      expect(riskLevel).toBe('medium');
    });

    test('assesses low risk blots correctly', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [0, 0] as [number, number],
        offBoard: [0, 0] as [number, number],
      };
      
      // Set up a white blot at point 5
      boardState.board[4] = [1, 0]; // White blot at point 5
      // Set up black pieces that can reach the blot
      boardState.board[1] = [0, 1]; // Black has 1 piece at point 2 (can reach point 5 with die 3)
      
      const riskLevel = getBlotRiskLevel(boardState, 4, PlayerColor.WHITE);
      expect(riskLevel).toBe('low');
    });

    test('returns low risk for non-blots', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [0, 0] as [number, number],
        offBoard: [0, 0] as [number, number],
      };
      
      // Set up multiple pieces (not a blot)
      boardState.board[4] = [2, 0]; // White has 2 pieces at point 5
      
      const riskLevel = getBlotRiskLevel(boardState, 4, PlayerColor.WHITE);
      expect(riskLevel).toBe('low');
    });
  });

  describe('Blot Strategic Functions', () => {
    test('finds blot protection moves', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [0, 0] as [number, number],
        offBoard: [0, 0] as [number, number],
      };
      
      // Set up a vulnerable white blot
      boardState.board[4] = [1, 0]; // White blot at point 5
      boardState.board[1] = [0, 2]; // Black pieces at point 2 (can reach point 5)
      
      // Set up white pieces that can protect the blot
      boardState.board[0] = [2, 0]; // White pieces at point 1 (can move to point 5 with die 4)
      
      const protectionMoves = getBlotProtectionMoves(boardState, PlayerColor.WHITE, [4], []);
      expect(protectionMoves.length).toBeGreaterThan(0);
    });

    test('finds blot attack moves', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [0, 0] as [number, number],
        offBoard: [0, 0] as [number, number],
      };
      
      // Set up a black blot
      boardState.board[4] = [0, 1]; // Black blot at point 5
      
      // Set up white pieces that can attack the blot
      boardState.board[1] = [2, 0]; // White pieces at point 2 (can reach point 5 with die 3)
      
      const attackMoves = getBlotAttackMoves(boardState, PlayerColor.WHITE, [3], []);
      expect(attackMoves.length).toBeGreaterThan(0);
    });

    test('calculates blot strategic value', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [0, 0] as [number, number],
        offBoard: [0, 0] as [number, number],
      };
      
      // Set up a white blot in home board
      boardState.board[20] = [1, 0]; // White blot at point 21 (home board)
      
      const strategicValue = getBlotStrategicValue(boardState, 20, PlayerColor.WHITE);
      expect(strategicValue).toBeGreaterThan(0);
    });
  });

  describe('Blot Status Messages', () => {
    test('generates status message for no blots', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [0, 0] as [number, number],
        offBoard: [0, 0] as [number, number],
      };
      
      const message = getBlotStatusMessage(boardState, PlayerColor.WHITE);
      expect(message).toBe('');
    });

    test('generates status message for non-vulnerable blots', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [0, 0] as [number, number],
        offBoard: [0, 0] as [number, number],
      };
      
      // Set up white blots that are not vulnerable
      boardState.board[22] = [1, 0]; // White blot at point 23 (not vulnerable)
      boardState.board[23] = [1, 0]; // White blot at point 24 (not vulnerable)
      
      const message = getBlotStatusMessage(boardState, PlayerColor.WHITE);
      expect(message).toContain('2 blot(s) but none are vulnerable');
    });

    test('generates status message for high risk blots', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [0, 0] as [number, number],
        offBoard: [0, 0] as [number, number],
      };
      
      // Set up vulnerable white blots
      boardState.board[4] = [1, 0]; // White blot at point 5
      boardState.board[1] = [0, 3]; // Black has 3 pieces at point 2 (high risk)
      
      const message = getBlotStatusMessage(boardState, PlayerColor.WHITE);
      expect(message).toContain('high risk');
    });

    test('generates status message for medium risk blots', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [0, 0] as [number, number],
        offBoard: [0, 0] as [number, number],
      };
      
      // Set up vulnerable white blots
      boardState.board[4] = [1, 0]; // White blot at point 5
      boardState.board[1] = [0, 2]; // Black has 2 pieces at point 2 (medium risk)
      
      const message = getBlotStatusMessage(boardState, PlayerColor.WHITE);
      expect(message).toContain('medium risk');
    });
  });

  describe('UI Integration', () => {
    test('shows blot status message in UI', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [0, 0] as [number, number],
        offBoard: [0, 0] as [number, number],
      };
      
      // Set up vulnerable white blots
      boardState.board[4] = [1, 0]; // White blot at point 5
      boardState.board[1] = [0, 3]; // Black has 3 pieces at point 2 (high risk)
      
      mockStore.boardState = boardState;
      (getBlotStatusMessage as jest.Mock).mockReturnValue('⚠️ You have 1 vulnerable blot(s) - 1 at high risk!');
      
      render(<Backgammon />);
      
      expect(screen.getByText(/high risk/)).toBeInTheDocument();
    });

    test('shows different colors for different risk levels', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [0, 0] as [number, number],
        offBoard: [0, 0] as [number, number],
      };
      
      mockStore.boardState = boardState;
      (getBlotStatusMessage as jest.Mock).mockReturnValue('⚠️ You have 1 vulnerable blot(s) - 1 at high risk!');
      
      render(<Backgammon />);
      
      // The message should be rendered with appropriate styling
      expect(screen.getByText(/high risk/)).toBeInTheDocument();
    });
  });

  describe('Bot AI Integration', () => {
    test('bot considers blot vulnerability in strategy', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [0, 0] as [number, number],
        offBoard: [0, 0] as [number, number],
      };
      
      // Set up vulnerable opponent blots
      boardState.board[4] = [0, 1]; // Black blot at point 5
      boardState.board[1] = [2, 0]; // White pieces at point 2 (can attack)
      
      mockStore.boardState = boardState;
      mockStore.turn = PlayerColor.WHITE;
      mockStore.botDifficulty = BotDifficulty.HARD;
      (getBlotAttackMoves as jest.Mock).mockReturnValue([[1, 4]]);
      
      render(<Backgammon />);
      
      // Bot should consider attacking blots
      expect(getBlotAttackMoves).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    test('handles multiple blots with different risk levels', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [0, 0] as [number, number],
        offBoard: [0, 0] as [number, number],
      };
      
      // Set up multiple white blots with different risk levels
      boardState.board[4] = [1, 0]; // White blot at point 5 (high risk)
      boardState.board[10] = [1, 0]; // White blot at point 11 (low risk)
      boardState.board[1] = [0, 3]; // Black has 3 pieces at point 2 (can reach point 5)
      boardState.board[7] = [0, 1]; // Black has 1 piece at point 8 (can reach point 11)
      
      const vulnerableBlots = getVulnerableBlots(boardState, PlayerColor.WHITE);
      expect(vulnerableBlots.length).toBe(2);
      
      const riskLevel1 = getBlotRiskLevel(boardState, 4, PlayerColor.WHITE);
      const riskLevel2 = getBlotRiskLevel(boardState, 10, PlayerColor.WHITE);
      expect(riskLevel1).toBe('high');
      expect(riskLevel2).toBe('low');
    });

    test('handles blots in home board correctly', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [0, 0] as [number, number],
        offBoard: [0, 0] as [number, number],
      };
      
      // Set up white blot in home board
      boardState.board[20] = [1, 0]; // White blot at point 21 (home board)
      
      const strategicValue = getBlotStrategicValue(boardState, 20, PlayerColor.WHITE);
      expect(strategicValue).toBeGreaterThan(1); // Should have extra value for home board
    });

    test('handles empty board state correctly', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [0, 0] as [number, number],
        offBoard: [0, 0] as [number, number],
      };
      
      const blots = getAllBlots(boardState, PlayerColor.WHITE);
      const vulnerableBlots = getVulnerableBlots(boardState, PlayerColor.WHITE);
      const message = getBlotStatusMessage(boardState, PlayerColor.WHITE);
      
      expect(blots).toEqual([]);
      expect(vulnerableBlots).toEqual([]);
      expect(message).toBe('');
    });
  });
});

describe('Backgammon Gammon Detection', () => {
  const mockStore = {
    boardState: {
      board: Array.from({ length: 24 }, () => [0, 0]),
      bar: [0, 0] as [number, number],
      offBoard: [0, 0] as [number, number],
    },
    turn: PlayerColor.WHITE,
    message: 'White to roll',
    gameState: 'playing',
    dice: [3, 4],
    usedDice: [],
    history: [],
    historyIndex: 0,
    stats: { wins: 0, losses: 0, totalGames: 0 },
    botDifficulty: BotDifficulty.MEDIUM,
    gameMode: GameMode.HUMAN_VS_BOT,
    setBoardState: jest.fn(),
    setTurn: jest.fn(),
    setMessage: jest.fn(),
    setGameState: jest.fn(),
    setDice: jest.fn(),
    setUsedDice: jest.fn(),
    resetGame: jest.fn(),
    pushHistory: jest.fn(),
    stepHistory: jest.fn(),
    updateStats: jest.fn(),
    resetStats: jest.fn(),
    setBotDifficulty: jest.fn(),
    setGameMode: jest.fn(),
    saveGame: jest.fn(),
    loadGame: jest.fn(),
    hasSavedGame: jest.fn(),
    rollDice: jest.fn(),
  };

  beforeEach(() => {
    mockUseBackgammonStore.mockReturnValue(mockStore);
    jest.clearAllMocks();
  });

  describe('Win Detection', () => {
    test('detects normal win when player bears off all pieces', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [0, 0] as [number, number],
        offBoard: [15, 0] as [number, number], // White has borne off all 15 pieces
      };
      
      const hasWon = hasAllPiecesBorneOff(boardState, PlayerColor.WHITE);
      expect(hasWon).toBe(true);
    });

    test('does not detect win when player has not borne off all pieces', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [0, 0] as [number, number],
        offBoard: [14, 0] as [number, number], // White has borne off 14 pieces, still has 1 on board
      };
      
      const hasWon = hasAllPiecesBorneOff(boardState, PlayerColor.WHITE);
      expect(hasWon).toBe(false);
    });

    test('does not detect win when player has pieces on bar', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [1, 0] as [number, number], // White has 1 piece on bar
        offBoard: [14, 0] as [number, number], // White has borne off 14 pieces
      };
      
      const hasWon = hasAllPiecesBorneOff(boardState, PlayerColor.WHITE);
      expect(hasWon).toBe(false);
    });
  });

  describe('Gammon Detection', () => {
    test('detects gammon win when opponent has not borne off any pieces', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [0, 0] as [number, number],
        offBoard: [15, 0] as [number, number], // White has borne off all pieces, black has borne off none
      };
      
      const isGammon = isGammonWin(boardState, PlayerColor.WHITE);
      expect(isGammon).toBe(true);
    });

    test('does not detect gammon when opponent has borne off some pieces', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [0, 0] as [number, number],
        offBoard: [15, 5] as [number, number], // White has borne off all pieces, black has borne off 5
      };
      
      const isGammon = isGammonWin(boardState, PlayerColor.WHITE);
      expect(isGammon).toBe(false);
    });

    test('does not detect gammon when player has not won', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [0, 0] as [number, number],
        offBoard: [14, 0] as [number, number], // White has not borne off all pieces
      };
      
      const isGammon = isGammonWin(boardState, PlayerColor.WHITE);
      expect(isGammon).toBe(false);
    });
  });

  describe('Backgammon Detection', () => {
    test('detects backgammon win when opponent has pieces on bar', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [0, 3] as [number, number], // Black has 3 pieces on bar
        offBoard: [15, 0] as [number, number], // White has borne off all pieces, black has borne off none
      };
      
      const isBackgammon = isBackgammonWin(boardState, PlayerColor.WHITE);
      expect(isBackgammon).toBe(true);
    });

    test('does not detect backgammon when opponent has no pieces on bar', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [0, 0] as [number, number], // No pieces on bar
        offBoard: [15, 0] as [number, number], // White has borne off all pieces, black has borne off none
      };
      
      const isBackgammon = isBackgammonWin(boardState, PlayerColor.WHITE);
      expect(isBackgammon).toBe(false);
    });

    test('does not detect backgammon when opponent has borne off some pieces', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [0, 3] as [number, number], // Black has 3 pieces on bar
        offBoard: [15, 5] as [number, number], // White has borne off all pieces, black has borne off 5
      };
      
      const isBackgammon = isBackgammonWin(boardState, PlayerColor.WHITE);
      expect(isBackgammon).toBe(false);
    });
  });

  describe('Win Type Detection', () => {
    test('returns normal win type', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [0, 0] as [number, number],
        offBoard: [15, 5] as [number, number], // White has borne off all pieces, black has borne off 5
      };
      
      const winType = getWinType(boardState, PlayerColor.WHITE);
      expect(winType).toBe('normal');
    });

    test('returns gammon win type', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [0, 0] as [number, number],
        offBoard: [15, 0] as [number, number], // White has borne off all pieces, black has borne off none
      };
      
      const winType = getWinType(boardState, PlayerColor.WHITE);
      expect(winType).toBe('gammon');
    });

    test('returns backgammon win type', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [0, 3] as [number, number], // Black has 3 pieces on bar
        offBoard: [15, 0] as [number, number], // White has borne off all pieces, black has borne off none
      };
      
      const winType = getWinType(boardState, PlayerColor.WHITE);
      expect(winType).toBe('backgammon');
    });

    test('returns null when no win', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [0, 0] as [number, number],
        offBoard: [14, 0] as [number, number], // White has not borne off all pieces
      };
      
      const winType = getWinType(boardState, PlayerColor.WHITE);
      expect(winType).toBe(null);
    });
  });

  describe('Win Messages', () => {
    test('generates normal win message', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [0, 0] as [number, number],
        offBoard: [15, 5] as [number, number], // White has borne off all pieces, black has borne off 5
      };
      
      const message = getWinMessage(boardState, PlayerColor.WHITE);
      expect(message).toBe('🎉 White wins!');
    });

    test('generates gammon win message', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [0, 0] as [number, number],
        offBoard: [15, 0] as [number, number], // White has borne off all pieces, black has borne off none
      };
      
      const message = getWinMessage(boardState, PlayerColor.WHITE);
      expect(message).toBe('🎉 White wins by Gammon! (2x points)');
    });

    test('generates backgammon win message', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [0, 3] as [number, number], // Black has 3 pieces on bar
        offBoard: [15, 0] as [number, number], // White has borne off all pieces, black has borne off none
      };
      
      const message = getWinMessage(boardState, PlayerColor.WHITE);
      expect(message).toBe('🎉 White wins by Backgammon! (3x points)');
    });

    test('generates black win message', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [0, 0] as [number, number],
        offBoard: [0, 15] as [number, number], // Black has borne off all pieces
      };
      
      const message = getWinMessage(boardState, PlayerColor.BLACK);
      expect(message).toBe('🎉 Black wins!');
    });

    test('returns empty string when no win', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [0, 0] as [number, number],
        offBoard: [14, 0] as [number, number], // White has not borne off all pieces
      };
      
      const message = getWinMessage(boardState, PlayerColor.WHITE);
      expect(message).toBe('');
    });
  });

  describe('Win Points Calculation', () => {
    test('calculates normal win points', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [0, 0] as [number, number],
        offBoard: [15, 5] as [number, number], // White has borne off all pieces, black has borne off 5
      };
      
      const points = calculateWinPoints(boardState, PlayerColor.WHITE);
      expect(points).toBe(1);
    });

    test('calculates gammon win points', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [0, 0] as [number, number],
        offBoard: [15, 0] as [number, number], // White has borne off all pieces, black has borne off none
      };
      
      const points = calculateWinPoints(boardState, PlayerColor.WHITE);
      expect(points).toBe(2);
    });

    test('calculates backgammon win points', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [0, 3] as [number, number], // Black has 3 pieces on bar
        offBoard: [15, 0] as [number, number], // White has borne off all pieces, black has borne off none
      };
      
      const points = calculateWinPoints(boardState, PlayerColor.WHITE);
      expect(points).toBe(3);
    });

    test('returns zero points when no win', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [0, 0] as [number, number],
        offBoard: [14, 0] as [number, number], // White has not borne off all pieces
      };
      
      const points = calculateWinPoints(boardState, PlayerColor.WHITE);
      expect(points).toBe(0);
    });
  });

  describe('Game End State Detection', () => {
    test('detects white normal win', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [0, 0] as [number, number],
        offBoard: [15, 5] as [number, number], // White has borne off all pieces, black has borne off 5
      };
      
      const gameEndState = getGameEndState(boardState);
      expect(gameEndState.winner).toBe(PlayerColor.WHITE);
      expect(gameEndState.winType).toBe('normal');
      expect(gameEndState.points).toBe(1);
    });

    test('detects white gammon win', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [0, 0] as [number, number],
        offBoard: [15, 0] as [number, number], // White has borne off all pieces, black has borne off none
      };
      
      const gameEndState = getGameEndState(boardState);
      expect(gameEndState.winner).toBe(PlayerColor.WHITE);
      expect(gameEndState.winType).toBe('gammon');
      expect(gameEndState.points).toBe(2);
    });

    test('detects white backgammon win', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [0, 3] as [number, number], // Black has 3 pieces on bar
        offBoard: [15, 0] as [number, number], // White has borne off all pieces, black has borne off none
      };
      
      const gameEndState = getGameEndState(boardState);
      expect(gameEndState.winner).toBe(PlayerColor.WHITE);
      expect(gameEndState.winType).toBe('backgammon');
      expect(gameEndState.points).toBe(3);
    });

    test('detects black normal win', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [0, 0] as [number, number],
        offBoard: [5, 15] as [number, number], // Black has borne off all pieces, white has borne off 5
      };
      
      const gameEndState = getGameEndState(boardState);
      expect(gameEndState.winner).toBe(PlayerColor.BLACK);
      expect(gameEndState.winType).toBe('normal');
      expect(gameEndState.points).toBe(1);
    });

    test('detects black gammon win', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [0, 0] as [number, number],
        offBoard: [0, 15] as [number, number], // Black has borne off all pieces, white has borne off none
      };
      
      const gameEndState = getGameEndState(boardState);
      expect(gameEndState.winner).toBe(PlayerColor.BLACK);
      expect(gameEndState.winType).toBe('gammon');
      expect(gameEndState.points).toBe(2);
    });

    test('detects black backgammon win', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [3, 0] as [number, number], // White has 3 pieces on bar
        offBoard: [0, 15] as [number, number], // Black has borne off all pieces, white has borne off none
      };
      
      const gameEndState = getGameEndState(boardState);
      expect(gameEndState.winner).toBe(PlayerColor.BLACK);
      expect(gameEndState.winType).toBe('backgammon');
      expect(gameEndState.points).toBe(3);
    });

    test('returns no winner when game is ongoing', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [0, 0] as [number, number],
        offBoard: [14, 10] as [number, number], // Neither player has borne off all pieces
      };
      
      const gameEndState = getGameEndState(boardState);
      expect(gameEndState.winner).toBe(null);
      expect(gameEndState.winType).toBe(null);
      expect(gameEndState.points).toBe(0);
    });
  });

  describe('UI Integration', () => {
    test('shows gammon win message in UI', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [0, 0] as [number, number],
        offBoard: [15, 0] as [number, number], // White gammon win
      };
      
      mockStore.boardState = boardState;
      mockStore.gameState = 'gameOver';
      (getWinMessage as jest.Mock).mockReturnValue('🎉 White wins by Gammon! (2x points)');
      
      render(<Backgammon />);
      
      expect(screen.getByText(/Gammon/)).toBeInTheDocument();
      expect(screen.getByText(/Double points/)).toBeInTheDocument();
    });

    test('shows backgammon win message in UI', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [0, 3] as [number, number], // Black has pieces on bar
        offBoard: [15, 0] as [number, number], // White backgammon win
      };
      
      mockStore.boardState = boardState;
      mockStore.gameState = 'gameOver';
      (getWinMessage as jest.Mock).mockReturnValue('🎉 White wins by Backgammon! (3x points)');
      
      render(<Backgammon />);
      
      expect(screen.getByText(/Backgammon/)).toBeInTheDocument();
      expect(screen.getByText(/Triple points/)).toBeInTheDocument();
    });

    test('shows normal win message in UI', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [0, 0] as [number, number],
        offBoard: [15, 5] as [number, number], // White normal win
      };
      
      mockStore.boardState = boardState;
      mockStore.gameState = 'gameOver';
      (getWinMessage as jest.Mock).mockReturnValue('🎉 White wins!');
      
      render(<Backgammon />);
      
      expect(screen.getByText(/White wins/)).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    test('handles pieces on board and bar correctly', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [1, 0] as [number, number], // White has 1 piece on bar
        offBoard: [14, 0] as [number, number], // White has borne off 14 pieces
      };
      
      const hasWon = hasAllPiecesBorneOff(boardState, PlayerColor.WHITE);
      expect(hasWon).toBe(false); // Total pieces = 14 + 1 = 15, but not all borne off
    });

    test('handles pieces on board correctly', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [0, 0] as [number, number],
        offBoard: [14, 0] as [number, number], // White has borne off 14 pieces
      };
      
      // Set up 1 piece on board
      boardState.board[0] = [1, 0]; // White has 1 piece at point 1
      
      const hasWon = hasAllPiecesBorneOff(boardState, PlayerColor.WHITE);
      expect(hasWon).toBe(false); // Total pieces = 14 + 1 = 15, but not all borne off
    });

    test('handles empty board state correctly', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [0, 0] as [number, number],
        offBoard: [0, 0] as [number, number],
      };
      
      const hasWon = hasAllPiecesBorneOff(boardState, PlayerColor.WHITE);
      expect(hasWon).toBe(false);
      
      const gameEndState = getGameEndState(boardState);
      expect(gameEndState.winner).toBe(null);
    });

    test('handles both players having borne off pieces', () => {
      const boardState = {
        board: Array.from({ length: 24 }, () => [0, 0]),
        bar: [0, 0] as [number, number],
        offBoard: [15, 15] as [number, number], // Both players have borne off all pieces
      };
      
      // This shouldn't happen in normal play, but test the logic
      const whiteWon = hasAllPiecesBorneOff(boardState, PlayerColor.WHITE);
      const blackWon = hasAllPiecesBorneOff(boardState, PlayerColor.BLACK);
      
      expect(whiteWon).toBe(true);
      expect(blackWon).toBe(true);
      
      // First player to bear off all pieces wins
      const gameEndState = getGameEndState(boardState);
      expect(gameEndState.winner).toBe(PlayerColor.WHITE); // White wins in this case
    });
  });
});