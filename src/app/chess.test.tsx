import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Chess from './chess';
import { useChessStore, BotDifficulty, PlayerColor } from './chessStore';

// Mock Next.js Link component
jest.mock('next/link', () => {
  return function MockLink({ children, href, ...props }: any) {
    return <a href={href} {...props}>{children}</a>;
  };
});

describe('Chess Component', () => {
  beforeEach(() => {
    // Reset store before each test
    useChessStore.setState({
      board: useChessStore.getState().board,
      selected: null,
      turn: PlayerColor.WHITE,
      message: 'White to move',
      gameState: 'playing',
      history: [useChessStore.getState().board],
      historyIndex: 0,
      stats: { wins: 0, losses: 0, totalGames: 0 },
      botDifficulty: BotDifficulty.MEDIUM,
      lastMove: null,
    });
  });

  test('renders chess game with all UI elements', () => {
    render(<Chess />);
    
    expect(screen.getByText('Chess')).toBeInTheDocument();
    expect(screen.getByText('← Back to Lobby')).toBeInTheDocument();
    expect(screen.getByText('Bot Difficulty:')).toBeInTheDocument();
    expect(screen.getByText('Game Statistics:')).toBeInTheDocument();
    expect(screen.getByText('How to Play:')).toBeInTheDocument();
    expect(screen.getByText('New Game')).toBeInTheDocument();
    expect(screen.getByText('💾 Save Game')).toBeInTheDocument();
    expect(screen.getByText('📂 Load Game')).toBeInTheDocument();
  });

  test('bot difficulty selector changes difficulty', () => {
    render(<Chess />);
    
    const difficultySelect = screen.getByDisplayValue('Medium');
    fireEvent.change(difficultySelect, { target: { value: BotDifficulty.HARD } });
    
    expect(useChessStore.getState().botDifficulty).toBe(BotDifficulty.HARD);
  });

  test('bot makes moves at different difficulty levels', async () => {
    render(<Chess />);
    
    // Set difficulty to Easy
    const difficultySelect = screen.getByDisplayValue('Medium');
    fireEvent.change(difficultySelect, { target: { value: BotDifficulty.EASY } });
    
    // Make a player move (move white pawn from e2 to e4)
    const e2Cell = screen.getByLabelText('7, 5 ♙');
    const e4Cell = screen.getByLabelText('5, 5 ');
    
    fireEvent.click(e2Cell);
    fireEvent.click(e4Cell);
    
    // Wait for bot move
    await waitFor(() => {
      expect(useChessStore.getState().turn).toBe('white');
    }, { timeout: 1000 });
    
    // Verify bot made a move
    expect(useChessStore.getState().lastMove).not.toBeNull();
  });

  test('move validation prevents invalid moves', () => {
    render(<Chess />);
    
    // Try to move a pawn diagonally without capturing
    const e2Cell = screen.getByLabelText('7, 5 ♙');
    const f3Cell = screen.getByLabelText('6, 6 ');
    
    fireEvent.click(e2Cell);
    fireEvent.click(f3Cell);
    
    // The move should not be made (pawn can't move diagonally without capturing)
    expect(useChessStore.getState().selected).toEqual([6, 5]); // Still selected
  });

  test('valid pawn move works correctly', () => {
    render(<Chess />);
    
    // Move white pawn from e2 to e4 (valid move)
    const e2Cell = screen.getByLabelText('7, 5 ♙');
    const e4Cell = screen.getByLabelText('5, 5 ');
    
    fireEvent.click(e2Cell);
    fireEvent.click(e4Cell);
    
    // The move should be made
    expect(useChessStore.getState().selected).toBeNull();
    expect(useChessStore.getState().turn).toBe('black');
  });

  test('game statistics are displayed correctly', () => {
    render(<Chess />);
    
    expect(screen.getByText(/Wins: 0/)).toBeInTheDocument();
    expect(screen.getByText(/Losses: 0/)).toBeInTheDocument();
    expect(screen.getByText(/Total Games: 0/)).toBeInTheDocument();
  });

  test('reset stats button works', () => {
    render(<Chess />);
    
    const resetButton = screen.getByText('Reset Stats');
    fireEvent.click(resetButton);
    
    expect(useChessStore.getState().stats).toEqual({
      wins: 0,
      losses: 0,
      totalGames: 0
    });
  });

  test('new game button resets the board', () => {
    render(<Chess />);
    
    const newGameButton = screen.getByText('New Game');
    fireEvent.click(newGameButton);
    
    expect(useChessStore.getState().turn).toBe('white');
    expect(useChessStore.getState().gameState).toBe('playing');
    expect(useChessStore.getState().message).toBe('White to move');
  });

  test('tutorial can be opened and closed', () => {
    render(<Chess />);
    
    const tutorialButton = screen.getByText('📖 Full Tutorial');
    fireEvent.click(tutorialButton);
    
    // Tutorial should be open
    expect(screen.getByText('Chess Tutorial')).toBeInTheDocument();
    
    const closeButton = screen.getByText('Close');
    fireEvent.click(closeButton);
    
    // Tutorial should be closed
    expect(screen.queryByText('Chess Tutorial')).not.toBeInTheDocument();
  });

  test('keyboard navigation works', () => {
    render(<Chess />);
    
    const gameContainer = screen.getByRole('button', { name: /1, 1/ });
    gameContainer.focus();
    
    // Test arrow key navigation
    fireEvent.keyDown(gameContainer, { key: 'ArrowRight' });
    expect(screen.getByLabelText('1, 2 ')).toHaveFocus();
  });

  test('undo and redo buttons work correctly', () => {
    render(<Chess />);
    
    const undoButton = screen.getByText('↩ Undo');
    const redoButton = screen.getByText('↪ Redo');
    
    // Initially, undo should be disabled
    expect(undoButton).toBeDisabled();
    expect(redoButton).toBeDisabled();
    
    // Make a move
    const e2Cell = screen.getByLabelText('7, 5 ♙');
    const e4Cell = screen.getByLabelText('5, 5 ');
    
    fireEvent.click(e2Cell);
    fireEvent.click(e4Cell);
    
    // Now undo should be enabled
    expect(undoButton).not.toBeDisabled();
  });
}); 