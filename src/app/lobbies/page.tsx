'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface Lobby {
  id: string;
  name: string;
  gameType: 'chess' | 'checkers' | 'backgammon' | 'ginRummy' | 'crazy8s';
  host: string;
  players: number;
  maxPlayers: number;
  status: 'waiting' | 'playing' | 'finished';
  created: string;
  lastActivity: string;
  settings: {
    difficulty: 'easy' | 'medium' | 'hard';
    timeLimit?: number; // in minutes
    private: boolean;
    allowSpectators: boolean;
  };
  tags: string[];
}

export default function Lobbies() {
  const [selectedGame, setSelectedGame] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'created' | 'players' | 'activity'>('activity');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock lobby data
  const lobbies: Lobby[] = [
    {
      id: '1',
      name: 'Chess Masters Tournament',
      gameType: 'chess',
      host: 'ChessMaster2024',
      players: 2,
      maxPlayers: 2,
      status: 'playing',
      created: '2024-01-25T10:00:00',
      lastActivity: '2024-01-25T14:30:00',
      settings: {
        difficulty: 'hard',
        timeLimit: 30,
        private: false,
        allowSpectators: true
      },
      tags: ['tournament', 'competitive', 'ranked']
    },
    {
      id: '2',
      name: 'Casual Checkers',
      gameType: 'checkers',
      host: 'CheckersFan',
      players: 1,
      maxPlayers: 2,
      status: 'waiting',
      created: '2024-01-25T14:15:00',
      lastActivity: '2024-01-25T14:15:00',
      settings: {
        difficulty: 'medium',
        private: false,
        allowSpectators: true
      },
      tags: ['casual', 'newbies-welcome']
    },
    {
      id: '3',
      name: 'Backgammon Pro League',
      gameType: 'backgammon',
      host: 'BackgammonPro',
      players: 2,
      maxPlayers: 2,
      status: 'playing',
      created: '2024-01-25T13:00:00',
      lastActivity: '2024-01-25T14:25:00',
      settings: {
        difficulty: 'hard',
        timeLimit: 20,
        private: true,
        allowSpectators: false
      },
      tags: ['pro', 'private', 'competitive']
    },
    {
      id: '4',
      name: 'Gin Rummy Night',
      gameType: 'ginRummy',
      host: 'CardShark',
      players: 3,
      maxPlayers: 4,
      status: 'waiting',
      created: '2024-01-25T14:20:00',
      lastActivity: '2024-01-25T14:20:00',
      settings: {
        difficulty: 'medium',
        private: false,
        allowSpectators: true
      },
      tags: ['social', 'multiplayer', 'fun']
    },
    {
      id: '5',
      name: 'Crazy 8s Quick Games',
      gameType: 'crazy8s',
      host: 'SpeedPlayer',
      players: 2,
      maxPlayers: 4,
      status: 'waiting',
      created: '2024-01-25T14:10:00',
      lastActivity: '2024-01-25T14:10:00',
      settings: {
        difficulty: 'easy',
        timeLimit: 5,
        private: false,
        allowSpectators: true
      },
      tags: ['quick', 'casual', 'fast-paced']
    },
    {
      id: '6',
      name: 'Chess Training Room',
      gameType: 'chess',
      host: 'ChessCoach',
      players: 1,
      maxPlayers: 2,
      status: 'waiting',
      created: '2024-01-25T14:05:00',
      lastActivity: '2024-01-25T14:05:00',
      settings: {
        difficulty: 'medium',
        private: false,
        allowSpectators: true
      },
      tags: ['training', 'learning', 'coaching']
    },
    {
      id: '7',
      name: 'Checkers Championship',
      gameType: 'checkers',
      host: 'CheckersChamp',
      players: 2,
      maxPlayers: 2,
      status: 'finished',
      created: '2024-01-25T12:00:00',
      lastActivity: '2024-01-25T13:45:00',
      settings: {
        difficulty: 'hard',
        timeLimit: 45,
        private: false,
        allowSpectators: true
      },
      tags: ['championship', 'competitive', 'finished']
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting': return '#f59e0b';
      case 'playing': return '#10b981';
      case 'finished': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'waiting': return '⏳';
      case 'playing': return '▶️';
      case 'finished': return '🏁';
      default: return '❓';
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

  // Filter and sort lobbies
  const filteredLobbies = lobbies
    .filter(lobby => selectedGame === 'all' || lobby.gameType === selectedGame)
    .filter(lobby => selectedStatus === 'all' || lobby.status === selectedStatus)
    .filter(lobby => 
      searchTerm === '' || 
      lobby.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lobby.host.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lobby.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'created':
          aValue = new Date(a.created).getTime();
          bValue = new Date(b.created).getTime();
          break;
        case 'players':
          aValue = a.players;
          bValue = b.players;
          break;
        case 'activity':
          aValue = new Date(a.lastActivity).getTime();
          bValue = new Date(b.lastActivity).getTime();
          break;
        default:
          aValue = new Date(a.lastActivity).getTime();
          bValue = new Date(b.lastActivity).getTime();
      }
      
      if (sortOrder === 'asc') {
        return aValue - bValue;
      } else {
        return bValue - aValue;
      }
    });

  const stats = {
    totalLobbies: lobbies.length,
    waitingLobbies: lobbies.filter(l => l.status === 'waiting').length,
    activeGames: lobbies.filter(l => l.status === 'playing').length,
    finishedGames: lobbies.filter(l => l.status === 'finished').length
  };

  return (
    <div style={{ padding: 24, color: 'white', minHeight: '100vh', background: 'linear-gradient(135deg, #1e3a8a, #6d28d9, #312e81)' }}>
      <Link href="/" style={{ color: '#60a5fa', textDecoration: 'underline' }}>← Back to Lobby</Link>
      <h1 style={{ fontSize: '2.5rem', margin: '1rem 0', textAlign: 'center' }}>🎮 Game Lobbies</h1>
      
      {/* Statistics Overview */}
      <div style={{ 
        background: 'rgba(255,255,255,0.1)', 
        padding: 24, 
        borderRadius: 12, 
        marginBottom: 24,
        backdropFilter: 'blur(10px)'
      }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: 16 }}>Lobby Overview</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16 }}>
          <div style={{ textAlign: 'center', padding: 16, background: 'rgba(255,255,255,0.1)', borderRadius: 8 }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#60a5fa' }}>{stats.totalLobbies}</div>
            <div>Total Lobbies</div>
          </div>
          <div style={{ textAlign: 'center', padding: 16, background: 'rgba(255,255,255,0.1)', borderRadius: 8 }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>{stats.waitingLobbies}</div>
            <div>Waiting</div>
          </div>
          <div style={{ textAlign: 'center', padding: 16, background: 'rgba(255,255,255,0.1)', borderRadius: 8 }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>{stats.activeGames}</div>
            <div>Active Games</div>
          </div>
          <div style={{ textAlign: 'center', padding: 16, background: 'rgba(255,255,255,0.1)', borderRadius: 8 }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#6b7280' }}>{stats.finishedGames}</div>
            <div>Finished</div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div style={{ 
        background: 'rgba(255,255,255,0.1)', 
        padding: 24, 
        borderRadius: 12, 
        marginBottom: 24,
        backdropFilter: 'blur(10px)'
      }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: 16 }}>Search & Filters</h2>
        
        {/* Search Bar */}
        <div style={{ marginBottom: 16 }}>
          <input
            type="text"
            placeholder="Search lobbies, hosts, or tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: 8,
              background: '#333',
              color: 'white',
              border: '1px solid #555',
              fontSize: '1rem'
            }}
          />
        </div>
        
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
            <label style={{ display: 'block', marginBottom: 4 }}>Status:</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              style={{ 
                padding: '8px 12px', 
                borderRadius: 4, 
                background: '#333',
                color: 'white',
                border: '1px solid #555'
              }}
            >
              <option value="all">All Status</option>
              <option value="waiting">Waiting</option>
              <option value="playing">Playing</option>
              <option value="finished">Finished</option>
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
              <option value="activity">Last Activity</option>
              <option value="created">Created</option>
              <option value="players">Players</option>
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

      {/* Lobby List */}
      <div style={{ 
        background: 'rgba(255,255,255,0.1)', 
        padding: 24, 
        borderRadius: 12,
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontSize: '1.5rem', margin: 0 }}>
            Available Lobbies ({filteredLobbies.length})
          </h2>
          <Link 
            href="/create-lobby"
            style={{ 
              background: '#10b981', 
              color: 'white', 
              padding: '8px 16px', 
              borderRadius: 8, 
              textDecoration: 'none', 
              fontWeight: 600 
            }}
          >
            ➕ Create Lobby
          </Link>
        </div>
        
        <div style={{ display: 'grid', gap: 16 }}>
          {filteredLobbies.map(lobby => (
            <div key={lobby.id} style={{ 
              padding: 20, 
              background: 'rgba(255,255,255,0.05)', 
              borderRadius: 8,
              border: `2px solid ${getStatusColor(lobby.status)}`
            }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ fontSize: '2.5rem', marginRight: 16 }}>
                  {getGameIcon(lobby.gameType)}
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '1.3rem' }}>
                    {lobby.name}
                    {lobby.settings.private && <span style={{ marginLeft: 8, color: '#f59e0b' }}>🔒</span>}
                  </h3>
                  <div style={{ fontSize: '0.9rem', opacity: 0.8, marginBottom: 8 }}>
                    Host: {lobby.host} • {getGameName(lobby.gameType)} • {lobby.settings.difficulty.charAt(0).toUpperCase() + lobby.settings.difficulty.slice(1)}
                    {lobby.settings.timeLimit && ` • ${lobby.settings.timeLimit}min`}
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {lobby.tags.map(tag => (
                      <span key={tag} style={{ 
                        background: 'rgba(255,255,255,0.1)', 
                        padding: '2px 8px', 
                        borderRadius: 12, 
                        fontSize: '0.8rem' 
                      }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div style={{ textAlign: 'center', marginLeft: 16 }}>
                  <div style={{ 
                    fontSize: '2rem', 
                    color: getStatusColor(lobby.status),
                    marginBottom: 4
                  }}>
                    {getStatusIcon(lobby.status)}
                  </div>
                  <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>
                    {lobby.players}/{lobby.maxPlayers}
                  </div>
                </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '0.9rem', opacity: 0.7 }}>
                  Created: {formatTimeAgo(lobby.created)} • Last activity: {formatTimeAgo(lobby.lastActivity)}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {lobby.status === 'waiting' && lobby.players < lobby.maxPlayers && (
                    <button style={{ 
                      background: '#3b82f6', 
                      color: 'white', 
                      border: 'none',
                      padding: '8px 16px', 
                      borderRadius: 4, 
                      cursor: 'pointer' 
                    }}>
                      Join
                    </button>
                  )}
                  {lobby.settings.allowSpectators && (
                    <button style={{ 
                      background: '#6b7280', 
                      color: 'white', 
                      border: 'none',
                      padding: '8px 16px', 
                      borderRadius: 4, 
                      cursor: 'pointer' 
                    }}>
                      Spectate
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {filteredLobbies.length === 0 && (
          <div style={{ textAlign: 'center', padding: 32, opacity: 0.7 }}>
            No lobbies found matching the current filters.
            <br />
            <Link href="/create-lobby" style={{ color: '#60a5fa', textDecoration: 'underline', marginTop: 8, display: 'inline-block' }}>
              Create a new lobby
            </Link>
          </div>
        )}
      </div>
    </div>
  );
} 