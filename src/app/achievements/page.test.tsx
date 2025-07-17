import { render, screen } from '@testing-library/react';
import Achievements from './page';

// Mock Next.js Link component
jest.mock('next/link', () => {
  return function MockLink({ children, href, ...props }: any) {
    return <a href={href} {...props}>{children}</a>;
  };
});

describe('Achievements Page', () => {
  it('renders achievements page with correct title', () => {
    render(<Achievements />);
    expect(screen.getByText('🏆 Achievements')).toBeInTheDocument();
  });

  it('displays progress overview with correct statistics', () => {
    render(<Achievements />);
    expect(screen.getByText('Progress Overview')).toBeInTheDocument();
    expect(screen.getByText('Achievements Unlocked')).toBeInTheDocument();
    expect(screen.getByText('Total Achievements')).toBeInTheDocument();
    expect(screen.getByText('Completion Rate')).toBeInTheDocument();
  });

  it('shows all achievement categories', () => {
    render(<Achievements />);
    expect(screen.getByText('🎮 Game Achievements')).toBeInTheDocument();
    expect(screen.getByText('⚡ Skill Achievements')).toBeInTheDocument();
    expect(screen.getByText('📦 Collection Achievements')).toBeInTheDocument();
    expect(screen.getByText('👥 Social Achievements')).toBeInTheDocument();
  });

  it('displays specific achievements with correct information', () => {
    render(<Achievements />);
    
    // Check for specific achievements
    expect(screen.getByText('First Checkmate')).toBeInTheDocument();
    expect(screen.getByText('Win your first game of Chess')).toBeInTheDocument();
    
    expect(screen.getByText('Chess Master')).toBeInTheDocument();
    expect(screen.getByText('Win 50 games of Chess')).toBeInTheDocument();
    
    expect(screen.getByText('Checkers King')).toBeInTheDocument();
    expect(screen.getByText('Win 25 games of Checkers')).toBeInTheDocument();
    
    expect(screen.getByText('Backgammon Expert')).toBeInTheDocument();
    expect(screen.getByText('Win 20 games of Backgammon')).toBeInTheDocument();
    
    expect(screen.getByText('Card Shark')).toBeInTheDocument();
    expect(screen.getByText('Win 30 card games (Gin Rummy + Crazy 8s)')).toBeInTheDocument();
    
    expect(screen.getByText('Crazy 8s Champion')).toBeInTheDocument();
    expect(screen.getByText('Win 40 games of Crazy 8s')).toBeInTheDocument();
  });

  it('shows skill achievements', () => {
    render(<Achievements />);
    expect(screen.getByText('Winning Streak')).toBeInTheDocument();
    expect(screen.getByText('Win 5 games in a row')).toBeInTheDocument();
    
    expect(screen.getByText('Comeback King')).toBeInTheDocument();
    expect(screen.getByText('Win a game after being down by 5+ points')).toBeInTheDocument();
    
    expect(screen.getByText('Speed Demon')).toBeInTheDocument();
    expect(screen.getByText('Win a game in under 2 minutes')).toBeInTheDocument();
  });

  it('shows collection achievements', () => {
    render(<Achievements />);
    expect(screen.getByText('Game Collector')).toBeInTheDocument();
    expect(screen.getByText('Play all 5 available games')).toBeInTheDocument();
    
    expect(screen.getByText('Tutorial Master')).toBeInTheDocument();
    expect(screen.getByText('Complete all game tutorials')).toBeInTheDocument();
  });

  it('shows social achievements', () => {
    render(<Achievements />);
    expect(screen.getByText('First Replay')).toBeInTheDocument();
    expect(screen.getByText('Watch your first game replay')).toBeInTheDocument();
    
    expect(screen.getByText('Challenge Accepter')).toBeInTheDocument();
    expect(screen.getByText('Complete 10 daily challenges')).toBeInTheDocument();
  });

  it('displays rarity badges', () => {
    render(<Achievements />);
    expect(screen.getByText('COMMON')).toBeInTheDocument();
    expect(screen.getByText('RARE')).toBeInTheDocument();
    expect(screen.getByText('EPIC')).toBeInTheDocument();
    expect(screen.getByText('LEGENDARY')).toBeInTheDocument();
  });

  it('shows completion status for achievements', () => {
    render(<Achievements />);
    
    // Check for completed achievements
    expect(screen.getByText('✅ Completed on 2024-01-15')).toBeInTheDocument();
    expect(screen.getByText('✅ Completed on 2024-01-20')).toBeInTheDocument();
    expect(screen.getByText('✅ Completed on 2024-01-10')).toBeInTheDocument();
    expect(screen.getByText('✅ Completed on 2024-01-18')).toBeInTheDocument();
    
    // Check for progress indicators
    expect(screen.getByText('Progress: 12/50')).toBeInTheDocument();
    expect(screen.getByText('Progress: 15/25')).toBeInTheDocument();
    expect(screen.getByText('Progress: 8/20')).toBeInTheDocument();
    expect(screen.getByText('Progress: 28/30')).toBeInTheDocument();
    expect(screen.getByText('Progress: 18/40')).toBeInTheDocument();
  });

  it('shows category progress counts', () => {
    render(<Achievements />);
    expect(screen.getByText('(1/6)')).toBeInTheDocument(); // Game achievements
    expect(screen.getByText('(1/3)')).toBeInTheDocument(); // Skill achievements
    expect(screen.getByText('(1/2)')).toBeInTheDocument(); // Collection achievements
    expect(screen.getByText('(1/2)')).toBeInTheDocument(); // Social achievements
  });

  it('has back to lobby link', () => {
    render(<Achievements />);
    const backLink = screen.getByText('← Back to Lobby');
    expect(backLink).toBeInTheDocument();
    expect(backLink.closest('a')).toHaveAttribute('href', '/');
  });
}); 