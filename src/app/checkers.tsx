import React, { useState } from 'react';
import Link from 'next/link';

const BOARD_SIZE = 8;
const EMPTY = 0, PLAYER = 1, BOT = 2;

type Cell = 0 | 1 | 2;
type Board = Cell[][];
type Pos = [number, number] | null;

function initialBoard(): Board {
  const board: Board = Array.from({ length: BOARD_SIZE }, () => Array<Cell>(BOARD_SIZE).fill(EMPTY));
  for (let y = 0; y < 3; y++) for (let x = (y + 1) % 2; x < BOARD_SIZE; x += 2) board[y][x] = BOT;
  for (let y = BOARD_SIZE - 3; y < BOARD_SIZE; y++) for (let x = (y + 1) % 2; x < BOARD_SIZE; x += 2) board[y][x] = PLAYER;
  return board;
}

function clone(board: Board): Board {
  return board.map(row => [...row]);
}

export default function Checkers() {
  const [board, setBoard] = useState<Board>(initialBoard());
  const [selected, setSelected] = useState<Pos>(null);
  const [turn, setTurn] = useState<Cell>(PLAYER);
  const [message, setMessage] = useState<string>('Your move!');

  function handleCellClick(y: number, x: number) {
    if (turn !== PLAYER) return;
    if (selected) {
      const [sy, sx] = selected;
      if (isValidMove(board, sy, sx, y, x, PLAYER)) {
        const newBoard = movePiece(board, sy, sx, y, x);
        setBoard(newBoard);
        setSelected(null);
        setTurn(BOT);
        setTimeout(() => botMove(newBoard), 500);
      } else {
        setSelected(null);
      }
    } else if (board[y][x] === PLAYER) {
      setSelected([y, x]);
    }
  }

  function botMove(currentBoard: Board) {
    for (let y = 0; y < BOARD_SIZE; y++) {
      for (let x = 0; x < BOARD_SIZE; x++) {
        if (currentBoard[y][x] === BOT) {
          const ny = y + 1;
          const nx1 = x - 1, nx2 = x + 1;
          if (ny < BOARD_SIZE) {
            if (nx1 >= 0 && currentBoard[ny][nx1] === EMPTY) {
              setBoard(movePiece(currentBoard, y, x, ny, nx1));
              setTurn(PLAYER);
              setMessage('Your move!');
              return;
            }
            if (nx2 < BOARD_SIZE && currentBoard[ny][nx2] === EMPTY) {
              setBoard(movePiece(currentBoard, y, x, ny, nx2));
              setTurn(PLAYER);
              setMessage('Your move!');
              return;
            }
          }
        }
      }
    }
    setMessage('Bot cannot move. Your turn!');
    setTurn(PLAYER);
  }

  function isValidMove(board: Board, sy: number, sx: number, dy: number, dx: number, player: Cell): boolean {
    if (board[dy][dx] !== EMPTY) return false;
    const dir = player === PLAYER ? -1 : 1;
    return (dy - sy === dir) && (Math.abs(dx - sx) === 1);
  }

  function movePiece(board: Board, sy: number, sx: number, dy: number, dx: number): Board {
    const newBoard = clone(board);
    newBoard[dy][dx] = newBoard[sy][sx];
    newBoard[sy][sx] = EMPTY;
    return newBoard;
  }

  return (
    <div style={{ padding: 24, color: 'white', minHeight: '100vh', background: '#222' }}>
      <Link href="/" style={{ color: '#60a5fa', textDecoration: 'underline' }}>← Back to Lobby</Link>
      <h1 style={{ fontSize: '2rem', margin: '1rem 0' }}>Checkers</h1>
      <div style={{ marginBottom: 12 }}>{message}</div>
      <div style={{ display: 'inline-block', border: '2px solid #fff' }}>
        {board.map((row, y) => (
          <div key={y} style={{ display: 'flex' }}>
            {row.map((cell, x) => (
              <div
                key={x}
                onClick={() => handleCellClick(y, x)}
                style={{
                  width: 40,
                  height: 40,
                  background: (y + x) % 2 === 0 ? '#444' : '#eee',
                  color: (y + x) % 2 === 0 ? 'white' : 'black',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: selected && selected[0] === y && selected[1] === x ? '2px solid #fbbf24' : '1px solid #333',
                  cursor: turn === PLAYER && (cell === PLAYER || (selected && isValidMove(board, selected[0], selected[1], y, x, PLAYER))) ? 'pointer' : 'default',
                  fontSize: 24,
                  userSelect: 'none',
                }}
              >
                {cell === PLAYER ? '●' : cell === BOT ? '○' : ''}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
} 