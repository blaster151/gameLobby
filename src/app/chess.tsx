import React from 'react';
import Link from 'next/link';
import { useChessStore, ChessPiece, PlayerColor, BotDifficulty } from './chessStore';
import Tutorial from './components/Tutorial';
import { chessTutorial } from './data/tutorials';

const BOARD_SIZE = 8;

const cellStyle = {
  width: 50,
  height: 50,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 28,
  userSelect: 'none' as const,
  transition: 'all 0.2s ease-in-out',
};

const pieceStyle = {
  transition: 'transform 0.3s ease-in-out',
  cursor: 'pointer',
};

function clone(board: any[][]): any[][] {
  return board.map(row => [...row]);
}

function getPieceSymbol(piece: ChessPiece): string {
  switch (piece) {
    case ChessPiece.WHITE_PAWN: return '♙';
    case ChessPiece.WHITE_ROOK: return '♖';
    case ChessPiece.WHITE_KNIGHT: return '♘';
    case ChessPiece.WHITE_BISHOP: return '♗';
    case ChessPiece.WHITE_QUEEN: return '♕';
    case ChessPiece.WHITE_KING: return '♔';
    case ChessPiece.BLACK_PAWN: return '♟';
    case ChessPiece.BLACK_ROOK: return '♜';
    case ChessPiece.BLACK_KNIGHT: return '♞';
    case ChessPiece.BLACK_BISHOP: return '♝';
    case ChessPiece.BLACK_QUEEN: return '♛';
    case ChessPiece.BLACK_KING: return '♚';
    default: return '';
  }
}

function isWhitePiece(piece: ChessPiece): boolean {
  return piece >= ChessPiece.WHITE_PAWN && piece <= ChessPiece.WHITE_KING;
}

function isBlackPiece(piece: ChessPiece): boolean {
  return piece >= ChessPiece.BLACK_PAWN && piece <= ChessPiece.BLACK_KING;
}

function isValidMove(board: ChessPiece[][], fromY: number, fromX: number, toY: number, toX: number): boolean {
  const piece = board[fromY][fromX];
  const targetPiece = board[toY][toX];
  
  // Can't move to same position
  if (fromY === toY && fromX === toX) return false;
  
  // Can't capture own piece
  if (isWhitePiece(piece) && isWhitePiece(targetPiece)) return false;
  if (isBlackPiece(piece) && isBlackPiece(targetPiece)) return false;
  
  // Basic piece movement validation
  switch (piece) {
    case ChessPiece.WHITE_PAWN:
    case ChessPiece.BLACK_PAWN:
      const direction = piece === ChessPiece.WHITE_PAWN ? -1 : 1;
      const startRow = piece === ChessPiece.WHITE_PAWN ? 6 : 1;
      
      // Forward move
      if (fromX === toX && toY === fromY + direction && targetPiece === ChessPiece.EMPTY) {
        return true;
      }
      
      // Initial two-square move
      if (fromX === toX && fromY === startRow && toY === fromY + 2 * direction && 
          board[fromY + direction][fromX] === ChessPiece.EMPTY && targetPiece === ChessPiece.EMPTY) {
        return true;
      }
      
      // Diagonal capture
      if (Math.abs(fromX - toX) === 1 && toY === fromY + direction && targetPiece !== ChessPiece.EMPTY) {
        return true;
      }
      break;
      
    case ChessPiece.WHITE_ROOK:
    case ChessPiece.BLACK_ROOK:
      if (fromY === toY || fromX === toX) {
        // Check if path is clear
        const minY = Math.min(fromY, toY);
        const maxY = Math.max(fromY, toY);
        const minX = Math.min(fromX, toX);
        const maxX = Math.max(fromX, toX);
        
        for (let y = minY; y <= maxY; y++) {
          for (let x = minX; x <= maxX; x++) {
            if (y === fromY && x === fromX) continue;
            if (y === toY && x === toX) continue;
            if (board[y][x] !== ChessPiece.EMPTY) return false;
          }
        }
        return true;
      }
      break;
      
    case ChessPiece.WHITE_KNIGHT:
    case ChessPiece.BLACK_KNIGHT:
      const knightY = Math.abs(fromY - toY);
      const knightX = Math.abs(fromX - toX);
      return (knightY === 2 && knightX === 1) || (knightY === 1 && knightX === 2);
      
    case ChessPiece.WHITE_BISHOP:
    case ChessPiece.BLACK_BISHOP:
      if (Math.abs(fromY - toY) === Math.abs(fromX - toX)) {
        // Check diagonal path
        const yDir = fromY < toY ? 1 : -1;
        const xDir = fromX < toX ? 1 : -1;
        let y = fromY + yDir;
        let x = fromX + xDir;
        
        while (y !== toY && x !== toX) {
          if (board[y][x] !== ChessPiece.EMPTY) return false;
          y += yDir;
          x += xDir;
        }
        return true;
      }
      break;
      
    case ChessPiece.WHITE_QUEEN:
    case ChessPiece.BLACK_QUEEN:
      // Queen combines rook and bishop moves
      if (fromY === toY || fromX === toX) {
        // Rook-like move
        const minY = Math.min(fromY, toY);
        const maxY = Math.max(fromY, toY);
        const minX = Math.min(fromX, toX);
        const maxX = Math.max(fromX, toX);
        
        for (let y = minY; y <= maxY; y++) {
          for (let x = minX; x <= maxX; x++) {
            if (y === fromY && x === fromX) continue;
            if (y === toY && x === toX) continue;
            if (board[y][x] !== ChessPiece.EMPTY) return false;
          }
        }
        return true;
      } else if (Math.abs(fromY - toY) === Math.abs(fromX - toX)) {
        // Bishop-like move
        const yDir = fromY < toY ? 1 : -1;
        const xDir = fromX < toX ? 1 : -1;
        let y = fromY + yDir;
        let x = fromX + xDir;
        
        while (y !== toY && x !== toX) {
          if (board[y][x] !== ChessPiece.EMPTY) return false;
          y += yDir;
          x += xDir;
        }
        return true;
      }
      break;
      
    case ChessPiece.WHITE_KING:
    case ChessPiece.BLACK_KING:
      return Math.abs(fromY - toY) <= 1 && Math.abs(fromX - toX) <= 1;
  }
  
  return false;
}

function getValidMoves(board: ChessPiece[][], y: number, x: number): [number, number][] {
  const moves: [number, number][] = [];
  for (let toY = 0; toY < BOARD_SIZE; toY++) {
    for (let toX = 0; toX < BOARD_SIZE; toX++) {
      if (isValidMove(board, y, x, toY, toX)) {
        moves.push([toY, toX]);
      }
    }
  }
  return moves;
}

function getAllValidMoves(board: ChessPiece[][], isWhiteTurn: boolean): [number, number, number, number][] {
  const moves: [number, number, number, number][] = [];
  for (let y = 0; y < BOARD_SIZE; y++) {
    for (let x = 0; x < BOARD_SIZE; x++) {
      const piece = board[y][x];
      if (piece !== ChessPiece.EMPTY) {
        const isCurrentPlayerPiece = isWhiteTurn ? isWhitePiece(piece) : isBlackPiece(piece);
        if (isCurrentPlayerPiece) {
          const validMoves = getValidMoves(board, y, x);
          for (const [toY, toX] of validMoves) {
            moves.push([y, x, toY, toX]);
          }
        }
      }
    }
  }
  return moves;
}

function evaluateBoard(board: ChessPiece[][]): number {
  let score = 0;
  const pieceValues = {
    [ChessPiece.WHITE_PAWN]: 1,
    [ChessPiece.WHITE_ROOK]: 5,
    [ChessPiece.WHITE_KNIGHT]: 3,
    [ChessPiece.WHITE_BISHOP]: 3,
    [ChessPiece.WHITE_QUEEN]: 9,
    [ChessPiece.WHITE_KING]: 100,
    [ChessPiece.BLACK_PAWN]: -1,
    [ChessPiece.BLACK_ROOK]: -5,
    [ChessPiece.BLACK_KNIGHT]: -3,
    [ChessPiece.BLACK_BISHOP]: -3,
    [ChessPiece.BLACK_QUEEN]: -9,
    [ChessPiece.BLACK_KING]: -100,
  };
  
  for (let y = 0; y < BOARD_SIZE; y++) {
    for (let x = 0; x < BOARD_SIZE; x++) {
      const piece = board[y][x];
      if (piece !== ChessPiece.EMPTY) {
        score += pieceValues[piece] || 0;
      }
    }
  }
  return score;
}

function makeBotMove(board: ChessPiece[][], difficulty: BotDifficulty): [number, number, number, number] | null {
  const validMoves = getAllValidMoves(board, false); // Black's turn (bot)
  if (validMoves.length === 0) return null;
  
  switch (difficulty) {
    case BotDifficulty.EASY:
      // Random move
      return validMoves[Math.floor(Math.random() * validMoves.length)];
      
    case BotDifficulty.MEDIUM:
      // Sometimes random, sometimes greedy
      if (Math.random() < 0.3) {
        return validMoves[Math.floor(Math.random() * validMoves.length)];
      }
      // Fall through to greedy logic
      
    case BotDifficulty.HARD:
      // Greedy move - find best immediate capture or position
      let bestMove = validMoves[0];
      let bestScore = -Infinity;
      
      for (const [fromY, fromX, toY, toX] of validMoves) {
        const testBoard = clone(board);
        testBoard[toY][toX] = testBoard[fromY][fromX];
        testBoard[fromY][fromX] = ChessPiece.EMPTY;
        
        const score = evaluateBoard(testBoard);
        if (score > bestScore) {
          bestScore = score;
          bestMove = [fromY, fromX, toY, toX];
        }
      }
      
      return bestMove;
  }
  
  return validMoves[0];
}

export default function Chess() {
  const board = useChessStore(s => s.board);
  const selected = useChessStore(s => s.selected);
  const turn = useChessStore(s => s.turn);
  const message = useChessStore(s => s.message);
  const gameState = useChessStore(s => s.gameState);
  const stats = useChessStore(s => s.stats);
  const botDifficulty = useChessStore(s => s.botDifficulty);
  const setBoard = useChessStore(s => s.setBoard);
  const setSelected = useChessStore(s => s.setSelected);
  const setTurn = useChessStore(s => s.setTurn);
  const setMessage = useChessStore(s => s.setMessage);
  const setGameState = useChessStore(s => s.setGameState);
  const resetGame = useChessStore(s => s.resetGame);
  const pushHistory = useChessStore(s => s.pushHistory);
  const stepHistory = useChessStore(s => s.stepHistory);
  const history = useChessStore(s => s.history);
  const historyIndex = useChessStore(s => s.historyIndex);
  const updateStats = useChessStore(s => s.updateStats);
  const resetStats = useChessStore(s => s.resetStats);
  const setBotDifficulty = useChessStore(s => s.setBotDifficulty);
  const saveGame = useChessStore(s => s.saveGame);
  const loadGame = useChessStore(s => s.loadGame);
  const hasSavedGame = useChessStore(s => s.hasSavedGame);

  const [keyboardFocus, setKeyboardFocus] = React.useState<[number, number]>([0, 0]);
  const lastMove = useChessStore(s => s.lastMove);
  const setLastMove = useChessStore(s => s.setLastMove);
  const [showTutorial, setShowTutorial] = React.useState(false);

  function handleCellClick(y: number, x: number) {
    if (gameState !== 'playing') return;
    
    const piece = board[y][x];
    const isPlayerTurn = turn === PlayerColor.WHITE;
    const isPlayerPiece = isWhitePiece(piece);
    
    if (selected) {
      const [sy, sx] = selected;
      // Validate move
      if (isValidMove(board, sy, sx, y, x)) {
        const newBoard = clone(board);
        newBoard[y][x] = newBoard[sy][sx];
        newBoard[sy][sx] = ChessPiece.EMPTY;
        setBoard(newBoard);
        setSelected(null);
        setLastMove([sy, sx, y, x]);
        pushHistory(newBoard);
        setTurn(turn === PlayerColor.WHITE ? PlayerColor.BLACK : PlayerColor.WHITE);
        setMessage(turn === PlayerColor.WHITE ? 'Black to move' : 'White to move');
        
        // Bot move after player move
        setTimeout(() => {
          const currentBoard = useChessStore.getState().board;
          const currentTurn = useChessStore.getState().turn;
          if (currentTurn === PlayerColor.BLACK) {
            const botMove = makeBotMove(currentBoard, botDifficulty);
            if (botMove) {
              const [fromY, fromX, toY, toX] = botMove;
              const botBoard = clone(currentBoard);
              botBoard[toY][toX] = botBoard[fromY][fromX];
              botBoard[fromY][fromX] = ChessPiece.EMPTY;
              useChessStore.getState().setBoard(botBoard);
              useChessStore.getState().pushHistory(botBoard);
              useChessStore.getState().setTurn(PlayerColor.WHITE);
              useChessStore.getState().setMessage('White to move');
              useChessStore.getState().setLastMove([fromY, fromX, toY, toX]);
            }
          }
        }, 500);
      }
    } else if (isPlayerTurn && isPlayerPiece) {
      setSelected([y, x]);
    }
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    if (gameState !== 'playing') return;
    
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

  return (
    <div 
      style={{ padding: 24, color: 'white', minHeight: '100vh', background: '#222' }}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <Link href="/" style={{ color: '#60a5fa', textDecoration: 'underline' }}>← Back to Lobby</Link>
      <h1 style={{ fontSize: '2rem', margin: '1rem 0' }}>Chess</h1>
      
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
        <strong>How to Play:</strong> Chess is a strategic board game. White moves first. Each piece moves in specific ways. The goal is to checkmate the opponent's king.
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
      
      {/* Chess Board */}
      <div style={{ display: 'inline-block', border: '2px solid #fff', borderRadius: 8, overflow: 'hidden' }}>
        {board.map((row, y) => (
          <div key={y} style={{ display: 'flex' }}>
            {row.map((cell, x) => {
              const isKeyboardFocused = keyboardFocus[0] === y && keyboardFocus[1] === x;
              const isSelected = selected && selected[0] === y && selected[1] === x;
              const isLastMove = lastMove && ((lastMove[0] === y && lastMove[1] === x) || (lastMove[2] === y && lastMove[3] === x));
              
              return (
                <div
                  key={x}
                  onClick={() => handleCellClick(y, x)}
                  onFocus={() => setKeyboardFocus([y, x])}
                  tabIndex={0}
                  role="button"
                  aria-label={`${y + 1}, ${x + 1} ${getPieceSymbol(cell)}`}
                  style={{
                    ...cellStyle,
                    background: isLastMove ? '#fbbf24' : 
                              isSelected ? '#10b981' :
                              (y + x) % 2 === 0 ? '#444' : '#eee',
                    color: (y + x) % 2 === 0 ? 'white' : 'black',
                    border: isSelected ? '2px solid #fbbf24' : 
                           isKeyboardFocused ? '2px solid #3b82f6' : '1px solid #333',
                    cursor: 'pointer',
                    outline: 'none',
                    transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                    boxShadow: isLastMove ? '0 0 10px rgba(251, 191, 36, 0.5)' : 'none',
                  }}
                >
                  <span style={{
                    ...pieceStyle,
                    transform: cell !== ChessPiece.EMPTY ? 'scale(1)' : 'scale(0)',
                    opacity: cell !== ChessPiece.EMPTY ? 1 : 0,
                  }}>
                    {getPieceSymbol(cell)}
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
        gameName="Chess"
        steps={chessTutorial}
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
      />
    </div>
  );
} 