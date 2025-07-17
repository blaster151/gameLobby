import React, { useEffect } from 'react';
import Link from 'next/link';
import { useReplayStore, ReplayGame } from '../replayStore';

export default function ReplaysPage() {
  const savedGames = useReplayStore(s => s.savedGames);
  const currentReplay = useReplayStore(s => s.currentReplay);
  const currentMoveIndex = useReplayStore(s => s.currentMoveIndex);
  const isPlaying = useReplayStore(s => s.isPlaying);
  const playbackSpeed = useReplayStore(s => s.playbackSpeed);
  const loadReplays = useReplayStore(s => s.loadReplays);
  const setCurrentReplay = useReplayStore(s => s.setCurrentReplay);
  const setCurrentMoveIndex = useReplayStore(s => s.setCurrentMoveIndex);
  const setIsPlaying = useReplayStore(s => s.setIsPlaying);
  const setPlaybackSpeed = useReplayStore(s => s.setPlaybackSpeed);
  const playNext = useReplayStore(s => s.playNext);
  const playPrevious = useReplayStore(s => s.playPrevious);
  const playToEnd = useReplayStore(s => s.playToEnd);
  const resetReplay = useReplayStore(s => s.resetReplay);
  const removeReplay = useReplayStore(s => s.removeReplay);

  useEffect(() => {
    loadReplays();
  }, [loadReplays]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && currentReplay) {
      interval = setInterval(() => {
        playNext();
      }, 1000 / playbackSpeed);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, currentReplay, playbackSpeed, playNext]);

  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  function formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  function getGameIcon(gameType: string): string {
    switch (gameType) {
      case 'chess': return '♔';
      case 'checkers': return '●';
      case 'backgammon': return '⚀';
      default: return '🎮';
    }
  }

  function renderReplayViewer() {
    if (!currentReplay) return null;

    const currentMove = currentReplay.moves[currentMoveIndex];
    const progress = (currentMoveIndex / (currentReplay.moves.length - 1)) * 100;

    return (
      <div style={{ background: '#333', padding: 24, borderRadius: 8, marginBottom: 24 }}>
        <h2 style={{ margin: '0 0 16px 0' }}>
          {getGameIcon(currentReplay.gameType)} {currentReplay.gameType.charAt(0).toUpperCase() + currentReplay.gameType.slice(1)} Replay
        </h2>
        
        <div style={{ marginBottom: 16 }}>
          <strong>Players:</strong> {currentReplay.player1} vs {currentReplay.player2}
          <br />
          <strong>Winner:</strong> {currentReplay.winner}
          <br />
          <strong>Date:</strong> {formatDate(currentReplay.date)}
          <br />
          <strong>Duration:</strong> {formatDuration(currentReplay.duration)}
        </div>

        {/* Progress Bar */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ 
            width: '100%', 
            height: 8, 
            background: '#555', 
            borderRadius: 4,
            overflow: 'hidden'
          }}>
            <div style={{ 
              width: `${progress}%`, 
              height: '100%', 
              background: '#60a5fa',
              transition: 'width 0.3s ease'
            }} />
          </div>
          <div style={{ fontSize: 14, color: '#9ca3af', marginTop: 4 }}>
            Move {currentMoveIndex + 1} of {currentReplay.moves.length}
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          <button
            onClick={resetReplay}
            style={{ background: '#6366f1', color: 'white', border: 'none', padding: '8px 16px', borderRadius: 4, cursor: 'pointer' }}
          >
            ⏮ Reset
          </button>
          <button
            onClick={playPrevious}
            disabled={currentMoveIndex === 0}
            style={{ background: '#6366f1', color: 'white', border: 'none', padding: '8px 16px', borderRadius: 4, cursor: 'pointer' }}
          >
            ⏪ Previous
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            style={{ background: isPlaying ? '#dc2626' : '#059669', color: 'white', border: 'none', padding: '8px 16px', borderRadius: 4, cursor: 'pointer' }}
          >
            {isPlaying ? '⏸ Pause' : '▶ Play'}
          </button>
          <button
            onClick={playNext}
            disabled={currentMoveIndex === currentReplay.moves.length - 1}
            style={{ background: '#6366f1', color: 'white', border: 'none', padding: '8px 16px', borderRadius: 4, cursor: 'pointer' }}
          >
            ⏩ Next
          </button>
          <button
            onClick={playToEnd}
            style={{ background: '#6366f1', color: 'white', border: 'none', padding: '8px 16px', borderRadius: 4, cursor: 'pointer' }}
          >
            ⏭ End
          </button>
        </div>

        {/* Speed Control */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ marginRight: 8 }}>
            <strong>Speed:</strong>
          </label>
          <select
            value={playbackSpeed}
            onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
            style={{ padding: '4px 8px', borderRadius: 4 }}
          >
            <option value={0.5}>0.5x</option>
            <option value={1}>1x</option>
            <option value={2}>2x</option>
            <option value={4}>4x</option>
          </select>
        </div>

        {/* Current Move Display */}
        {currentMove && (
          <div style={{ background: '#444', padding: 12, borderRadius: 4 }}>
            <strong>Move {currentMoveIndex + 1}:</strong> {currentMove.description || 'Move made'}
          </div>
        )}

        {/* Game Board Placeholder */}
        <div style={{ 
          background: '#444', 
          height: 300, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          borderRadius: 4,
          marginTop: 16
        }}>
          <div style={{ textAlign: 'center', color: '#9ca3af' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>{getGameIcon(currentReplay.gameType)}</div>
            <div>Game board visualization would appear here</div>
            <div style={{ fontSize: 12, marginTop: 8 }}>Move: {currentMoveIndex + 1} / {currentReplay.moves.length}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 24, color: 'white', minHeight: '100vh', background: '#222' }}>
      <Link href="/" style={{ color: '#60a5fa', textDecoration: 'underline' }}>← Back to Lobby</Link>
      <h1 style={{ fontSize: '2rem', margin: '1rem 0' }}>Game Replays</h1>
      
      <p style={{ color: '#9ca3af', marginBottom: 24 }}>
        Watch and analyze your previous games. Click on any replay to start viewing.
      </p>

      {/* Replay Viewer */}
      {renderReplayViewer()}

      {/* Replay List */}
      <div style={{ background: '#333', padding: 24, borderRadius: 8 }}>
        <h2 style={{ margin: '0 0 16px 0' }}>Saved Replays ({savedGames.length})</h2>
        
        {savedGames.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#9ca3af', padding: 32 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📺</div>
            <div>No saved replays yet.</div>
            <div style={{ fontSize: 14, marginTop: 8 }}>Complete some games to see replays here.</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 16 }}>
            {savedGames.map((game) => (
              <div
                key={game.id}
                style={{
                  background: currentReplay?.id === game.id ? '#444' : '#444',
                  padding: 16,
                  borderRadius: 8,
                  border: currentReplay?.id === game.id ? '2px solid #60a5fa' : '1px solid #555',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onClick={() => setCurrentReplay(game)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <span style={{ fontSize: 24 }}>{getGameIcon(game.gameType)}</span>
                      <h3 style={{ margin: 0, fontSize: 18 }}>
                        {game.gameType.charAt(0).toUpperCase() + game.gameType.slice(1)} Game
                      </h3>
                    </div>
                    <div style={{ color: '#9ca3af', fontSize: 14 }}>
                      {game.player1} vs {game.player2}
                    </div>
                    <div style={{ color: '#9ca3af', fontSize: 14 }}>
                      Winner: {game.winner} • {formatDate(game.date)} • {formatDuration(game.duration)}
                    </div>
                    <div style={{ color: '#9ca3af', fontSize: 14 }}>
                      {game.moves.length} moves
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentReplay(game);
                      }}
                      style={{ background: '#059669', color: 'white', border: 'none', padding: '8px 16px', borderRadius: 4, cursor: 'pointer' }}
                    >
                      ▶ Watch
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeReplay(game.id);
                      }}
                      style={{ background: '#dc2626', color: 'white', border: 'none', padding: '8px 16px', borderRadius: 4, cursor: 'pointer' }}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 