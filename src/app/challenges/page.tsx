import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useChallengeStore, Challenge, ChallengeAttempt } from '../challengeStore';

export default function ChallengesPage() {
  const dailyChallenges = useChallengeStore(s => s.dailyChallenges);
  const attempts = useChallengeStore(s => s.attempts);
  const currentChallenge = useChallengeStore(s => s.currentChallenge);
  const loadChallenges = useChallengeStore(s => s.loadChallenges);
  const generateDailyChallenges = useChallengeStore(s => s.generateDailyChallenges);
  const getTodayChallenges = useChallengeStore(s => s.getTodayChallenges);
  const getLeaderboard = useChallengeStore(s => s.getLeaderboard);
  const setCurrentChallenge = useChallengeStore(s => s.setCurrentChallenge);
  const addAttempt = useChallengeStore(s => s.addAttempt);
  const calculateScore = useChallengeStore(s => s.calculateScore);

  const [playerName, setPlayerName] = useState('');
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [showLeaderboard, setShowLeaderboard] = useState<string | null>(null);

  useEffect(() => {
    loadChallenges();
    // Generate challenges if none exist for today
    const todayChallenges = getTodayChallenges();
    if (todayChallenges.length === 0) {
      generateDailyChallenges();
    }
  }, [loadChallenges, generateDailyChallenges, getTodayChallenges]);

  function getGameIcon(gameType: string): string {
    switch (gameType) {
      case 'chess': return '♔';
      case 'checkers': return '●';
      case 'backgammon': return '⚀';
      default: return '🎮';
    }
  }

  function getDifficultyColor(difficulty: string): string {
    switch (difficulty) {
      case 'easy': return '#059669';
      case 'medium': return '#d97706';
      case 'hard': return '#dc2626';
      default: return '#6b7280';
    }
  }

  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  function handleStartChallenge(challenge: Challenge) {
    if (!playerName.trim()) {
      alert('Please enter your name to start a challenge!');
      return;
    }
    setSelectedChallenge(challenge);
    setCurrentChallenge(challenge);
  }

  function handleCompleteChallenge() {
    if (!selectedChallenge || !playerName.trim()) return;

    const timeSpent = Math.floor(Math.random() * 300) + 60; // Simulated time
    const moves: any[] = []; // Simulated moves
    const score = calculateScore(moves, timeSpent, selectedChallenge.targetMoves);

    const attempt: ChallengeAttempt = {
      id: `${selectedChallenge.id}-${Date.now()}`,
      challengeId: selectedChallenge.id,
      playerName: playerName.trim(),
      moves,
      completed: true,
      timeSpent,
      date: new Date().toISOString(),
      score,
    };

    addAttempt(attempt);
    setSelectedChallenge(null);
    setCurrentChallenge(null);
    alert(`Challenge completed! Your score: ${score} points`);
  }

  function handleAbandonChallenge() {
    setSelectedChallenge(null);
    setCurrentChallenge(null);
  }

  const todayChallenges = getTodayChallenges();

  return (
    <div style={{ padding: 24, color: 'white', minHeight: '100vh', background: '#222' }}>
      <Link href="/" style={{ color: '#60a5fa', textDecoration: 'underline' }}>← Back to Lobby</Link>
      <h1 style={{ fontSize: '2rem', margin: '1rem 0' }}>Daily Challenges</h1>
      
      <p style={{ color: '#9ca3af', marginBottom: 24 }}>
        Test your skills with unique daily puzzles. Complete challenges to earn points and compete on leaderboards!
      </p>

      {/* Player Name Input */}
      <div style={{ background: '#333', padding: 16, borderRadius: 8, marginBottom: 24 }}>
        <label style={{ display: 'block', marginBottom: 8 }}>
          <strong>Your Name:</strong>
        </label>
        <input
          type="text"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          placeholder="Enter your name to participate"
          style={{
            width: '100%',
            maxWidth: 300,
            padding: '8px 12px',
            borderRadius: 4,
            border: '1px solid #555',
            background: '#444',
            color: 'white',
          }}
        />
      </div>

      {/* Active Challenge */}
      {selectedChallenge && (
        <div style={{ background: '#333', padding: 24, borderRadius: 8, marginBottom: 24 }}>
          <h2 style={{ margin: '0 0 16px 0' }}>
            {getGameIcon(selectedChallenge.gameType)} {selectedChallenge.title}
          </h2>
          
          <div style={{ marginBottom: 16 }}>
            <p style={{ margin: '0 0 8px 0' }}>{selectedChallenge.description}</p>
            <div style={{ color: '#9ca3af', fontSize: 14 }}>
              Target Moves: {selectedChallenge.targetMoves} • 
              Difficulty: <span style={{ color: getDifficultyColor(selectedChallenge.difficulty) }}>
                {selectedChallenge.difficulty.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Challenge Board Placeholder */}
          <div style={{ 
            background: '#444', 
            height: 300, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            borderRadius: 4,
            marginBottom: 16
          }}>
            <div style={{ textAlign: 'center', color: '#9ca3af' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>{getGameIcon(selectedChallenge.gameType)}</div>
              <div>Challenge board would appear here</div>
              <div style={{ fontSize: 12, marginTop: 8 }}>Complete the puzzle to earn points!</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={handleCompleteChallenge}
              style={{ background: '#059669', color: 'white', border: 'none', padding: '12px 24px', borderRadius: 4, cursor: 'pointer' }}
            >
              ✅ Complete Challenge
            </button>
            <button
              onClick={handleAbandonChallenge}
              style={{ background: '#dc2626', color: 'white', border: 'none', padding: '12px 24px', borderRadius: 4, cursor: 'pointer' }}
            >
              ❌ Abandon
            </button>
          </div>
        </div>
      )}

      {/* Today's Challenges */}
      <div style={{ background: '#333', padding: 24, borderRadius: 8, marginBottom: 24 }}>
        <h2 style={{ margin: '0 0 16px 0' }}>Today's Challenges ({formatDate(new Date().toISOString())})</h2>
        
        {todayChallenges.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#9ca3af', padding: 32 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🎯</div>
            <div>No challenges available for today.</div>
            <button
              onClick={generateDailyChallenges}
              style={{ background: '#6366f1', color: 'white', border: 'none', padding: '8px 16px', borderRadius: 4, cursor: 'pointer', marginTop: 16 }}
            >
              Generate Challenges
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 16 }}>
            {todayChallenges.map((challenge) => {
              const leaderboard = getLeaderboard(challenge.id);
              const playerAttempt = attempts.find(a => a.challengeId === challenge.id && a.playerName === playerName);
              
              return (
                <div
                  key={challenge.id}
                  style={{
                    background: '#444',
                    padding: 20,
                    borderRadius: 8,
                    border: '1px solid #555',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <span style={{ fontSize: 24 }}>{getGameIcon(challenge.gameType)}</span>
                        <h3 style={{ margin: 0, fontSize: 18 }}>{challenge.title}</h3>
                        <span style={{ 
                          background: getDifficultyColor(challenge.difficulty), 
                          color: 'white', 
                          padding: '2px 8px', 
                          borderRadius: 4, 
                          fontSize: 12 
                        }}>
                          {challenge.difficulty.toUpperCase()}
                        </span>
                      </div>
                      <p style={{ margin: '0 0 8px 0', color: '#9ca3af' }}>{challenge.description}</p>
                      <div style={{ color: '#9ca3af', fontSize: 14 }}>
                        Target Moves: {challenge.targetMoves} • 
                        Completed: {challenge.completedBy.length} players
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: 8 }}>
                      {playerAttempt ? (
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ color: '#059669', fontWeight: 'bold' }}>
                            Completed! Score: {playerAttempt.score}
                          </div>
                          <div style={{ color: '#9ca3af', fontSize: 12 }}>
                            Time: {Math.floor(playerAttempt.timeSpent / 60)}:{(playerAttempt.timeSpent % 60).toString().padStart(2, '0')}
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleStartChallenge(challenge)}
                          disabled={!playerName.trim()}
                          style={{ 
                            background: playerName.trim() ? '#059669' : '#666', 
                            color: 'white', 
                            border: 'none', 
                            padding: '8px 16px', 
                            borderRadius: 4, 
                            cursor: playerName.trim() ? 'pointer' : 'not-allowed'
                          }}
                        >
                          🎯 Start Challenge
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Leaderboard Preview */}
                  <div style={{ marginTop: 12 }}>
                    <button
                      onClick={() => setShowLeaderboard(showLeaderboard === challenge.id ? null : challenge.id)}
                      style={{ 
                        background: 'transparent', 
                        color: '#60a5fa', 
                        border: 'none', 
                        cursor: 'pointer',
                        textDecoration: 'underline'
                      }}
                    >
                      {showLeaderboard === challenge.id ? 'Hide' : 'Show'} Leaderboard
                    </button>
                    
                    {showLeaderboard === challenge.id && (
                      <div style={{ marginTop: 8, background: '#555', padding: 12, borderRadius: 4 }}>
                        <h4 style={{ margin: '0 0 8px 0' }}>Top Players</h4>
                        {leaderboard.length === 0 ? (
                          <div style={{ color: '#9ca3af', fontSize: 14 }}>No attempts yet</div>
                        ) : (
                          <div style={{ display: 'grid', gap: 4 }}>
                            {leaderboard.map((attempt, index) => (
                              <div key={attempt.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                                <span>
                                  {index + 1}. {attempt.playerName}
                                </span>
                                <span style={{ color: '#fbbf24' }}>
                                  {attempt.score} pts
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Challenge Statistics */}
      <div style={{ background: '#333', padding: 24, borderRadius: 8 }}>
        <h2 style={{ margin: '0 0 16px 0' }}>Your Challenge Stats</h2>
        
        {playerName.trim() ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            <div style={{ background: '#444', padding: 16, borderRadius: 4 }}>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: '#fbbf24' }}>
                {attempts.filter(a => a.playerName === playerName && a.completed).length}
              </div>
              <div style={{ color: '#9ca3af' }}>Challenges Completed</div>
            </div>
            
            <div style={{ background: '#444', padding: 16, borderRadius: 4 }}>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: '#fbbf24' }}>
                {attempts.filter(a => a.playerName === playerName).reduce((sum, a) => sum + a.score, 0)}
              </div>
              <div style={{ color: '#9ca3af' }}>Total Points</div>
            </div>
            
            <div style={{ background: '#444', padding: 16, borderRadius: 4 }}>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: '#fbbf24' }}>
                {attempts.filter(a => a.playerName === playerName).length > 0 
                  ? Math.round(attempts.filter(a => a.playerName === playerName).reduce((sum, a) => sum + a.score, 0) / attempts.filter(a => a.playerName === playerName).length)
                  : 0}
              </div>
              <div style={{ color: '#9ca3af' }}>Average Score</div>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: '#9ca3af' }}>
            Enter your name above to see your challenge statistics
          </div>
        )}
      </div>
    </div>
  );
} 