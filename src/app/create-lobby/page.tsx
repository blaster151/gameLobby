'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLobbyStore } from '../lobbyStore';

const games = [
  { id: 'checkers', name: 'Checkers', icon: '●', maxPlayers: 2 },
  { id: 'chess', name: 'Chess', icon: '♔', maxPlayers: 2 },
  { id: 'backgammon', name: 'Backgammon', icon: '⚀', maxPlayers: 2 },
  { id: 'gin-rummy', name: 'Gin Rummy', icon: '🃏', maxPlayers: 2 },
  { id: 'crazy-8s', name: 'Crazy 8s', icon: '🎴', maxPlayers: 4 },
];

export default function CreateLobbyPage() {
  const router = useRouter();
  const createLobby = useLobbyStore(s => s.createLobby);
  const [lobbyName, setLobbyName] = useState('');
  const [selectedGame, setSelectedGame] = useState('checkers');
  const [maxPlayers, setMaxPlayers] = useState(2);
  const [isPrivate, setIsPrivate] = useState(false);

  const handleCreateLobby = () => {
    if (lobbyName.trim()) {
      createLobby(lobbyName.trim(), selectedGame as any, maxPlayers, isPrivate);
      router.push('/lobbies');
    }
  };

  const selectedGameData = games.find(g => g.id === selectedGame);

  return (
    <div style={{ padding: 24, color: 'white', minHeight: '100vh', background: '#222' }}>
      <Link href="/lobbies" style={{ color: '#60a5fa', textDecoration: 'underline' }}>← Back to Lobbies</Link>
      <h1 style={{ fontSize: '2rem', margin: '1rem 0' }}>Create New Lobby</h1>
      
      <div style={{ maxWidth: '600px' }}>
        <div style={{ background: '#333', padding: '1.5rem', borderRadius: 8, marginBottom: '1rem' }}>
          <h3 style={{ margin: '0 0 1rem 0' }}>Lobby Details</h3>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>
              Lobby Name:
            </label>
            <input
              type="text"
              value={lobbyName}
              onChange={(e) => setLobbyName(e.target.value)}
              placeholder="Enter lobby name"
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: 4,
                border: '1px solid #555',
                background: '#444',
                color: 'white',
                fontSize: '1rem',
              }}
              onKeyPress={(e) => e.key === 'Enter' && handleCreateLobby()}
            />
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>
              Game:
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.5rem' }}>
              {games.map(game => (
                <button
                  key={game.id}
                  onClick={() => {
                    setSelectedGame(game.id);
                    setMaxPlayers(game.maxPlayers);
                  }}
                  style={{
                    background: selectedGame === game.id ? '#60a5fa' : '#444',
                    color: 'white',
                    border: '1px solid #555',
                    padding: '1rem',
                    borderRadius: 4,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <span style={{ fontSize: '2rem' }}>{game.icon}</span>
                  <span>{game.name}</span>
                  <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                    {game.maxPlayers} players max
                  </span>
                </button>
              ))}
            </div>
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>
              Max Players: {maxPlayers}
            </label>
            <input
              type="range"
              min="2"
              max={selectedGameData?.maxPlayers || 4}
              value={maxPlayers}
              onChange={(e) => setMaxPlayers(parseInt(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
                style={{ transform: 'scale(1.2)' }}
              />
              Private Lobby (🔒)
            </label>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link
            href="/lobbies"
            style={{
              background: '#666',
              color: 'white',
              padding: '0.75rem 1.5rem',
              borderRadius: 4,
              textDecoration: 'none',
              display: 'inline-block',
            }}
          >
            Cancel
          </Link>
          <button
            onClick={handleCreateLobby}
            disabled={!lobbyName.trim()}
            style={{
              background: '#22c55e',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: 4,
              cursor: lobbyName.trim() ? 'pointer' : 'not-allowed',
              opacity: lobbyName.trim() ? 1 : 0.5,
              fontSize: '1rem',
            }}
          >
            Create Lobby
          </button>
        </div>
      </div>
    </div>
  );
} 