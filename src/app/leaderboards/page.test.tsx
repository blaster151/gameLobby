import { render, screen } from '@testing-library/react';
import Leaderboards from './page';

// Mock Next.js Link component
jest.mock('next/link', () => {
  return function MockLink({ children, href, ...props }: any) {
    return <a href={href} {...props}>{children}</a>;
  };
});

describe('Leaderboards Page', () => {
  it('renders leaderboards page with correct title', () => {
    render(<Leaderboards />);
    expect(screen.getByText('🏆 Leaderboards')).toBeInTheDocument();
  });

  it('displays leaderboard options', () => {
    render(<Leaderboards />);
    expect(screen.getByText('Leaderboard Options')).toBeInTheDocument();
    expect(screen.getByText('Game:')).toBeInTheDocument();
    expect(screen.getByText('Period:')).toBeInTheDocument();
    expect(screen.getByText('Sort By:')).toBeInTheDocument();
  });

  it('shows champions podium', () => {
    render(<Leaderboards />);
    expect(screen.getByText('Overall Champions')).toBeInTheDocument();
    expect(screen.getByText('🥇')).toBeInTheDocument();
    expect(screen.getByText('🥈')).toBeInTheDocument();
    expect(screen.getByText('🥉')).toBeInTheDocument();
  });

  it('displays top players correctly', () => {
    render(<Leaderboards />);
    expect(screen.getByText('ChessMaster2024')).toBeInTheDocument();
    expect(screen.getByText('CheckersChamp')).toBeInTheDocument();
    expect(screen.getByText('BackgammonPro')).toBeInTheDocument();
  });

  it('shows player statistics', () => {
    render(<Leaderboards />);
    expect(screen.getByText('Rating')).toBeInTheDocument();
    expect(screen.getByText('Win Rate')).toBeInTheDocument();
    expect(screen.getByText('Games')).toBeInTheDocument();
    expect(screen.getByText('Streak')).toBeInTheDocument();
    expect(screen.getByText('Achievements')).toBeInTheDocument();
  });

  it('displays player ratings correctly', () => {
    render(<Leaderboards />);
    expect(screen.getByText('2450')).toBeInTheDocument(); // ChessMaster2024 rating
    expect(screen.getByText('2380')).toBeInTheDocument(); // CheckersChamp rating
    expect(screen.getByText('2320')).toBeInTheDocument(); // BackgammonPro rating
  });

  it('shows win rates correctly', () => {
    render(<Leaderboards />);
    expect(screen.getByText('79.5%')).toBeInTheDocument(); // ChessMaster2024 win rate
    expect(screen.getByText('76.1%')).toBeInTheDocument(); // CheckersChamp win rate
    expect(screen.getByText('79.6%')).toBeInTheDocument(); // BackgammonPro win rate
  });

  it('displays game counts correctly', () => {
    render(<Leaderboards />);
    expect(screen.getByText('156')).toBeInTheDocument(); // ChessMaster2024 games
    expect(screen.getByText('142')).toBeInTheDocument(); // CheckersChamp games
    expect(screen.getByText('98')).toBeInTheDocument(); // BackgammonPro games
  });

  it('shows achievement counts', () => {
    render(<Leaderboards />);
    expect(screen.getByText('23')).toBeInTheDocument(); // ChessMaster2024 achievements
    expect(screen.getByText('19')).toBeInTheDocument(); // CheckersChamp achievements
    expect(screen.getByText('17')).toBeInTheDocument(); // BackgammonPro achievements
  });

  it('displays full leaderboard', () => {
    render(<Leaderboards />);
    expect(screen.getByText('Overall Leaderboard')).toBeInTheDocument();
    expect(screen.getByText('#1')).toBeInTheDocument();
    expect(screen.getByText('#2')).toBeInTheDocument();
    expect(screen.getByText('#3')).toBeInTheDocument();
  });

  it('has back to lobby link', () => {
    render(<Leaderboards />);
    const backLink = screen.getByText('← Back to Lobby');
    expect(backLink).toBeInTheDocument();
    expect(backLink.closest('a')).toHaveAttribute('href', '/');
  });
}); 