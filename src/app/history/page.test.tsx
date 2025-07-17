import { render, screen } from '@testing-library/react';
import GameHistory from './page';

// Mock Next.js Link component
jest.mock('next/link', () => {
  return function MockLink({ children, href, ...props }: any) {
    return <a href={href} {...props}>{children}</a>;
  };
});

describe('Game History Page', () => {
  it('renders game history page with correct title', () => {
    render(<GameHistory />);
    expect(screen.getByText('📜 Game History')).toBeInTheDocument();
  });

  it('displays overall statistics', () => {
    render(<GameHistory />);
    expect(screen.getByText('Overall Statistics')).toBeInTheDocument();
    expect(screen.getByText('Total Games')).toBeInTheDocument();
    expect(screen.getByText('Wins')).toBeInTheDocument();
    expect(screen.getByText('Losses')).toBeInTheDocument();
    expect(screen.getByText('Draws')).toBeInTheDocument();
    expect(screen.getByText('Win Rate')).toBeInTheDocument();
    expect(screen.getByText('Avg Duration')).toBeInTheDocument();
  });

  it('shows filters and sorting options', () => {
    render(<GameHistory />);
    expect(screen.getByText('Filters & Sorting')).toBeInTheDocument();
    expect(screen.getByText('Game Type:')).toBeInTheDocument();
    expect(screen.getByText('Result:')).toBeInTheDocument();
    expect(screen.getByText('Sort By:')).toBeInTheDocument();
    expect(screen.getByText('Order:')).toBeInTheDocument();
  });

  it('displays game records with correct information', () => {
    render(<GameHistory />);
    
    // Check for specific game records
    expect(screen.getByText('Chess vs Bot (Hard)')).toBeInTheDocument();
    expect(screen.getByText('Checkers vs Bot (Medium)')).toBeInTheDocument();
    expect(screen.getByText('Backgammon vs Bot (Easy)')).toBeInTheDocument();
    expect(screen.getByText('Gin Rummy vs Bot (Hard)')).toBeInTheDocument();
    expect(screen.getByText('Crazy 8s vs Bot (Medium)')).toBeInTheDocument();
  });

  it('shows game highlights', () => {
    render(<GameHistory />);
    expect(screen.getByText(/Checkmate with queen sacrifice/)).toBeInTheDocument();
    expect(screen.getByText(/Double jump capture/)).toBeInTheDocument();
    expect(screen.getByText(/Gammon loss/)).toBeInTheDocument();
    expect(screen.getByText(/Gin hand/)).toBeInTheDocument();
    expect(screen.getByText(/Quick victory/)).toBeInTheDocument();
  });

  it('displays result icons correctly', () => {
    render(<GameHistory />);
    expect(screen.getByText('🏆')).toBeInTheDocument(); // Win
    expect(screen.getByText('💔')).toBeInTheDocument(); // Loss
    expect(screen.getByText('🤝')).toBeInTheDocument(); // Draw
  });

  it('shows game statistics correctly', () => {
    render(<GameHistory />);
    expect(screen.getByText('8')).toBeInTheDocument(); // Total games
    expect(screen.getByText('5')).toBeInTheDocument(); // Wins
    expect(screen.getByText('2')).toBeInTheDocument(); // Losses
    expect(screen.getByText('1')).toBeInTheDocument(); // Draws
    expect(screen.getByText('63%')).toBeInTheDocument(); // Win rate
  });

  it('has back to lobby link', () => {
    render(<GameHistory />);
    const backLink = screen.getByText('← Back to Lobby');
    expect(backLink).toBeInTheDocument();
    expect(backLink.closest('a')).toHaveAttribute('href', '/');
  });
}); 