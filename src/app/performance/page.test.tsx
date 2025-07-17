import { render, screen } from '@testing-library/react';
import Performance from './page';

// Mock Next.js Link component
jest.mock('next/link', () => {
  return function MockLink({ children, href, ...props }: any) {
    return <a href={href} {...props}>{children}</a>;
  };
});

describe('Performance Page', () => {
  it('renders performance page with correct title', () => {
    render(<Performance />);
    expect(screen.getByText('📊 Performance Analytics')).toBeInTheDocument();
  });

  it('displays performance options', () => {
    render(<Performance />);
    expect(screen.getByText('Performance Options')).toBeInTheDocument();
    expect(screen.getByText('Game:')).toBeInTheDocument();
    expect(screen.getByText('Period:')).toBeInTheDocument();
  });

  it('shows overall performance statistics', () => {
    render(<Performance />);
    expect(screen.getByText('Overall Performance')).toBeInTheDocument();
    expect(screen.getByText('Total Games')).toBeInTheDocument();
    expect(screen.getByText('Win Rate')).toBeInTheDocument();
    expect(screen.getByText('Avg Game Time')).toBeInTheDocument();
    expect(screen.getByText('Rating')).toBeInTheDocument();
  });

  it('displays game performance breakdown', () => {
    render(<Performance />);
    expect(screen.getByText('Game Performance Breakdown')).toBeInTheDocument();
    expect(screen.getByText('Chess')).toBeInTheDocument();
    expect(screen.getByText('Checkers')).toBeInTheDocument();
    expect(screen.getByText('Backgammon')).toBeInTheDocument();
    expect(screen.getByText('Gin Rummy')).toBeInTheDocument();
    expect(screen.getByText('Crazy 8s')).toBeInTheDocument();
  });

  it('shows game statistics correctly', () => {
    render(<Performance />);
    
    // Check for specific game stats
    expect(screen.getByText('156')).toBeInTheDocument(); // Chess total games
    expect(screen.getByText('79.5%')).toBeInTheDocument(); // Chess win rate
    expect(screen.getByText('2450')).toBeInTheDocument(); // Chess rating
    
    expect(screen.getByText('142')).toBeInTheDocument(); // Checkers total games
    expect(screen.getByText('76.1%')).toBeInTheDocument(); // Checkers win rate
    expect(screen.getByText('2380')).toBeInTheDocument(); // Checkers rating
  });

  it('displays game icons', () => {
    render(<Performance />);
    expect(screen.getByText('♔')).toBeInTheDocument(); // Chess
    expect(screen.getByText('●')).toBeInTheDocument(); // Checkers
    expect(screen.getByText('⚀')).toBeInTheDocument(); // Backgammon
    expect(screen.getByText('🃏')).toBeInTheDocument(); // Gin Rummy
    expect(screen.getByText('🎴')).toBeInTheDocument(); // Crazy 8s
  });

  it('shows recent performance indicators', () => {
    render(<Performance />);
    expect(screen.getByText('Recent Performance (Last 10 games):')).toBeInTheDocument();
    
    // Check for win/loss indicators
    expect(screen.getByText('W')).toBeInTheDocument();
    expect(screen.getByText('L')).toBeInTheDocument();
  });

  it('displays performance trends', () => {
    render(<Performance />);
    expect(screen.getByText('Performance Trends')).toBeInTheDocument();
    
    // Check for trend data
    expect(screen.getByText('2400')).toBeInTheDocument(); // Rating
    expect(screen.getByText('2450')).toBeInTheDocument(); // Latest rating
  });

  it('shows rating changes', () => {
    render(<Performance />);
    expect(screen.getByText('↗️')).toBeInTheDocument(); // Rating increase
    expect(screen.getByText('45')).toBeInTheDocument(); // Rating change
  });

  it('displays game details', () => {
    render(<Performance />);
    expect(screen.getByText('124W 28L 4D')).toBeInTheDocument(); // Chess record
    expect(screen.getByText('108W 30L 4D')).toBeInTheDocument(); // Checkers record
    expect(screen.getByText('78W 18L 2D')).toBeInTheDocument(); // Backgammon record
  });

  it('shows time statistics', () => {
    render(<Performance />);
    expect(screen.getByText('25m')).toBeInTheDocument(); // Chess avg time
    expect(screen.getByText('12m')).toBeInTheDocument(); // Checkers avg time
    expect(screen.getByText('18m')).toBeInTheDocument(); // Backgammon avg time
  });

  it('displays move statistics', () => {
    render(<Performance />);
    expect(screen.getByText('42')).toBeInTheDocument(); // Chess avg moves
    expect(screen.getByText('18')).toBeInTheDocument(); // Checkers avg moves
    expect(screen.getByText('25')).toBeInTheDocument(); // Backgammon avg moves
  });

  it('shows streak information', () => {
    render(<Performance />);
    expect(screen.getByText('8')).toBeInTheDocument(); // Current streak
    expect(screen.getByText('15')).toBeInTheDocument(); // Best streak
  });

  it('has back to lobby link', () => {
    render(<Performance />);
    const backLink = screen.getByText('← Back to Lobby');
    expect(backLink).toBeInTheDocument();
    expect(backLink.closest('a')).toHaveAttribute('href', '/');
  });
}); 