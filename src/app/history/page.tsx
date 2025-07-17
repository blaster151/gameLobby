import React, { useState } from 'react';
import Link from 'next/link';

interface GameRecord {
  id: string;
  gameType: 'chess' | 'checkers' | 'backgammon' | 'ginRummy' | 'crazy8s';
  playerName: string;
  opponentName: string;
  result: 'win' | 'loss' | 'draw';
  date: string;
  duration: number; // in minutes
  score?: number;
  opponentScore?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  moves?: number;
  highlights?: string[];
}

export default function GameHistory() {
  const [selectedGame, setSelectedGame] = useState<string>('all');
  const [selectedResult, setSelectedResult] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'duration' | 'score'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Mock game history data
  const gameHistory: GameRecord[] = [
    {
      id: '1',
      gameType: 'chess',
      playerName: 'Player',
      opponentName: 'Bot (Hard)',
      result: 'win',
      date: '2024-01-25T14:30:00',
      duration: 25,
      difficulty: 'hard',
      moves: 42,
      highlights: ['Checkmate with queen sacrifice', 'Pawn promotion to queen']
    },
    {
      id: '2',
      gameType: 'checkers',
      playerName: 'Player',
      opponentName: 'Bot (Medium)',
      result: 'win',
      date: '2024-01-25T13:15:00',
      duration: 12,
      difficulty: 'medium',
      moves: 18,
      highlights: ['Double jump capture', 'King promotion']
    },
    {
      id: '3',
      gameType: 'backgammon',
      playerName: 'Player',
      opponentName: 'Bot (Easy)',
      result: 'loss',
      date: '2024-01-25T12:00:00',
      duration: 18,
      difficulty: 'easy',
      score: 8,
      opponentScore: 15,
      highlights: ['Gammon loss', 'Poor dice rolls']
    },
    {
      id: '4',
      gameType: 'ginRummy',
      playerName: 'Player',
      opponentName: 'Bot (Hard)',
      result: 'win',
      date: '2024-01-24T16:45:00',
      duration: 8,
      difficulty: 'hard',
      score: 100,
      opponentScore: 25,
      highlights: ['Gin hand', 'Perfect melding']
    },
    {
      id: '5',
      gameType: 'crazy8s',
      playerName: 'Player',
      opponentName: 'Bot (Medium)',
      result: 'win',
      date: '2024-01-24T15:20:00',
      duration: 5,
      difficulty: 'medium',
      moves: 12,
      highlights: ['Quick victory', 'Strategic 8 usage']
    },
    {
      id: '6',
      gameType: 'chess',
      playerName: 'Player',
      opponentName: 'Bot (Medium)',
      result: 'draw',
      date: '2024-01-24T14:10:00',
      duration: 35,
      difficulty: 'medium',
      moves: 67,
      highlights: ['Stalemate', 'Complex endgame']
    },
    {
      id: '7',
      gameType: 'checkers',
      playerName: 'Player',
      opponentName: 'Bot (Hard)',
      result: 'loss',
      date: '2024-01-23T17:30:00',
      duration: 22,
      difficulty: 'hard',
      moves: 31,
      highlights: ['Trap setup', 'Multiple captures']
    },
    {
      id: '8',
      gameType: 'backgammon',
      playerName: 'Player',
      opponentName: 'Bot (Medium)',
      result: 'win',
      date: '2024-01-23T16:00:00',
      duration: 15,
      difficulty: 'medium',
      score: 15,
      opponentScore: 8,
      highlights: ['Backgammon win', 'Perfect bear-off']
    }
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

  const getResultColor = (result: string) => {
    switch (result) {
      case 'win': return '#10b981';
      case 'loss': return '#ef4444';
      case 'draw': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getResultIcon = (result: string) => {
    switch (result) {
      case 'win': return '🏆';
      case 'loss': return '💔';
      case 'draw': return '🤝';
      default: return '❓';
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Filter and sort games
  const filteredGames = gameHistory
    .filter(game => selectedGame === 'all' || game.gameType === selectedGame)
    .filter(game => selectedResult === 'all' || game.result === selectedResult)
    .sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'date':
          aValue = new Date(a.date).getTime();
          bValue = new Date(b.date).getTime();
          break;
        case 'duration':
          aValue = a.duration;
          bValue = b.duration;
          break;
        case 'score':
          aValue = a.score || 0;
          bValue = b.score || 0;
          break;
        default:
          aValue = new Date(a.date).getTime();
          bValue = new Date(b.date).getTime();
      }
      
      if (sortOrder === 'asc') {
        return aValue - bValue;
      } else {
        return bValue - aValue;
      }
    });

  const stats = {
    totalGames: gameHistory.length,
    wins: gameHistory.filter(g => g.result === 'win').length,
    losses: gameHistory.filter(g => g.result === 'loss').length,
    draws: gameHistory.filter(g => g.result === 'draw').length,
    winRate: Math.round((gameHistory.filter(g => g.result === 'win').length / gameHistory.length) * 100),
    averageDuration: Math.round(gameHistory.reduce((sum, g) => sum + g.duration, 0) / gameHistory.length)
  };

  return (
    <div style={{ padding: 24, color: 'white', minHeight: '100vh', background: 'linear-gradient(135deg, #1e3a8a, #6d28d9, #312e81)' }}>
      <Link href="/" style={{ color: '#60a5fa', textDecoration: 'underline' }}>← Back to Lobby</Link>
      <h1 style={{ fontSize: '2.5rem', margin: '1rem 0', textAlign: 'center' }}>📜 Game History</h1>
      
      {/* Statistics Overview */}
      <div style={{ 
        background: 'rgba(255,255,255,0.1)', 
        padding: 24, 
        borderRadius: 12, 
        marginBottom: 24,
        backdropFilter: 'blur(10px)'
      }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: 16 }}>Overall Statistics</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16 }}>
          <div style={{ textAlign: 'center', padding: 16, background: 'rgba(255,255,255,0.1)', borderRadius: 8 }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#60a5fa' }}>{stats.totalGames}</div>
            <div>Total Games</div>
          </div>
          <div style={{ textAlign: 'center', padding: 16, background: 'rgba(255,255,255,0.1)', borderRadius: 8 }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>{stats.wins}</div>
            <div>Wins</div>
          </div>
          <div style={{ textAlign: 'center', padding: 16, background: 'rgba(255,255,255,0.1)', borderRadius: 8 }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ef4444' }}>{stats.losses}</div>
            <div>Losses</div>
          </div>
          <div style={{ textAlign: 'center', padding: 16, background: 'rgba(255,255,255,0.1)', borderRadius: 8 }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>{stats.draws}</div>
            <div>Draws</div>
          </div>
          <div style={{ textAlign: 'center', padding: 16, background: 'rgba(255,255,255,0.1)', borderRadius: 8 }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#8b5cf6' }}>{stats.winRate}%</div>
            <div>Win Rate</div>
          </div>
          <div style={{ textAlign: 'center', padding: 16, background: 'rgba(255,255,255,0.1)', borderRadius: 8 }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#0891b2' }}>{stats.averageDuration}m</div>
            <div>Avg Duration</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ 
        background: 'rgba(255,255,255,0.1)', 
        padding: 24, 
        borderRadius: 12, 
        marginBottom: 24,
        backdropFilter: 'blur(10px)'
      }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: 16 }}>Filters & Sorting</h2>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          <div>
            <label style={{ display: 'block', marginBottom: 4 }}>Game Type:</label>
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
            <label style={{ display: 'block', marginBottom: 4 }}>Result:</label>
            <select
              value={selectedResult}
              onChange={(e) => setSelectedResult(e.target.value)}
              style={{ 
                padding: '8px 12px', 
                borderRadius: 4, 
                background: '#333',
                color: 'white',
                border: '1px solid #555'
              }}
            >
              <option value="all">All Results</option>
              <option value="win">Wins</option>
              <option value="loss">Losses</option>
              <option value="draw">Draws</option>
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
              <option value="date">Date</option>
              <option value="duration">Duration</option>
              <option value="score">Score</option>
            </select>
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: 4 }}>Order:</label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as any)}
              style={{ 
                padding: '8px 12px', 
                borderRadius: 4, 
                background: '#333',
                color: 'white',
                border: '1px solid #555'
              }}
            >
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Game History List */}
      <div style={{ 
        background: 'rgba(255,255,255,0.1)', 
        padding: 24, 
        borderRadius: 12,
        backdropFilter: 'blur(10px)'
      }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: 16 }}>
          Game Records ({filteredGames.length} games)
        </h2>
        
        <div style={{ display: 'grid', gap: 16 }}>
          {filteredGames.map(game => (
            <div key={game.id} style={{ 
              padding: 16, 
              background: 'rgba(255,255,255,0.05)', 
              borderRadius: 8,
              border: `2px solid ${getResultColor(game.result)}`
            }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ fontSize: '2rem', marginRight: 12 }}>
                  {getGameIcon(game.gameType)}
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '1.2rem' }}>
                    {getGameName(game.gameType)} vs {game.opponentName}
                  </h3>
                  <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>
                    {formatDate(game.date)} • {formatDuration(game.duration)}
                    {game.difficulty && ` • ${game.difficulty.charAt(0).toUpperCase() + game.difficulty.slice(1)}`}
                    {game.moves && ` • ${game.moves} moves`}
                  </div>
                </div>
                <div style={{ 
                  fontSize: '2rem', 
                  marginLeft: 16,
                  color: getResultColor(game.result)
                }}>
                  {getResultIcon(game.result)}
                </div>
              </div>
              
              {game.score !== undefined && (
                <div style={{ marginBottom: 8, fontSize: '0.9rem' }}>
                  <strong>Score:</strong> {game.score} - {game.opponentScore}
                </div>
              )}
              
              {game.highlights && game.highlights.length > 0 && (
                <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>
                  <strong>Highlights:</strong> {game.highlights.join(', ')}
                </div>
              )}
            </div>
          ))}
        </div>
        
        {filteredGames.length === 0 && (
          <div style={{ textAlign: 'center', padding: 32, opacity: 0.7 }}>
            No games found matching the current filters.
          </div>
        )}
      </div>
    </div>
  );
} 