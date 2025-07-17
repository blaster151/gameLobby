import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import GinRummy from './ginRummy';
import { useGinRummyStore, GameState, BotDifficulty, Suit, Rank } from './ginRummyStore';

// Mock Next.js Link component
jest.mock('next/link', () => {
  return function MockLink({ children, href, ...props }: any) {
    return <a href={href} {...props}>{children}</a>;
  };
});

describe('GinRummy Component', () => {
  beforeEach(() => {
    // Reset store before each test
    useGinRummyStore.setState({
      playerHand: [],
      botHand: [],
      stockPile: [],
      discardPile: [],
      gameState: GameState.DEALING,
      turn: 'player',
      message: 'Dealing cards...',
      stats: { wins: 0, losses: 0, totalGames: 0, totalScore: 0 },
      botDifficulty: BotDifficulty.MEDIUM,
    });
  });

  test('renders gin rummy game with all UI elements', () => {
    render(<GinRummy />);
    
    expect(screen.getByText('Gin Rummy')).toBeInTheDocument();
    expect(screen.getByText('← Back to Lobby')).toBeInTheDocument();
    expect(screen.getByText('Bot Difficulty:')).toBeInTheDocument();
    expect(screen.getByText('Game Statistics:')).toBeInTheDocument();
    expect(screen.getByText('How to Play:')).toBeInTheDocument();
    expect(screen.getByText('New Game')).toBeInTheDocument();
    expect(screen.getByText('💾 Save Game')).toBeInTheDocument();
    expect(screen.getByText('📂 Load Game')).toBeInTheDocument();
  });

  test('bot difficulty selector changes difficulty', () => {
    render(<GinRummy />);
    
    const difficultySelect = screen.getByDisplayValue('Medium');
    fireEvent.change(difficultySelect, { target: { value: BotDifficulty.HARD } });
    
    expect(useGinRummyStore.getState().botDifficulty).toBe(BotDifficulty.HARD);
  });

  test('new game button resets the game', () => {
    render(<GinRummy />);
    
    const newGameButton = screen.getByText('New Game');
    fireEvent.click(newGameButton);
    
    const state = useGinRummyStore.getState();
    expect(state.gameState).toBe(GameState.PLAYING);
    expect(state.turn).toBe('player');
    expect(state.playerHand).toHaveLength(10);
    expect(state.botHand).toHaveLength(10);
    expect(state.stockPile.length).toBeGreaterThan(0);
    expect(state.discardPile).toHaveLength(1);
  });

  test('game statistics are displayed correctly', () => {
    render(<GinRummy />);
    
    expect(screen.getByText(/Wins: 0/)).toBeInTheDocument();
    expect(screen.getByText(/Losses: 0/)).toBeInTheDocument();
    expect(screen.getByText(/Total Games: 0/)).toBeInTheDocument();
  });

  test('reset stats button works', () => {
    render(<GinRummy />);
    
    const resetButton = screen.getByText('Reset Stats');
    fireEvent.click(resetButton);
    
    expect(useGinRummyStore.getState().stats).toEqual({
      wins: 0,
      losses: 0,
      totalGames: 0,
      totalScore: 0
    });
  });

  test('tutorial can be opened and closed', () => {
    render(<GinRummy />);
    
    const tutorialButton = screen.getByText('📖 Full Tutorial');
    fireEvent.click(tutorialButton);
    
    // Tutorial should be open
    expect(screen.getByText('Gin Rummy Tutorial')).toBeInTheDocument();
    
    const closeButton = screen.getByText('Close');
    fireEvent.click(closeButton);
    
    // Tutorial should be closed
    expect(screen.queryByText('Gin Rummy Tutorial')).not.toBeInTheDocument();
  });

  test('displays game status information', () => {
    render(<GinRummy />);
    
    expect(screen.getByText(/Turn:/)).toBeInTheDocument();
    expect(screen.getByText(/Stock Pile:/)).toBeInTheDocument();
    expect(screen.getByText(/Your Deadwood:/)).toBeInTheDocument();
  });

  test('displays bot hand as face down cards', () => {
    // Set up a game with cards
    useGinRummyStore.setState({
      botHand: [
        { suit: Suit.HEARTS, rank: Rank.ACE, id: 'hearts-1' },
        { suit: Suit.DIAMONDS, rank: Rank.TWO, id: 'diamonds-2' },
      ],
      gameState: GameState.PLAYING,
    });
    
    render(<GinRummy />);
    
    expect(screen.getByText("Bot's Hand (2 cards)")).toBeInTheDocument();
    // Should show face down card symbols
    const faceDownCards = screen.getAllByText('🂠');
    expect(faceDownCards).toHaveLength(2);
  });

  test('displays discard pile with top card visible', () => {
    // Set up a game with discard pile
    useGinRummyStore.setState({
      discardPile: [
        { suit: Suit.HEARTS, rank: Rank.ACE, id: 'hearts-1' },
        { suit: Suit.DIAMONDS, rank: Rank.TWO, id: 'diamonds-2' },
      ],
      gameState: GameState.PLAYING,
    });
    
    render(<GinRummy />);
    
    expect(screen.getByText('Discard Pile')).toBeInTheDocument();
    // Should show the top card (last in array)
    expect(screen.getByText('2♦')).toBeInTheDocument();
  });

  test('displays stock pile as face down card', () => {
    // Set up a game with stock pile
    useGinRummyStore.setState({
      stockPile: [
        { suit: Suit.HEARTS, rank: Rank.ACE, id: 'hearts-1' },
        { suit: Suit.DIAMONDS, rank: Rank.TWO, id: 'diamonds-2' },
      ],
      gameState: GameState.PLAYING,
    });
    
    render(<GinRummy />);
    
    expect(screen.getByText('Stock Pile')).toBeInTheDocument();
    // Should show face down card symbol
    expect(screen.getByText('🂠')).toBeInTheDocument();
  });

  test('displays player hand with visible cards', () => {
    // Set up a game with player hand
    useGinRummyStore.setState({
      playerHand: [
        { suit: Suit.HEARTS, rank: Rank.ACE, id: 'hearts-1' },
        { suit: Suit.DIAMONDS, rank: Rank.TWO, id: 'diamonds-2' },
        { suit: Suit.CLUBS, rank: Rank.THREE, id: 'clubs-3' },
      ],
      gameState: GameState.PLAYING,
    });
    
    render(<GinRummy />);
    
    expect(screen.getByText('Your Hand (3 cards)')).toBeInTheDocument();
    expect(screen.getByText('A♥')).toBeInTheDocument();
    expect(screen.getByText('2♦')).toBeInTheDocument();
    expect(screen.getByText('3♣')).toBeInTheDocument();
  });

  test('shows knock button when deadwood is 10 or less', () => {
    // Set up a game with low deadwood hand
    useGinRummyStore.setState({
      playerHand: [
        { suit: Suit.HEARTS, rank: Rank.ACE, id: 'hearts-1' }, // 1 point
        { suit: Suit.DIAMONDS, rank: Rank.TWO, id: 'diamonds-2' }, // 2 points
      ],
      gameState: GameState.PLAYING,
      turn: 'player',
    });
    
    render(<GinRummy />);
    
    const knockButton = screen.getByText('🚪 Knock');
    expect(knockButton).toBeInTheDocument();
    expect(knockButton).not.toBeDisabled();
  });

  test('disables knock button when deadwood is more than 10', () => {
    // Set up a game with high deadwood hand
    useGinRummyStore.setState({
      playerHand: [
        { suit: Suit.HEARTS, rank: Rank.TEN, id: 'hearts-10' }, // 10 points
        { suit: Suit.DIAMONDS, rank: Rank.JACK, id: 'diamonds-11' }, // 10 points
        { suit: Suit.CLUBS, rank: Rank.QUEEN, id: 'clubs-12' }, // 10 points
      ],
      gameState: GameState.PLAYING,
      turn: 'player',
    });
    
    render(<GinRummy />);
    
    const knockButton = screen.getByText('🚪 Knock');
    expect(knockButton).toBeDisabled();
  });

  test('save and load game functionality exists', () => {
    render(<GinRummy />);
    
    const saveButton = screen.getByText('💾 Save Game');
    const loadButton = screen.getByText('📂 Load Game');
    
    expect(saveButton).toBeInTheDocument();
    expect(loadButton).toBeInTheDocument();
    
    // Initially load should be disabled
    expect(loadButton).toBeDisabled();
    
    // Save a game
    fireEvent.click(saveButton);
    
    // Now load should be enabled
    expect(loadButton).not.toBeDisabled();
  });

  test('game instructions are displayed', () => {
    render(<GinRummy />);
    
    expect(screen.getByText(/Instructions:/)).toBeInTheDocument();
    expect(screen.getByText(/Draw a card from stock or discard pile/)).toBeInTheDocument();
  });

  test('displays correct card colors', () => {
    // Set up a game with different colored cards
    useGinRummyStore.setState({
      playerHand: [
        { suit: Suit.HEARTS, rank: Rank.ACE, id: 'hearts-1' }, // Red
        { suit: Suit.CLUBS, rank: Rank.TWO, id: 'clubs-2' }, // Black
      ],
      gameState: GameState.PLAYING,
    });
    
    render(<GinRummy />);
    
    const heartCard = screen.getByText('A♥');
    const clubCard = screen.getByText('2♣');
    
    expect(heartCard).toHaveStyle({ color: '#dc2626' }); // Red
    expect(clubCard).toHaveStyle({ color: '#000' }); // Black
  });

  test('shows deadwood calculation', () => {
    // Set up a game with known deadwood
    useGinRummyStore.setState({
      playerHand: [
        { suit: Suit.HEARTS, rank: Rank.ACE, id: 'hearts-1' }, // 1 point
        { suit: Suit.DIAMONDS, rank: Rank.TWO, id: 'diamonds-2' }, // 2 points
        { suit: Suit.CLUBS, rank: Rank.TEN, id: 'clubs-10' }, // 10 points
      ],
      gameState: GameState.PLAYING,
    });
    
    render(<GinRummy />);
    
    // Should show total deadwood: 1 + 2 + 10 = 13
    expect(screen.getByText(/Your Deadwood: 13/)).toBeInTheDocument();
  });

  test('handles empty stock pile', () => {
    // Set up a game with empty stock pile
    useGinRummyStore.setState({
      stockPile: [],
      gameState: GameState.PLAYING,
      turn: 'player',
    });
    
    render(<GinRummy />);
    
    expect(screen.getByText('Stock Pile: 0 cards')).toBeInTheDocument();
  });

  test('displays turn information correctly', () => {
    render(<GinRummy />);
    
    // Initially should show player turn
    expect(screen.getByText(/Turn: Your Turn/)).toBeInTheDocument();
    
    // Change to bot turn
    useGinRummyStore.setState({ turn: 'bot' });
    
    // Re-render to see updated turn
    render(<GinRummy />);
    expect(screen.getByText(/Turn: Bot Turn/)).toBeInTheDocument();
  });
}); 