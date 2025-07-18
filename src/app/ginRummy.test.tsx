import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import GinRummy from './ginRummy';
import { useGinRummyStore, GameMode, BotDifficulty, GameState } from './ginRummyStore';

// Mock the store
jest.mock('./ginRummyStore', () => ({
  useGinRummyStore: jest.fn(),
  GameMode: {
    HUMAN_VS_BOT: 'human_vs_bot',
    HUMAN_VS_HUMAN: 'human_vs_human',
  },
  BotDifficulty: {
    EASY: 'easy',
    MEDIUM: 'medium',
    HARD: 'hard',
  },
  GameState: {
    DEALING: 'dealing',
    PLAYING: 'playing',
    KNOCKED: 'knocked',
    GAME_OVER: 'game_over',
  },
  Suit: {
    HEARTS: 'hearts',
    DIAMONDS: 'diamonds',
    CLUBS: 'clubs',
    SPADES: 'spades',
  },
  Rank: {
    ACE: 1,
    TWO: 2,
    THREE: 3,
    FOUR: 4,
    FIVE: 5,
    SIX: 6,
    SEVEN: 7,
    EIGHT: 8,
    NINE: 9,
    TEN: 10,
    JACK: 11,
    QUEEN: 12,
    KING: 13,
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
  ginRummyTutorial: {
    title: 'Gin Rummy Tutorial',
    steps: [],
  },
}));

describe('Gin Rummy Game Mode', () => {
  const mockStore = {
    playerHand: [
      { suit: 'hearts' as any, rank: 1 as any, id: '1' },
      { suit: 'diamonds' as any, rank: 2 as any, id: '2' },
    ],
    botHand: [
      { suit: 'clubs' as any, rank: 3 as any, id: '3' },
      { suit: 'spades' as any, rank: 4 as any, id: '4' },
    ],
    stockPile: [],
    discardPile: [],
    gameState: GameState.PLAYING,
    turn: 'player' as const,
    message: 'Your turn. Draw a card or pick up from discard pile.',
    stats: { wins: 0, losses: 0, totalGames: 0, totalScore: 0 },
    botDifficulty: BotDifficulty.MEDIUM,
    gameMode: GameMode.HUMAN_VS_BOT,
    setPlayerHand: jest.fn(),
    setBotHand: jest.fn(),
    setStockPile: jest.fn(),
    setDiscardPile: jest.fn(),
    setGameState: jest.fn(),
    setTurn: jest.fn(),
    setMessage: jest.fn(),
    resetGame: jest.fn(),
    updateStats: jest.fn(),
    resetStats: jest.fn(),
    setBotDifficulty: jest.fn(),
    setGameMode: jest.fn(),
    saveGame: jest.fn(),
    loadGame: jest.fn(),
    hasSavedGame: jest.fn(() => false),
    drawFromStock: jest.fn(),
    drawFromDiscard: jest.fn(),
    discardCard: jest.fn(),
    knock: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useGinRummyStore as jest.MockedFunction<typeof useGinRummyStore>).mockImplementation((selector) => {
      const state = selector(mockStore);
      return state;
    });
  });

  test('displays game mode selector with correct options', () => {
    render(<GinRummy />);
    
    expect(screen.getByLabelText('Game Mode')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Human vs Bot')).toBeInTheDocument();
    expect(screen.getByText('Human vs Human')).toBeInTheDocument();
  });

  test('allows switching between game modes', () => {
    render(<GinRummy />);
    
    const gameModeSelect = screen.getByLabelText('Game Mode');
    fireEvent.change(gameModeSelect, { target: { value: GameMode.HUMAN_VS_HUMAN } });
    
    expect(mockStore.setGameMode).toHaveBeenCalledWith(GameMode.HUMAN_VS_HUMAN);
  });

  test('shows game mode in game status', () => {
    render(<GinRummy />);
    
    // Check that "Human vs Bot" appears in the document (both in selector and status)
    const gameModeElements = screen.getAllByText('Human vs Bot');
    expect(gameModeElements.length).toBeGreaterThan(0);
    
    // Verify it appears at least twice (once in selector, once in status)
    expect(gameModeElements.length).toBeGreaterThanOrEqual(2);
  });

  test('shows bot hand title correctly in human vs bot mode', () => {
    render(<GinRummy />);
    
    expect(screen.getByText("Bot's Hand (2 cards)")).toBeInTheDocument();
  });

  test('shows player 2 hand title correctly in human vs human mode', () => {
    mockStore.gameMode = GameMode.HUMAN_VS_HUMAN;
    
    render(<GinRummy />);
    
    expect(screen.getByText("Player 2's Hand (2 cards)")).toBeInTheDocument();
  });

  test('shows face down cards in human vs bot mode', () => {
    render(<GinRummy />);
    
    const faceDownCards = screen.getAllByText('🂠');
    expect(faceDownCards.length).toBeGreaterThan(0);
  });

  test('shows actual cards in human vs human mode', () => {
    mockStore.gameMode = GameMode.HUMAN_VS_HUMAN;
    
    render(<GinRummy />);
    
    // Should show actual card symbols instead of face down cards in the bot hand
    const botHandSection = screen.getByText("Player 2's Hand (2 cards)").closest('div');
    const faceDownCardsInBotHand = botHandSection?.querySelectorAll('div[style*="background: rgb(68, 68, 68)"]');
    expect(faceDownCardsInBotHand?.length).toBe(0);
  });
}); 