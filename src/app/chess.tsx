import React from 'react';
import Link from 'next/link';
import { useChessStore, ChessPiece, PlayerColor, BotDifficulty, GameMode } from './chessStore';
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

function isKingInCheck(board: ChessPiece[][], isWhiteKing: boolean): boolean {
  // Find the king
  const kingPiece = isWhiteKing ? ChessPiece.WHITE_KING : ChessPiece.BLACK_KING;
  let kingY = -1, kingX = -1;
  
  for (let y = 0; y < BOARD_SIZE; y++) {
    for (let x = 0; x < BOARD_SIZE; x++) {
      if (board[y][x] === kingPiece) {
        kingY = y;
        kingX = x;
        break;
      }
    }
    if (kingY !== -1) break;
  }
  
  if (kingY === -1) return false; // King not found
  
  // Check if any opponent piece can attack the king
  for (let y = 0; y < BOARD_SIZE; y++) {
    for (let x = 0; x < BOARD_SIZE; x++) {
      const piece = board[y][x];
      if (piece !== ChessPiece.EMPTY) {
        const isOpponentPiece = isWhiteKing ? isBlackPiece(piece) : isWhitePiece(piece);
        if (isOpponentPiece && isValidMove(board, y, x, kingY, kingX)) {
          return true;
        }
      }
    }
  }
  
  return false;
}

function isCheckmate(board: ChessPiece[][], isWhiteTurn: boolean): boolean {
  // First check if king is in check
  if (!isKingInCheck(board, isWhiteTurn)) return false;
  
  // Check if any move can get out of check
  const validMoves = getAllValidMoves(board, isWhiteTurn);
  
  for (const [fromY, fromX, toY, toX] of validMoves) {
    const testBoard = clone(board);
    testBoard[toY][toX] = testBoard[fromY][fromX];
    testBoard[fromY][fromX] = ChessPiece.EMPTY;
    
    // If this move gets us out of check, it's not checkmate
    if (!isKingInCheck(testBoard, isWhiteTurn)) {
      return false;
    }
  }
  
  return true;
}

function isStalemate(board: ChessPiece[][], isWhiteTurn: boolean): boolean {
  // King is not in check
  if (isKingInCheck(board, isWhiteTurn)) return false;
  
  // No valid moves available
  const validMoves = getAllValidMoves(board, isWhiteTurn);
  return validMoves.length === 0;
}

function isGameOver(board: ChessPiece[][], isWhiteTurn: boolean): { isOver: boolean; result: 'checkmate' | 'stalemate' | 'win' | 'loss' | null } {
  if (isCheckmate(board, isWhiteTurn)) {
    return { isOver: true, result: isWhiteTurn ? 'loss' : 'win' };
  }
  
  if (isStalemate(board, isWhiteTurn)) {
    return { isOver: true, result: 'stalemate' };
  }
  
  return { isOver: false, result: null };
}

function canPromotePawn(board: ChessPiece[][], fromY: number, fromX: number, toY: number): boolean {
  const piece = board[fromY][fromX];
  if (piece === ChessPiece.WHITE_PAWN && toY === 0) return true;
  if (piece === ChessPiece.BLACK_PAWN && toY === 7) return true;
  return false;
}

function promotePawn(board: ChessPiece[][], toY: number, toX: number, isWhite: boolean, promotionPiece: 'queen' | 'rook' | 'bishop' | 'knight'): ChessPiece[][] {
  const newBoard = clone(board);
  const pieceMap = {
    queen: isWhite ? ChessPiece.WHITE_QUEEN : ChessPiece.BLACK_QUEEN,
    rook: isWhite ? ChessPiece.WHITE_ROOK : ChessPiece.BLACK_ROOK,
    bishop: isWhite ? ChessPiece.WHITE_BISHOP : ChessPiece.BLACK_BISHOP,
    knight: isWhite ? ChessPiece.WHITE_KNIGHT : ChessPiece.BLACK_KNIGHT,
  };
  newBoard[toY][toX] = pieceMap[promotionPiece];
  return newBoard;
}

function canCastle(board: ChessPiece[][], isWhite: boolean, isKingside: boolean): boolean {
  const row = isWhite ? 7 : 0;
  const kingCol = 4;
  const rookCol = isKingside ? 7 : 0;
  const kingPiece = isWhite ? ChessPiece.WHITE_KING : ChessPiece.BLACK_KING;
  const rookPiece = isWhite ? ChessPiece.WHITE_ROOK : ChessPiece.BLACK_ROOK;
  
  // Check if king and rook are in starting positions
  if (board[row][kingCol] !== kingPiece || board[row][rookCol] !== rookPiece) {
    return false;
  }
  
  // Check if path is clear
  const startCol = isKingside ? 5 : 1;
  const endCol = isKingside ? 6 : 3;
  for (let col = startCol; col <= endCol; col++) {
    if (board[row][col] !== ChessPiece.EMPTY) {
      return false;
    }
  }
  
  // Check if king is in check or would pass through check
  if (isKingInCheck(board, isWhite)) return false;
  
  const checkCol = isKingside ? 5 : 3;
  const testBoard = clone(board);
  testBoard[row][checkCol] = testBoard[row][kingCol];
  testBoard[row][kingCol] = ChessPiece.EMPTY;
  if (isKingInCheck(testBoard, isWhite)) return false;
  
  return true;
}

function performCastling(board: ChessPiece[][], isWhite: boolean, isKingside: boolean): ChessPiece[][] {
  const newBoard = clone(board);
  const row = isWhite ? 7 : 0;
  const kingCol = 4;
  const rookCol = isKingside ? 7 : 0;
  const kingPiece = isWhite ? ChessPiece.WHITE_KING : ChessPiece.BLACK_KING;
  const rookPiece = isWhite ? ChessPiece.WHITE_ROOK : ChessPiece.BLACK_ROOK;
  
  // Move king
  const newKingCol = isKingside ? 6 : 2;
  newBoard[row][newKingCol] = kingPiece;
  newBoard[row][kingCol] = ChessPiece.EMPTY;
  
  // Move rook
  const newRookCol = isKingside ? 5 : 3;
  newBoard[row][newRookCol] = rookPiece;
  newBoard[row][rookCol] = ChessPiece.EMPTY;
  
  return newBoard;
}

export default function Chess() {
  const board = useChessStore(s => s.board);
  const selected = useChessStore(s => s.selected);
  const turn = useChessStore(s => s.turn);
  const message = useChessStore(s => s.message);
  const gameState = useChessStore(s => s.gameState);
  const stats = useChessStore(s => s.stats);
  const botDifficulty = useChessStore(s => s.botDifficulty);
  const gameMode = useChessStore(s => s.gameMode);
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
  const setGameMode = useChessStore(s => s.setGameMode);
  const saveGame = useChessStore(s => s.saveGame);
  const loadGame = useChessStore(s => s.loadGame);
  const hasSavedGame = useChessStore(s => s.hasSavedGame);

  const [keyboardFocus, setKeyboardFocus] = React.useState<[number, number]>([0, 0]);
  const lastMove = useChessStore(s => s.lastMove);
  const setLastMove = useChessStore(s => s.setLastMove);
  const pendingPromotion = useChessStore(s => s.pendingPromotion);
  const setPendingPromotion = useChessStore(s => s.setPendingPromotion);
  const [showTutorial, setShowTutorial] = React.useState(false);

  function handleCellClick(y: number, x: number) {
    if (gameState !== 'playing') return;
    
    const piece = board[y][x];
    const isPlayerTurn = turn === PlayerColor.WHITE;
    const isPlayerPiece = isWhitePiece(piece);
    const isOpponentPiece = isBlackPiece(piece);
    
    // In human vs human mode, allow both players to move their pieces
    // In human vs bot mode, only allow white (human) to move
    const canMovePiece = gameMode === GameMode.HUMAN_VS_HUMAN ? 
      (isPlayerTurn && isPlayerPiece) || (!isPlayerTurn && isOpponentPiece) :
      (isPlayerTurn && isPlayerPiece);
    
    if (selected) {
      const [sy, sx] = selected;
      // Validate move
      if (isValidMove(board, sy, sx, y, x)) {
        let newBoard = clone(board);
        newBoard[y][x] = newBoard[sy][sx];
        newBoard[sy][sx] = ChessPiece.EMPTY;
        
        // Check for pawn promotion
        if (canPromotePawn(board, sy, sx, y)) {
          setPendingPromotion([y, x]);
          setBoard(newBoard);
          setSelected(null);
          setLastMove([sy, sx, y, x]);
          pushHistory(newBoard);
          return; // Wait for promotion choice
        }
        
        setBoard(newBoard);
        setSelected(null);
        setLastMove([sy, sx, y, x]);
        pushHistory(newBoard);
        
        // Check for game end after player move
        const gameOverResult = isGameOver(newBoard, false); // Black's turn now
        if (gameOverResult.isOver) {
          const moveCount = history.length - 1; // Subtract initial board state
          if (gameOverResult.result === 'win') {
            setGameState('won');
            setMessage('Checkmate! White wins!');
            updateStats('win', moveCount);
          } else if (gameOverResult.result === 'loss') {
            setGameState('lost');
            setMessage('Checkmate! Black wins!');
            updateStats('loss', moveCount);
          } else if (gameOverResult.result === 'stalemate') {
            setGameState('draw');
            setMessage('Stalemate! Game is a draw.');
          }
        } else {
          setTurn(turn === PlayerColor.WHITE ? PlayerColor.BLACK : PlayerColor.WHITE);
          setMessage(turn === PlayerColor.WHITE ? 'Black to move' : 'White to move');
          
          // Bot move after player move (only in HUMAN_VS_BOT mode)
          if (gameMode === GameMode.HUMAN_VS_BOT) {
            setTimeout(() => {
              const currentBoard = useChessStore.getState().board;
              const currentTurn = useChessStore.getState().turn;
              const currentGameState = useChessStore.getState().gameState;
              
              if (currentTurn === PlayerColor.BLACK && currentGameState === 'playing') {
                const botMove = makeBotMove(currentBoard, botDifficulty);
                if (botMove) {
                  const [fromY, fromX, toY, toX] = botMove;
                  const botBoard = clone(currentBoard);
                  botBoard[toY][toX] = botBoard[fromY][fromX];
                  botBoard[fromY][fromX] = ChessPiece.EMPTY;
                  useChessStore.getState().setBoard(botBoard);
                  useChessStore.getState().pushHistory(botBoard);
                  useChessStore.getState().setLastMove([fromY, fromX, toY, toX]);
                  
                  // Check for game end after bot move
                  const botGameOverResult = isGameOver(botBoard, true); // White's turn now
                  if (botGameOverResult.isOver) {
                    const botMoveCount = useChessStore.getState().history.length - 1;
                    if (botGameOverResult.result === 'win') {
                      useChessStore.getState().setGameState('won');
                      useChessStore.getState().setMessage('Checkmate! White wins!');
                      useChessStore.getState().updateStats('win', botMoveCount);
                    } else if (botGameOverResult.result === 'loss') {
                      useChessStore.getState().setGameState('lost');
                      useChessStore.getState().setMessage('Checkmate! Black wins!');
                      useChessStore.getState().updateStats('loss', botMoveCount);
                    } else if (botGameOverResult.result === 'stalemate') {
                      useChessStore.getState().setGameState('draw');
                      useChessStore.getState().setMessage('Stalemate! Game is a draw.');
                    }
                  } else {
                    useChessStore.getState().setTurn(PlayerColor.WHITE);
                    useChessStore.getState().setMessage('White to move');
                  }
                }
              }
            }, 500);
          }
        }
      }
    } else if (canMovePiece) {
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

  function handlePromotion(promotionPiece: 'queen' | 'rook' | 'bishop' | 'knight') {
    if (!pendingPromotion) return;
    
    const [y, x] = pendingPromotion;
    const isWhite = turn === PlayerColor.WHITE;
    const newBoard = promotePawn(board, y, x, isWhite, promotionPiece);
    setBoard(newBoard);
    setPendingPromotion(null);
    
    // Continue with game logic
    const gameOverResult = isGameOver(newBoard, false); // Black's turn now
    if (gameOverResult.isOver) {
      const moveCount = history.length - 1;
      if (gameOverResult.result === 'win') {
        setGameState('won');
        setMessage('Checkmate! White wins!');
        updateStats('win', moveCount);
      } else if (gameOverResult.result === 'loss') {
        setGameState('lost');
        setMessage('Checkmate! Black wins!');
        updateStats('loss', moveCount);
      } else if (gameOverResult.result === 'stalemate') {
        setGameState('draw');
        setMessage('Stalemate! Game is a draw.');
      }
    } else {
      setTurn(turn === PlayerColor.WHITE ? PlayerColor.BLACK : PlayerColor.WHITE);
      setMessage(turn === PlayerColor.WHITE ? 'Black to move' : 'White to move');
      
      // Bot move after player move (only in HUMAN_VS_BOT mode)
      if (gameMode === GameMode.HUMAN_VS_BOT) {
        setTimeout(() => {
          const currentBoard = useChessStore.getState().board;
          const currentTurn = useChessStore.getState().turn;
          const currentGameState = useChessStore.getState().gameState;
          
          if (currentTurn === PlayerColor.BLACK && currentGameState === 'playing') {
            const botMove = makeBotMove(currentBoard, botDifficulty);
            if (botMove) {
              const [fromY, fromX, toY, toX] = botMove;
              const botBoard = clone(currentBoard);
              botBoard[toY][toX] = botBoard[fromY][fromX];
              botBoard[fromY][fromX] = ChessPiece.EMPTY;
              useChessStore.getState().setBoard(botBoard);
              useChessStore.getState().pushHistory(botBoard);
              useChessStore.getState().setLastMove([fromY, fromX, toY, toX]);
              
              // Check for game end after bot move
              const botGameOverResult = isGameOver(botBoard, true); // White's turn now
              if (botGameOverResult.isOver) {
                const botMoveCount = useChessStore.getState().history.length - 1;
                if (botGameOverResult.result === 'win') {
                  useChessStore.getState().setGameState('won');
                  useChessStore.getState().setMessage('Checkmate! White wins!');
                  useChessStore.getState().updateStats('win', botMoveCount);
                } else if (botGameOverResult.result === 'loss') {
                  useChessStore.getState().setGameState('lost');
                  useChessStore.getState().setMessage('Checkmate! Black wins!');
                  useChessStore.getState().updateStats('loss', botMoveCount);
                } else if (botGameOverResult.result === 'stalemate') {
                  useChessStore.getState().setGameState('draw');
                  useChessStore.getState().setMessage('Stalemate! Game is a draw.');
                }
              } else {
                useChessStore.getState().setTurn(PlayerColor.WHITE);
                useChessStore.getState().setMessage('White to move');
              }
            }
          }
        }, 500);
      }
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
            Win Rate: {Math.round((stats.wins / stats.totalGames) * 100)}% | 
            Current Streak: {stats.currentWinStreak} | 
            Best Streak: {stats.bestWinStreak} | 
            Avg Moves: {stats.averageMovesPerGame}
          </span>
        )}
        {stats.fastestWin > 0 && (
          <div style={{ marginTop: 8, fontSize: '0.9em' }}>
            Fastest Win: {stats.fastestWin} moves | Longest Game: {stats.longestGame} moves
          </div>
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

      {/* Pawn Promotion Modal */}
      {pendingPromotion && (
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
            padding: 24,
            borderRadius: 8,
            textAlign: 'center',
          }}>
            <h3>Choose Promotion Piece</h3>
            <div style={{ display: 'flex', gap: 16, marginTop: 16 }}>
              {(['queen', 'rook', 'bishop', 'knight'] as const).map(piece => (
                <button
                  key={piece}
                  onClick={() => handlePromotion(piece)}
                  style={{
                    background: '#6366f1',
                    color: 'white',
                    border: 'none',
                    padding: '12px 16px',
                    borderRadius: 4,
                    cursor: 'pointer',
                    fontSize: 16,
                    textTransform: 'capitalize',
                  }}
                >
                  {piece}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

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