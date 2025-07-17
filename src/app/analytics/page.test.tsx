import { render, screen } from '@testing-library/react';
import Analytics from './page';

// Mock Next.js Link component
jest.mock('next/link', () => {
  return function MockLink({ children, href, ...props }: any) {
    return <a href={href} {...props}>{children}</a>;
  };
});

describe('Analytics Page', () => {
  it('renders analytics dashboard with correct title', () => {
    render(<Analytics />);
    expect(screen.getByText('📊 Game Analytics')).toBeInTheDocument();
  });

  it('displays overall performance statistics', () => {
    render(<Analytics />);
    expect(screen.getByText('Overall Performance')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument(); // Total Games
    expect(screen.getByText('63')).toBeInTheDocument(); // Total Wins
    expect(screen.getByText('63%')).toBeInTheDocument(); // Win Rate
    expect(screen.getByText('Crazy 8s')).toBeInTheDocument(); // Best Game
  });

  it('shows game breakdown for all games', () => {
    render(<Analytics />);
    expect(screen.getByText('Game Breakdown')).toBeInTheDocument();
    expect(screen.getByText('Chess')).toBeInTheDocument();
    expect(screen.getByText('Checkers')).toBeInTheDocument();
    expect(screen.getByText('Backgammon')).toBeInTheDocument();
    expect(screen.getByText('Gin Rummy')).toBeInTheDocument();
    expect(screen.getByText('Crazy 8s')).toBeInTheDocument();
  });

  it('displays performance insights', () => {
    render(<Analytics />);
    expect(screen.getByText('Performance Insights')).toBeInTheDocument();
    expect(screen.getByText(/Strongest Game/)).toBeInTheDocument();
    expect(screen.getByText(/Most Improved/)).toBeInTheDocument();
    expect(screen.getByText(/Challenge Area/)).toBeInTheDocument();
    expect(screen.getByText(/Average Session/)).toBeInTheDocument();
  });

  it('shows correct win rates for each game', () => {
    render(<Analytics />);
    expect(screen.getByText('60%')).toBeInTheDocument(); // Chess
    expect(screen.getByText('75%')).toBeInTheDocument(); // Checkers
    expect(screen.getByText('40%')).toBeInTheDocument(); // Backgammon
    expect(screen.getByText('50%')).toBeInTheDocument(); // Gin Rummy
    expect(screen.getByText('90%')).toBeInTheDocument(); // Crazy 8s
  });

  it('has back to lobby link', () => {
    render(<Analytics />);
    const backLink = screen.getByText('← Back to Lobby');
    expect(backLink).toBeInTheDocument();
    expect(backLink.closest('a')).toHaveAttribute('href', '/');
  });
}); 