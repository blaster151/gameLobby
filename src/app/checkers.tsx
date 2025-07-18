import React from 'react';
import Link from 'next/link';
import { useCheckersStore, PlayerType, Board, BotDifficulty, GameMode } from './checkersStore';
import Tutorial from './components/Tutorial';
import { checkersTutorial } from './data/tutorials';

const BOARD_SIZE = 8;

const cellStyle = {
  width: 40,
  height: 40,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 24,
  userSelect: 'none' as const,
  transition: 'all 0.2s ease-in-out',
};

const pieceStyle = {
  transition: 'transform 0.3s ease-in-out',
  cursor: 'pointer',
};

function clone(board: Board): Board {
  return board.map(row => [...row]);
}

export default function Checkers() {
  const board = useCheckersStore(s => s.board);
  const selected = useCheckersStore(s => s.selected);
  const turn = useCheckersStore(s => s.turn);
  const message = useCheckersStore(s => s.message);
  const gameState = useCheckersStore(s => s.gameState);
  const stats = useCheckersStore(s => s.stats);
  const botDifficulty = useCheckersStore(s => s.botDifficulty);
  const gameMode = useCheckersStore(s => s.gameMode);
  const setBoard = useCheckersStore(s => s.setBoard);
  const setSelected = useCheckersStore(s => s.setSelected);
  const setTurn = useCheckersStore(s => s.setTurn);
  const setMessage = useCheckersStore(s => s.setMessage);
  const setGameState = useCheckersStore(s => s.setGameState);
  const resetGame = useCheckersStore(s => s.resetGame);
  const pushHistory = useCheckersStore(s => s.pushHistory);
  const stepHistory = useCheckersStore(s => s.stepHistory);
  const history = useCheckersStore(s => s.history);
  const historyIndex = useCheckersStore(s => s.historyIndex);
  const updateStats = useCheckersStore(s => s.updateStats);
  const resetStats = useCheckersStore(s => s.resetStats);
  const setBotDifficulty = useCheckersStore(s => s.setBotDifficulty);
  const setGameMode = useCheckersStore(s => s.setGameMode);
  const saveGame = useCheckersStore(s => s.saveGame);
  const loadGame = useCheckersStore(s => s.loadGame);
  const hasSavedGame = useCheckersStore(s => s.hasSavedGame);

  // Track last move for highlighting
  const [lastMove, setLastMove] = React.useState<null | [number, number, number, number]>(null);
  const [keyboardFocus, setKeyboardFocus] = React.useState<[number, number]>([0, 0]);
  const [showTutorial, setShowTutorial] = React.useState(false);

  function checkGameState(board: Board): string {
    const playerPieces = board.flat().filter(cell => cell === PlayerType.PLAYER).length;
    const botPieces = board.flat().filter(cell => cell === PlayerType.BOT).length;
    if (playerPieces === 0) return 'lose';
    if (botPieces === 0) return 'win';
    return 'playing';
  }

  function handleCellClick(y: number, x: number) {
    if (gameState !== 'playing') return;
    
    // In human vs human mode, allow both players to move their pieces
    // In human vs bot mode, only allow player to move
    const canMovePiece = gameMode === GameMode.HUMAN_VS_HUMAN ? 
      (turn === PlayerType.PLAYER && board[y][x] === PlayerType.PLAYER) || 
      (turn === PlayerType.BOT && board[y][x] === PlayerType.BOT) :
      (turn === PlayerType.PLAYER && board[y][x] === PlayerType.PLAYER);
    
    if (selected) {
      const [sy, sx] = selected;
      const currentPlayer = turn === PlayerType.PLAYER ? PlayerType.PLAYER : PlayerType.BOT;
      if (isValidMove(board, sy, sx, y, x, currentPlayer)) {
        const newBoard = movePiece(board, sy, sx, y, x);
        setBoard(newBoard);
        setSelected(null);
        setLastMove([sy, sx, y, x]);
        pushHistory(newBoard);
        const newGameState = checkGameState(newBoard);
        setGameState(newGameState);
        if (newGameState === 'playing') {
          setTurn(turn === PlayerType.PLAYER ? PlayerType.BOT : PlayerType.PLAYER);
          // Bot move after player move (only in HUMAN_VS_BOT mode)
          if (gameMode === GameMode.HUMAN_VS_BOT && turn === PlayerType.PLAYER) {
            setTimeout(() => botMove(newBoard), 500);
          }
        } else {
          updateStats(newGameState === 'win' ? 'win' : 'loss');
          setMessage(newGameState === 'win' ? 'You win!' : 'You lose!');
        }
      } else {
        setSelected(null);
      }
    } else if (canMovePiece) {
      setSelected([y, x]);
    }
  }

  function getValidMoves(board: Board, player: PlayerType): Array<[number, number, number, number]> {
    const moves: Array<[number, number, number, number]> = [];
    for (let y = 0; y < BOARD_SIZE; y++) {
      for (let x = 0; x < BOARD_SIZE; x++) {
        if (board[y][x] === player) {
          const dir = player === PlayerType.PLAYER ? -1 : 1;
          const ny = y + dir;
          if (ny >= 0 && ny < BOARD_SIZE) {
            if (x - 1 >= 0 && board[ny][x - 1] === PlayerType.EMPTY) {
              moves.push([y, x, ny, x - 1]);
            }
            if (x + 1 < BOARD_SIZE && board[ny][x + 1] === PlayerType.EMPTY) {
              moves.push([y, x, ny, x + 1]);
            }
          }
        }
      }
    }
    return moves;
  }

  function evaluateBoard(board: Board): number {
    let score = 0;
    for (let y = 0; y < BOARD_SIZE; y++) {
      for (let x = 0; x < BOARD_SIZE; x++) {
        if (board[y][x] === PlayerType.BOT) {
          score += 1;
        } else if (board[y][x] === PlayerType.PLAYER) {
          score -= 1;
        }
      }
    }
    return score;
  }

  function botMoveEasy(currentBoard: Board) {
    const moves = getValidMoves(currentBoard, PlayerType.BOT);
    if (moves.length === 0) {
      setMessage('Bot cannot move. Your turn!');
      setTurn(PlayerType.PLAYER);
      return;
    }
    const randomMove = moves[Math.floor(Math.random() * moves.length)];
    const [sy, sx, dy, dx] = randomMove;
    const newBoard = movePiece(currentBoard, sy, sx, dy, dx);
    setBoard(newBoard);
    setLastMove([sy, sx, dy, dx]);
    pushHistory(newBoard);
    const newGameState = checkGameState(newBoard);
    setGameState(newGameState);
    if (newGameState === 'playing') {
      setTurn(PlayerType.PLAYER);
      setMessage('Your move!');
    } else {
      updateStats(newGameState === 'win' ? 'win' : 'loss');
      setMessage(newGameState === 'lose' ? 'You lose!' : 'You win!');
    }
  }

  function botMoveMedium(currentBoard: Board) {
    const moves = getValidMoves(currentBoard, PlayerType.BOT);
    if (moves.length === 0) {
      setMessage('Bot cannot move. Your turn!');
      setTurn(PlayerType.PLAYER);
      return;
    }
    
    // Prefer moves that capture pieces or move towards the center
    let bestMove = moves[0];
    let bestScore = -Infinity;
    
    for (const [sy, sx, dy, dx] of moves) {
      const newBoard = movePiece(currentBoard, sy, sx, dy, dx);
      const score = evaluateBoard(newBoard);
      
      // Bonus for moving towards the center
      const centerBonus = Math.abs(4 - dx) < Math.abs(4 - sx) ? 0.1 : 0;
      
      if (score + centerBonus > bestScore) {
        bestScore = score + centerBonus;
        bestMove = [sy, sx, dy, dx];
      }
    }
    
    const [sy, sx, dy, dx] = bestMove;
    const newBoard = movePiece(currentBoard, sy, sx, dy, dx);
    setBoard(newBoard);
    setLastMove([sy, sx, dy, dx]);
    pushHistory(newBoard);
    const newGameState = checkGameState(newBoard);
    setGameState(newGameState);
    if (newGameState === 'playing') {
      setTurn(PlayerType.PLAYER);
      setMessage('Your move!');
    } else {
      updateStats(newGameState === 'win' ? 'win' : 'loss');
      setMessage(newGameState === 'lose' ? 'You lose!' : 'You win!');
    }
  }

  function botMoveHard(currentBoard: Board) {
    const moves = getValidMoves(currentBoard, PlayerType.BOT);
    if (moves.length === 0) {
      setMessage('Bot cannot move. Your turn!');
      setTurn(PlayerType.PLAYER);
      return;
    }
    
    // Look ahead 2 moves and choose the best option
    let bestMove = moves[0];
    let bestScore = -Infinity;
    
    for (const [sy, sx, dy, dx] of moves) {
      const newBoard = movePiece(currentBoard, sy, sx, dy, dx);
      let score = evaluateBoard(newBoard);
      
      // Simulate player's best response
      const playerMoves = getValidMoves(newBoard, PlayerType.PLAYER);
      if (playerMoves.length > 0) {
        let worstPlayerScore = Infinity;
        for (const [psy, psx, pdy, pdx] of playerMoves) {
          const playerBoard = movePiece(newBoard, psy, psx, pdy, pdx);
          const playerScore = evaluateBoard(playerBoard);
          worstPlayerScore = Math.min(worstPlayerScore, playerScore);
        }
        score = worstPlayerScore; // Assume player makes the best move
      }
      
      if (score > bestScore) {
        bestScore = score;
        bestMove = [sy, sx, dy, dx];
      }
    }
    
    const [sy, sx, dy, dx] = bestMove;
    const newBoard = movePiece(currentBoard, sy, sx, dy, dx);
    setBoard(newBoard);
    setLastMove([sy, sx, dy, dx]);
    pushHistory(newBoard);
    const newGameState = checkGameState(newBoard);
    setGameState(newGameState);
    if (newGameState === 'playing') {
      setTurn(PlayerType.PLAYER);
      setMessage('Your move!');
    } else {
      updateStats(newGameState === 'win' ? 'win' : 'loss');
      setMessage(newGameState === 'lose' ? 'You lose!' : 'You win!');
    }
  }

  function botMove(currentBoard: Board) {
    switch (botDifficulty) {
      case BotDifficulty.EASY:
        botMoveEasy(currentBoard);
        break;
      case BotDifficulty.MEDIUM:
        botMoveMedium(currentBoard);
        break;
      case BotDifficulty.HARD:
        botMoveHard(currentBoard);
        break;
    }
  }

  function isValidMove(board: Board, sy: number, sx: number, dy: number, dx: number, player: PlayerType): boolean {
    if (board[dy][dx] !== PlayerType.EMPTY) return false;
    const dir = player === PlayerType.PLAYER ? -1 : 1;
    return (dy - sy === dir) && (Math.abs(dx - sx) === 1);
  }

  function movePiece(board: Board, sy: number, sx: number, dy: number, dx: number): Board {
    const newBoard = clone(board);
    newBoard[dy][dx] = newBoard[sy][sx];
    newBoard[sy][sx] = PlayerType.EMPTY;
    return newBoard;
  }

  // Replay controls
  function handleStep(dir: 1 | -1) {
    stepHistory(dir);
    setSelected(null);
    setLastMove(null);
  }

  // Player undo/redo controls
  function handleUndo() {
    if (historyIndex > 0) {
      stepHistory(-1);
      setSelected(null);
      setLastMove(null);
    }
  }

  function handleRedo() {
    if (historyIndex < history.length - 1) {
      stepHistory(1);
      setSelected(null);
      setLastMove(null);
    }
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    if (turn !== PlayerType.PLAYER || gameState !== 'playing') return;
    
    const [y, x] = keyboardFocus;
    let newY = y;
    let newX = x;
    
    switch (event.key) {
      case 'ArrowUp':
        newY = Math.max(0, y - 1);
        break;
      case 'ArrowDown':
        newY = Math.min(BOARD_SIZE - 1, y + 1);
        break;
      case 'ArrowLeft':
        newX = Math.max(0, x - 1);
        break;
      case 'ArrowRight':
        newX = Math.min(BOARD_SIZE - 1, x + 1);
        break;
      case 'Enter':
      case ' ':
        handleCellClick(y, x);
        return;
      default:
        return;
    }
    
    setKeyboardFocus([newY, newX]);
    event.preventDefault();
  }

  return (
    <div 
      style={{ padding: 24, color: 'white', minHeight: '100vh', background: '#222' }}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <Link href="/" style={{ color: '#60a5fa', textDecoration: 'underline' }}>← Back to Lobby</Link>
      <h1 style={{ fontSize: '2rem', margin: '1rem 0' }}>Checkers</h1>
      
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

      {/* Game Mode Selector */}
      <div style={{ background: '#333', padding: 12, borderRadius: 8, marginBottom: 16 }}>
        <strong>Game Mode:</strong>
        <select 
          value={gameMode} 
          onChange={(e) => setGameMode(e.target.value as GameMode)}
          style={{ marginLeft: 12, padding: '4px 8px', borderRadius: 4 }}
          aria-label="Game Mode"
        >
          <option value={GameMode.HUMAN_VS_BOT}>Human vs Bot</option>
          <option value={GameMode.HUMAN_VS_HUMAN}>Human vs Human</option>
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
        <strong>How to Play:</strong> Move your pieces diagonally forward. Capture opponent pieces by jumping over them. First to lose all pieces loses the game.
        <button
          onClick={() => setShowTutorial(true)}
          style={{ marginLeft: 16, background: '#059669', color: 'white', border: 'none', borderRadius: 4, padding: '4px 12px', cursor: 'pointer' }}
        >
          📖 Full Tutorial
        </button>
      </div>
      
      <div style={{ marginBottom: 12 }}>{message}</div>
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
      
      <div style={{ marginBottom: 16 }}>
        <button onClick={() => handleStep(-1)} disabled={historyIndex === 0} style={{ marginRight: 8 }}>⏪ Prev</button>
        <button onClick={() => handleStep(1)} disabled={historyIndex === history.length - 1}>Next ⏩</button>
        <span style={{ marginLeft: 16 }}>Move {historyIndex + 1} / {history.length}</span>
      </div>
      
      {/* Player Undo/Redo Controls */}
      <div style={{ marginBottom: 16 }}>
        <button 
          onClick={handleUndo} 
          disabled={historyIndex === 0 || turn !== PlayerType.PLAYER}
          style={{ marginRight: 8, background: '#6366f1', color: 'white', border: 'none', padding: '8px 16px', borderRadius: 4, cursor: 'pointer' }}
        >
          ↩ Undo
        </button>
        <button 
          onClick={handleRedo} 
          disabled={historyIndex === history.length - 1 || turn !== PlayerType.PLAYER}
          style={{ background: '#6366f1', color: 'white', border: 'none', padding: '8px 16px', borderRadius: 4, cursor: 'pointer' }}
        >
          ↪ Redo
        </button>
      </div>
      
      <div style={{ display: 'inline-block', border: '2px solid #fff', borderRadius: 8, overflow: 'hidden' }}>
        {board.map((row, y) => (
          <div key={y} style={{ display: 'flex' }}>
            {row.map((cell, x) => {
              let highlight = false;
              if (lastMove && ((lastMove[0] === y && lastMove[1] === x) || (lastMove[2] === y && lastMove[3] === x))) {
                highlight = true;
              }
              const isKeyboardFocused = keyboardFocus[0] === y && keyboardFocus[1] === x;
              const isValidMoveTarget = selected && isValidMove(board, selected[0], selected[1], y, x, PlayerType.PLAYER);
              
              return (
                <div
                  key={x}
                  onClick={() => handleCellClick(y, x)}
                  onFocus={() => setKeyboardFocus([y, x])}
                  tabIndex={0}
                  role="button"
                  aria-label={`${y + 1}, ${x + 1} ${cell === PlayerType.PLAYER ? 'player piece' : cell === PlayerType.BOT ? 'bot piece' : 'empty'}`}
                  style={{
                    ...cellStyle,
                    background: highlight ? '#fbbf24' : 
                              isValidMoveTarget ? '#10b981' :
                              (y + x) % 2 === 0 ? '#444' : '#eee',
                    color: (y + x) % 2 === 0 ? 'white' : 'black',
                    border: selected && selected[0] === y && selected[1] === x ? '2px solid #fbbf24' : 
                           isKeyboardFocused ? '2px solid #3b82f6' : '1px solid #333',
                    cursor: turn === PlayerType.PLAYER && (cell === PlayerType.PLAYER || isValidMoveTarget) ? 'pointer' : 'default',
                    outline: 'none',
                    transform: selected && selected[0] === y && selected[1] === x ? 'scale(1.1)' : 'scale(1)',
                    boxShadow: highlight ? '0 0 10px rgba(251, 191, 36, 0.5)' : 'none',
                  }}
                >
                  <span style={{
                    ...pieceStyle,
                    transform: cell === PlayerType.PLAYER || cell === PlayerType.BOT ? 'scale(1)' : 'scale(0)',
                    opacity: cell === PlayerType.PLAYER || cell === PlayerType.BOT ? 1 : 0,
                  }}>
                    {cell === PlayerType.PLAYER ? '●' : cell === PlayerType.BOT ? '○' : ''}
                  </span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
      
      {/* Keyboard Instructions */}
      <div style={{ background: '#333', padding: 12, borderRadius: 8, marginTop: 16 }}>
        <strong>Keyboard Controls:</strong> Use arrow keys to navigate, Enter or Space to select/move pieces.
      </div>
      
      {/* Tutorial Modal */}
      <Tutorial
        gameName="Checkers"
        steps={checkersTutorial}
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
      />
    </div>
  );
} 