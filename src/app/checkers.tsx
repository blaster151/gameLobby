import React from 'react';
import Link from 'next/link';
import { useCheckersStore, PieceType, Board, BotDifficulty, GameMode, isKing, isPlayerPiece, isBotPiece, promoteToKing } from './checkersStore';
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

  // Check game state when board changes
  React.useEffect(() => {
    const newGameState = checkGameState(board);
    if (newGameState !== gameState) {
      setGameState(newGameState);
    }
  }, [board, gameState, setGameState]);

  // Trigger bot move when it's bot's turn
  React.useEffect(() => {
    if (turn === PieceType.BOT && gameState === 'playing' && gameMode === GameMode.HUMAN_VS_BOT) {
      setTimeout(() => botMove(board), 100);
    }
  }, [turn, gameState, gameMode, board]);

  function checkGameState(board: Board): string {
    const playerPieces = board.flat().filter(cell => cell === PieceType.PLAYER || cell === PieceType.PLAYER_KING).length;
    const botPieces = board.flat().filter(cell => cell === PieceType.BOT || cell === PieceType.BOT_KING).length;
    
    // Check for piece elimination
    if (playerPieces === 0) return 'lose';
    if (botPieces === 0) return 'win';
    
    // Check for stalemate scenarios (including insufficient material)
    const stalemateType = detectStalemate(board);
    if (stalemateType !== 'none') {
      return 'stalemate';
    }
    
    // Check for no moves (this is different from stalemate)
    const playerMoves = getValidMoves(board, PieceType.PLAYER);
    const botMoves = getValidMoves(board, PieceType.BOT);
    
    if (playerMoves.length === 0 && botMoves.length === 0) {
      return 'stalemate';
    }
    
    if (playerMoves.length === 0) {
      return 'lose'; // Player has no moves but bot does
    }
    
    if (botMoves.length === 0) {
      return 'win'; // Bot has no moves but player does
    }
    
    return 'playing';
  }

  function detectStalemate(board: Board): 'none' | 'blocked' | 'insufficient_material' | 'repetitive' | 'no_progress' {
    // Check for blocked pieces stalemate
    if (isBlockedStalemate(board)) {
      return 'blocked';
    }
    
    // Check for insufficient material stalemate
    if (isInsufficientMaterialStalemate(board)) {
      return 'insufficient_material';
    }
    
    // Check for repetitive position stalemate
    if (isRepetitivePositionStalemate(board)) {
      return 'repetitive';
    }
    
    // Check for no progress stalemate
    if (isNoProgressStalemate(board)) {
      return 'no_progress';
    }
    
    return 'none';
  }

  function isBlockedStalemate(board: Board): boolean {
    const playerPieces = getPiecePositions(board, PieceType.PLAYER);
    const botPieces = getPiecePositions(board, PieceType.BOT);
    
    // Check if all pieces are completely blocked
    const allPlayerBlocked = playerPieces.every(([y, x]) => isPieceCompletelyBlocked(board, y, x, PieceType.PLAYER));
    const allBotBlocked = botPieces.every(([y, x]) => isPieceCompletelyBlocked(board, y, x, PieceType.BOT));
    
    return allPlayerBlocked && allBotBlocked;
  }

  function isPieceCompletelyBlocked(board: Board, y: number, x: number, player: PieceType): boolean {
    const piece = board[y][x];
    if (piece === PieceType.EMPTY) return false;
    
    const isKingPiece = isKing(piece);
    const opponent = player === PieceType.PLAYER ? PieceType.BOT : PieceType.PLAYER;
    const opponentKing = player === PieceType.PLAYER ? PieceType.BOT_KING : PieceType.PLAYER_KING;
    
    // Check all possible diagonal directions
    const directions = isKingPiece ? 
      [[-1, -1], [-1, 1], [1, -1], [1, 1]] : // Kings can move in all directions
      (player === PieceType.PLAYER ? [[1, -1], [1, 1]] : [[-1, -1], [-1, 1]]); // Pawns move forward only
    
    for (const [yDir, xDir] of directions) {
      const newY = y + yDir;
      const newX = x + xDir;
      
      // Check regular moves
      if (isValidPosition(newY, newX) && board[newY][newX] === PieceType.EMPTY) {
        return false; // Piece can move
      }
      
      // Check captures
      const captureY = y + yDir;
      const captureX = x + xDir;
      const landingY = y + (yDir * 2);
      const landingX = x + (xDir * 2);
      
      if (isValidPosition(captureY, captureX) && 
          (board[captureY][captureX] === opponent || board[captureY][captureX] === opponentKing) &&
          isValidPosition(landingY, landingX) && 
          board[landingY][landingX] === PieceType.EMPTY) {
        return false; // Piece can capture
      }
    }
    
    return true; // Piece is completely blocked
  }

  function isInsufficientMaterialStalemate(board: Board): boolean {
    const playerPieces = getPiecePositions(board, PieceType.PLAYER);
    const botPieces = getPiecePositions(board, PieceType.BOT);
    
    // Count kings and pawns for each player
    const playerKings = playerPieces.filter(([y, x]) => isKing(board[y][x])).length;
    const playerPawns = playerPieces.length - playerKings;
    const botKings = botPieces.filter(([y, x]) => isKing(board[y][x])).length;
    const botPawns = botPieces.length - botKings;
    
    // King vs King stalemate
    if (playerKings === 1 && playerPawns === 0 && botKings === 1 && botPawns === 0) {
      return true;
    }
    
    // King vs King + 1 pawn stalemate (if pawn is blocked)
    if (playerKings === 1 && playerPawns === 0 && botKings === 1 && botPawns === 1) {
      const botPawn = botPieces.find(([y, x]) => !isKing(board[y][x]));
      if (botPawn && isPawnBlockedFromPromotion(board, botPawn[0], botPawn[1], PieceType.BOT)) {
        return true;
      }
    }
    
    if (botKings === 1 && botPawns === 0 && playerKings === 1 && playerPawns === 1) {
      const playerPawn = playerPieces.find(([y, x]) => !isKing(board[y][x]));
      if (playerPawn && isPawnBlockedFromPromotion(board, playerPawn[0], playerPawn[1], PieceType.PLAYER)) {
        return true;
      }
    }
    
    return false;
  }

  function isPawnBlockedFromPromotion(board: Board, y: number, x: number, player: PieceType): boolean {
    if (isKing(board[y][x])) return false;
    
    // Check if pawn can reach promotion row
    const promotionRow = player === PieceType.PLAYER ? 0 : 7;
    const direction = player === PieceType.PLAYER ? -1 : 1;
    
    // Check if there's a clear path to promotion
    let currentY = y;
    let currentX = x;
    
    while (currentY !== promotionRow) {
      currentY += direction;
      
      // Check if path is blocked
      if (board[currentY][currentX] !== PieceType.EMPTY) {
        return true; // Blocked from promotion
      }
      
      // Check if opponent king can block the path
      const opponentKing = player === PieceType.PLAYER ? PieceType.BOT_KING : PieceType.PLAYER_KING;
      const kingPositions = getPiecePositions(board, opponentKing);
      
      for (const [kingY, kingX] of kingPositions) {
        if (canKingBlockPawnPromotion(board, kingY, kingX, currentY, currentX, promotionRow)) {
          return true; // Can be blocked from promotion
        }
      }
    }
    
    return false;
  }

  function canKingBlockPawnPromotion(board: Board, kingY: number, kingX: number, pawnY: number, pawnX: number, promotionRow: number): boolean {
    // Calculate if king can reach a blocking position before pawn promotes
    const pawnDistance = Math.abs(pawnY - promotionRow);
    const kingDistance = Math.abs(kingY - promotionRow) + Math.abs(kingX - pawnX);
    
    // King can block if it can reach the promotion path in time
    return kingDistance <= pawnDistance;
  }

  function isRepetitivePositionStalemate(board: Board): boolean {
    // This would require tracking move history, but for now we'll implement a simple version
    // that checks for obvious repetitive patterns
    
    // Check if pieces are stuck in a small area with no progress
    const playerPieces = getPiecePositions(board, PieceType.PLAYER);
    const botPieces = getPiecePositions(board, PieceType.BOT);
    
    // If all pieces are in a small confined area, it might be repetitive
    const allPieces = [...playerPieces, ...botPieces];
    if (allPieces.length <= 4) {
      const minY = Math.min(...allPieces.map(([y]) => y));
      const maxY = Math.max(...allPieces.map(([y]) => y));
      const minX = Math.min(...allPieces.map(([, x]) => x));
      const maxX = Math.max(...allPieces.map(([, x]) => x));
      
      const area = (maxY - minY + 1) * (maxX - minX + 1);
      if (area <= 16) { // 4x4 area or smaller
        return true;
      }
    }
    
    return false;
  }

  function isNoProgressStalemate(board: Board): boolean {
    // Check if no captures or promotions have occurred recently
    // This would require tracking game history, but for now we'll check current state
    
    const playerPieces = getPiecePositions(board, PieceType.PLAYER);
    const botPieces = getPiecePositions(board, PieceType.BOT);
    
    // If both players have only kings and they're in opposite corners
    const playerKings = playerPieces.filter(([y, x]) => isKing(board[y][x]));
    const botKings = botPieces.filter(([y, x]) => isKing(board[y][x]));
    
    if (playerKings.length === playerPieces.length && botKings.length === botPieces.length) {
      // Check if kings are in opposite corners
      const playerAvgY = playerKings.reduce((sum, [y]) => sum + y, 0) / playerKings.length;
      const playerAvgX = playerKings.reduce((sum, [, x]) => sum + x, 0) / playerKings.length;
      const botAvgY = botKings.reduce((sum, [y]) => sum + y, 0) / botKings.length;
      const botAvgX = botKings.reduce((sum, [, x]) => sum + x, 0) / botKings.length;
      
      // If kings are in opposite quadrants, it might be a no-progress stalemate
      const playerQuadrant = (playerAvgY < 4 ? 0 : 1) * 2 + (playerAvgX < 4 ? 0 : 1);
      const botQuadrant = (botAvgY < 4 ? 0 : 1) * 2 + (botAvgX < 4 ? 0 : 1);
      
      if (playerQuadrant + botQuadrant === 3) { // Opposite quadrants
        return true;
      }
    }
    
    return false;
  }

  function getPiecePositions(board: Board, player: PieceType): Array<[number, number]> {
    const positions: Array<[number, number]> = [];
    
    for (let y = 0; y < BOARD_SIZE; y++) {
      for (let x = 0; x < BOARD_SIZE; x++) {
        const piece = board[y][x];
        if (piece === player || (player === PieceType.PLAYER && piece === PieceType.PLAYER_KING) || (player === PieceType.BOT && piece === PieceType.BOT_KING)) {
          positions.push([y, x]);
        }
      }
    }
    
    return positions;
  }

  function isStalemate(board: Board): boolean {
    const playerMoves = getValidMoves(board, PieceType.PLAYER);
    const botMoves = getValidMoves(board, PieceType.BOT);
    return playerMoves.length === 0 && botMoves.length === 0;
  }

  function hasNoMoves(board: Board, player: PieceType): boolean {
    return getValidMoves(board, player).length === 0;
  }

  function getStalemateReason(board: Board): string {
    const playerMoves = getValidMoves(board, PieceType.PLAYER);
    const botMoves = getValidMoves(board, PieceType.BOT);
    
    // Check for stalemate scenarios first (including repetitive positions)
    const stalemateType = detectStalemate(board);
    if (stalemateType !== 'none') {
      switch (stalemateType) {
        case 'blocked':
          return 'Stalemate: All pieces are completely blocked';
        case 'insufficient_material':
          return 'Stalemate: Insufficient material to win';
        case 'repetitive':
          return 'Stalemate: Repetitive position with no progress';
        case 'no_progress':
          return 'Stalemate: No progress possible';
        default:
          return 'Stalemate: No valid moves for either player';
      }
    }
    
    // Check for no moves scenarios
    if (playerMoves.length === 0 && botMoves.length === 0) {
      return 'Stalemate: No valid moves for either player';
    }
    
    if (playerMoves.length === 0) {
      return 'Player has no valid moves';
    }
    
    if (botMoves.length === 0) {
      return 'Bot has no valid moves';
    }
    
    return 'Game is still playable';
  }

  function getDetailedStalemateAnalysis(board: Board): string {
    const stalemateType = detectStalemate(board);
    const playerPieces = getPiecePositions(board, PieceType.PLAYER);
    const botPieces = getPiecePositions(board, PieceType.BOT);
    
    let analysis = `Stalemate Analysis:\n`;
    analysis += `Player pieces: ${playerPieces.length} (${playerPieces.filter(([y, x]) => isKing(board[y][x])).length} kings)\n`;
    analysis += `Bot pieces: ${botPieces.length} (${botPieces.filter(([y, x]) => isKing(board[y][x])).length} kings)\n`;
    analysis += `Stalemate type: ${stalemateType}\n`;
    
    if (stalemateType === 'blocked') {
      const blockedPlayerPieces = playerPieces.filter(([y, x]) => isPieceCompletelyBlocked(board, y, x, PieceType.PLAYER)).length;
      const blockedBotPieces = botPieces.filter(([y, x]) => isPieceCompletelyBlocked(board, y, x, PieceType.BOT)).length;
      analysis += `Blocked pieces: Player ${blockedPlayerPieces}, Bot ${blockedBotPieces}\n`;
    }
    
    return analysis;
  }

  function handleCellClick(y: number, x: number) {
    if (gameState !== 'playing') return;
    
    // In human vs human mode, allow both players to move their pieces
    // In human vs bot mode, only allow player to move
    const canMovePiece = gameMode === GameMode.HUMAN_VS_HUMAN ? 
      (turn === PieceType.PLAYER && (board[y][x] === PieceType.PLAYER || board[y][x] === PieceType.PLAYER_KING)) || 
      (turn === PieceType.BOT && (board[y][x] === PieceType.BOT || board[y][x] === PieceType.BOT_KING)) :
      (turn === PieceType.PLAYER && (board[y][x] === PieceType.PLAYER || board[y][x] === PieceType.PLAYER_KING));
    
    if (selected) {
      const [sy, sx] = selected;
      const currentPlayer = turn === PieceType.PLAYER ? PieceType.PLAYER : PieceType.BOT;
      
      // Use enhanced validation with mandatory capture checking
      const validation = validateMoveWithMandatoryCapture(board, sy, sx, y, x, currentPlayer);
      
      if (validation.isValid) {
        const newBoard = movePiece(board, sy, sx, y, x);
        setBoard(newBoard);
        setSelected(null);
        setLastMove([sy, sx, y, x]);
        pushHistory(newBoard);
        const newGameState = checkGameState(newBoard);
        setGameState(newGameState);
        if (newGameState === 'playing') {
          setTurn(turn === PieceType.PLAYER ? PieceType.BOT : PieceType.PLAYER);
          // Bot move after player move (only in HUMAN_VS_BOT mode)
          if (gameMode === GameMode.HUMAN_VS_BOT && turn === PieceType.PLAYER) {
            setTimeout(() => botMove(newBoard), 500);
          }
        } else {
          if (newGameState === 'win') {
            updateStats('win');
            setMessage('You win!');
          } else if (newGameState === 'lose') {
            updateStats('loss');
            setMessage('You lose!');
          } else if (newGameState === 'stalemate') {
            setMessage('Stalemate! No valid moves for either player.');
          }
        }
      } else {
        // Show error message for invalid moves
        setMessage(validation.message);
        setSelected(null);
      }
    } else if (canMovePiece) {
      setSelected([y, x]);
    }
  }

  function getValidMoves(board: Board, player: PieceType): Array<[number, number, number, number]> {
    // Use the mandatory capture enforcement function
    return enforceMandatoryCapture(board, player);
  }

  function getAvailableCaptures(board: Board, player: PieceType): Array<[number, number, number, number]> {
    const captures: Array<[number, number, number, number]> = [];
    
    for (let y = 0; y < BOARD_SIZE; y++) {
      for (let x = 0; x < BOARD_SIZE; x++) {
        const piece = board[y][x];
        if (piece === player || (player === PieceType.PLAYER && piece === PieceType.PLAYER_KING) || (player === PieceType.BOT && piece === PieceType.BOT_KING)) {
          const isKingPiece = isKing(piece);
          const opponent = player === PieceType.PLAYER ? PieceType.BOT : PieceType.PLAYER;
          const opponentKing = player === PieceType.PLAYER ? PieceType.BOT_KING : PieceType.PLAYER_KING;
          
          // Check all possible diagonal capture directions
          const diagonalOffsets = [
            [-1, -1], // northwest
            [-1, 1],  // northeast
            [1, -1],  // southwest
            [1, 1]    // southeast
          ];
          
          for (const [yOffset, xOffset] of diagonalOffsets) {
            const captureY = y + yOffset;
            const captureX = x + xOffset;
            const landingY = y + (yOffset * 2);
            const landingX = x + (xOffset * 2);
            
            // Check if capture is valid using simple validation (no recursive calls)
            if (isValidCaptureMove(board, y, x, landingY, landingX, player, isKingPiece, opponent, opponentKing)) {
              captures.push([y, x, landingY, landingX]);
            }
          }
        }
      }
    }
    
    return captures;
  }

  function isValidCaptureMove(board: Board, sy: number, sx: number, dy: number, dx: number, player: PieceType, isKingPiece: boolean, opponent: PieceType, opponentKing: PieceType): boolean {
    // Validate board boundaries
    if (!isValidPosition(sy, sx) || !isValidPosition(dy, dx)) {
      return false;
    }
    
    // Validate that source position contains a piece
    if (board[sy][sx] === PieceType.EMPTY) {
      return false;
    }
    
    // Validate that destination is empty
    if (board[dy][dx] !== PieceType.EMPTY) {
      return false;
    }
    
    // Calculate direction vectors
    const yDiff = dy - sy;
    const xDiff = dx - sx;
    
    // Must move diagonally (both x and y must change by the same amount)
    if (Math.abs(xDiff) !== Math.abs(yDiff)) {
      return false;
    }
    
    // Must be a capture move (2 steps)
    if (Math.abs(yDiff) !== 2) {
      return false;
    }
    
    // Validate diagonal direction for regular pieces
    if (!isKingPiece) {
      const expectedYDir = player === PieceType.PLAYER ? -1 : 1;
      if (yDiff !== expectedYDir) {
        return false;
      }
    }
    
    // Validate the captured piece and its position
    const captureY = sy + (yDiff / 2);
    const captureX = sx + (xDiff / 2);
    
    // Validate capture position is within bounds
    if (!isValidPosition(captureY, captureX)) {
      return false;
    }
    
    const capturedPiece = board[captureY][captureX];
    if (capturedPiece !== opponent && capturedPiece !== opponentKing) {
      return false;
    }
    
    return true;
  }

  function hasAvailableCaptures(board: Board, player: PieceType): boolean {
    return getAvailableCaptures(board, player).length > 0;
  }

  function hasAnyCaptures(board: Board, player: PieceType): boolean {
    // Check for single captures, chain captures, and multiple jump sequences
    const singleCaptures = getAvailableCaptures(board, player);
    const chainCaptures = findChainCaptures(board, player, 10);
    const multipleJumpSequences = findMultipleJumpSequences(board, player, 10);
    
    return singleCaptures.length > 0 || chainCaptures.length > 0 || multipleJumpSequences.length > 0;
  }

  function validateMandatoryCapture(board: Board, sy: number, sx: number, dy: number, dx: number, player: PieceType): boolean {
    // If this is a capture move, it's always valid when captures are mandatory
    const isCapture = Math.abs(dy - sy) === 2 && Math.abs(dx - sx) === 2;
    
    if (isCapture) {
      return true; // Capture moves are always valid when captures are available
    }
    
    // If this is a regular move, check if any captures are available
    const hasCaptures = hasAnyCaptures(board, player);
    
    if (hasCaptures) {
      return false; // Regular moves are not allowed when captures are available
    }
    
    return true; // Regular moves are allowed when no captures are available
  }

  function enforceMandatoryCapture(board: Board, player: PieceType): Array<[number, number, number, number]> {
    const validMoves: Array<[number, number, number, number]> = [];
    
    // Check for multiple jump sequences first (they take highest priority)
    const multipleJumpSequences = findMultipleJumpSequences(board, player, 10);
    if (multipleJumpSequences.length > 0) {
      // Return the first move of each multiple jump sequence
      const firstMoves = new Set<string>();
      for (const sequence of multipleJumpSequences) {
        if (sequence.length > 0) {
          const [sy, sx, dy, dx] = sequence[0];
          firstMoves.add(`${sy},${sx},${dy},${dx}`);
        }
      }
      
      // Convert back to move format
      for (const moveStr of firstMoves) {
        const [sy, sx, dy, dx] = moveStr.split(',').map(Number);
        validMoves.push([sy, sx, dy, dx]);
      }
      
      return validMoves; // Only multiple jump sequences are valid
    }
    
    // Check for chain captures (they take second priority)
    const chainCaptures = findChainCaptures(board, player, 10);
    if (chainCaptures.length > 0) {
      // Return the first move of each chain capture sequence
      const firstMoves = new Set<string>();
      for (const sequence of chainCaptures) {
        if (sequence.length > 0) {
          const [sy, sx, dy, dx] = sequence[0];
          firstMoves.add(`${sy},${sx},${dy},${dx}`);
        }
      }
      
      // Convert back to move format
      for (const moveStr of firstMoves) {
        const [sy, sx, dy, dx] = moveStr.split(',').map(Number);
        validMoves.push([sy, sx, dy, dx]);
      }
      
      return validMoves; // Only chain captures are valid
    }
    
    // Check for single captures
    const singleCaptures = getAvailableCaptures(board, player);
    if (singleCaptures.length > 0) {
      return singleCaptures; // Only single captures are valid
    }
    
    // If no captures are available, return all valid regular moves
    for (let y = 0; y < BOARD_SIZE; y++) {
      for (let x = 0; x < BOARD_SIZE; x++) {
        const piece = board[y][x];
        if (piece === player || (player === PieceType.PLAYER && piece === PieceType.PLAYER_KING) || (player === PieceType.BOT && piece === PieceType.BOT_KING)) {
          const isKingPiece = isKing(piece);
          
          // Check all possible diagonal moves
          const diagonalOffsets = [
            [-1, -1], // northwest
            [-1, 1],  // northeast
            [1, -1],  // southwest
            [1, 1]    // southeast
          ];
          
          for (const [yOffset, xOffset] of diagonalOffsets) {
            const ny = y + yOffset;
            const nx = x + xOffset;
            
            // Check if the move is valid and no captures are available
            if (isValidMove(board, y, x, ny, nx, player) && validateMandatoryCapture(board, y, x, ny, nx, player)) {
              validMoves.push([y, x, ny, nx]);
            }
          }
        }
      }
    }
    
    return validMoves;
  }

  function getMandatoryCaptureMessage(board: Board, player: PieceType): string {
    const multipleJumpSequences = findMultipleJumpSequences(board, player, 10);
    const chainCaptures = findChainCaptures(board, player, 10);
    const singleCaptures = getAvailableCaptures(board, player);
    
    if (multipleJumpSequences.length > 0) {
      const maxJumps = Math.max(...multipleJumpSequences.map(seq => seq.length));
      return `You must capture! Multiple jump sequence available (${maxJumps} jumps)`;
    } else if (chainCaptures.length > 0) {
      const maxCaptures = Math.max(...chainCaptures.map(seq => seq.length));
      return `You must capture! Chain capture available (${maxCaptures} pieces)`;
    } else if (singleCaptures.length > 0) {
      return `You must capture! ${singleCaptures.length} capture(s) available`;
    }
    
    return '';
  }

  function validateMoveWithMandatoryCapture(board: Board, sy: number, sx: number, dy: number, dx: number, player: PieceType): { isValid: boolean; message: string } {
    // Check if this is a capture move
    const isCapture = Math.abs(dy - sy) === 2 && Math.abs(dx - sx) === 2;
    
    // If captures are available, only capture moves are valid
    if (hasAnyCaptures(board, player) && !isCapture) {
      return {
        isValid: false,
        message: getMandatoryCaptureMessage(board, player)
      };
    }
    
    // Use the enhanced diagonal movement validation
    const diagonalValidation = validateDiagonalMoveWithDetails(board, sy, sx, dy, dx, player);
    if (!diagonalValidation.isValid) {
      return {
        isValid: false,
        message: `${diagonalValidation.message}: ${diagonalValidation.details}`
      };
    }
    
    // Additional validation for edge cases
    const edgeValidation = validateEdgeCaseMove(board, sy, sx, dy, dx, player);
    if (!edgeValidation.isValid) {
      return {
        isValid: false,
        message: edgeValidation.message
      };
    }
    
    return {
      isValid: true,
      message: diagonalValidation.details
    };
  }

  function evaluateBoard(board: Board): number {
    let score = 0;
    
    // Basic piece counting
    for (let y = 0; y < BOARD_SIZE; y++) {
      for (let x = 0; x < BOARD_SIZE; x++) {
        const piece = board[y][x];
        if (piece === PieceType.BOT) {
          score += 1;
        } else if (piece === PieceType.BOT_KING) {
          score += 2; // Kings are worth more
        } else if (piece === PieceType.PLAYER) {
          score -= 1;
        } else if (piece === PieceType.PLAYER_KING) {
          score -= 2; // Kings are worth more
        }
      }
    }
    
    // Advanced positional evaluation
    score += evaluatePositionalAdvantage(board);
    score += evaluateKingSafety(board);
    score += evaluateCenterControl(board);
    score += evaluateBackRowProtection(board);
    score += evaluateMobility(board);
    score += evaluatePieceCoordination(board);
    score += evaluateEndgamePosition(board);
    
    // Add king creation strategic planning
    score += evaluateKingCreationOpportunity(board, PieceType.BOT);
    score += evaluateKingCreationDefense(board, PieceType.BOT);
    score += evaluateKingCreationPath(board, PieceType.BOT);
    
    // Add multiple jump opportunity evaluation
    score += evaluateMultipleJumpOpportunity(board, PieceType.BOT);
    
    // Add stalemate detection and evaluation
    score += evaluateStalematePosition(board);
    
    return score;
  }

  function evaluateStalematePosition(board: Board): number {
    let score = 0;
    
    // Check for stalemate scenarios and evaluate them
    const stalemateType = detectStalemate(board);
    
    if (stalemateType !== 'none') {
      // In a stalemate, the position is neutral (0 score)
      // But we can evaluate which player is closer to winning before stalemate
      const playerPieces = getPiecePositions(board, PieceType.PLAYER);
      const botPieces = getPiecePositions(board, PieceType.BOT);
      
      const playerKings = playerPieces.filter(([y, x]) => isKing(board[y][x])).length;
      const botKings = botPieces.filter(([y, x]) => isKing(board[y][x])).length;
      
      // If bot has more pieces or kings, stalemate is slightly favorable
      if (botPieces.length > playerPieces.length) {
        score += 0.5;
      } else if (playerPieces.length > botPieces.length) {
        score -= 0.5;
      }
      
      if (botKings > playerKings) {
        score += 0.3;
      } else if (playerKings > botKings) {
        score -= 0.3;
      }
    }
    
    // Evaluate potential stalemate scenarios
    score += evaluatePotentialStalemate(board);
    
    return score;
  }

  function evaluatePotentialStalemate(board: Board): number {
    let score = 0;
    
    // Check if pieces are getting blocked
    const playerPieces = getPiecePositions(board, PieceType.PLAYER);
    const botPieces = getPiecePositions(board, PieceType.BOT);
    
    const blockedPlayerPieces = playerPieces.filter(([y, x]) => isPieceCompletelyBlocked(board, y, x, PieceType.PLAYER)).length;
    const blockedBotPieces = botPieces.filter(([y, x]) => isPieceCompletelyBlocked(board, y, x, PieceType.BOT)).length;
    
    // If opponent has more blocked pieces, that's good for us
    score += blockedPlayerPieces * 0.2;
    score -= blockedBotPieces * 0.2;
    
    // Check for insufficient material scenarios
    if (isInsufficientMaterialStalemate(board)) {
      // In insufficient material, try to maintain piece advantage
      if (botPieces.length > playerPieces.length) {
        score += 0.4;
      } else if (playerPieces.length > botPieces.length) {
        score -= 0.4;
      }
    }
    
    // Check for repetitive position potential
    if (isRepetitivePositionStalemate(board)) {
      // In repetitive positions, try to maintain initiative
      const botMoves = getValidMoves(board, PieceType.BOT).length;
      const playerMoves = getValidMoves(board, PieceType.PLAYER).length;
      
      if (botMoves > playerMoves) {
        score += 0.3;
      } else if (playerMoves > botMoves) {
        score -= 0.3;
      }
    }
    
    return score;
  }

  function evaluatePositionalAdvantage(board: Board): number {
    let score = 0;
    
    // Position-based scoring for regular pieces
    for (let y = 0; y < BOARD_SIZE; y++) {
      for (let x = 0; x < BOARD_SIZE; x++) {
        const piece = board[y][x];
        
        if (piece === PieceType.BOT) {
          // Bot pieces get bonus for advancing towards player's back row
          score += (7 - y) * 0.1; // Closer to promotion = better
        } else if (piece === PieceType.PLAYER) {
          // Player pieces get bonus for advancing towards bot's back row
          score -= y * 0.1; // Closer to promotion = better for player
        }
      }
    }
    
    return score;
  }

  function evaluateKingSafety(board: Board): number {
    let score = 0;
    
    for (let y = 0; y < BOARD_SIZE; y++) {
      for (let x = 0; x < BOARD_SIZE; x++) {
        const piece = board[y][x];
        
        if (piece === PieceType.BOT_KING) {
          // Kings are safer in corners and edges
          if ((x === 0 || x === 7) && (y === 0 || y === 7)) {
            score += 0.3; // Corner bonus
          } else if (x === 0 || x === 7 || y === 0 || y === 7) {
            score += 0.1; // Edge bonus
          }
        } else if (piece === PieceType.PLAYER_KING) {
          if ((x === 0 || x === 7) && (y === 0 || y === 7)) {
            score -= 0.3; // Corner bonus for player
          } else if (x === 0 || x === 7 || y === 0 || y === 7) {
            score -= 0.1; // Edge bonus for player
          }
        }
      }
    }
    
    return score;
  }

  function evaluateCenterControl(board: Board): number {
    let score = 0;
    
    // Center squares (3,3), (3,4), (4,3), (4,4)
    const centerSquares = [[3, 3], [3, 4], [4, 3], [4, 4]];
    
    for (const [y, x] of centerSquares) {
      const piece = board[y][x];
      if (piece === PieceType.BOT || piece === PieceType.BOT_KING) {
        score += 0.2; // Control of center squares
      } else if (piece === PieceType.PLAYER || piece === PieceType.PLAYER_KING) {
        score -= 0.2; // Player control of center
      }
    }
    
    // Extended center (2,2) to (5,5)
    for (let y = 2; y <= 5; y++) {
      for (let x = 2; x <= 5; x++) {
        const piece = board[y][x];
        if (piece === PieceType.BOT || piece === PieceType.BOT_KING) {
          score += 0.05; // Extended center control
        } else if (piece === PieceType.PLAYER || piece === PieceType.PLAYER_KING) {
          score -= 0.05; // Player extended center control
        }
      }
    }
    
    return score;
  }

  function evaluateBackRowProtection(board: Board): number {
    let score = 0;
    
    // Bot's back row (row 0)
    for (let x = 0; x < BOARD_SIZE; x++) {
      const piece = board[0][x];
      if (piece === PieceType.BOT || piece === PieceType.BOT_KING) {
        score += 0.15; // Back row protection
      }
    }
    
    // Player's back row (row 7)
    for (let x = 0; x < BOARD_SIZE; x++) {
      const piece = board[7][x];
      if (piece === PieceType.PLAYER || piece === PieceType.PLAYER_KING) {
        score -= 0.15; // Player back row protection
      }
    }
    
    return score;
  }

  function evaluateMobility(board: Board): number {
    // Limit mobility evaluation to avoid performance issues
    let botMoves = 0;
    let playerMoves = 0;
    
    // Simple move counting without full validation
    for (let y = 0; y < BOARD_SIZE; y++) {
      for (let x = 0; x < BOARD_SIZE; x++) {
        const piece = board[y][x];
        if (piece === PieceType.BOT || piece === PieceType.BOT_KING) {
          // Count potential diagonal moves
          const directions = piece === PieceType.BOT_KING ? 
            [[-1, -1], [-1, 1], [1, -1], [1, 1]] : 
            [[1, -1], [1, 1]]; // Bot pieces move down
          
          for (const [dy, dx] of directions) {
            const ny = y + dy;
            const nx = x + dx;
            if (isValidPosition(ny, nx) && board[ny][nx] === PieceType.EMPTY) {
              botMoves++;
            }
          }
        } else if (piece === PieceType.PLAYER || piece === PieceType.PLAYER_KING) {
          // Count potential diagonal moves
          const directions = piece === PieceType.PLAYER_KING ? 
            [[-1, -1], [-1, 1], [1, -1], [1, 1]] : 
            [[-1, -1], [-1, 1]]; // Player pieces move up
          
          for (const [dy, dx] of directions) {
            const ny = y + dy;
            const nx = x + dx;
            if (isValidPosition(ny, nx) && board[ny][nx] === PieceType.EMPTY) {
              playerMoves++;
            }
          }
        }
      }
    }
    
    // Mobility advantage
    const mobilityDiff = botMoves - playerMoves;
    return mobilityDiff * 0.05; // Small bonus for having more moves
  }

  function evaluatePieceCoordination(board: Board): number {
    let score = 0;
    
    // Check for connected pieces (pieces that can support each other)
    for (let y = 0; y < BOARD_SIZE; y++) {
      for (let x = 0; x < BOARD_SIZE; x++) {
        const piece = board[y][x];
        
        if (piece === PieceType.BOT || piece === PieceType.BOT_KING) {
          // Check for supporting pieces in adjacent squares
          const adjacentSquares = [
            [y - 1, x - 1], [y - 1, x + 1], [y + 1, x - 1], [y + 1, x + 1]
          ];
          
          for (const [ay, ax] of adjacentSquares) {
            if (isValidPosition(ay, ax) && 
                (board[ay][ax] === PieceType.BOT || board[ay][ax] === PieceType.BOT_KING)) {
              score += 0.05; // Connected pieces bonus
            }
          }
        } else if (piece === PieceType.PLAYER || piece === PieceType.PLAYER_KING) {
          // Check for supporting pieces in adjacent squares
          const adjacentSquares = [
            [y - 1, x - 1], [y - 1, x + 1], [y + 1, x - 1], [y + 1, x + 1]
          ];
          
          for (const [ay, ax] of adjacentSquares) {
            if (isValidPosition(ay, ax) && 
                (board[ay][ax] === PieceType.PLAYER || board[ay][ax] === PieceType.PLAYER_KING)) {
              score -= 0.05; // Player connected pieces penalty
            }
          }
        }
      }
    }
    
    return score;
  }

  function evaluateEndgamePosition(board: Board): number {
    let botPieces = 0;
    let playerPieces = 0;
    let botKings = 0;
    let playerKings = 0;
    
    // Count pieces
    for (let y = 0; y < BOARD_SIZE; y++) {
      for (let x = 0; x < BOARD_SIZE; x++) {
        const piece = board[y][x];
        if (piece === PieceType.BOT) botPieces++;
        else if (piece === PieceType.BOT_KING) botKings++;
        else if (piece === PieceType.PLAYER) playerPieces++;
        else if (piece === PieceType.PLAYER_KING) playerKings++;
      }
    }
    
    const totalBotPieces = botPieces + botKings;
    const totalPlayerPieces = playerPieces + playerKings;
    
    // Only apply endgame tactics when we're in endgame (few pieces remaining)
    if (totalBotPieces <= 3 || totalPlayerPieces <= 3) {
      let score = 0;
      
      // King vs King endgame
      if (botKings >= 1 && playerKings >= 1 && totalBotPieces <= 2 && totalPlayerPieces <= 2) {
        score += evaluateKingVsKingEndgame(board);
      }
      
      // King vs Pawn endgame
      if (botKings >= 1 && playerKings === 0 && playerPieces >= 1) {
        score += evaluateKingVsPawnEndgame(board, true);
      }
      if (playerKings >= 1 && botKings === 0 && botPieces >= 1) {
        score += evaluateKingVsPawnEndgame(board, false);
      }
      
      // Pawn vs Pawn endgame
      if (botKings === 0 && playerKings === 0 && totalBotPieces <= 3 && totalPlayerPieces <= 3) {
        score += evaluatePawnVsPawnEndgame(board);
      }
      
      // Multiple kings endgame
      if (botKings >= 2 || playerKings >= 2) {
        score += evaluateMultipleKingsEndgame(board);
      }
      
      // Zugzwang detection (forcing opponent into bad moves)
      score += evaluateZugzwangPosition(board);
      
      // Opposition tactics (controlling key squares)
      score += evaluateOppositionTactics(board);
      
      // Tempo tactics (gaining move advantage)
      score += evaluateTempoTactics(board);
      
      return score;
    }
    
    return 0;
  }

  function evaluateKingVsKingEndgame(board: Board): number {
    let score = 0;
    let botKingPos: [number, number] | null = null;
    let playerKingPos: [number, number] | null = null;
    
    // Find king positions
    for (let y = 0; y < BOARD_SIZE; y++) {
      for (let x = 0; x < BOARD_SIZE; x++) {
        const piece = board[y][x];
        if (piece === PieceType.BOT_KING) {
          botKingPos = [y, x];
        } else if (piece === PieceType.PLAYER_KING) {
          playerKingPos = [y, x];
        }
      }
    }
    
    if (botKingPos && playerKingPos) {
      // Calculate distance between kings
      const distance = Math.abs(botKingPos[0] - playerKingPos[0]) + Math.abs(botKingPos[1] - playerKingPos[1]);
      
      // Kings should maintain optimal distance (not too close, not too far)
      if (distance <= 2) {
        score -= 0.3; // Too close - vulnerable to tactics
      } else if (distance >= 6) {
        score += 0.2; // Good distance for maneuvering
      }
      
      // Corner control is important in king vs king
      if ((botKingPos[0] === 0 || botKingPos[0] === 7) && (botKingPos[1] === 0 || botKingPos[1] === 7)) {
        score += 0.4; // Bot king in corner
      }
      if ((playerKingPos[0] === 0 || playerKingPos[0] === 7) && (playerKingPos[1] === 0 || playerKingPos[1] === 7)) {
        score -= 0.4; // Player king in corner
      }
    }
    
    return score;
  }

  function evaluateKingVsPawnEndgame(board: Board, botHasKing: boolean): number {
    let score = 0;
    const kingPlayer = botHasKing ? PieceType.BOT_KING : PieceType.PLAYER_KING;
    const pawnPlayer = botHasKing ? PieceType.PLAYER : PieceType.BOT;
    const kingPromotionRow = botHasKing ? 0 : 7; // Where pawns promote
    const pawnDirection = botHasKing ? -1 : 1; // Direction pawns move
    
    let kingPos: [number, number] | null = null;
    let pawnPositions: [number, number][] = [];
    
    // Find pieces
    for (let y = 0; y < BOARD_SIZE; y++) {
      for (let x = 0; x < BOARD_SIZE; x++) {
        const piece = board[y][x];
        if (piece === kingPlayer) {
          kingPos = [y, x];
        } else if (piece === pawnPlayer) {
          pawnPositions.push([y, x]);
        }
      }
    }
    
    if (kingPos && pawnPositions.length > 0) {
      // King should try to block pawn advancement
      for (const [py, px] of pawnPositions) {
        const distanceToPromotion = Math.abs(py - kingPromotionRow);
        const distanceFromKing = Math.abs(kingPos[0] - py) + Math.abs(kingPos[1] - px);
        
        // If pawn is close to promotion, king should be close to block
        if (distanceToPromotion <= 2) {
          if (distanceFromKing <= 3) {
            score += botHasKing ? 0.6 : -0.6; // Good blocking position
          } else {
            score += botHasKing ? -0.4 : 0.4; // Poor blocking position
          }
        }
        
        // Bonus for king controlling squares in front of pawn
        const blockingSquares = getBlockingSquares(py, px, pawnDirection);
        for (const [by, bx] of blockingSquares) {
          if (isValidPosition(by, bx) && Math.abs(kingPos[0] - by) + Math.abs(kingPos[1] - bx) <= 2) {
            score += botHasKing ? 0.2 : -0.2; // King controls blocking square
          }
        }
      }
    }
    
    return score;
  }

  function getBlockingSquares(pawnY: number, pawnX: number, direction: number): [number, number][] {
    const squares: [number, number][] = [];
    let currentY = pawnY + direction;
    
    while (currentY >= 0 && currentY < BOARD_SIZE) {
      // Add diagonal squares in front of pawn
      if (pawnX - 1 >= 0) squares.push([currentY, pawnX - 1]);
      if (pawnX + 1 < BOARD_SIZE) squares.push([currentY, pawnX + 1]);
      currentY += direction;
    }
    
    return squares;
  }

  function evaluatePawnVsPawnEndgame(board: Board): number {
    let score = 0;
    let botPawns: [number, number][] = [];
    let playerPawns: [number, number][] = [];
    
    // Find pawn positions
    for (let y = 0; y < BOARD_SIZE; y++) {
      for (let x = 0; x < BOARD_SIZE; x++) {
        const piece = board[y][x];
        if (piece === PieceType.BOT) {
          botPawns.push([y, x]);
        } else if (piece === PieceType.PLAYER) {
          playerPawns.push([y, x]);
        }
      }
    }
    
    // Evaluate pawn advancement
    for (const [py, px] of botPawns) {
      const distanceToPromotion = 7 - py; // Bot pawns move down
      score += (1.0 / (distanceToPromotion + 1)) * 0.5; // Closer to promotion = better
    }
    
    for (const [py, px] of playerPawns) {
      const distanceToPromotion = py; // Player pawns move up
      score -= (1.0 / (distanceToPromotion + 1)) * 0.5; // Closer to promotion = worse for bot
    }
    
    // Evaluate pawn coordination
    if (botPawns.length >= 2) {
      score += evaluatePawnCoordination(botPawns) * 0.3;
    }
    if (playerPawns.length >= 2) {
      score -= evaluatePawnCoordination(playerPawns) * 0.3;
    }
    
    return score;
  }

  function evaluatePawnCoordination(pawns: [number, number][]): number {
    let score = 0;
    
    for (let i = 0; i < pawns.length; i++) {
      for (let j = i + 1; j < pawns.length; j++) {
        const [y1, x1] = pawns[i];
        const [y2, x2] = pawns[j];
        const distance = Math.abs(y1 - y2) + Math.abs(x1 - x2);
        
        // Connected pawns are stronger
        if (distance <= 2) {
          score += 0.2;
        }
        
        // Pawns on same rank can support each other
        if (y1 === y2 && Math.abs(x1 - x2) === 2) {
          score += 0.3;
        }
      }
    }
    
    return score;
  }

  function evaluateMultipleKingsEndgame(board: Board): number {
    let score = 0;
    let botKings: [number, number][] = [];
    let playerKings: [number, number][] = [];
    
    // Find king positions
    for (let y = 0; y < BOARD_SIZE; y++) {
      for (let x = 0; x < BOARD_SIZE; x++) {
        const piece = board[y][x];
        if (piece === PieceType.BOT_KING) {
          botKings.push([y, x]);
        } else if (piece === PieceType.PLAYER_KING) {
          playerKings.push([y, x]);
        }
      }
    }
    
    // Multiple kings should coordinate
    if (botKings.length >= 2) {
      score += evaluateKingCoordination(botKings) * 0.4;
    }
    if (playerKings.length >= 2) {
      score -= evaluateKingCoordination(playerKings) * 0.4;
    }
    
    // Kings should control center in multiple king endgames
    for (const [y, x] of botKings) {
      if (y >= 2 && y <= 5 && x >= 2 && x <= 5) {
        score += 0.2; // Bot king in center
      }
    }
    for (const [y, x] of playerKings) {
      if (y >= 2 && y <= 5 && x >= 2 && x <= 5) {
        score -= 0.2; // Player king in center
      }
    }
    
    return score;
  }

  function evaluateKingCoordination(kings: [number, number][]): number {
    let score = 0;
    
    for (let i = 0; i < kings.length; i++) {
      for (let j = i + 1; j < kings.length; j++) {
        const [y1, x1] = kings[i];
        const [y2, x2] = kings[j];
        const distance = Math.abs(y1 - y2) + Math.abs(x1 - x2);
        
        // Kings should maintain optimal distance for coordination
        if (distance >= 2 && distance <= 4) {
          score += 0.3; // Good coordination distance
        } else if (distance <= 1) {
          score -= 0.2; // Too close - can block each other
        }
      }
    }
    
    return score;
  }

  function evaluateZugzwangPosition(board: Board): number {
    let score = 0;
    
    // Count available moves for each player
    const botMoves = getValidMoves(board, PieceType.BOT).length;
    const playerMoves = getValidMoves(board, PieceType.PLAYER).length;
    
    // If opponent has very few moves, that's good for us
    if (playerMoves <= 1) {
      score += 0.5; // Zugzwang advantage
    }
    if (botMoves <= 1) {
      score -= 0.5; // We're in zugzwang
    }
    
    // If we have many more moves than opponent, that's advantageous
    if (botMoves > playerMoves * 2) {
      score += 0.3;
    }
    
    return score;
  }

  function evaluateOppositionTactics(board: Board): number {
    let score = 0;
    
    // Opposition is when kings face each other with odd number of squares between them
    let botKingPos: [number, number] | null = null;
    let playerKingPos: [number, number] | null = null;
    
    // Find king positions
    for (let y = 0; y < BOARD_SIZE; y++) {
      for (let x = 0; x < BOARD_SIZE; x++) {
        const piece = board[y][x];
        if (piece === PieceType.BOT_KING) {
          botKingPos = [y, x];
        } else if (piece === PieceType.PLAYER_KING) {
          playerKingPos = [y, x];
        }
      }
    }
    
    if (botKingPos && playerKingPos) {
      const yDistance = Math.abs(botKingPos[0] - playerKingPos[0]);
      const xDistance = Math.abs(botKingPos[1] - playerKingPos[1]);
      
      // Opposition on same file (vertical)
      if (botKingPos[1] === playerKingPos[1] && yDistance % 2 === 1) {
        score += 0.4; // Bot has opposition
      }
      
      // Opposition on same rank (horizontal)
      if (botKingPos[0] === playerKingPos[0] && xDistance % 2 === 1) {
        score += 0.4; // Bot has opposition
      }
      
      // Diagonal opposition
      if (yDistance === xDistance && yDistance % 2 === 1) {
        score += 0.3; // Bot has diagonal opposition
      }
    }
    
    return score;
  }

  function evaluateTempoTactics(board: Board): number {
    let score = 0;
    
    // Tempo is about gaining move advantage and forcing opponent into bad positions
    const botMoves = getValidMoves(board, PieceType.BOT);
    const playerMoves = getValidMoves(board, PieceType.PLAYER);
    
    // If we can force opponent into positions with fewer moves
    for (const [sy, sx, dy, dx] of botMoves) {
      const newBoard = movePiece(board, sy, sx, dy, dx);
      const newPlayerMoves = getValidMoves(newBoard, PieceType.PLAYER);
      
      if (newPlayerMoves.length < playerMoves.length) {
        score += 0.2; // This move reduces opponent's options
      }
    }
    
    // Bonus for moves that maintain our flexibility
    if (botMoves.length >= 3) {
      score += 0.1; // We have good flexibility
    }
    
    return score;
  }

  function evaluateKingCreationOpportunity(board: Board, player: PieceType): number {
    let score = 0;
    const isBot = player === PieceType.BOT;
    const promotionRow = isBot ? 7 : 0; // Bot promotes on row 7, player on row 0
    
    // Check for pieces close to promotion
    for (let x = 0; x < BOARD_SIZE; x++) {
      const piece = board[promotionRow - (isBot ? 1 : -1)][x];
      if (piece === player) {
        score += isBot ? 0.8 : -0.8; // High value for pieces one row away from promotion
      }
      
      // Check pieces two rows away from promotion
      if (promotionRow - (isBot ? 2 : -2) >= 0 && promotionRow - (isBot ? 2 : -2) < BOARD_SIZE) {
        const piece2 = board[promotionRow - (isBot ? 2 : -2)][x];
        if (piece2 === player) {
          score += isBot ? 0.4 : -0.4; // Medium value for pieces two rows away
        }
      }
    }
    
    return score;
  }

  function findKingCreationSequences(board: Board, player: PieceType, maxDepth: number = 3): Array<[number, number, number, number]> {
    if (maxDepth <= 0) return [];
    
    const moves = getValidMoves(board, player);
    if (moves.length === 0) return [];
    
    let bestSequence: Array<[number, number, number, number]> = [];
    let bestScore = -Infinity;
    
    for (const [sy, sx, dy, dx] of moves) {
      const newBoard = movePiece(board, sy, sx, dy, dx);
      let score = 0;
      
      // Check if this move creates a king
      const piece = board[sy][sx];
      const isBot = player === PieceType.BOT;
      const promotionRow = isBot ? 7 : 0;
      
      if (piece === player && dy === promotionRow) {
        score += 5; // High bonus for immediate king creation
      } else {
        // Evaluate king creation potential after this move
        score += evaluateKingCreationOpportunity(newBoard, player);
        
        // Look ahead for king creation sequences
        const nextMoves = findKingCreationSequences(newBoard, player, maxDepth - 1);
        if (nextMoves.length > 0) {
          score += nextMoves.length * 2; // Bonus for sequences leading to king creation
        }
      }
      
      if (score > bestScore) {
        bestScore = score;
        bestSequence = [[sy, sx, dy, dx]];
      }
    }
    
    return bestSequence;
  }

  function evaluateKingCreationDefense(board: Board, player: PieceType): number {
    let score = 0;
    const isBot = player === PieceType.BOT;
    const opponent = isBot ? PieceType.PLAYER : PieceType.BOT;
    const opponentPromotionRow = isBot ? 0 : 7;
    
    // Check if opponent has pieces close to promotion
    for (let x = 0; x < BOARD_SIZE; x++) {
      const piece = board[opponentPromotionRow + (isBot ? 1 : -1)][x];
      if (piece === opponent) {
        score += isBot ? -0.6 : 0.6; // Penalty for opponent pieces close to promotion
      }
      
      // Check pieces two rows away from opponent promotion
      if (opponentPromotionRow + (isBot ? 2 : -2) >= 0 && opponentPromotionRow + (isBot ? 2 : -2) < BOARD_SIZE) {
        const piece2 = board[opponentPromotionRow + (isBot ? 2 : -2)][x];
        if (piece2 === opponent) {
          score += isBot ? -0.3 : 0.3; // Smaller penalty for pieces two rows away
        }
      }
    }
    
    return score;
  }

  function evaluateKingCreationPath(board: Board, player: PieceType): number {
    let score = 0;
    const isBot = player === PieceType.BOT;
    const promotionRow = isBot ? 7 : 0;
    
    // Evaluate clear paths to promotion for each piece
    for (let y = 0; y < BOARD_SIZE; y++) {
      for (let x = 0; x < BOARD_SIZE; x++) {
        const piece = board[y][x];
        if (piece === player) {
          // Calculate distance to promotion
          const distanceToPromotion = isBot ? 7 - y : y;
          
          // Check if there's a clear path to promotion
          const pathClear = checkClearPathToPromotion(board, y, x, player);
          
          if (pathClear) {
            score += isBot ? (1.0 / (distanceToPromotion + 1)) : -(1.0 / (distanceToPromotion + 1));
          }
        }
      }
    }
    
    return score;
  }

  function checkClearPathToPromotion(board: Board, y: number, x: number, player: PieceType): boolean {
    const isBot = player === PieceType.BOT;
    const promotionRow = isBot ? 7 : 0;
    const direction = isBot ? 1 : -1;
    
    // Check if there's a clear diagonal path to promotion
    const leftPath = checkDiagonalPath(board, y, x, -1, direction, player);
    const rightPath = checkDiagonalPath(board, y, x, 1, direction, player);
    
    return leftPath || rightPath;
  }

  function checkDiagonalPath(board: Board, startY: number, startX: number, xDir: number, yDir: number, player: PieceType): boolean {
    const isBot = player === PieceType.BOT;
    const promotionRow = isBot ? 7 : 0;
    
    let currentY = startY;
    let currentX = startX;
    
    while (currentY !== promotionRow) {
      currentY += yDir;
      currentX += xDir;
      
      // Check bounds
      if (!isValidPosition(currentY, currentX)) {
        return false;
      }
      
      // Check if path is blocked
      if (board[currentY][currentX] !== PieceType.EMPTY) {
        return false;
      }
    }
    
    return true;
  }

  function botMoveEasy(currentBoard: Board) {
    const moves = getValidMoves(currentBoard, PieceType.BOT);
    if (moves.length === 0) {
      setMessage('Bot cannot move. Your turn!');
      setTurn(PieceType.PLAYER);
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
      setTurn(PieceType.PLAYER);
      setMessage('Your move!');
    } else {
      if (newGameState === 'win') {
        updateStats('win');
        setMessage('You win!');
      } else if (newGameState === 'lose') {
        updateStats('loss');
        setMessage('You lose!');
      } else if (newGameState === 'stalemate') {
        setMessage('Stalemate! No valid moves for either player.');
      }
    }
  }

  function botMoveMedium(currentBoard: Board) {
    const moves = getValidMoves(currentBoard, PieceType.BOT);
    if (moves.length === 0) {
      setMessage('Bot cannot move. Your turn!');
      setTurn(PieceType.PLAYER);
      return;
    }
    
    // Prefer moves that capture pieces, move towards the center, or create kings
    let bestMove = moves[0];
    let bestScore = -Infinity;
    
    for (const [sy, sx, dy, dx] of moves) {
      const newBoard = movePiece(currentBoard, sy, sx, dy, dx);
      let score = evaluateBoard(newBoard);
      
      // Bonus for moving towards the center
      const centerBonus = Math.abs(4 - dx) < Math.abs(4 - sx) ? 0.1 : 0;
      
      // Check for capture opportunities (basic look-ahead)
      const captureValue = evaluateCaptureOpportunity(newBoard, PieceType.BOT);
      score += captureValue * 0.5; // Smaller bonus for medium difficulty
      
      // Check for king creation opportunities
      const piece = currentBoard[sy][sx];
      if (piece === PieceType.BOT && dy === 7) {
        score += 3; // High bonus for immediate king creation
      } else {
        const kingCreationValue = evaluateKingCreationOpportunity(newBoard, PieceType.BOT);
        score += kingCreationValue * 0.8; // Medium bonus for king creation potential
      }
      
      // Consider endgame tactics
      const endgameValue = evaluateEndgamePosition(newBoard);
      score += endgameValue * 1.0; // Medium weight for endgame tactics
      
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
      setTurn(PieceType.PLAYER);
      setMessage('Your move!');
    } else {
      if (newGameState === 'win') {
        updateStats('win');
        setMessage('You win!');
      } else if (newGameState === 'lose') {
        updateStats('loss');
        setMessage('You lose!');
      } else if (newGameState === 'stalemate') {
        setMessage('Stalemate! No valid moves for either player.');
      }
    }
  }

  function botMoveHard(currentBoard: Board) {
    const moves = getValidMoves(currentBoard, PieceType.BOT);
    if (moves.length === 0) {
      setMessage('Bot cannot move. Your turn!');
      setTurn(PieceType.PLAYER);
      return;
    }
    
    // Look ahead for capture sequences and king creation opportunities
    let bestMove = moves[0];
    let bestScore = -Infinity;
    
    for (const [sy, sx, dy, dx] of moves) {
      const newBoard = movePiece(currentBoard, sy, sx, dy, dx);
      let score = evaluateBoard(newBoard);
      
      // Check for additional capture opportunities after this move
      const additionalCaptures = findBestCaptureSequence(newBoard, PieceType.BOT, 3);
      if (additionalCaptures.length > 0) {
        // Bonus for capture sequences
        score += additionalCaptures.length * 2;
      }
      
      // Check for multiple jump sequence opportunities
      const multipleJumpSequences = findMultipleJumpSequences(newBoard, PieceType.BOT, 5);
      if (multipleJumpSequences.length > 0) {
        // Very high bonus for multiple jump sequences
        const maxJumpLength = Math.max(...multipleJumpSequences.map(seq => seq.length));
        score += maxJumpLength * 4;
      }
      
      // Check for chain capture opportunities
      const chainCaptures = findChainCaptures(newBoard, PieceType.BOT, 5);
      if (chainCaptures.length > 0) {
        // High bonus for chain captures
        const maxChainLength = Math.max(...chainCaptures.map(seq => seq.length));
        score += maxChainLength * 3;
      }
      
      // Check for king creation opportunities and sequences
      const piece = currentBoard[sy][sx];
      if (piece === PieceType.BOT && dy === 7) {
        score += 5; // Very high bonus for immediate king creation
      } else {
        // Look for king creation sequences
        const kingCreationSequences = findKingCreationSequences(newBoard, PieceType.BOT, 2);
        if (kingCreationSequences.length > 0) {
          score += kingCreationSequences.length * 3; // High bonus for king creation sequences
        }
        
        // Evaluate king creation potential
        const kingCreationValue = evaluateKingCreationOpportunity(newBoard, PieceType.BOT);
        score += kingCreationValue * 1.2; // Higher bonus for hard difficulty
        
        // Check for clear paths to promotion
        const pathValue = evaluateKingCreationPath(newBoard, PieceType.BOT);
        score += pathValue * 0.8;
      }
      
      // Enhanced endgame tactics evaluation
      const endgameValue = evaluateEndgamePosition(newBoard);
      score += endgameValue * 2.0; // High weight for endgame tactics
      
      // Simulate player's best response
      const playerMoves = getValidMoves(newBoard, PieceType.PLAYER);
      if (playerMoves.length > 0) {
        let worstPlayerScore = Infinity;
        for (const [psy, psx, pdy, pdx] of playerMoves) {
          const playerBoard = movePiece(newBoard, psy, psx, pdy, pdx);
          let playerScore = evaluateBoard(playerBoard);
          
          // Check if player can capture after this move
          const playerCaptures = findBestCaptureSequence(playerBoard, PieceType.PLAYER, 2);
          if (playerCaptures.length > 0) {
            playerScore -= playerCaptures.length * 1.5; // Penalty for allowing player captures
          }
          
          // Check if player can create kings after this move
          const playerPiece = newBoard[psy][psx];
          if (playerPiece === PieceType.PLAYER && pdy === 0) {
            playerScore -= 4; // High penalty for allowing player king creation
          } else {
            const playerKingCreationValue = evaluateKingCreationOpportunity(playerBoard, PieceType.PLAYER);
            playerScore -= playerKingCreationValue * 1.0; // Penalty for player king creation potential
          }
          
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
      setTurn(PieceType.PLAYER);
      setMessage('Your move!');
    } else {
      if (newGameState === 'win') {
        updateStats('win');
        setMessage('You win!');
      } else if (newGameState === 'lose') {
        updateStats('loss');
        setMessage('You lose!');
      } else if (newGameState === 'stalemate') {
        setMessage('Stalemate! No valid moves for either player.');
      }
    }
  }

  function findBestCaptureSequence(board: Board, player: PieceType, maxDepth: number): Array<[number, number, number, number]> {
    if (maxDepth <= 0) return [];
    
    const captures = getAvailableCaptures(board, player);
    if (captures.length === 0) return [];
    
    let bestSequence: Array<[number, number, number, number]> = [];
    let bestScore = -Infinity;
    
    for (const [sy, sx, dy, dx] of captures) {
      const newBoard = movePiece(board, sy, sx, dy, dx);
      const score = evaluateBoard(newBoard);
      
      // Recursively look for more captures
      const nextCaptures = findBestCaptureSequence(newBoard, player, maxDepth - 1);
      const totalScore = score + nextCaptures.length * 2;
      
      if (totalScore > bestScore) {
        bestScore = totalScore;
        bestSequence = [[sy, sx, dy, dx], ...nextCaptures];
      }
    }
    
    return bestSequence;
  }

  function evaluateCaptureOpportunity(board: Board, player: PieceType): number {
    const captures = getAvailableCaptures(board, player);
    if (captures.length === 0) return 0;
    
    let totalValue = 0;
    for (const [sy, sx, dy, dx] of captures) {
      const newBoard = movePiece(board, sy, sx, dy, dx);
      const capturedPiece = board[sy + (dy - sy) / 2][sx + (dx - sx) / 2];
      
      // Value captured pieces
      if (capturedPiece === PieceType.PLAYER || capturedPiece === PieceType.BOT) {
        totalValue += 1;
      } else if (capturedPiece === PieceType.PLAYER_KING || capturedPiece === PieceType.BOT_KING) {
        totalValue += 2; // Kings are worth more
      }
      
      // Bonus for capture sequences
      const additionalCaptures = findBestCaptureSequence(newBoard, player, 2);
      totalValue += additionalCaptures.length * 1.5;
    }
    
    return totalValue;
  }

  function hasCaptureSequence(board: Board, player: PieceType, depth: number = 3): boolean {
    if (depth <= 0) return false;
    
    const captures = getAvailableCaptures(board, player);
    if (captures.length === 0) return false;
    
    for (const [sy, sx, dy, dx] of captures) {
      const newBoard = movePiece(board, sy, sx, dy, dx);
      if (hasCaptureSequence(newBoard, player, depth - 1)) {
        return true;
      }
    }
    
    return true; // Current level has captures
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

  function isValidMove(board: Board, sy: number, sx: number, dy: number, dx: number, player: PieceType): boolean {
    // Validate board boundaries for source and destination
    if (!isValidPosition(sy, sx) || !isValidPosition(dy, dx)) {
      return false;
    }
    
    // Validate that source position contains a piece
    if (board[sy][sx] === PieceType.EMPTY) {
      return false;
    }
    
    // Validate that destination is empty
    if (board[dy][dx] !== PieceType.EMPTY) {
      return false;
    }
    
    const piece = board[sy][sx];
    const isKingPiece = isKing(piece);
    
    // Calculate direction vectors
    const yDiff = dy - sy;
    const xDiff = dx - sx;
    
    // Must move diagonally (both x and y must change by the same amount)
    if (Math.abs(xDiff) !== Math.abs(yDiff)) {
      return false;
    }
    
    // Must actually move (not stay in same position)
    if (xDiff === 0 && yDiff === 0) {
      return false;
    }
    
    // Check if this is a capture move
    const isCapture = Math.abs(yDiff) === 2;
    
    // If captures are available, only capture moves are valid
    if (hasAnyCaptures(board, player) && !isCapture) {
      return false;
    }
    
    // Validate diagonal direction for regular pieces
    if (!isKingPiece) {
      const expectedYDir = player === PieceType.PLAYER ? -1 : 1;
      if (yDiff !== expectedYDir) {
        return false;
      }
    }
    
    // For capture moves, validate the captured piece and its position
    if (isCapture) {
      const captureY = sy + (yDiff / 2);
      const captureX = sx + (xDiff / 2);
      
      // Validate capture position is within bounds
      if (!isValidPosition(captureY, captureX)) {
        return false;
      }
      
      const capturedPiece = board[captureY][captureX];
      const opponent = player === PieceType.PLAYER ? PieceType.BOT : PieceType.PLAYER;
      const opponentKing = player === PieceType.PLAYER ? PieceType.BOT_KING : PieceType.PLAYER_KING;
      
      if (capturedPiece !== opponent && capturedPiece !== opponentKing) {
        return false;
      }
    }
    
    // Enhanced diagonal movement validation
    if (!validateEnhancedDiagonalMove(board, sy, sx, dy, dx, player, isKingPiece, isCapture)) {
      return false;
    }
    
    // Validate edge case moves
    if (!validateBoundaryMove(sy, sx, dy, dx, player, isKingPiece)) {
      return false;
    }
    
    // Validate corner piece moves
    if (!validateCornerPieceMove(sy, sx, dy, dx, player)) {
      return false;
    }
    
    // Kings can move in any diagonal direction
    return true;
  }

  function validateEnhancedDiagonalMove(board: Board, sy: number, sx: number, dy: number, dx: number, player: PieceType, isKingPiece: boolean, isCapture: boolean): boolean {
    // Basic diagonal validation
    if (!validateDiagonalMove(sy, sx, dy, dx)) {
      return false;
    }
    
    // Validate diagonal direction for piece type
    if (!isValidDiagonalDirection(sy, sx, dy, dx, player, isKingPiece)) {
      return false;
    }
    
    // Check for blocking pieces along the path (for non-capture moves)
    if (!isCapture && hasBlockingPiecesInPath(board, sy, sx, dy, dx)) {
      return false;
    }
    
    // Validate diagonal path integrity
    if (!validateDiagonalPathIntegrity(board, sy, sx, dy, dx, isCapture)) {
      return false;
    }
    
    // Check for complex diagonal scenarios
    if (!validateComplexDiagonalScenario(board, sy, sx, dy, dx, player, isKingPiece)) {
      return false;
    }
    
    return true;
  }

  function hasBlockingPiecesInPath(board: Board, sy: number, sx: number, dy: number, dx: number): boolean {
    const yDiff = dy - sy;
    const xDiff = dx - sx;
    const steps = Math.abs(yDiff);
    
    // Check each step along the diagonal path
    for (let i = 1; i < steps; i++) {
      const checkY = sy + (yDiff > 0 ? i : -i);
      const checkX = sx + (xDiff > 0 ? i : -i);
      
      if (board[checkY][checkX] !== PieceType.EMPTY) {
        return true; // Found a blocking piece
      }
    }
    
    return false;
  }

  function validateDiagonalPathIntegrity(board: Board, sy: number, sx: number, dy: number, dx: number, isCapture: boolean): boolean {
    const yDiff = dy - sy;
    const xDiff = dx - sx;
    const steps = Math.abs(yDiff);
    
    if (isCapture) {
      // For captures, check that the path is clear except for the captured piece
      for (let i = 1; i < steps; i++) {
        const checkY = sy + (yDiff > 0 ? i : -i);
        const checkX = sx + (xDiff > 0 ? i : -i);
        
        // Skip the middle square for 2-step captures
        if (steps === 2 && i === 1) {
          continue;
        }
        
        if (board[checkY][checkX] !== PieceType.EMPTY) {
          return false; // Path is blocked
        }
      }
    } else {
      // For regular moves, check that the entire path is clear
      for (let i = 1; i <= steps; i++) {
        const checkY = sy + (yDiff > 0 ? i : -i);
        const checkX = sx + (xDiff > 0 ? i : -i);
        
        if (board[checkY][checkX] !== PieceType.EMPTY) {
          return false; // Path is blocked
        }
      }
    }
    
    return true;
  }

  function validateComplexDiagonalScenario(board: Board, sy: number, sx: number, dy: number, dx: number, player: PieceType, isKingPiece: boolean): boolean {
    // Check for edge case diagonal moves
    if (isOnEdge(sy, sx) && isOnEdge(dy, dx)) {
      return validateEdgeToEdgeDiagonalMove(board, sy, sx, dy, dx, player, isKingPiece);
    }
    
    // Check for long diagonal moves (more than 2 steps)
    const yDiff = dy - sy;
    const xDiff = dx - sx;
    const steps = Math.abs(yDiff);
    
    if (steps > 2) {
      return validateLongDiagonalMove(board, sy, sx, dy, dx, player, isKingPiece);
    }
    
    // Check for diagonal moves near board boundaries
    if (isNearBoundary(sy, sx) || isNearBoundary(dy, dx)) {
      return validateBoundaryDiagonalMove(board, sy, sx, dy, dx, player, isKingPiece);
    }
    
    return true;
  }

  function validateEdgeToEdgeDiagonalMove(board: Board, sy: number, sx: number, dy: number, dx: number, player: PieceType, isKingPiece: boolean): boolean {
    // Only kings can make edge-to-edge diagonal moves
    if (!isKingPiece) {
      return false;
    }
    
    // Check if the move is along the same edge
    if ((sy === 0 && dy === 0) || (sy === BOARD_SIZE - 1 && dy === BOARD_SIZE - 1) ||
        (sx === 0 && dx === 0) || (sx === BOARD_SIZE - 1 && dx === BOARD_SIZE - 1)) {
      return false; // Can't move along the same edge
    }
    
    // Validate the diagonal path
    return validateDiagonalPathIntegrity(board, sy, sx, dy, dx, false);
  }

  function validateLongDiagonalMove(board: Board, sy: number, sx: number, dy: number, dx: number, player: PieceType, isKingPiece: boolean): boolean {
    // Only kings can make long diagonal moves
    if (!isKingPiece) {
      return false;
    }
    
    const yDiff = dy - sy;
    const xDiff = dx - sx;
    const steps = Math.abs(yDiff);
    
    // Check if the long move is valid (no blocking pieces)
    for (let i = 1; i < steps; i++) {
      const checkY = sy + (yDiff > 0 ? i : -i);
      const checkX = sx + (xDiff > 0 ? i : -i);
      
      if (board[checkY][checkX] !== PieceType.EMPTY) {
        return false; // Path is blocked
      }
    }
    
    return true;
  }

  function validateBoundaryDiagonalMove(board: Board, sy: number, sx: number, dy: number, dx: number, player: PieceType, isKingPiece: boolean): boolean {
    // Check if the move would go off the board
    if (!isValidPosition(dy, dx)) {
      return false;
    }
    
    // For pieces near boundaries, ensure they don't move off the board
    if (isNearBoundary(sy, sx)) {
      const yDiff = dy - sy;
      const xDiff = dx - sx;
      
      // Check boundary constraints
      if (sy <= 1 && yDiff < 0) return false; // Can't go above top boundary
      if (sy >= BOARD_SIZE - 2 && yDiff > 0) return false; // Can't go below bottom boundary
      if (sx <= 1 && xDiff < 0) return false; // Can't go left of left boundary
      if (sx >= BOARD_SIZE - 2 && xDiff > 0) return false; // Can't go right of right boundary
    }
    
    return true;
  }

  function isNearBoundary(y: number, x: number): boolean {
    return y <= 1 || y >= BOARD_SIZE - 2 || x <= 1 || x >= BOARD_SIZE - 2;
  }

  function validateDiagonalMove(sy: number, sx: number, dy: number, dx: number): boolean {
    const yDiff = dy - sy;
    const xDiff = dx - sx;
    
    // Must move diagonally
    if (Math.abs(xDiff) !== Math.abs(yDiff)) {
      return false;
    }
    
    // Must actually move
    if (xDiff === 0 && yDiff === 0) {
      return false;
    }
    
    // Validate diagonal distance (reasonable range)
    const distance = Math.abs(xDiff);
    if (distance > BOARD_SIZE - 1) {
      return false; // Move is too long
    }
    
    return true;
  }

  function getDiagonalDirection(sy: number, sx: number, dy: number, dx: number): 'northwest' | 'northeast' | 'southwest' | 'southeast' | null {
    const yDiff = dy - sy;
    const xDiff = dx - sx;
    
    if (!validateDiagonalMove(sy, sx, dy, dx)) {
      return null;
    }
    
    if (yDiff < 0 && xDiff < 0) return 'northwest';
    if (yDiff < 0 && xDiff > 0) return 'northeast';
    if (yDiff > 0 && xDiff < 0) return 'southwest';
    if (yDiff > 0 && xDiff > 0) return 'southeast';
    
    return null;
  }

  function isValidDiagonalDirection(sy: number, sx: number, dy: number, dx: number, player: PieceType, isKingPiece: boolean): boolean {
    const direction = getDiagonalDirection(sy, sx, dy, dx);
    
    if (!direction) {
      return false;
    }
    
    // Kings can move in any diagonal direction
    if (isKingPiece) {
      return true;
    }
    
    // Regular pieces can only move forward
    if (player === PieceType.PLAYER) {
      // Player pieces move up (northwest or northeast)
      return direction === 'northwest' || direction === 'northeast';
    } else {
      // Bot pieces move down (southwest or southeast)
      return direction === 'southwest' || direction === 'southeast';
    }
  }

  function getDiagonalMoveValidationMessage(board: Board, sy: number, sx: number, dy: number, dx: number, player: PieceType): string {
    const piece = board[sy][sx];
    const isKingPiece = isKing(piece);
    
    // Check basic diagonal validation
    if (!validateDiagonalMove(sy, sx, dy, dx)) {
      return 'Invalid diagonal move: must move diagonally with equal x and y changes';
    }
    
    // Check diagonal direction
    if (!isValidDiagonalDirection(sy, sx, dy, dx, player, isKingPiece)) {
      return isKingPiece ? 
        'Invalid diagonal direction for king' : 
        'Invalid diagonal direction: regular pieces can only move forward';
    }
    
    // Check for blocking pieces
    if (hasBlockingPiecesInPath(board, sy, sx, dy, dx)) {
      return 'Invalid diagonal move: path is blocked by other pieces';
    }
    
    // Check path integrity
    if (!validateDiagonalPathIntegrity(board, sy, sx, dy, dx, false)) {
      return 'Invalid diagonal move: path integrity check failed';
    }
    
    // Check complex scenarios
    if (!validateComplexDiagonalScenario(board, sy, sx, dy, dx, player, isKingPiece)) {
      return 'Invalid diagonal move: complex scenario validation failed';
    }
    
    return 'Valid diagonal move';
  }

  function validateDiagonalMoveWithDetails(board: Board, sy: number, sx: number, dy: number, dx: number, player: PieceType): { isValid: boolean; message: string; details: string } {
    const piece = board[sy][sx];
    const isKingPiece = isKing(piece);
    const isCapture = Math.abs(dy - sy) === 2;
    
    let details = '';
    
    // Check each validation step
    if (!validateDiagonalMove(sy, sx, dy, dx)) {
      return {
        isValid: false,
        message: 'Invalid diagonal move',
        details: 'Move must be diagonal with equal x and y changes'
      };
    }
    
    if (!isValidDiagonalDirection(sy, sx, dy, dx, player, isKingPiece)) {
      return {
        isValid: false,
        message: 'Invalid diagonal direction',
        details: isKingPiece ? 'King diagonal direction error' : 'Regular pieces can only move forward'
      };
    }
    
    if (!isCapture && hasBlockingPiecesInPath(board, sy, sx, dy, dx)) {
      return {
        isValid: false,
        message: 'Path is blocked',
        details: 'Other pieces are blocking the diagonal path'
      };
    }
    
    if (!validateDiagonalPathIntegrity(board, sy, sx, dy, dx, isCapture)) {
      return {
        isValid: false,
        message: 'Path integrity failed',
        details: 'Diagonal path contains invalid pieces'
      };
    }
    
    if (!validateComplexDiagonalScenario(board, sy, sx, dy, dx, player, isKingPiece)) {
      return {
        isValid: false,
        message: 'Complex scenario validation failed',
        details: 'Move violates complex diagonal movement rules'
      };
    }
    
    return {
      isValid: true,
      message: 'Valid diagonal move',
      details: `Valid ${isCapture ? 'capture' : 'move'} in ${getDiagonalDirection(sy, sx, dy, dx)} direction`
    };
  }

  function isValidPosition(y: number, x: number): boolean {
    return y >= 0 && y < BOARD_SIZE && x >= 0 && x < BOARD_SIZE;
  }

  function isOnBoard(y: number, x: number): boolean {
    return isValidPosition(y, x);
  }

  function validateMoveCoordinates(sy: number, sx: number, dy: number, dx: number): boolean {
    return isValidPosition(sy, sx) && isValidPosition(dy, dx);
  }

  function isOnEdge(y: number, x: number): boolean {
    return y === 0 || y === BOARD_SIZE - 1 || x === 0 || x === BOARD_SIZE - 1;
  }

  function isInCorner(y: number, x: number): boolean {
    return (y === 0 && x === 0) || (y === 0 && x === BOARD_SIZE - 1) || 
           (y === BOARD_SIZE - 1 && x === 0) || (y === BOARD_SIZE - 1 && x === BOARD_SIZE - 1);
  }

  function validateBoundaryMove(sy: number, sx: number, dy: number, dx: number, player: PieceType, isKingPiece: boolean): boolean {
    // Check if move would go off the board
    if (!isValidPosition(dy, dx)) {
      return false;
    }
    
    // For edge pieces, validate that they don't move off the board
    if (isOnEdge(sy, sx)) {
      const yDiff = dy - sy;
      const xDiff = dx - sx;
      
      // Check if the move would go outside the board
      if (sy === 0 && yDiff < 0) return false; // Can't go above top edge
      if (sy === BOARD_SIZE - 1 && yDiff > 0) return false; // Can't go below bottom edge
      if (sx === 0 && xDiff < 0) return false; // Can't go left of left edge
      if (sx === BOARD_SIZE - 1 && xDiff > 0) return false; // Can't go right of right edge
    }
    
    // For corner pieces, additional validation
    if (isInCorner(sy, sx)) {
      const yDiff = dy - sy;
      const xDiff = dx - sx;
      
      // Corner pieces can only move in valid diagonal directions
      if (sy === 0 && sx === 0) {
        // Top-left corner: can only move southeast
        if (yDiff <= 0 || xDiff <= 0) return false;
      } else if (sy === 0 && sx === BOARD_SIZE - 1) {
        // Top-right corner: can only move southwest
        if (yDiff <= 0 || xDiff >= 0) return false;
      } else if (sy === BOARD_SIZE - 1 && sx === 0) {
        // Bottom-left corner: can only move northeast
        if (yDiff >= 0 || xDiff <= 0) return false;
      } else if (sy === BOARD_SIZE - 1 && sx === BOARD_SIZE - 1) {
        // Bottom-right corner: can only move northwest
        if (yDiff >= 0 || xDiff >= 0) return false;
      }
    }
    
    return true;
  }

  function validateCaptureBoundary(sy: number, sx: number, dy: number, dx: number): boolean {
    const yDiff = dy - sy;
    const xDiff = dx - sx;
    
    // Calculate capture position
    const captureY = sy + (yDiff / 2);
    const captureX = sx + (xDiff / 2);
    
    // Validate capture position is within bounds
    if (!isValidPosition(captureY, captureX)) {
      return false;
    }
    
    // Validate landing position is within bounds
    if (!isValidPosition(dy, dx)) {
      return false;
    }
    
    // For edge captures, ensure the capture doesn't go off the board
    if (isOnEdge(sy, sx)) {
      if (sy === 0 && captureY < 0) return false;
      if (sy === BOARD_SIZE - 1 && captureY >= BOARD_SIZE) return false;
      if (sx === 0 && captureX < 0) return false;
      if (sx === BOARD_SIZE - 1 && captureX >= BOARD_SIZE) return false;
    }
    
    return true;
  }

  function getValidBoundaryMoves(board: Board, y: number, x: number, player: PieceType): Array<[number, number, number, number]> {
    const moves: Array<[number, number, number, number]> = [];
    const piece = board[y][x];
    
    if (piece === PieceType.EMPTY) return moves;
    
    const isKingPiece = isKing(piece);
    
    // Define possible move directions based on piece type and position
    const diagonalOffsets = [
      [-1, -1], // northwest
      [-1, 1],  // northeast
      [1, -1],  // southwest
      [1, 1]    // southeast
    ];
    
    for (const [yOffset, xOffset] of diagonalOffsets) {
      const ny = y + yOffset;
      const nx = x + xOffset;
      
      // Check if this is a valid boundary move
      if (validateBoundaryMove(y, x, ny, nx, player, isKingPiece) && 
          isValidMove(board, y, x, ny, nx, player)) {
        moves.push([y, x, ny, nx]);
      }
    }
    
    return moves;
  }

  function validateEdgeCaseMove(board: Board, sy: number, sx: number, dy: number, dx: number, player: PieceType): { isValid: boolean; message: string } {
    // Check basic boundary validation
    if (!validateMoveCoordinates(sy, sx, dy, dx)) {
      return { isValid: false, message: 'Move would go outside the board' };
    }
    
    const piece = board[sy][sx];
    const isKingPiece = isKing(piece);
    
    // Check boundary-specific validation
    if (!validateBoundaryMove(sy, sx, dy, dx, player, isKingPiece)) {
      return { isValid: false, message: 'Invalid move for edge/corner piece' };
    }
    
    // Check if this is a capture move
    const isCapture = Math.abs(dy - sy) === 2;
    
    if (isCapture) {
      if (!validateCaptureBoundary(sy, sx, dy, dx)) {
        return { isValid: false, message: 'Invalid capture: would go outside board' };
      }
    }
    
    return { isValid: true, message: '' };
  }

  function handleEdgeCasePromotion(board: Board, y: number, x: number, piece: PieceType): PieceType {
    // Handle promotion for edge pieces
    if (isPlayerPiece(piece) && y === 0) {
      return promoteToKing(piece);
    } else if (isBotPiece(piece) && y === BOARD_SIZE - 1) {
      return promoteToKing(piece);
    }
    
    return piece;
  }

  function validateCornerPieceMove(sy: number, sx: number, dy: number, dx: number, player: PieceType): boolean {
    if (!isInCorner(sy, sx)) return true; // Not a corner piece
    
    const yDiff = dy - sy;
    const xDiff = dx - sx;
    
    // Corner pieces have limited move options
    if (sy === 0 && sx === 0) {
      // Top-left corner: can only move southeast
      return yDiff > 0 && xDiff > 0;
    } else if (sy === 0 && sx === BOARD_SIZE - 1) {
      // Top-right corner: can only move southwest
      return yDiff > 0 && xDiff < 0;
    } else if (sy === BOARD_SIZE - 1 && sx === 0) {
      // Bottom-left corner: can only move northeast
      return yDiff < 0 && xDiff > 0;
    } else if (sy === BOARD_SIZE - 1 && sx === BOARD_SIZE - 1) {
      // Bottom-right corner: can only move northwest
      return yDiff < 0 && xDiff < 0;
    }
    
    return false;
  }

  function getEdgeCaseMoves(board: Board, player: PieceType): Array<[number, number, number, number]> {
    const moves: Array<[number, number, number, number]> = [];
    
    // Check all edge and corner pieces
    for (let y = 0; y < BOARD_SIZE; y++) {
      for (let x = 0; x < BOARD_SIZE; x++) {
        const piece = board[y][x];
        if (piece === player || (player === PieceType.PLAYER && piece === PieceType.PLAYER_KING) || (player === PieceType.BOT && piece === PieceType.BOT_KING)) {
          if (isOnEdge(y, x)) {
            const edgeMoves = getValidBoundaryMoves(board, y, x, player);
            moves.push(...edgeMoves);
          }
        }
      }
    }
    
    return moves;
  }

  function movePiece(board: Board, sy: number, sx: number, dy: number, dx: number): Board {
    // Validate coordinates before proceeding
    if (!validateMoveCoordinates(sy, sx, dy, dx)) {
      throw new Error('Invalid move coordinates: out of bounds');
    }
    
    const newBoard = clone(board);
    const piece = newBoard[sy][sx];
    
    // Validate that source contains a piece
    if (piece === PieceType.EMPTY) {
      throw new Error('Invalid move: source position is empty');
    }
    
    // Check if this is a capture move
    const yDiff = dy - sy;
    const xDiff = dx - sx;
    const isCapture = Math.abs(yDiff) === 2;
    
    // Move the piece
    newBoard[dy][dx] = piece;
    newBoard[sy][sx] = PieceType.EMPTY;
    
    // Handle capture with boundary validation
    if (isCapture) {
      const captureY = sy + (yDiff / 2);
      const captureX = sx + (xDiff / 2);
      
      // Validate capture position is within bounds
      if (!isValidPosition(captureY, captureX)) {
        throw new Error('Invalid capture: capture position out of bounds');
      }
      
      newBoard[captureY][captureX] = PieceType.EMPTY;
    }
    
    // Check for king promotion with edge case handling
    newBoard[dy][dx] = handleEdgeCasePromotion(newBoard, dy, dx, piece);
    
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
    if (turn !== PieceType.PLAYER || gameState !== 'playing') return;
    
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

  function findChainCaptures(board: Board, player: PieceType, maxDepth: number = 10): Array<Array<[number, number, number, number]>> {
    const allSequences: Array<Array<[number, number, number, number]>> = [];
    
    // Find all possible starting captures
    const initialCaptures = getAvailableCaptures(board, player);
    
    for (const [sy, sx, dy, dx] of initialCaptures) {
      const sequence = findChainCaptureSequence(board, sy, sx, player, maxDepth);
      if (sequence.length > 0) {
        allSequences.push(sequence);
      }
    }
    
    return allSequences;
  }

  function findChainCaptureSequence(board: Board, startY: number, startX: number, player: PieceType, maxDepth: number): Array<[number, number, number, number]> {
    if (maxDepth <= 0) return [];
    
    const sequences: Array<Array<[number, number, number, number]>> = [];
    
    // Get all possible captures from the starting position
    const captures = getCapturesFromPosition(board, startY, startX, player);
    
    if (captures.length === 0) {
      return []; // No captures possible from this position
    }
    
    // Try each capture and recursively find more captures
    for (const [sy, sx, dy, dx] of captures) {
      const newBoard = movePiece(board, sy, sx, dy, dx);
      
      // Check if more captures are possible from the landing position
      const nextCaptures = getCapturesFromPosition(newBoard, dy, dx, player);
      
      if (nextCaptures.length > 0) {
        // Continue the chain
        const nextSequence = findChainCaptureSequence(newBoard, dy, dx, player, maxDepth - 1);
        if (nextSequence.length > 0) {
          sequences.push([[sy, sx, dy, dx], ...nextSequence]);
        } else {
          sequences.push([[sy, sx, dy, dx]]);
        }
      } else {
        // End of chain
        sequences.push([[sy, sx, dy, dx]]);
      }
    }
    
    // Return the longest sequence (or first if multiple same length)
    if (sequences.length === 0) return [];
    
    let bestSequence = sequences[0];
    for (const sequence of sequences) {
      if (sequence.length > bestSequence.length) {
        bestSequence = sequence;
      }
    }
    
    return bestSequence;
  }

  function getCapturesFromPosition(board: Board, y: number, x: number, player: PieceType): Array<[number, number, number, number]> {
    const captures: Array<[number, number, number, number]> = [];
    const piece = board[y][x];
    
    if (piece !== player && piece !== (player === PieceType.PLAYER ? PieceType.PLAYER_KING : PieceType.BOT_KING)) {
      return captures; // Not our piece
    }
    
    const isKingPiece = isKing(piece);
    const opponent = player === PieceType.PLAYER ? PieceType.BOT : PieceType.PLAYER;
    const opponentKing = player === PieceType.PLAYER ? PieceType.BOT_KING : PieceType.PLAYER_KING;
    
    // Check all possible diagonal capture directions
    const diagonalOffsets = [
      [-1, -1], // northwest
      [-1, 1],  // northeast
      [1, -1],  // southwest
      [1, 1]    // southeast
    ];
    
    for (const [yOffset, xOffset] of diagonalOffsets) {
      const captureY = y + yOffset;
      const captureX = x + xOffset;
      const landingY = y + (yOffset * 2);
      const landingX = x + (xOffset * 2);
      
      // Check if capture is valid
      if (isValidPosition(captureY, captureX) && 
          (board[captureY][captureX] === opponent || board[captureY][captureX] === opponentKing) &&
          isValidPosition(landingY, landingX) && 
          board[landingY][landingX] === PieceType.EMPTY) {
        
        // Additional validation: check if the move direction is valid for this piece
        if (isValidMove(board, y, x, landingY, landingX, player)) {
          captures.push([y, x, landingY, landingX]);
        }
      }
    }
    
    return captures;
  }

  function hasChainCapture(board: Board, player: PieceType): boolean {
    const chainCaptures = findChainCaptures(board, player, 5); // Limit depth for performance
    return chainCaptures.length > 0;
  }

  function getBestChainCapture(board: Board, player: PieceType): Array<[number, number, number, number]> {
    const chainCaptures = findChainCaptures(board, player, 10);
    
    if (chainCaptures.length === 0) return [];
    
    // Find the sequence that captures the most pieces
    let bestSequence = chainCaptures[0];
    let maxCaptures = bestSequence.length;
    
    for (const sequence of chainCaptures) {
      if (sequence.length > maxCaptures) {
        bestSequence = sequence;
        maxCaptures = sequence.length;
      }
    }
    
    return bestSequence;
  }

  function validateChainCapture(board: Board, moves: Array<[number, number, number, number]>, player: PieceType): boolean {
    if (moves.length === 0) return false;
    
    let currentBoard = clone(board);
    let currentY = moves[0][0];
    let currentX = moves[0][1];
    
    for (const [sy, sx, dy, dx] of moves) {
      // Validate that the move starts from the correct position
      if (sy !== currentY || sx !== currentX) {
        return false;
      }
      
      // Validate that this is a capture move
      if (Math.abs(dy - sy) !== 2 || Math.abs(dx - sx) !== 2) {
        return false;
      }
      
      // Validate that the move is legal
      if (!isValidMove(currentBoard, sy, sx, dy, dx, player)) {
        return false;
      }
      
      // Apply the move
      currentBoard = movePiece(currentBoard, sy, sx, dy, dx);
      
      // Update current position
      currentY = dy;
      currentX = dx;
    }
    
    return true;
  }

  function executeChainCapture(board: Board, moves: Array<[number, number, number, number]>, player: PieceType): Board {
    let currentBoard = clone(board);
    
    for (const [sy, sx, dy, dx] of moves) {
      currentBoard = movePiece(currentBoard, sy, sx, dy, dx);
    }
    
    return currentBoard;
  }

  function findMultipleJumpSequences(board: Board, player: PieceType, maxDepth: number = 10): Array<Array<[number, number, number, number]>> {
    const allSequences: Array<Array<[number, number, number, number]>> = [];
    
    // Find all possible starting positions for jumps
    for (let y = 0; y < BOARD_SIZE; y++) {
      for (let x = 0; x < BOARD_SIZE; x++) {
        const piece = board[y][x];
        if (piece === player || (player === PieceType.PLAYER && piece === PieceType.PLAYER_KING) || (player === PieceType.BOT && piece === PieceType.BOT_KING)) {
          const sequences = findMultipleJumpSequence(board, y, x, player, maxDepth);
          allSequences.push(...sequences);
        }
      }
    }
    
    return allSequences;
  }

  function findMultipleJumpSequence(board: Board, startY: number, startX: number, player: PieceType, maxDepth: number): Array<Array<[number, number, number, number]>> {
    if (maxDepth <= 0) return [];
    
    const sequences: Array<Array<[number, number, number, number]>> = [];
    
    // Get all possible jumps from the starting position
    const jumps = getJumpsFromPosition(board, startY, startX, player);
    
    if (jumps.length === 0) {
      return []; // No jumps possible from this position
    }
    
    // Try each jump and recursively find more jumps
    for (const [sy, sx, dy, dx] of jumps) {
      const newBoard = movePiece(board, sy, sx, dy, dx);
      
      // Check if more jumps are possible from the landing position
      const nextJumps = getJumpsFromPosition(newBoard, dy, dx, player);
      
      if (nextJumps.length > 0) {
        // Continue the multiple jump sequence
        const nextSequences = findMultipleJumpSequence(newBoard, dy, dx, player, maxDepth - 1);
        if (nextSequences.length > 0) {
          for (const nextSequence of nextSequences) {
            sequences.push([[sy, sx, dy, dx], ...nextSequence]);
          }
        } else {
          sequences.push([[sy, sx, dy, dx]]);
        }
      } else {
        // End of sequence
        sequences.push([[sy, sx, dy, dx]]);
      }
    }
    
    return sequences;
  }

  function getJumpsFromPosition(board: Board, y: number, x: number, player: PieceType): Array<[number, number, number, number]> {
    const jumps: Array<[number, number, number, number]> = [];
    const piece = board[y][x];
    
    if (piece !== player && piece !== (player === PieceType.PLAYER ? PieceType.PLAYER_KING : PieceType.BOT_KING)) {
      return jumps; // Not our piece
    }
    
    const isKingPiece = isKing(piece);
    const opponent = player === PieceType.PLAYER ? PieceType.BOT : PieceType.PLAYER;
    const opponentKing = player === PieceType.PLAYER ? PieceType.BOT_KING : PieceType.PLAYER_KING;
    
    // Check all possible diagonal jump directions
    const diagonalOffsets = [
      [-1, -1], // northwest
      [-1, 1],  // northeast
      [1, -1],  // southwest
      [1, 1]    // southeast
    ];
    
    for (const [yOffset, xOffset] of diagonalOffsets) {
      const jumpY = y + yOffset;
      const jumpX = x + xOffset;
      const landingY = y + (yOffset * 2);
      const landingX = x + (xOffset * 2);
      
      // Check if jump is valid (must jump over opponent piece)
      if (isValidPosition(jumpY, jumpX) && 
          (board[jumpY][jumpX] === opponent || board[jumpY][jumpX] === opponentKing) &&
          isValidPosition(landingY, landingX) && 
          board[landingY][landingX] === PieceType.EMPTY) {
        
        // Additional validation: check if the move direction is valid for this piece
        if (isValidMove(board, y, x, landingY, landingX, player)) {
          jumps.push([y, x, landingY, landingX]);
        }
      }
    }
    
    return jumps;
  }

  function hasMultipleJumpSequences(board: Board, player: PieceType): boolean {
    const sequences = findMultipleJumpSequences(board, player, 10);
    return sequences.some(seq => seq.length > 1);
  }

  function getBestMultipleJumpSequence(board: Board, player: PieceType): Array<[number, number, number, number]> {
    const sequences = findMultipleJumpSequences(board, player, 10);
    
    if (sequences.length === 0) return [];
    
    // Find the sequence with the most jumps
    let bestSequence = sequences[0];
    for (const sequence of sequences) {
      if (sequence.length > bestSequence.length) {
        bestSequence = sequence;
      }
    }
    
    return bestSequence;
  }

  function validateMultipleJumpSequence(board: Board, moves: Array<[number, number, number, number]>, player: PieceType): boolean {
    if (moves.length === 0) return false;
    
    let currentBoard = clone(board);
    let currentY = moves[0][0];
    let currentX = moves[0][1];
    
    for (const [sy, sx, dy, dx] of moves) {
      // Validate that the move starts from the correct position
      if (sy !== currentY || sx !== currentX) {
        return false;
      }
      
      // Validate the move
      if (!isValidMove(currentBoard, sy, sx, dy, dx, player)) {
        return false;
      }
      
      // Execute the move
      currentBoard = movePiece(currentBoard, sy, sx, dy, dx);
      currentY = dy;
      currentX = dx;
    }
    
    return true;
  }

  function executeMultipleJumpSequence(board: Board, moves: Array<[number, number, number, number]>, player: PieceType): Board {
    let currentBoard = clone(board);
    
    for (const [sy, sx, dy, dx] of moves) {
      currentBoard = movePiece(currentBoard, sy, sx, dy, dx);
    }
    
    return currentBoard;
  }

  function getMultipleJumpMessage(board: Board, player: PieceType): string {
    const sequences = findMultipleJumpSequences(board, player, 10);
    const maxJumps = Math.max(...sequences.map(seq => seq.length), 0);
    
    if (maxJumps > 1) {
      return `Multiple jump sequence available (${maxJumps} jumps)`;
    }
    
    return '';
  }

  function findLongestJumpSequence(board: Board, player: PieceType): Array<[number, number, number, number]> {
    const sequences = findMultipleJumpSequences(board, player, 10);
    
    if (sequences.length === 0) return [];
    
    let longestSequence = sequences[0];
    for (const sequence of sequences) {
      if (sequence.length > longestSequence.length) {
        longestSequence = sequence;
      }
    }
    
    return longestSequence;
  }

  function canContinueJumping(board: Board, y: number, x: number, player: PieceType): boolean {
    const jumps = getJumpsFromPosition(board, y, x, player);
    return jumps.length > 0;
  }

  function getJumpSequenceValue(board: Board, moves: Array<[number, number, number, number]>, player: PieceType): number {
    let value = 0;
    let currentBoard = clone(board);
    
    for (const [sy, sx, dy, dx] of moves) {
      // Value for each captured piece
      const captureY = sy + (dy - sy) / 2;
      const captureX = sx + (dx - sx) / 2;
      const capturedPiece = currentBoard[captureY][captureX];
      
      if (capturedPiece === PieceType.PLAYER || capturedPiece === PieceType.BOT) {
        value += 1;
      } else if (capturedPiece === PieceType.PLAYER_KING || capturedPiece === PieceType.BOT_KING) {
        value += 2; // Kings are worth more
      }
      
      // Bonus for longer sequences
      value += 0.5;
      
      // Execute the move
      currentBoard = movePiece(currentBoard, sy, sx, dy, dx);
    }
    
    return value;
  }

  function evaluateMultipleJumpOpportunity(board: Board, player: PieceType): number {
    const sequences = findMultipleJumpSequences(board, player, 10);
    if (sequences.length === 0) return 0;
    
    let totalValue = 0;
    for (const sequence of sequences) {
      const sequenceValue = getJumpSequenceValue(board, sequence, player);
      totalValue += sequenceValue;
    }
    
    // Bonus for having multiple jump sequences available
    if (sequences.length > 1) {
      totalValue += sequences.length * 0.5;
    }
    
    return totalValue;
  }

  function findBestMultipleJumpMove(board: Board, player: PieceType): [number, number, number, number] | null {
    const sequences = findMultipleJumpSequences(board, player, 10);
    
    if (sequences.length === 0) return null;
    
    let bestSequence = sequences[0];
    let bestValue = getJumpSequenceValue(board, bestSequence, player);
    
    for (const sequence of sequences) {
      const value = getJumpSequenceValue(board, sequence, player);
      if (value > bestValue) {
        bestValue = value;
        bestSequence = sequence;
      }
    }
    
    return bestSequence[0]; // Return the first move of the best sequence
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
        <strong>How to Play:</strong> Move your pieces diagonally forward. Capture opponent pieces by jumping over them. Reach the opposite end to promote to king. Kings can move backward. First to lose all pieces loses the game.
        <button
          onClick={() => setShowTutorial(true)}
          style={{ marginLeft: 16, background: '#059669', color: 'white', border: 'none', borderRadius: 4, padding: '4px 12px', cursor: 'pointer' }}
        >
          📖 Full Tutorial
        </button>
      </div>
      
      <div style={{ marginBottom: 12 }}>{message}</div>
      
      {/* Mandatory Capture Warning */}
      {turn === PieceType.PLAYER && hasAnyCaptures(board, PieceType.PLAYER) && (
        <div style={{ 
          background: '#dc2626', 
          color: 'white', 
          padding: '8px 12px', 
          borderRadius: 4, 
          marginBottom: 12,
          fontWeight: 'bold',
          textAlign: 'center'
        }}>
          ⚠️ {getMandatoryCaptureMessage(board, PieceType.PLAYER)}
        </div>
      )}
      
      {/* Multiple Jump Sequence Indicator */}
      {turn === PieceType.PLAYER && hasMultipleJumpSequences(board, PieceType.PLAYER) && (
        <div style={{ 
          background: '#059669', 
          color: 'white', 
          padding: '8px 12px', 
          borderRadius: 4, 
          marginBottom: 12,
          fontWeight: 'bold',
          textAlign: 'center'
        }}>
          🎯 {getMultipleJumpMessage(board, PieceType.PLAYER)}
        </div>
      )}
      
      {/* Stalemate Analysis */}
      {gameState === 'stalemate' && (
        <div style={{ 
          background: '#f59e0b', 
          color: 'white', 
          padding: '12px', 
          borderRadius: 4, 
          marginBottom: 12,
          fontWeight: 'bold'
        }}>
          <div style={{ marginBottom: 8 }}>🔍 {getStalemateReason(board)}</div>
          <details style={{ fontSize: '14px', fontWeight: 'normal' }}>
            <summary style={{ cursor: 'pointer', marginBottom: 4 }}>📊 Detailed Analysis</summary>
            <pre style={{ 
              whiteSpace: 'pre-wrap', 
              fontFamily: 'monospace', 
              fontSize: '12px',
              margin: 0,
              padding: '8px',
              background: 'rgba(0,0,0,0.2)',
              borderRadius: 4
            }}>
              {getDetailedStalemateAnalysis(board)}
            </pre>
          </details>
        </div>
      )}
      
      {/* Potential Stalemate Warning */}
      {gameState === 'playing' && detectStalemate(board) !== 'none' && (
        <div style={{ 
          background: '#fbbf24', 
          color: 'black', 
          padding: '8px 12px', 
          borderRadius: 4, 
          marginBottom: 12,
          fontWeight: 'bold',
          textAlign: 'center'
        }}>
          ⚠️ Potential Stalemate Detected: {detectStalemate(board).replace('_', ' ')}
        </div>
      )}
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
          disabled={historyIndex === 0 || turn !== PieceType.PLAYER}
          style={{ marginRight: 8, background: '#6366f1', color: 'white', border: 'none', padding: '8px 16px', borderRadius: 4, cursor: 'pointer' }}
        >
          ↩ Undo
        </button>
        <button 
          onClick={handleRedo} 
          disabled={historyIndex === history.length - 1 || turn !== PieceType.PLAYER}
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
              const isValidMoveTarget = selected && validateMoveWithMandatoryCapture(board, selected[0], selected[1], y, x, PieceType.PLAYER).isValid;
              
              return (
                <div
                  key={x}
                  onClick={() => handleCellClick(y, x)}
                  onFocus={() => setKeyboardFocus([y, x])}
                  tabIndex={0}
                  role="button"
                  aria-label={`${y}, ${x} ${cell === PieceType.PLAYER ? 'player piece' : cell === PieceType.BOT ? 'bot piece' : cell === PieceType.PLAYER_KING ? 'player king' : cell === PieceType.BOT_KING ? 'bot king' : 'empty'}`}
                  style={{
                    ...cellStyle,
                    background: highlight ? '#fbbf24' : 
                              isValidMoveTarget ? '#10b981' :
                              (y + x) % 2 === 0 ? '#444' : '#eee',
                    color: (y + x) % 2 === 0 ? 'white' : 'black',
                    border: selected && selected[0] === y && selected[1] === x ? '2px solid #fbbf24' : 
                           isKeyboardFocused ? '2px solid #3b82f6' : '1px solid #333',
                    cursor: turn === PieceType.PLAYER && (cell === PieceType.PLAYER || cell === PieceType.PLAYER_KING || isValidMoveTarget) ? 'pointer' : 'default',
                    outline: 'none',
                    transform: selected && selected[0] === y && selected[1] === x ? 'scale(1.1)' : 'scale(1)',
                    boxShadow: highlight ? '0 0 10px rgba(251, 191, 36, 0.5)' : 'none',
                  }}
                >
                  <span style={{
                    ...pieceStyle,
                    transform: cell === PieceType.PLAYER || cell === PieceType.BOT || cell === PieceType.PLAYER_KING || cell === PieceType.BOT_KING ? 'scale(1)' : 'scale(0)',
                    opacity: cell === PieceType.PLAYER || cell === PieceType.BOT || cell === PieceType.PLAYER_KING || cell === PieceType.BOT_KING ? 1 : 0,
                    fontSize: isKing(cell) ? '20px' : '16px',
                    fontWeight: isKing(cell) ? 'bold' : 'normal',
                  }}>
                    {cell === PieceType.PLAYER ? '●' : 
                     cell === PieceType.BOT ? '○' : 
                     cell === PieceType.PLAYER_KING ? '♔' : 
                     cell === PieceType.BOT_KING ? '♚' : ''}
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