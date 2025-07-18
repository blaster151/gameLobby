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
    
    // Use getAllByText since these appear multiple times
    const winsElements = screen.getAllByText('Wins');
    expect(winsElements.length).toBeGreaterThan(0);
    
    const lossesElements = screen.getAllByText('Losses');
    expect(lossesElements.length).toBeGreaterThan(0);
    
    const drawsElements = screen.getAllByText('Draws');
    expect(drawsElements.length).toBeGreaterThan(0);
    
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
    
    // Use getAllByText since these appear multiple times
    const winIcons = screen.getAllByText('🏆');
    expect(winIcons.length).toBeGreaterThan(0);
    
    const lossIcons = screen.getAllByText('💔');
    expect(lossIcons.length).toBeGreaterThan(0);
    
    const drawIcons = screen.getAllByText('🤝');
    expect(drawIcons.length).toBeGreaterThan(0);
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