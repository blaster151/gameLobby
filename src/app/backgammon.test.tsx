import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Backgammon from './backgammon';
import { useBackgammonStore, PlayerColor, BotDifficulty } from './backgammonStore';

// Mock Next.js Link component
jest.mock('next/link', () => {
  return function MockLink({ children, href, ...props }: any) {
    return <a href={href} {...props}>{children}</a>;
  };
});

describe('Backgammon Component', () => {
  beforeEach(() => {
    // Reset store before each test
    useBackgammonStore.setState({
      board: useBackgammonStore.getState().board,
      turn: PlayerColor.WHITE,
      message: 'White to roll',
      gameState: 'playing',
      dice: [],
      usedDice: [],
      history: [useBackgammonStore.getState().board],
      historyIndex: 0,
      stats: { wins: 0, losses: 0, totalGames: 0 },
      botDifficulty: BotDifficulty.MEDIUM,
    });
  });

  test('renders backgammon game with all UI elements', () => {
    render(<Backgammon />);
    
    expect(screen.getByText('Backgammon')).toBeInTheDocument();
    expect(screen.getByText('← Back to Lobby')).toBeInTheDocument();
    expect(screen.getByText('Bot Difficulty:')).toBeInTheDocument();
    expect(screen.getByText('Game Statistics:')).toBeInTheDocument();
    expect(screen.getByText('How to Play:')).toBeInTheDocument();
    expect(screen.getByText('New Game')).toBeInTheDocument();
    expect(screen.getByText('💾 Save Game')).toBeInTheDocument();
    expect(screen.getByText('📂 Load Game')).toBeInTheDocument();
  });

  test('bot difficulty selector changes difficulty', () => {
    render(<Backgammon />);
    
    const difficultySelect = screen.getByDisplayValue('Medium');
    fireEvent.change(difficultySelect, { target: { value: BotDifficulty.HARD } });
    
    expect(useBackgammonStore.getState().botDifficulty).toBe(BotDifficulty.HARD);
  });

  test('dice rolling functionality works', () => {
    render(<Backgammon />);
    
    const rollButton = screen.getByText('Roll Dice');
    fireEvent.click(rollButton);
    
    // Should have dice after rolling
    expect(useBackgammonStore.getState().dice.length).toBeGreaterThan(0);
  });

  test('piece selection and movement works', () => {
    render(<Backgammon />);
    
    // Roll dice first
    const rollButton = screen.getByText('Roll Dice');
    fireEvent.click(rollButton);
    
    // Find a point with white pieces (point 0 should have 2 white pieces)
    const point0 = screen.getByText('1'); // Point 0 is labeled as "1"
    fireEvent.click(point0);
    
    // Should be able to select a point with pieces
    expect(screen.getByText('1')).toHaveStyle({ border: '2px solid #fbbf24' });
  });

  test('game statistics are displayed correctly', () => {
    render(<Backgammon />);
    
    expect(screen.getByText(/Wins: 0/)).toBeInTheDocument();
    expect(screen.getByText(/Losses: 0/)).toBeInTheDocument();
    expect(screen.getByText(/Total Games: 0/)).toBeInTheDocument();
  });

  test('reset stats button works', () => {
    render(<Backgammon />);
    
    const resetButton = screen.getByText('Reset Stats');
    fireEvent.click(resetButton);
    
    expect(useBackgammonStore.getState().stats).toEqual({
      wins: 0,
      losses: 0,
      totalGames: 0
    });
  });

  test('new game button resets the board', () => {
    render(<Backgammon />);
    
    const newGameButton = screen.getByText('New Game');
    fireEvent.click(newGameButton);
    
    expect(useBackgammonStore.getState().turn).toBe(PlayerColor.WHITE);
    expect(useBackgammonStore.getState().gameState).toBe('playing');
    expect(useBackgammonStore.getState().message).toBe('White to roll');
  });

  test('tutorial can be opened and closed', () => {
    render(<Backgammon />);
    
    const tutorialButton = screen.getByText('📖 Full Tutorial');
    fireEvent.click(tutorialButton);
    
    // Tutorial should be open
    expect(screen.getByText('Backgammon Tutorial')).toBeInTheDocument();
    
    const closeButton = screen.getByText('Close');
    fireEvent.click(closeButton);
    
    // Tutorial should be closed
    expect(screen.queryByText('Backgammon Tutorial')).not.toBeInTheDocument();
  });

  test('undo and redo buttons work correctly', () => {
    render(<Backgammon />);
    
    const undoButton = screen.getByText('↩ Undo');
    const redoButton = screen.getByText('↪ Redo');
    
    // Initially, undo should be disabled
    expect(undoButton).toBeDisabled();
    expect(redoButton).toBeDisabled();
    
    // Roll dice to create some history
    const rollButton = screen.getByText('Roll Dice');
    fireEvent.click(rollButton);
    
    // Now undo should be enabled
    expect(undoButton).not.toBeDisabled();
  });

  test('board displays all 24 points', () => {
    render(<Backgammon />);
    
    // Check that all point numbers are displayed (1-24)
    for (let i = 1; i <= 24; i++) {
      expect(screen.getByText(i.toString())).toBeInTheDocument();
    }
  });

  test('initial board setup is correct', () => {
    render(<Backgammon />);
    
    const board = useBackgammonStore.getState().board;
    
    // Check initial piece positions
    expect(board[0][0]).toBe(2);  // White pieces on point 0
    expect(board[5][1]).toBe(5);  // Black pieces on point 5
    expect(board[11][0]).toBe(5); // White pieces on point 11
    expect(board[23][1]).toBe(2); // Black pieces on point 23
  });

  test('dice display shows used and unused dice correctly', () => {
    render(<Backgammon />);
    
    // Roll dice
    const rollButton = screen.getByText('Roll Dice');
    fireEvent.click(rollButton);
    
    // Should show dice
    const dice = useBackgammonStore.getState().dice;
    expect(dice.length).toBeGreaterThan(0);
    
    // Dice should be visible on screen
    dice.forEach(die => {
      expect(screen.getByText(die.toString())).toBeInTheDocument();
    });
  });

  test('save and load game functionality exists', () => {
    render(<Backgammon />);
    
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
    render(<Backgammon />);
    
    expect(screen.getByText(/Instructions:/)).toBeInTheDocument();
    expect(screen.getByText(/Click on a point with your pieces/)).toBeInTheDocument();
  });

  test('board has correct visual layout', () => {
    render(<Backgammon />);
    
    // Check that the board container exists with proper styling
    const boardContainer = screen.getByText('1').closest('div');
    expect(boardContainer).toHaveStyle({ display: 'grid' });
  });
}); 