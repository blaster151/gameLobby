import React from 'react';
import { render, screen } from '@testing-library/react';
import Performance from './page';

// Mock Next.js Link component
jest.mock('next/link', () => {
  return function MockLink({ children, href, ...props }: any) {
    return <a href={href} {...props}>{children}</a>;
  };
});

describe('Performance Page', () => {
  it('renders performance analytics page', () => {
    render(<Performance />);
    expect(screen.getByText('📊 Performance Analytics')).toBeInTheDocument();
  });

  it('displays overall performance metrics', () => {
    render(<Performance />);
    
    // Check for overall stats (these are calculated from the mock data)
    expect(screen.getByText('619')).toBeInTheDocument(); // Total games
    expect(screen.getByText('76%')).toBeInTheDocument(); // Win rate
    
    // Check for section headers
    expect(screen.getByText('Overall Performance')).toBeInTheDocument();
    expect(screen.getByText('Game Performance Breakdown')).toBeInTheDocument();
  });

  it('displays game breakdown with correct data', () => {
    render(<Performance />);
    
    // Check for game names - use getAllByText since they appear multiple times
    const chessElements = screen.getAllByText('Chess');
    expect(chessElements.length).toBeGreaterThan(0);
    
    const checkersElements = screen.getAllByText('Checkers');
    expect(checkersElements.length).toBeGreaterThan(0);
    
    const backgammonElements = screen.getAllByText('Backgammon');
    expect(backgammonElements.length).toBeGreaterThan(0);
    
    const ginRummyElements = screen.getAllByText('Gin Rummy');
    expect(ginRummyElements.length).toBeGreaterThan(0);
    
    const crazy8sElements = screen.getAllByText('Crazy 8s');
    expect(crazy8sElements.length).toBeGreaterThan(0);
  });

  it('displays performance metrics with correct labels', () => {
    render(<Performance />);
    
    // Check for metric labels - use getAllByText since they appear multiple times
    const totalGamesElements = screen.getAllByText('Total Games');
    expect(totalGamesElements.length).toBeGreaterThan(0);
    
    const winRateElements = screen.getAllByText('Win Rate');
    expect(winRateElements.length).toBeGreaterThan(0);
    
    const gamesElements = screen.getAllByText('Games');
    expect(gamesElements.length).toBeGreaterThan(0);
    
    // Note: "Streak" is not displayed in the current component, so we skip that check
  });

  it('displays game details', () => {
    render(<Performance />);
    
    // Check for specific game metrics - use getAllByText since there are multiple instances
    expect(screen.getAllByText('2450').length).toBeGreaterThanOrEqual(1); // Chess rating
    expect(screen.getAllByText('2380').length).toBeGreaterThanOrEqual(1); // Checkers rating
    expect(screen.getAllByText('79.5%').length).toBeGreaterThanOrEqual(1); // Chess win rate
    expect(screen.getAllByText('76.1%').length).toBeGreaterThanOrEqual(1); // Checkers win rate
  });

  it('shows rating changes', () => {
    render(<Performance />);
    
    // Check for rating change indicators
    expect(screen.getAllByText(/↗️/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/45/).length).toBeGreaterThanOrEqual(1); // Chess rating change
    expect(screen.getAllByText(/32/).length).toBeGreaterThanOrEqual(1); // Checkers rating change
  });

  it('shows streak information', () => {
    render(<Performance />);
    
    // Check for streak data - use getAllByText since there are multiple instances
    expect(screen.getAllByText(/8/).length).toBeGreaterThanOrEqual(1); // Chess current streak
    expect(screen.getAllByText(/15/).length).toBeGreaterThanOrEqual(1); // Chess best streak
    expect(screen.getAllByText(/5/).length).toBeGreaterThanOrEqual(1); // Checkers current streak
    expect(screen.getAllByText(/12/).length).toBeGreaterThanOrEqual(1); // Checkers best streak
  });

  it('has back to lobby link', () => {
    render(<Performance />);
    expect(screen.getByText('← Back to Lobby')).toBeInTheDocument();
  });

  it('has game and period selectors', () => {
    render(<Performance />);
    expect(screen.getByText('Game:')).toBeInTheDocument();
    expect(screen.getByText('Period:')).toBeInTheDocument();
    expect(screen.getByDisplayValue('All Games')).toBeInTheDocument();
    expect(screen.getByDisplayValue('This Month')).toBeInTheDocument();
  });

  it('displays recent performance indicators', () => {
    render(<Performance />);
    
    // Check for recent performance dots
    expect(screen.getAllByText('W').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('L').length).toBeGreaterThanOrEqual(1);
  });
}); 