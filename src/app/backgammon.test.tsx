import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Backgammon from './backgammon';
import { useBackgammonStore, GameMode, PlayerColor } from './backgammonStore';

// Mock the store
jest.mock('./backgammonStore', () => ({
  useBackgammonStore: jest.fn(),
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

describe('Backgammon Game Mode', () => {
  const mockStore = {
    board: Array(24).fill([0, 0]).map((_, i) => {
      if (i === 0) return [2, 0]; // White pieces
      if (i === 23) return [0, 2]; // Black pieces
      return [0, 0];
    }),
    turn: PlayerColor.WHITE,
    message: 'White to roll',
    gameState: 'playing',
    stats: { wins: 0, losses: 0, totalGames: 0 },
    botDifficulty: 'medium' as any,
    gameMode: GameMode.HUMAN_VS_BOT,
    dice: [],
    usedDice: [],
    history: [],
    historyIndex: 0,
    setBoard: jest.fn(),
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
    hasSavedGame: jest.fn(() => false),
    rollDice: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useBackgammonStore as jest.MockedFunction<typeof useBackgammonStore>).mockImplementation((selector) => {
      const state = selector(mockStore);
      return state;
    });
  });

  test('displays game mode selector with correct options', () => {
    render(<Backgammon />);
    
    expect(screen.getByText('Game Mode:')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Human vs Bot')).toBeInTheDocument();
    expect(screen.getByText('Human vs Human')).toBeInTheDocument();
  });

  test('allows switching between game modes', () => {
    render(<Backgammon />);
    
    const gameModeSelect = screen.getByLabelText('Game Mode');
    fireEvent.change(gameModeSelect, { target: { value: GameMode.HUMAN_VS_HUMAN } });
    
    expect(mockStore.setGameMode).toHaveBeenCalledWith(GameMode.HUMAN_VS_HUMAN);
  });

  test('in human vs human mode, both players can roll dice', () => {
    mockStore.gameMode = GameMode.HUMAN_VS_HUMAN;
    mockStore.turn = PlayerColor.BLACK;
    
    render(<Backgammon />);
    
    const rollButton = screen.getByText('Roll Dice');
    expect(rollButton).not.toBeDisabled();
  });

  test('in human vs bot mode, only white can roll dice', () => {
    mockStore.gameMode = GameMode.HUMAN_VS_BOT;
    mockStore.turn = PlayerColor.BLACK;
    
    render(<Backgammon />);
    
    const rollButton = screen.getByText('Roll Dice');
    expect(rollButton).toBeDisabled();
  });

  test('undo/redo buttons work for both players in human vs human mode', () => {
    mockStore.gameMode = GameMode.HUMAN_VS_HUMAN;
    mockStore.turn = PlayerColor.BLACK;
    mockStore.historyIndex = 1;
    
    render(<Backgammon />);
    
    const undoButton = screen.getByText('↩ Undo');
    const redoButton = screen.getByText('↪ Redo');
    
    expect(undoButton).not.toBeDisabled();
    expect(redoButton).not.toBeDisabled();
  });

  test('undo/redo buttons only work for white in human vs bot mode', () => {
    mockStore.gameMode = GameMode.HUMAN_VS_BOT;
    mockStore.turn = PlayerColor.BLACK;
    mockStore.historyIndex = 1;
    
    render(<Backgammon />);
    
    const undoButton = screen.getByText('↩ Undo');
    const redoButton = screen.getByText('↪ Redo');
    
    expect(undoButton).toBeDisabled();
    expect(redoButton).toBeDisabled();
  });
}); 