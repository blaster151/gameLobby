import React from 'react';
import Link from 'next/link';
import { useBackgammonStore, PlayerColor, BotDifficulty } from './backgammonStore';
import Tutorial from './components/Tutorial';
import { backgammonTutorial } from './data/tutorials';

const BOARD_SIZE = 24;

const pointStyle = {
  width: 60,
  height: 200,
  display: 'flex',
  flexDirection: 'column' as const,
  alignItems: 'center',
  justifyContent: 'center',
  border: '1px solid #666',
  position: 'relative' as const,
};

const pieceStyle = {
  width: 20,
  height: 20,
  borderRadius: '50%',
  margin: 1,
  border: '1px solid #333',
};

function clone(board: any[][]): any[][] {
  return board.map(point => [...point]);
}

export default function Backgammon() {
  const board = useBackgammonStore(s => s.board);
  const turn = useBackgammonStore(s => s.turn);
  const message = useBackgammonStore(s => s.message);
  const gameState = useBackgammonStore(s => s.gameState);
  const stats = useBackgammonStore(s => s.stats);
  const botDifficulty = useBackgammonStore(s => s.botDifficulty);
  const dice = useBackgammonStore(s => s.dice);
  const usedDice = useBackgammonStore(s => s.usedDice);
  const history = useBackgammonStore(s => s.history);
  const historyIndex = useBackgammonStore(s => s.historyIndex);
  const setBoard = useBackgammonStore(s => s.setBoard);
  const setTurn = useBackgammonStore(s => s.setTurn);
  const setMessage = useBackgammonStore(s => s.setMessage);
  const setGameState = useBackgammonStore(s => s.setGameState);
  const setDice = useBackgammonStore(s => s.setDice);
  const setUsedDice = useBackgammonStore(s => s.setUsedDice);
  const resetGame = useBackgammonStore(s => s.resetGame);
  const pushHistory = useBackgammonStore(s => s.pushHistory);
  const stepHistory = useBackgammonStore(s => s.stepHistory);
  const updateStats = useBackgammonStore(s => s.updateStats);
  const resetStats = useBackgammonStore(s => s.resetStats);
  const setBotDifficulty = useBackgammonStore(s => s.setBotDifficulty);
  const saveGame = useBackgammonStore(s => s.saveGame);
  const loadGame = useBackgammonStore(s => s.loadGame);
  const hasSavedGame = useBackgammonStore(s => s.hasSavedGame);
  const rollDice = useBackgammonStore(s => s.rollDice);

  const [selectedPoint, setSelectedPoint] = React.useState<number | null>(null);
  const [showTutorial, setShowTutorial] = React.useState(false);

  function handlePointClick(pointIndex: number) {
    if (gameState !== 'playing' || turn !== PlayerColor.WHITE) return;
    
    if (selectedPoint === null) {
      // Select point if it has player pieces
      if (board[pointIndex][0] > 0) {
        setSelectedPoint(pointIndex);
      }
    } else {
      // Try to move piece
      const availableDice = dice.filter(d => !usedDice.includes(d));
      const validMoves = availableDice.map(die => selectedPoint + die).filter(to => to < BOARD_SIZE);
      
      if (validMoves.includes(pointIndex)) {
        const newBoard = clone(board);
        newBoard[selectedPoint][0]--;
        newBoard[pointIndex][0]++;
        
        // Handle capture
        if (newBoard[pointIndex][1] === 1) {
          newBoard[pointIndex][1] = 0;
          // Add to bar (simplified)
        }
        
        setBoard(newBoard);
        pushHistory(newBoard);
        setSelectedPoint(null);
        
        // Mark die as used
        const usedDie = pointIndex - selectedPoint;
        setUsedDice([...usedDice, usedDie]);
        
        // Check if all dice used
        if (usedDice.length + 1 >= dice.length) {
          setTurn(PlayerColor.BLACK);
          setMessage('Black to roll');
          setDice([]);
          setUsedDice([]);
        }
      } else {
        setSelectedPoint(null);
      }
    }
  }

  function handleUndo() {
    if (historyIndex > 0) {
      stepHistory(-1);
      setSelectedPoint(null);
    }
  }

  function handleRedo() {
    if (historyIndex < history.length - 1) {
      stepHistory(1);
      setSelectedPoint(null);
    }
  }

  return (
    <div style={{ padding: 24, color: 'white', minHeight: '100vh', background: '#222' }}>
      <Link href="/" style={{ color: '#60a5fa', textDecoration: 'underline' }}>← Back to Lobby</Link>
      <h1 style={{ fontSize: '2rem', margin: '1rem 0' }}>Backgammon</h1>
      
      {/* Bot Difficulty Selector */}
      <div style={{ background: '#333', padding: 12, borderRadius: 8, marginBottom: 16 }}>
        <strong>Bot Difficulty:</strong>
        <select 
          value={botDifficulty} 
          onChange={(e) => setBotDifficulty(e.target.value as BotDifficulty)}
          style={{ marginLeft: 12, padding: '4px 8px', borderRadius: 4 }}
        >
          <option value={BotDifficulty.EASY}>Easy</option>
          <option value={BotDifficulty.MEDIUM}>Medium</option>
          <option value={BotDifficulty.HARD}>Hard</option>
        </select>
      </div>

      {/* Game Statistics */}
      <div style={{ background: '#333', padding: 12, borderRadius: 8, marginBottom: 16 }}>
        <strong>Game Statistics:</strong> Wins: {stats.wins} | Losses: {stats.losses} | Total Games: {stats.totalGames}
        {stats.totalGames > 0 && (
          <span style={{ marginLeft: 12 }}>
            Win Rate: {Math.round((stats.wins / stats.totalGames) * 100)}%
          </span>
        )}
        <button
          onClick={resetStats}
          style={{ marginLeft: 24, background: '#6366f1', color: 'white', border: 'none', borderRadius: 4, padding: '4px 12px', cursor: 'pointer' }}
        >
          Reset Stats
        </button>
      </div>
      
      {/* Tutorial Section */}
      <div style={{ background: '#333', padding: 12, borderRadius: 8, marginBottom: 16 }}>
        <strong>How to Play:</strong> Backgammon is a race game. Roll dice and move pieces around the board. First to bear off all pieces wins.
        <button
          onClick={() => setShowTutorial(true)}
          style={{ marginLeft: 16, background: '#059669', color: 'white', border: 'none', borderRadius: 4, padding: '4px 12px', cursor: 'pointer' }}
        >
          📖 Full Tutorial
        </button>
      </div>
      
      <div style={{ marginBottom: 12 }}>{message}</div>
      
      {/* Dice Section */}
      <div style={{ background: '#333', padding: 12, borderRadius: 8, marginBottom: 16 }}>
        <strong>Dice:</strong>
        {dice.length > 0 ? (
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            {dice.map((die, index) => (
              <div
                key={index}
                style={{
                  width: 40,
                  height: 40,
                  background: usedDice.includes(die) ? '#666' : '#fff',
                  color: usedDice.includes(die) ? '#999' : '#000',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 4,
                  fontSize: 18,
                  fontWeight: 'bold',
                }}
              >
                {die}
              </div>
            ))}
          </div>
        ) : (
          <button
            onClick={rollDice}
            disabled={turn !== PlayerColor.WHITE || gameState !== 'playing'}
            style={{
              marginLeft: 12,
              background: turn === PlayerColor.WHITE ? '#059669' : '#666',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              padding: '8px 16px',
              cursor: turn === PlayerColor.WHITE ? 'pointer' : 'not-allowed',
            }}
          >
            Roll Dice
          </button>
        )}
      </div>
      
      <button 
        onClick={resetGame}
        style={{ 
          background: '#dc2626', 
          color: 'white', 
          border: 'none',
          padding: '8px 16px', 
          borderRadius: 4, 
          cursor: 'pointer',
          marginBottom: 16 
        }}
      >
        New Game
      </button>
      
      {/* Save/Load Game Controls */}
      <div style={{ marginBottom: 16 }}>
        <button 
          onClick={saveGame}
          style={{ 
            background: '#059669', 
            color: 'white', 
            border: 'none',
            padding: '8px 16px', 
            borderRadius: 4, 
            cursor: 'pointer',
            marginRight: 8
          }}
        >
          💾 Save Game
        </button>
        <button 
          onClick={loadGame}
          disabled={!hasSavedGame()}
          style={{ 
            background: '#7c3aed', 
            color: 'white', 
            border: 'none',
            padding: '8px 16px', 
            borderRadius: 4, 
            cursor: hasSavedGame() ? 'pointer' : 'not-allowed',
            opacity: hasSavedGame() ? 1 : 0.5
          }}
        >
          📂 Load Game
        </button>
      </div>
      
      {/* Replay Controls */}
      <div style={{ marginBottom: 16 }}>
        <button onClick={() => stepHistory(-1)} disabled={historyIndex === 0} style={{ marginRight: 8 }}>⏪ Prev</button>
        <button onClick={() => stepHistory(1)} disabled={historyIndex === history.length - 1}>Next ⏩</button>
        <span style={{ marginLeft: 16 }}>Move {historyIndex + 1} / {history.length}</span>
      </div>
      
      {/* Player Undo/Redo Controls */}
      <div style={{ marginBottom: 16 }}>
        <button 
          onClick={handleUndo} 
          disabled={historyIndex === 0 || turn !== PlayerColor.WHITE}
          style={{ marginRight: 8, background: '#6366f1', color: 'white', border: 'none', padding: '8px 16px', borderRadius: 4, cursor: 'pointer' }}
        >
          ↩ Undo
        </button>
        <button 
          onClick={handleRedo} 
          disabled={historyIndex === history.length - 1 || turn !== PlayerColor.WHITE}
          style={{ background: '#6366f1', color: 'white', border: 'none', padding: '8px 16px', borderRadius: 4, cursor: 'pointer' }}
        >
          ↪ Redo
        </button>
      </div>
      
      {/* Backgammon Board */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(12, 1fr)', 
        gap: 1, 
        maxWidth: 800, 
        margin: '0 auto',
        background: '#8B4513',
        padding: 16,
        borderRadius: 8,
      }}>
        {/* Top half (points 13-24) */}
        {Array.from({ length: 12 }, (_, i) => {
          const pointIndex = 23 - i;
          const point = board[pointIndex];
          const isSelected = selectedPoint === pointIndex;
          
          return (
            <div
              key={`top-${i}`}
              onClick={() => handlePointClick(pointIndex)}
              style={{
                ...pointStyle,
                background: isSelected ? '#fbbf24' : (i % 2 === 0 ? '#DEB887' : '#F5DEB3'),
                cursor: 'pointer',
                border: isSelected ? '2px solid #fbbf24' : '1px solid #666',
              }}
            >
              <div style={{ fontSize: 12, color: '#333', marginBottom: 4 }}>{pointIndex + 1}</div>
              {/* Black pieces */}
              {Array.from({ length: point[1] }, (_, j) => (
                <div
                  key={`black-${pointIndex}-${j}`}
                  style={{
                    ...pieceStyle,
                    background: '#000',
                  }}
                />
              ))}
              {/* White pieces */}
              {Array.from({ length: point[0] }, (_, j) => (
                <div
                  key={`white-${pointIndex}-${j}`}
                  style={{
                    ...pieceStyle,
                    background: '#fff',
                  }}
                />
              ))}
            </div>
          );
        })}
        
        {/* Bottom half (points 1-12) */}
        {Array.from({ length: 12 }, (_, i) => {
          const pointIndex = i;
          const point = board[pointIndex];
          const isSelected = selectedPoint === pointIndex;
          
          return (
            <div
              key={`bottom-${i}`}
              onClick={() => handlePointClick(pointIndex)}
              style={{
                ...pointStyle,
                background: isSelected ? '#fbbf24' : (i % 2 === 0 ? '#F5DEB3' : '#DEB887'),
                cursor: 'pointer',
                border: isSelected ? '2px solid #fbbf24' : '1px solid #666',
              }}
            >
              <div style={{ fontSize: 12, color: '#333', marginBottom: 4 }}>{pointIndex + 1}</div>
              {/* White pieces */}
              {Array.from({ length: point[0] }, (_, j) => (
                <div
                  key={`white-${pointIndex}-${j}`}
                  style={{
                    ...pieceStyle,
                    background: '#fff',
                  }}
                />
              ))}
              {/* Black pieces */}
              {Array.from({ length: point[1] }, (_, j) => (
                <div
                  key={`black-${pointIndex}-${j}`}
                  style={{
                    ...pieceStyle,
                    background: '#000',
                  }}
                />
              ))}
            </div>
          );
        })}
      </div>
      
      {/* Game Instructions */}
      <div style={{ background: '#333', padding: 12, borderRadius: 8, marginTop: 16 }}>
        <strong>Instructions:</strong> Click on a point with your pieces to select it, then click on a valid destination to move. Roll dice to get new moves.
      </div>

      {/* Tutorial Modal */}
      <Tutorial
        gameName="Backgammon"
        steps={backgammonTutorial}
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
      />
    </div>
  );
} 