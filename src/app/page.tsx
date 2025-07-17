import React from 'react';
import Link from 'next/link';

export default function Home() {
  return (
    <main style={{ minHeight: '100vh', background: 'linear-gradient(to bottom right, #1e3a8a, #6d28d9, #312e81)', color: 'white', padding: '2rem' }}>
      <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Game Lobby</h1>
        <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>
          Play Backgammon, Checkers, Chess, Gin Rummy, and Crazy 8s with friends or bots.<br />
          Each game includes a tutorial. Remote multiplayer coming soon!
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '2rem' }}>
          <Link href="/lobbies" style={{ background: '#2563eb', color: 'white', padding: '1rem 2rem', borderRadius: 8, textDecoration: 'none', fontWeight: 600 }}>Browse Lobbies</Link>
          <Link href="/create-lobby" style={{ background: '#22c55e', color: 'white', padding: '1rem 2rem', borderRadius: 8, textDecoration: 'none', fontWeight: 600 }}>Create Lobby</Link>
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '2rem 0 1rem' }}>Available Games</h2>
        <ul style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', listStyle: 'none', padding: 0 }}>
          <li>♔ Chess</li>
          <li><Link href="/checkers" style={{ color: 'white', textDecoration: 'underline' }}>● Checkers</Link></li>
          <li>⚀ Backgammon</li>
          <li>🃏 Gin Rummy</li>
          <li>🎴 Crazy 8s</li>
        </ul>
      </div>
    </main>
  );
} 