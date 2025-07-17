'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLobbyStore, GameLobby } from '../lobbyStore';

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d ago`;
}

function getGameIcon(game: GameLobby['game']): string {
  switch (game) {
    case 'checkers': return '●';
    case 'chess': return '♔';
    case 'backgammon': return '⚀';
    case 'gin-rummy': return '🃏';
    case 'crazy-8s': return '🎴';
    default: return '🎮';
  }
}

function getGameName(game: GameLobby['game']): string {
  switch (game) {
    case 'checkers': return 'Checkers';
    case 'chess': return 'Chess';
    case 'backgammon': return 'Backgammon';
    case 'gin-rummy': return 'Gin Rummy';
    case 'crazy-8s': return 'Crazy 8s';
    default: return 'Unknown Game';
  }
}

export default function LobbiesPage() {
  const lobbies = useLobbyStore(s => s.lobbies);
  const joinLobby = useLobbyStore(s => s.joinLobby);
  const joinAsSpectator = useLobbyStore(s => s.joinAsSpectator);
  const [joinModal, setJoinModal] = useState<{ lobby: GameLobby; isOpen: boolean; isSpectator: boolean }>({ lobby: null!, isOpen: false, isSpectator: false });
  const [playerName, setPlayerName] = useState('');

  const handleJoinLobby = (lobby: GameLobby, asSpectator: boolean = false) => {
    if (!asSpectator && lobby.players.filter(p => !p.isSpectator).length >= lobby.maxPlayers) return;
    setJoinModal({ lobby, isOpen: true, isSpectator: asSpectator });
  };

  const confirmJoin = () => {
    if (playerName.trim()) {
      if (joinModal.isSpectator) {
        joinAsSpectator(joinModal.lobby.id, playerName.trim());
      } else {
        joinLobby(joinModal.lobby.id, playerName.trim());
      }
      setJoinModal({ lobby: null!, isOpen: false, isSpectator: false });
      setPlayerName('');
    }
  };

  const cancelJoin = () => {
    setJoinModal({ lobby: null!, isOpen: false, isSpectator: false });
    setPlayerName('');
  };

  return (
    <div style={{ padding: 24, color: 'white', minHeight: '100vh', background: '#222' }}>
      <Link href="/" style={{ color: '#60a5fa', textDecoration: 'underline' }}>← Back to Lobby</Link>
      <h1 style={{ fontSize: '2rem', margin: '1rem 0' }}>Game Lobbies</h1>
      
      <div style={{ marginBottom: '2rem' }}>
        <Link 
          href="/create-lobby"
          style={{ 
            background: '#22c55e', 
            color: 'white', 
            padding: '12px 24px', 
            borderRadius: 8, 
            textDecoration: 'none', 
            fontWeight: 600,
            display: 'inline-block'
          }}
        >
          ➕ Create New Lobby
        </Link>
      </div>

      <div style={{ display: 'grid', gap: '1rem' }}>
        {lobbies.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#ccc' }}>
            <p>No lobbies available. Create one to get started!</p>
          </div>
        ) : (
          lobbies.map(lobby => (
            <div 
              key={lobby.id}
              style={{
                background: '#333',
                padding: '1rem',
                borderRadius: 8,
                border: '1px solid #555',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>{getGameIcon(lobby.game)}</span>
                  <h3 style={{ margin: 0 }}>{lobby.name}</h3>
                  {lobby.isPrivate && <span style={{ color: '#fbbf24' }}>🔒</span>}
                </div>
                <div style={{ fontSize: '0.9rem', color: '#ccc' }}>
                  {formatTimeAgo(lobby.createdAt)}
                </div>
              </div>
              
              <div style={{ marginBottom: '0.5rem' }}>
                <span style={{ color: '#60a5fa' }}>{getGameName(lobby.game)}</span>
                <span style={{ margin: '0 0.5rem', color: '#666' }}>•</span>
                <span>{lobby.players.length}/{lobby.maxPlayers} players</span>
                <span style={{ margin: '0 0.5rem', color: '#666' }}>•</span>
                <span style={{ 
                  color: lobby.status === 'waiting' ? '#22c55e' : 
                         lobby.status === 'playing' ? '#fbbf24' : '#ef4444'
                }}>
                  {lobby.status.charAt(0).toUpperCase() + lobby.status.slice(1)}
                </span>
              </div>
              
              <div style={{ marginBottom: '1rem' }}>
                <strong>Players:</strong>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                  {lobby.players.map(player => (
                    <span 
                      key={player.id}
                      style={{
                        background: player.isSpectator ? '#8b5cf6' : 
                                  player.isHost ? '#fbbf24' : '#6366f1',
                        color: 'white',
                        padding: '0.25rem 0.5rem',
                        borderRadius: 4,
                        fontSize: '0.8rem',
                        opacity: player.isSpectator ? 0.8 : 1,
                      }}
                    >
                      {player.name} 
                      {player.isHost ? ' (Host)' : ''} 
                      {player.isSpectator ? ' (👁️)' : ''} 
                      {!player.isSpectator && (player.isReady ? ' ✓' : ' ○')}
                    </span>
                  ))}
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {lobby.status === 'waiting' && lobby.players.filter(p => !p.isSpectator).length < lobby.maxPlayers && (
                  <button
                    onClick={() => handleJoinLobby(lobby, false)}
                    style={{
                      background: '#22c55e',
                      color: 'white',
                      border: 'none',
                      padding: '0.5rem 1rem',
                      borderRadius: 4,
                      cursor: 'pointer',
                    }}
                  >
                    Join Lobby
                  </button>
                )}
                {lobby.status === 'playing' && (
                  <button
                    onClick={() => handleJoinLobby(lobby, true)}
                    style={{
                      background: '#fbbf24',
                      color: 'white',
                      border: 'none',
                      padding: '0.5rem 1rem',
                      borderRadius: 4,
                      cursor: 'pointer',
                    }}
                  >
                    👁️ Watch Game
                  </button>
                )}
                {lobby.status === 'waiting' && (
                  <button
                    onClick={() => handleJoinLobby(lobby, true)}
                    style={{
                      background: '#6366f1',
                      color: 'white',
                      border: 'none',
                      padding: '0.5rem 1rem',
                      borderRadius: 4,
                      cursor: 'pointer',
                    }}
                  >
                    👁️ Spectate
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Join Modal */}
      {joinModal.isOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            background: '#333',
            padding: '2rem',
            borderRadius: '12px',
            maxWidth: '400px',
            color: 'white',
            border: '2px solid #666',
          }}>
            <h3 style={{ margin: '0 0 1rem 0' }}>
              {joinModal.isSpectator ? 'Join as Spectator' : 'Join Lobby'}
            </h3>
            <p style={{ margin: '0 0 1rem 0', color: '#ccc' }}>
              {joinModal.isSpectator ? 'Watch' : 'Join'} "{joinModal.lobby.name}" ({getGameName(joinModal.lobby.game)})
            </p>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                Your Name:
              </label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter your name"
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: 4,
                  border: '1px solid #555',
                  background: '#444',
                  color: 'white',
                }}
                onKeyPress={(e) => e.key === 'Enter' && confirmJoin()}
              />
            </div>
            
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button
                onClick={cancelJoin}
                style={{
                  background: '#666',
                  color: 'white',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: 4,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmJoin}
                disabled={!playerName.trim()}
                style={{
                  background: '#22c55e',
                  color: 'white',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: 4,
                  cursor: playerName.trim() ? 'pointer' : 'not-allowed',
                  opacity: playerName.trim() ? 1 : 0.5,
                }}
              >
                Join
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 