import React, { useState } from 'react';
import Link from 'next/link';

interface PerformanceMetric {
  gameType: string;
  totalGames: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
  averageGameTime: number;
  bestTime: number;
  worstTime: number;
  averageMoves: number;
  rating: number;
  ratingChange: number;
  streak: number;
  bestStreak: number;
  recentPerformance: number[]; // Last 10 games (1 = win, 0 = loss, 0.5 = draw)
}

interface TrendData {
  date: string;
  rating: number;
  gamesPlayed: number;
  winRate: number;
}

export default function Performance() {
  const [selectedGame, setSelectedGame] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');

  // Mock performance data
  const performanceData: PerformanceMetric[] = [
    {
      gameType: 'chess',
      totalGames: 156,
      wins: 124,
      losses: 28,
      draws: 4,
      winRate: 79.5,
      averageGameTime: 25,
      bestTime: 8,
      worstTime: 45,
      averageMoves: 42,
      rating: 2450,
      ratingChange: 45,
      streak: 8,
      bestStreak: 15,
      recentPerformance: [1, 1, 1, 0, 1, 1, 1, 1, 1, 0]
    },
    {
      gameType: 'checkers',
      totalGames: 142,
      wins: 108,
      losses: 30,
      draws: 4,
      winRate: 76.1,
      averageGameTime: 12,
      bestTime: 3,
      worstTime: 28,
      averageMoves: 18,
      rating: 2380,
      ratingChange: 32,
      streak: 5,
      bestStreak: 12,
      recentPerformance: [1, 0, 1, 1, 1, 0, 1, 1, 0, 1]
    },
    {
      gameType: 'backgammon',
      totalGames: 98,
      wins: 78,
      losses: 18,
      draws: 2,
      winRate: 79.6,
      averageGameTime: 18,
      bestTime: 5,
      worstTime: 35,
      averageMoves: 25,
      rating: 2320,
      ratingChange: 28,
      streak: 12,
      bestStreak: 12,
      recentPerformance: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    },
    {
      gameType: 'ginRummy',
      totalGames: 134,
      wins: 95,
      losses: 35,
      draws: 4,
      winRate: 70.9,
      averageGameTime: 8,
      bestTime: 2,
      worstTime: 15,
      averageMoves: 12,
      rating: 2280,
      ratingChange: 15,
      streak: 3,
      bestStreak: 9,
      recentPerformance: [1, 0, 1, 0, 1, 1, 0, 1, 0, 1]
    },
    {
      gameType: 'crazy8s',
      totalGames: 89,
      wins: 67,
      losses: 20,
      draws: 2,
      winRate: 75.3,
      averageGameTime: 5,
      bestTime: 1,
      worstTime: 12,
      averageMoves: 8,
      rating: 2250,
      ratingChange: 22,
      streak: 6,
      bestStreak: 11,
      recentPerformance: [1, 1, 0, 1, 1, 1, 1, 0, 1, 1]
    }
  ];

  // Mock trend data
  const trendData: TrendData[] = [
    { date: '2024-01-19', rating: 2400, gamesPlayed: 5, winRate: 80 },
    { date: '2024-01-20', rating: 2410, gamesPlayed: 8, winRate: 75 },
    { date: '2024-01-21', rating: 2420, gamesPlayed: 6, winRate: 83 },
    { date: '2024-01-22', rating: 2430, gamesPlayed: 7, winRate: 86 },
    { date: '2024-01-23', rating: 2440, gamesPlayed: 9, winRate: 78 },
    { date: '2024-01-24', rating: 2445, gamesPlayed: 4, winRate: 100 },
    { date: '2024-01-25', rating: 2450, gamesPlayed: 6, winRate: 83 }
  ];

  const getGameIcon = (gameType: string) => {
    switch (gameType) {
      case 'chess': return '♔';
      case 'checkers': return '●';
      case 'backgammon': return '⚀';
      case 'ginRummy': return '🃏';
      case 'crazy8s': return '🎴';
      default: return '🎮';
    }
  };

  const getGameName = (gameType: string) => {
    switch (gameType) {
      case 'chess': return 'Chess';
      case 'checkers': return 'Checkers';
      case 'backgammon': return 'Backgammon';
      case 'ginRummy': return 'Gin Rummy';
      case 'crazy8s': return 'Crazy 8s';
      default: return gameType;
    }
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getPerformanceColor = (winRate: number) => {
    if (winRate >= 80) return '#10b981';
    if (winRate >= 70) return '#f59e0b';
    if (winRate >= 60) return '#3b82f6';
    return '#ef4444';
  };

  const getRatingChangeColor = (change: number) => {
    if (change > 0) return '#10b981';
    if (change < 0) return '#ef4444';
    return '#6b7280';
  };

  const getRatingChangeIcon = (change: number) => {
    if (change > 0) return '↗️';
    if (change < 0) return '↘️';
    return '→';
  };

  const calculateOverallStats = () => {
    const total = performanceData.reduce((acc, game) => ({
      totalGames: acc.totalGames + game.totalGames,
      wins: acc.wins + game.wins,
      losses: acc.losses + game.losses,
      draws: acc.draws + game.draws,
      totalTime: acc.totalTime + (game.averageGameTime * game.totalGames),
      totalMoves: acc.totalMoves + (game.averageMoves * game.totalGames),
      totalRating: acc.totalRating + game.rating
    }), { totalGames: 0, wins: 0, losses: 0, draws: 0, totalTime: 0, totalMoves: 0, totalRating: 0 });

    return {
      totalGames: total.totalGames,
      winRate: Math.round((total.wins / total.totalGames) * 100),
      averageGameTime: Math.round(total.totalTime / total.totalGames),
      averageMoves: Math.round(total.totalMoves / total.totalGames),
      averageRating: Math.round(total.totalRating / performanceData.length)
    };
  };

  const overallStats = calculateOverallStats();
  const selectedGameData = selectedGame === 'all' ? null : performanceData.find(g => g.gameType === selectedGame);

  return (
    <div style={{ padding: 24, color: 'white', minHeight: '100vh', background: 'linear-gradient(135deg, #1e3a8a, #6d28d9, #312e81)' }}>
      <Link href="/" style={{ color: '#60a5fa', textDecoration: 'underline' }}>← Back to Lobby</Link>
      <h1 style={{ fontSize: '2.5rem', margin: '1rem 0', textAlign: 'center' }}>📊 Performance Analytics</h1>
      
      {/* Filters */}
      <div style={{ 
        background: 'rgba(255,255,255,0.1)', 
        padding: 24, 
        borderRadius: 12, 
        marginBottom: 24,
        backdropFilter: 'blur(10px)'
      }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: 16 }}>Performance Options</h2>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          <div>
            <label style={{ display: 'block', marginBottom: 4 }}>Game:</label>
            <select
              value={selectedGame}
              onChange={(e) => setSelectedGame(e.target.value)}
              style={{ 
                padding: '8px 12px', 
                borderRadius: 4, 
                background: '#333',
                color: 'white',
                border: '1px solid #555'
              }}
            >
              <option value="all">All Games</option>
              <option value="chess">Chess</option>
              <option value="checkers">Checkers</option>
              <option value="backgammon">Backgammon</option>
              <option value="ginRummy">Gin Rummy</option>
              <option value="crazy8s">Crazy 8s</option>
            </select>
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: 4 }}>Period:</label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as any)}
              style={{ 
                padding: '8px 12px', 
                borderRadius: 4, 
                background: '#333',
                color: 'white',
                border: '1px solid #555'
              }}
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
          </div>
        </div>
      </div>

      {/* Overall Performance */}
      <div style={{ 
        background: 'rgba(255,255,255,0.1)', 
        padding: 24, 
        borderRadius: 12, 
        marginBottom: 24,
        backdropFilter: 'blur(10px)'
      }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: 16 }}>
          {selectedGame === 'all' ? 'Overall Performance' : `${getGameName(selectedGame)} Performance`}
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          <div style={{ textAlign: 'center', padding: 16, background: 'rgba(255,255,255,0.1)', borderRadius: 8 }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#60a5fa' }}>
              {selectedGame === 'all' ? overallStats.totalGames : selectedGameData?.totalGames}
            </div>
            <div>Total Games</div>
          </div>
          <div style={{ textAlign: 'center', padding: 16, background: 'rgba(255,255,255,0.1)', borderRadius: 8 }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: getPerformanceColor(selectedGame === 'all' ? overallStats.winRate : selectedGameData?.winRate || 0) }}>
              {selectedGame === 'all' ? overallStats.winRate : selectedGameData?.winRate}%
            </div>
            <div>Win Rate</div>
          </div>
          <div style={{ textAlign: 'center', padding: 16, background: 'rgba(255,255,255,0.1)', borderRadius: 8 }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>
              {selectedGame === 'all' ? overallStats.averageGameTime : selectedGameData?.averageGameTime}m
            </div>
            <div>Avg Game Time</div>
          </div>
          <div style={{ textAlign: 'center', padding: 16, background: 'rgba(255,255,255,0.1)', borderRadius: 8 }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>
              {selectedGame === 'all' ? overallStats.averageRating : selectedGameData?.rating}
            </div>
            <div>Rating</div>
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
        <h2 style={{ fontSize: '1.5rem', marginBottom: 16 }}>Game Performance Breakdown</h2>
        <div style={{ display: 'grid', gap: 16 }}>
          {performanceData.map(game => (
            <div key={game.gameType} style={{ 
              padding: 20, 
              background: 'rgba(255,255,255,0.05)', 
              borderRadius: 8,
              border: `2px solid ${getPerformanceColor(game.winRate)}`
            }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
                <div style={{ fontSize: '2.5rem', marginRight: 16 }}>
                  {getGameIcon(game.gameType)}
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '1.3rem' }}>
                    {getGameName(game.gameType)}
                  </h3>
                  <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>
                    {game.totalGames} games • {game.wins}W {game.losses}L {game.draws}D
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: getPerformanceColor(game.winRate) }}>
                    {game.winRate}%
                  </div>
                  <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>Win Rate</div>
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16 }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#60a5fa' }}>
                    {game.rating}
                  </div>
                  <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>Rating</div>
                  <div style={{ fontSize: '0.8rem', color: getRatingChangeColor(game.ratingChange) }}>
                    {getRatingChangeIcon(game.ratingChange)} {Math.abs(game.ratingChange)}
                  </div>
                </div>
                
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#10b981' }}>
                    {formatTime(game.averageGameTime)}
                  </div>
                  <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>Avg Time</div>
                  <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>
                    Best: {formatTime(game.bestTime)}
                  </div>
                </div>
                
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#f59e0b' }}>
                    {game.averageMoves}
                  </div>
                  <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>Avg Moves</div>
                </div>
                
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#8b5cf6' }}>
                    {game.streak}
                  </div>
                  <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>Current Streak</div>
                  <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>
                    Best: {game.bestStreak}
                  </div>
                </div>
              </div>
              
              {/* Recent Performance */}
              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: '0.9rem', marginBottom: 8, opacity: 0.8 }}>Recent Performance (Last 10 games):</div>
                <div style={{ display: 'flex', gap: 4 }}>
                  {game.recentPerformance.map((result, index) => (
                    <div
                      key={index}
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        background: result === 1 ? '#10b981' : result === 0 ? '#ef4444' : '#f59e0b',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.7rem',
                        fontWeight: 'bold'
                      }}
                    >
                      {result === 1 ? 'W' : result === 0 ? 'L' : 'D'}
                    </div>
                  ))}
                </div>
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
        <h2 style={{ fontSize: '1.5rem', marginBottom: 16 }}>Performance Trends</h2>
        <div style={{ display: 'grid', gap: 16 }}>
          {trendData.map((day, index) => (
            <div key={day.date} style={{ 
              display: 'flex', 
              alignItems: 'center', 
              padding: 12, 
              background: 'rgba(255,255,255,0.05)', 
              borderRadius: 8
            }}>
              <div style={{ width: 100, fontSize: '0.9rem' }}>
                {new Date(day.date).toLocaleDateString()}
              </div>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ textAlign: 'center', minWidth: 80 }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#60a5fa' }}>
                    {day.rating}
                  </div>
                  <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>Rating</div>
                </div>
                <div style={{ textAlign: 'center', minWidth: 80 }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#10b981' }}>
                    {day.gamesPlayed}
                  </div>
                  <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>Games</div>
                </div>
                <div style={{ textAlign: 'center', minWidth: 80 }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: getPerformanceColor(day.winRate) }}>
                    {day.winRate}%
                  </div>
                  <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>Win Rate</div>
                </div>
              </div>
              {index > 0 && (
                <div style={{ 
                  fontSize: '0.8rem', 
                  color: day.rating > trendData[index - 1].rating ? '#10b981' : '#ef4444'
                }}>
                  {day.rating > trendData[index - 1].rating ? '↗️' : '↘️'} {Math.abs(day.rating - trendData[index - 1].rating)}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 