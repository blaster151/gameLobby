import React from 'react';
import Link from 'next/link';

interface GameStats {
  wins: number;
  losses: number;
  totalGames: number;
  winRate: number;
  averageGameTime?: number;
  bestScore?: number;
}

interface AnalyticsData {
  chess: GameStats;
  checkers: GameStats;
  backgammon: GameStats;
  ginRummy: GameStats;
  crazy8s: GameStats;
  totalGames: number;
  totalWins: number;
  overallWinRate: number;
  favoriteGame: string;
  mostPlayedGame: string;
}

export default function Analytics() {
  // In a real implementation, this would come from a centralized analytics store
  // For now, we'll simulate the data
  const analyticsData: AnalyticsData = {
    chess: { wins: 12, losses: 8, totalGames: 20, winRate: 60 },
    checkers: { wins: 15, losses: 5, totalGames: 20, winRate: 75 },
    backgammon: { wins: 8, losses: 12, totalGames: 20, winRate: 40 },
    ginRummy: { wins: 10, losses: 10, totalGames: 20, winRate: 50 },
    crazy8s: { wins: 18, losses: 2, totalGames: 20, winRate: 90 },
    totalGames: 100,
    totalWins: 63,
    overallWinRate: 63,
    favoriteGame: 'Crazy 8s',
    mostPlayedGame: 'Chess'
  };

  const games = [
    { name: 'Chess', data: analyticsData.chess, color: '#3b82f6' },
    { name: 'Checkers', data: analyticsData.checkers, color: '#ef4444' },
    { name: 'Backgammon', data: analyticsData.backgammon, color: '#10b981' },
    { name: 'Gin Rummy', data: analyticsData.ginRummy, color: '#f59e0b' },
    { name: 'Crazy 8s', data: analyticsData.crazy8s, color: '#8b5cf6' }
  ];

  return (
    <div style={{ padding: 24, color: 'white', minHeight: '100vh', background: 'linear-gradient(135deg, #1e3a8a, #6d28d9, #312e81)' }}>
      <Link href="/" style={{ color: '#60a5fa', textDecoration: 'underline' }}>← Back to Lobby</Link>
      <h1 style={{ fontSize: '2.5rem', margin: '1rem 0', textAlign: 'center' }}>📊 Game Analytics</h1>
      
      {/* Overall Stats */}
      <div style={{ 
        background: 'rgba(255,255,255,0.1)', 
        padding: 24, 
        borderRadius: 12, 
        marginBottom: 24,
        backdropFilter: 'blur(10px)'
      }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: 16 }}>Overall Performance</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          <div style={{ textAlign: 'center', padding: 16, background: 'rgba(255,255,255,0.1)', borderRadius: 8 }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#60a5fa' }}>{analyticsData.totalGames}</div>
            <div>Total Games</div>
          </div>
          <div style={{ textAlign: 'center', padding: 16, background: 'rgba(255,255,255,0.1)', borderRadius: 8 }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>{analyticsData.totalWins}</div>
            <div>Total Wins</div>
          </div>
          <div style={{ textAlign: 'center', padding: 16, background: 'rgba(255,255,255,0.1)', borderRadius: 8 }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>{analyticsData.overallWinRate}%</div>
            <div>Win Rate</div>
          </div>
          <div style={{ textAlign: 'center', padding: 16, background: 'rgba(255,255,255,0.1)', borderRadius: 8 }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#8b5cf6' }}>{analyticsData.favoriteGame}</div>
            <div>Best Game</div>
          </div>
        </div>
      </div>

      {/* Game Breakdown */}
      <div style={{ 
        background: 'rgba(255,255,255,0.1)', 
        padding: 24, 
        borderRadius: 12, 
        marginBottom: 24,
        backdropFilter: 'blur(10px)'
      }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: 16 }}>Game Breakdown</h2>
        <div style={{ display: 'grid', gap: 16 }}>
          {games.map(game => (
            <div key={game.name} style={{ 
              display: 'flex', 
              alignItems: 'center', 
              padding: 16, 
              background: 'rgba(255,255,255,0.05)', 
              borderRadius: 8,
              border: `2px solid ${game.color}`
            }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: '0 0 8px 0', color: game.color }}>{game.name}</h3>
                <div style={{ display: 'flex', gap: 16, fontSize: '0.9rem' }}>
                  <span>Games: {game.data.totalGames}</span>
                  <span>Wins: {game.data.wins}</span>
                  <span>Losses: {game.data.losses}</span>
                  <span style={{ color: game.color, fontWeight: 'bold' }}>Win Rate: {game.data.winRate}%</span>
                </div>
              </div>
              <div style={{ 
                width: 60, 
                height: 60, 
                borderRadius: '50%', 
                background: `conic-gradient(${game.color} ${game.data.winRate * 3.6}deg, rgba(255,255,255,0.1) 0deg)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.8rem',
                fontWeight: 'bold'
              }}>
                {game.data.winRate}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Trends */}
      <div style={{ 
        background: 'rgba(255,255,255,0.1)', 
        padding: 24, 
        borderRadius: 12,
        backdropFilter: 'blur(10px)'
      }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: 16 }}>Performance Insights</h2>
        <div style={{ display: 'grid', gap: 12 }}>
          <div style={{ padding: 12, background: 'rgba(255,255,255,0.05)', borderRadius: 8 }}>
            <strong>🎯 Strongest Game:</strong> Crazy 8s with 90% win rate
          </div>
          <div style={{ padding: 12, background: 'rgba(255,255,255,0.05)', borderRadius: 8 }}>
            <strong>📈 Most Improved:</strong> Checkers - recent games show 80% win rate
          </div>
          <div style={{ padding: 12, background: 'rgba(255,255,255,0.05)', borderRadius: 8 }}>
            <strong>🎲 Challenge Area:</strong> Backgammon - consider practicing more
          </div>
          <div style={{ padding: 12, background: 'rgba(255,255,255,0.05)', borderRadius: 8 }}>
            <strong>⏱️ Average Session:</strong> 45 minutes per gaming session
          </div>
        </div>
      </div>
    </div>
  );
} 