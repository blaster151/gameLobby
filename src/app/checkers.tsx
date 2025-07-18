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
    
    // Check for stalemate
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
    
    if (playerMoves.length === 0 && botMoves.length === 0) {
      return 'Both players have no valid moves';
    }
    
    if (playerMoves.length === 0) {
      return 'Player has no valid moves';
    }
    
    if (botMoves.length === 0) {
      return 'Bot has no valid moves';
    }
    
    return 'Game is still playable';
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
      if (isValidMove(board, sy, sx, y, x, currentPlayer)) {
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
        setSelected(null);
      }
    } else if (canMovePiece) {
      setSelected([y, x]);
    }
  }

  function getValidMoves(board: Board, player: PieceType): Array<[number, number, number, number]> {
    const moves: Array<[number, number, number, number]> = [];
    
    // First check for captures - if any are available, only captures are valid
    const captures = getAvailableCaptures(board, player);
    if (captures.length > 0) {
      return captures;
    }
    
    // If no captures available, return regular moves
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
            
            // Check if the move is valid
            if (isValidMove(board, y, x, ny, nx, player)) {
              moves.push([y, x, ny, nx]);
            }
          }
        }
      }
    }
    return moves;
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
        }
      }
    }
    
    return captures;
  }

  function hasAvailableCaptures(board: Board, player: PieceType): boolean {
    return getAvailableCaptures(board, player).length > 0;
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
    
    // Endgame adjustments
    if (totalBotPieces <= 3 || totalPlayerPieces <= 3) {
      // In endgame, kings become more valuable
      return (botKings - playerKings) * 0.5;
    }
    
    return 0;
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
    
    // Prefer moves that capture pieces or move towards the center
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
    
    // Look ahead for capture sequences and choose the best option
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
    if (hasAvailableCaptures(board, player) && !isCapture) {
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
    
    // Kings can move in any diagonal direction
    return true;
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

  function isValidPosition(y: number, x: number): boolean {
    return y >= 0 && y < BOARD_SIZE && x >= 0 && x < BOARD_SIZE;
  }

  function isOnBoard(y: number, x: number): boolean {
    return isValidPosition(y, x);
  }

  function validateMoveCoordinates(sy: number, sx: number, dy: number, dx: number): boolean {
    return isValidPosition(sy, sx) && isValidPosition(dy, dx);
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
    
    // Check for king promotion
    if (isPlayerPiece(piece) && dy === 0) {
      // Player piece reached the top row
      newBoard[dy][dx] = promoteToKing(piece);
    } else if (isBotPiece(piece) && dy === BOARD_SIZE - 1) {
      // Bot piece reached the bottom row
      newBoard[dy][dx] = promoteToKing(piece);
    }
    
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
              const isValidMoveTarget = selected && isValidMove(board, selected[0], selected[1], y, x, PieceType.PLAYER);
              
              return (
                <div
                  key={x}
                  onClick={() => handleCellClick(y, x)}
                  onFocus={() => setKeyboardFocus([y, x])}
                  tabIndex={0}
                  role="button"
                  aria-label={`${y + 1}, ${x + 1} ${cell === PieceType.PLAYER ? 'player piece' : cell === PieceType.BOT ? 'bot piece' : cell === PieceType.PLAYER_KING ? 'player king' : cell === PieceType.BOT_KING ? 'bot king' : 'empty'}`}
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