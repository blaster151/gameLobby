import React, { useState } from 'react';
import Link from 'next/link';

interface Player {
  id: string;
  name: string;
  avatar: string;
  rank: number;
  totalGames: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
  rating: number;
  streak: number;
  bestStreak: number;
  achievements: number;
  lastActive: string;
  gameStats: {
    chess: { wins: number; losses: number; rating: number };
    checkers: { wins: number; losses: number; rating: number };
    backgammon: { wins: number; losses: number; rating: number };
    ginRummy: { wins: number; losses: number; rating: number };
    crazy8s: { wins: number; losses: number; rating: number };
  };
}

export default function Leaderboards() {
  const [selectedGame, setSelectedGame] = useState<string>('overall');
  const [selectedPeriod, setSelectedPeriod] = useState<'all' | 'month' | 'week'>('all');
  const [sortBy, setSortBy] = useState<'rating' | 'winRate' | 'games' | 'streak'>('rating');

  // Mock leaderboard data
  const players: Player[] = [
    {
      id: '1',
      name: 'ChessMaster2024',
      avatar: '♔',
      rank: 1,
      totalGames: 156,
      wins: 124,
      losses: 28,
      draws: 4,
      winRate: 79.5,
      rating: 2450,
      streak: 8,
      bestStreak: 15,
      achievements: 23,
      lastActive: '2024-01-25T14:30:00',
      gameStats: {
        chess: { wins: 45, losses: 8, rating: 2450 },
        checkers: { wins: 28, losses: 5, rating: 2300 },
        backgammon: { wins: 18, losses: 7, rating: 2200 },
        ginRummy: { wins: 20, losses: 4, rating: 2350 },
        crazy8s: { wins: 13, losses: 4, rating: 2100 }
      }
    },
    {
      id: '2',
      name: 'CheckersChamp',
      avatar: '●',
      rank: 2,
      totalGames: 142,
      wins: 108,
      losses: 30,
      draws: 4,
      winRate: 76.1,
      rating: 2380,
      streak: 5,
      bestStreak: 12,
      achievements: 19,
      lastActive: '2024-01-25T13:45:00',
      gameStats: {
        chess: { wins: 32, losses: 12, rating: 2250 },
        checkers: { wins: 45, losses: 8, rating: 2380 },
        backgammon: { wins: 15, losses: 6, rating: 2150 },
        ginRummy: { wins: 12, losses: 2, rating: 2300 },
        crazy8s: { wins: 4, losses: 2, rating: 2000 }
      }
    },
    {
      id: '3',
      name: 'BackgammonPro',
      avatar: '⚀',
      rank: 3,
      totalGames: 98,
      wins: 78,
      losses: 18,
      draws: 2,
      winRate: 79.6,
      rating: 2320,
      streak: 12,
      bestStreak: 12,
      achievements: 17,
      lastActive: '2024-01-25T14:25:00',
      gameStats: {
        chess: { wins: 18, losses: 8, rating: 2100 },
        checkers: { wins: 22, losses: 6, rating: 2200 },
        backgammon: { wins: 25, losses: 2, rating: 2320 },
        ginRummy: { wins: 8, losses: 1, rating: 2250 },
        crazy8s: { wins: 5, losses: 1, rating: 2050 }
      }
    },
    {
      id: '4',
      name: 'CardShark',
      avatar: '🃏',
      rank: 4,
      totalGames: 134,
      wins: 95,
      losses: 35,
      draws: 4,
      winRate: 70.9,
      rating: 2280,
      streak: 3,
      bestStreak: 9,
      achievements: 21,
      lastActive: '2024-01-25T12:15:00',
      gameStats: {
        chess: { wins: 25, losses: 10, rating: 2150 },
        checkers: { wins: 28, losses: 8, rating: 2250 },
        backgammon: { wins: 12, losses: 5, rating: 2100 },
        ginRummy: { wins: 18, losses: 6, rating: 2280 },
        crazy8s: { wins: 12, losses: 6, rating: 2200 }
      }
    },
    {
      id: '5',
      name: 'SpeedPlayer',
      avatar: '⚡',
      rank: 5,
      totalGames: 89,
      wins: 67,
      losses: 20,
      draws: 2,
      winRate: 75.3,
      rating: 2250,
      streak: 6,
      bestStreak: 11,
      achievements: 15,
      lastActive: '2024-01-25T14:10:00',
      gameStats: {
        chess: { wins: 20, losses: 8, rating: 2100 },
        checkers: { wins: 18, losses: 5, rating: 2200 },
        backgammon: { wins: 10, losses: 4, rating: 2050 },
        ginRummy: { wins: 12, losses: 2, rating: 2250 },
        crazy8s: { wins: 7, losses: 1, rating: 2250 }
      }
    },
    {
      id: '6',
      name: 'GameCollector',
      avatar: '🎮',
      rank: 6,
      totalGames: 203,
      wins: 145,
      losses: 52,
      draws: 6,
      winRate: 71.4,
      rating: 2220,
      streak: 2,
      bestStreak: 8,
      achievements: 28,
      lastActive: '2024-01-25T11:30:00',
      gameStats: {
        chess: { wins: 35, losses: 15, rating: 2100 },
        checkers: { wins: 38, losses: 12, rating: 2200 },
        backgammon: { wins: 28, losses: 10, rating: 2150 },
        ginRummy: { wins: 25, losses: 8, rating: 2200 },
        crazy8s: { wins: 19, losses: 7, rating: 2100 }
      }
    },
    {
      id: '7',
      name: 'TacticalMind',
      avatar: '🧠',
      rank: 7,
      totalGames: 76,
      wins: 58,
      losses: 16,
      draws: 2,
      winRate: 76.3,
      rating: 2200,
      streak: 4,
      bestStreak: 7,
      achievements: 12,
      lastActive: '2024-01-25T13:20:00',
      gameStats: {
        chess: { wins: 22, losses: 6, rating: 2200 },
        checkers: { wins: 18, losses: 4, rating: 2150 },
        backgammon: { wins: 8, losses: 3, rating: 2000 },
        ginRummy: { wins: 6, losses: 2, rating: 2100 },
        crazy8s: { wins: 4, losses: 1, rating: 2000 }
      }
    },
    {
      id: '8',
      name: 'LuckyDice',
      avatar: '🎲',
      rank: 8,
      totalGames: 112,
      wins: 78,
      losses: 30,
      draws: 4,
      winRate: 69.6,
      rating: 2180,
      streak: 1,
      bestStreak: 6,
      achievements: 16,
      lastActive: '2024-01-25T10:45:00',
      gameStats: {
        chess: { wins: 28, losses: 12, rating: 2050 },
        checkers: { wins: 25, losses: 8, rating: 2150 },
        backgammon: { wins: 15, losses: 5, rating: 2180 },
        ginRummy: { wins: 6, losses: 3, rating: 2000 },
        crazy8s: { wins: 4, losses: 2, rating: 1950 }
      }
    }
  ];

  const getGameIcon = (gameType: string) => {
    switch (gameType) {
      case 'chess': return '♔';
      case 'checkers': return '●';
      case 'backgammon': return '⚀';
      case 'ginRummy': return '🃏';
      case 'crazy8s': return '🎴';
      default: return '🏆';
    }
  };

  const getGameName = (gameType: string) => {
    switch (gameType) {
      case 'overall': return 'Overall';
      case 'chess': return 'Chess';
      case 'checkers': return 'Checkers';
      case 'backgammon': return 'Backgammon';
      case 'ginRummy': return 'Gin Rummy';
      case 'crazy8s': return 'Crazy 8s';
      default: return gameType;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return '#fbbf24'; // Gold
      case 2: return '#9ca3af'; // Silver
      case 3: return '#b45309'; // Bronze
      default: return '#6b7280';
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    if (diffMins > 0) return `${diffMins}m ago`;
    return 'Just now';
  };

  // Sort players based on selected criteria
  const sortedPlayers = [...players].sort((a, b) => {
    let aValue: number, bValue: number;
    
    switch (sortBy) {
      case 'rating':
                 aValue = selectedGame === 'overall' ? a.rating : (a.gameStats as any)[selectedGame]?.rating || 0;
         bValue = selectedGame === 'overall' ? b.rating : (b.gameStats as any)[selectedGame]?.rating || 0;
        break;
      case 'winRate':
        aValue = a.winRate;
        bValue = b.winRate;
        break;
      case 'games':
        aValue = a.totalGames;
        bValue = b.totalGames;
        break;
      case 'streak':
        aValue = a.streak;
        bValue = b.streak;
        break;
      default:
        aValue = a.rating;
        bValue = b.rating;
    }
    
    return bValue - aValue; // Descending order
  });

  return (
    <div style={{ padding: 24, color: 'white', minHeight: '100vh', background: 'linear-gradient(135deg, #1e3a8a, #6d28d9, #312e81)' }}>
      <Link href="/" style={{ color: '#60a5fa', textDecoration: 'underline' }}>← Back to Lobby</Link>
      <h1 style={{ fontSize: '2.5rem', margin: '1rem 0', textAlign: 'center' }}>🏆 Leaderboards</h1>
      
      {/* Filters */}
      <div style={{ 
        background: 'rgba(255,255,255,0.1)', 
        padding: 24, 
        borderRadius: 12, 
        marginBottom: 24,
        backdropFilter: 'blur(10px)'
      }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: 16 }}>Leaderboard Options</h2>
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
              <option value="overall">Overall</option>
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
              <option value="all">All Time</option>
              <option value="month">This Month</option>
              <option value="week">This Week</option>
            </select>
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: 4 }}>Sort By:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              style={{ 
                padding: '8px 12px', 
                borderRadius: 4, 
                background: '#333',
                color: 'white',
                border: '1px solid #555'
              }}
            >
              <option value="rating">Rating</option>
              <option value="winRate">Win Rate</option>
              <option value="games">Games Played</option>
              <option value="streak">Current Streak</option>
            </select>
          </div>
        </div>
      </div>

      {/* Top 3 Podium */}
      <div style={{ 
        background: 'rgba(255,255,255,0.1)', 
        padding: 24, 
        borderRadius: 12, 
        marginBottom: 24,
        backdropFilter: 'blur(10px)'
      }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: 16, textAlign: 'center' }}>
          {getGameName(selectedGame)} Champions
        </h2>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'end', gap: 16, minHeight: 200 }}>
          {/* 2nd Place */}
          {sortedPlayers[1] && (
            <div style={{ 
              textAlign: 'center', 
              padding: 16, 
              background: 'rgba(255,255,255,0.1)', 
              borderRadius: 8,
              border: '2px solid #9ca3af',
              minWidth: 120
            }}>
              <div style={{ fontSize: '3rem', marginBottom: 8 }}>🥈</div>
              <div style={{ fontSize: '1.5rem', marginBottom: 4 }}>{sortedPlayers[1].avatar}</div>
              <div style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: 4 }}>{sortedPlayers[1].name}</div>
              <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>
                                 Rating: {selectedGame === 'overall' ? sortedPlayers[1].rating : (sortedPlayers[1].gameStats as any)[selectedGame]?.rating || 0}
              </div>
            </div>
          )}
          
          {/* 1st Place */}
          {sortedPlayers[0] && (
            <div style={{ 
              textAlign: 'center', 
              padding: 20, 
              background: 'rgba(255,255,255,0.15)', 
              borderRadius: 8,
              border: '2px solid #fbbf24',
              minWidth: 140,
              transform: 'scale(1.1)'
            }}>
              <div style={{ fontSize: '4rem', marginBottom: 8 }}>🥇</div>
              <div style={{ fontSize: '2rem', marginBottom: 8 }}>{sortedPlayers[0].avatar}</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: 4 }}>{sortedPlayers[0].name}</div>
              <div style={{ fontSize: '1rem', opacity: 0.8 }}>
                                 Rating: {selectedGame === 'overall' ? sortedPlayers[0].rating : (sortedPlayers[0].gameStats as any)[selectedGame]?.rating || 0}
              </div>
            </div>
          )}
          
          {/* 3rd Place */}
          {sortedPlayers[2] && (
            <div style={{ 
              textAlign: 'center', 
              padding: 16, 
              background: 'rgba(255,255,255,0.1)', 
              borderRadius: 8,
              border: '2px solid #b45309',
              minWidth: 120
            }}>
              <div style={{ fontSize: '3rem', marginBottom: 8 }}>🥉</div>
              <div style={{ fontSize: '1.5rem', marginBottom: 4 }}>{sortedPlayers[2].avatar}</div>
              <div style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: 4 }}>{sortedPlayers[2].name}</div>
              <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>
                                 Rating: {selectedGame === 'overall' ? sortedPlayers[2].rating : (sortedPlayers[2].gameStats as any)[selectedGame]?.rating || 0}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Full Leaderboard */}
      <div style={{ 
        background: 'rgba(255,255,255,0.1)', 
        padding: 24, 
        borderRadius: 12,
        backdropFilter: 'blur(10px)'
      }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: 16 }}>
          {getGameName(selectedGame)} Leaderboard
        </h2>
        
        <div style={{ display: 'grid', gap: 12 }}>
          {sortedPlayers.map((player, index) => (
            <div key={player.id} style={{ 
              display: 'flex', 
              alignItems: 'center', 
              padding: 16, 
              background: 'rgba(255,255,255,0.05)', 
              borderRadius: 8,
              border: index < 3 ? `2px solid ${getRankColor(index + 1)}` : '1px solid rgba(255,255,255,0.1)'
            }}>
              {/* Rank */}
              <div style={{ 
                width: 60, 
                textAlign: 'center', 
                fontSize: '1.5rem',
                color: getRankColor(index + 1),
                fontWeight: 'bold'
              }}>
                {getRankIcon(index + 1)}
              </div>
              
              {/* Player Info */}
              <div style={{ display: 'flex', alignItems: 'center', flex: 1, marginLeft: 16 }}>
                <div style={{ fontSize: '2rem', marginRight: 12 }}>{player.avatar}</div>
                <div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: 4 }}>
                    {player.name}
                  </div>
                  <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>
                    Last active: {formatTimeAgo(player.lastActive)}
                  </div>
                </div>
              </div>
              
              {/* Stats */}
              <div style={{ display: 'flex', gap: 24, marginRight: 16 }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#60a5fa' }}>
                    {selectedGame === 'overall' ? player.rating : player.gameStats[selectedGame as keyof typeof player.gameStats]?.rating || 0}
                  </div>
                  <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>Rating</div>
                </div>
                
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#10b981' }}>
                    {player.winRate}%
                  </div>
                  <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>Win Rate</div>
                </div>
                
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#f59e0b' }}>
                    {player.totalGames}
                  </div>
                  <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>Games</div>
                </div>
                
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#8b5cf6' }}>
                    {player.streak}
                  </div>
                  <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>Streak</div>
                </div>
                
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#ec4899' }}>
                    {player.achievements}
                  </div>
                  <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>Achievements</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 