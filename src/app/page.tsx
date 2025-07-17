import React from 'react';
import Link from 'next/link';

const games = [
  { name: 'Chess', icon: '♔', alt: 'Chess King', href: '/chess' },
  { name: 'Checkers', icon: '●', alt: 'Checkers piece', href: '/checkers' },
  { name: 'Backgammon', icon: '⚀', alt: 'Backgammon die', href: '/backgammon' },
  { name: 'Gin Rummy', icon: '🃏', alt: 'Gin Rummy card', href: '/ginRummy' },
  { name: 'Crazy 8s', icon: '🎴', alt: 'Crazy 8s card', href: '/crazy8s' },
];

export default function Home() {
  return (
    <main style={{ minHeight: '100vh', background: 'linear-gradient(to bottom right, #1e3a8a, #6d28d9, #312e81)', color: 'white', padding: '2rem' }}>
      <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Game Lobby</h1>
        <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>
          Play Backgammon, Checkers, Chess, Gin Rummy, and Crazy 8s with friends or bots.<br />
          Each game includes a tutorial. Remote multiplayer coming soon!
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          <Link href="/lobbies" style={{ background: '#2563eb', color: 'white', padding: '1rem 2rem', borderRadius: 8, textDecoration: 'none', fontWeight: 600 }}>Browse Lobbies</Link>
          <Link href="/create-lobby" style={{ background: '#22c55e', color: 'white', padding: '1rem 2rem', borderRadius: 8, textDecoration: 'none', fontWeight: 600 }}>Create Lobby</Link>
          <Link href="/replays" style={{ background: '#7c3aed', color: 'white', padding: '1rem 2rem', borderRadius: 8, textDecoration: 'none', fontWeight: 600 }}>📺 Replays</Link>
          <Link href="/challenges" style={{ background: '#ea580c', color: 'white', padding: '1rem 2rem', borderRadius: 8, textDecoration: 'none', fontWeight: 600 }}>🎯 Challenges</Link>
          <Link href="/analytics" style={{ background: '#0891b2', color: 'white', padding: '1rem 2rem', borderRadius: 8, textDecoration: 'none', fontWeight: 600 }}>📊 Analytics</Link>
          <Link href="/settings" style={{ background: '#6b7280', color: 'white', padding: '1rem 2rem', borderRadius: 8, textDecoration: 'none', fontWeight: 600 }}>⚙️ Settings</Link>
          <Link href="/achievements" style={{ background: '#f59e0b', color: 'white', padding: '1rem 2rem', borderRadius: 8, textDecoration: 'none', fontWeight: 600 }}>🏆 Achievements</Link>
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '2rem 0 1rem' }}>Available Games</h2>
        <ul style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', listStyle: 'none', padding: 0 }}>
          {games.map(game => (
            <li key={game.name}>
              {game.href ? (
                <Link href={game.href} style={{ color: 'white', textDecoration: 'underline' }}>
                  <span role="img" aria-label={game.alt}>{game.icon}</span> {game.name}
                </Link>
              ) : (
                <span><span role="img" aria-label={game.alt}>{game.icon}</span> {game.name}</span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
} 