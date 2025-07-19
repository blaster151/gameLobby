import { create } from 'zustand';

export enum PlayerColor {
  WHITE = 'white',
  BLACK = 'black',
}

export enum BotDifficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
}

export enum GameMode {
  HUMAN_VS_BOT = 'human_vs_bot',
  HUMAN_VS_HUMAN = 'human_vs_human',
}

export type Point = number[]; // Array of piece counts for each player
export type Board = Point[];
export type Dice = number[];

// Individual piece representation
export interface Piece {
  id: string; // Unique identifier for the piece
  player: PlayerColor; // Which player owns this piece
  position: number; // Current position (0-23 for board points, 25 for bar, 27/28 for off-board)
  state: 'active' | 'onBar' | 'borneOff'; // Current state of the piece
  moveCount: number; // Number of moves this piece has made
  lastMoveTurn: number; // Turn number when this piece was last moved
  isBlot: boolean; // Whether this piece is currently a blot (single piece on point)
}

// Enhanced board state with individual piece tracking
export interface EnhancedBoardState {
  pieces: Piece[]; // Array of all pieces with their individual states
  board: Board; // Legacy board representation for compatibility
  bar: [number, number]; // [white pieces on bar, black pieces on bar]
  offBoard: [number, number]; // [white pieces borne off, black pieces borne off]
  turnNumber: number; // Current turn number for tracking piece movement
}

// Extended board state to include bar and off-board pieces
export interface ExtendedBoardState {
  board: Board;
  bar: [number, number]; // [white pieces on bar, black pieces on bar]
  offBoard: [number, number]; // [white pieces borne off, black pieces borne off]
}

// Doubling cube state
export interface DoublingCubeState {
  value: number; // Current value of the cube (1, 2, 4, 8, 16, 32, 64)
  owner: PlayerColor | null; // Who owns the cube (null if centered)
  canDouble: boolean; // Whether the current player can offer a double
  pendingOffer: boolean; // Whether there's a pending double offer
  offeringPlayer: PlayerColor | null; // Who is offering the double
}

// Match scoring system
export interface MatchState {
  matchLength: number; // Points needed to win the match (1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25)
  whiteScore: number; // White's current match score
  blackScore: number; // Black's current match score
  gameNumber: number; // Current game number in the match
  matchWinner: PlayerColor | null; // Winner of the match (null if ongoing)
  isMatchPlay: boolean; // Whether we're playing a match or single game
  crawfordGame: boolean; // Whether this is the Crawford game (when one player is 1 point away)
  postCrawford: boolean; // Whether we're in post-Crawford phase
  jacobyRule: boolean; // Whether Jacoby rule is in effect (gammons/backgammons don't count in money games)
}

export enum MatchLength {
  POINT_1 = 1,
  POINT_3 = 3,
  POINT_5 = 5,
  POINT_7 = 7,
  POINT_9 = 9,
  POINT_11 = 11,
  POINT_13 = 13,
  POINT_15 = 15,
  POINT_17 = 17,
  POINT_19 = 19,
  POINT_21 = 21,
  POINT_23 = 23,
  POINT_25 = 25,
}

const BOARD_SIZE = 24;
const BAR_WHITE = 25;
const BAR_BLACK = 26;
const OFF_WHITE = 27;
const OFF_BLACK = 28;

// Export constants for use in components
export const BOARD_CONSTANTS = {
  BOARD_SIZE,
  BAR_WHITE,
  BAR_BLACK,
  OFF_WHITE,
  OFF_BLACK,
} as const;

// Home board and outer board constants and functions
export const BOARD_REGIONS = {
  WHITE_HOME: [0, 5] as [number, number], // Points 0-5
  BLACK_HOME: [18, 23] as [number, number], // Points 18-23
  OUTER_BOARD: [6, 17] as [number, number], // Points 6-17
} as const;

function initialBoard(): Board {
  const board: Board = Array.from({ length: BOARD_SIZE }, () => [0, 0]);
  
  // Set up initial piece positions
  // Point 0 is white's home board, point 23 is black's home board
  board[0] = [2, 0];   // White pieces
  board[5] = [0, 5];   // Black pieces
  board[7] = [0, 3];   // Black pieces
  board[11] = [5, 0];  // White pieces
  board[12] = [0, 5];  // Black pieces
  board[16] = [3, 0];  // White pieces
  board[18] = [5, 0];  // White pieces
  board[23] = [0, 2];  // Black pieces
  
  return board;
}

function initialExtendedBoardState(): ExtendedBoardState {
  return {
    board: initialBoard(),
    bar: [0, 0], // No pieces on bar initially
    offBoard: [0, 0], // No pieces borne off initially
  };
}

function initialDoublingCubeState(): DoublingCubeState {
  return {
    value: 1,
    owner: null, // Cube starts centered
    canDouble: false, // Can't double on first roll
    pendingOffer: false,
    offeringPlayer: null,
  };
}

function initialMatchState(matchLength: number = MatchLength.POINT_7): MatchState {
  return {
    matchLength,
    whiteScore: 0,
    blackScore: 0,
    gameNumber: 1,
    matchWinner: null,
    isMatchPlay: true,
    crawfordGame: false,
    postCrawford: false,
    jacobyRule: false, // Jacoby rule is typically off in match play
  };
}

function clone(board: Board): Board {
  return board.map(point => [...point]);
}

function cloneEnhancedBoardState(state: EnhancedBoardState): EnhancedBoardState {
  return {
    pieces: state.pieces.map(piece => ({ ...piece })),
    board: clone(state.board),
    bar: [...state.bar],
    offBoard: [...state.offBoard],
    turnNumber: state.turnNumber,
  };
}

function cloneExtendedBoardState(state: ExtendedBoardState): ExtendedBoardState {
  return {
    board: clone(state.board),
    bar: [...state.bar],
    offBoard: [...state.offBoard],
  };
}

function cloneDoublingCubeState(state: DoublingCubeState): DoublingCubeState {
  return {
    value: state.value,
    owner: state.owner,
    canDouble: state.canDouble,
    pendingOffer: state.pendingOffer,
    offeringPlayer: state.offeringPlayer,
  };
}

function cloneMatchState(state: MatchState): MatchState {
  return {
    matchLength: state.matchLength,
    whiteScore: state.whiteScore,
    blackScore: state.blackScore,
    gameNumber: state.gameNumber,
    matchWinner: state.matchWinner,
    isMatchPlay: state.isMatchPlay,
    crawfordGame: state.crawfordGame,
    postCrawford: state.postCrawford,
    jacobyRule: state.jacobyRule,
  };
}

// Bar re-entry functions
function hasPiecesOnBar(boardState: ExtendedBoardState, player: PlayerColor): boolean {
  const playerIndex = player === PlayerColor.WHITE ? 0 : 1;
  return boardState.bar[playerIndex] > 0;
}

function canReenterFromBar(boardState: ExtendedBoardState, player: PlayerColor, die: number): boolean {
  const playerIndex = player === PlayerColor.WHITE ? 0 : 1;
  const opponentIndex = player === PlayerColor.WHITE ? 1 : 0;
  
  if (!hasPiecesOnBar(boardState, player)) {
    return false;
  }
  
  // Calculate re-entry point based on die
  let reentryPoint: number;
  if (player === PlayerColor.WHITE) {
    reentryPoint = 24 - die; // White re-enters from point 24-die
  } else {
    reentryPoint = die - 1; // Black re-enters from point die
  }
  
  // Check if re-entry point is valid (0-23)
  if (reentryPoint < 0 || reentryPoint >= BOARD_SIZE) {
    return false;
  }
  
  // Check if opponent has 2 or more pieces at re-entry point
  const opponentPieces = boardState.board[reentryPoint][opponentIndex];
  return opponentPieces < 2;
}

function getBarReentryMoves(boardState: ExtendedBoardState, player: PlayerColor, dice: Dice, usedDice: number[]): [number, number][] {
  const moves: [number, number][] = [];
  const availableDice = dice.filter(d => !usedDice.includes(d));
  
  if (!hasPiecesOnBar(boardState, player)) {
    return moves;
  }
  
  for (const die of availableDice) {
    if (canReenterFromBar(boardState, player, die)) {
      let reentryPoint: number;
      if (player === PlayerColor.WHITE) {
        reentryPoint = 24 - die;
      } else {
        reentryPoint = die - 1;
      }
      moves.push([BAR_WHITE, reentryPoint]); // Use BAR_WHITE as from point for both players
    }
  }
  
  return moves;
}

function validateBarReentryMove(boardState: ExtendedBoardState, from: number, to: number, player: PlayerColor, die: number): boolean {
  if (!hasPiecesOnBar(boardState, player)) {
    return false;
  }
  
  if (from !== BAR_WHITE) {
    return false;
  }
  
  return canReenterFromBar(boardState, player, die);
}

function executeBarReentryMove(boardState: ExtendedBoardState, from: number, to: number, player: PlayerColor): ExtendedBoardState {
  const newState = cloneExtendedBoardState(boardState);
  const playerIndex = player === PlayerColor.WHITE ? 0 : 1;
  const opponentIndex = player === PlayerColor.WHITE ? 1 : 0;
  
  // Remove piece from bar
  newState.bar[playerIndex]--;
  
  // Add piece to re-entry point
  newState.board[to][playerIndex]++;
  
  // Handle capture if opponent has exactly 1 piece
  if (newState.board[to][opponentIndex] === 1) {
    newState.board[to][opponentIndex] = 0;
    newState.bar[opponentIndex]++;
  }
  
  return newState;
}

function hitPiece(boardState: ExtendedBoardState, point: number, player: PlayerColor): ExtendedBoardState {
  const newState = cloneExtendedBoardState(boardState);
  const playerIndex = player === PlayerColor.WHITE ? 0 : 1;
  const opponentIndex = player === PlayerColor.WHITE ? 1 : 0;
  
  // Remove opponent piece from point
  newState.board[point][opponentIndex]--;
  
  // Add opponent piece to bar
  newState.bar[opponentIndex]++;
  
  return newState;
}

function isBlot(boardState: ExtendedBoardState, point: number, player: PlayerColor): boolean {
  const playerIndex = player === PlayerColor.WHITE ? 0 : 1;
  return boardState.board[point][playerIndex] === 1;
}

function canHitBlot(boardState: ExtendedBoardState, from: number, to: number, player: PlayerColor): boolean {
  const opponentIndex = player === PlayerColor.WHITE ? 1 : 0;
  return boardState.board[to][opponentIndex] === 1;
}

// Enhanced blot concept functions
function getAllBlots(boardState: ExtendedBoardState, player: PlayerColor): number[] {
  const blots: number[] = [];
  const playerIndex = player === PlayerColor.WHITE ? 0 : 1;
  
  for (let point = 0; point < BOARD_SIZE; point++) {
    if (boardState.board[point][playerIndex] === 1) {
      blots.push(point);
    }
  }
  
  return blots;
}

function getBlotCount(boardState: ExtendedBoardState, player: PlayerColor): number {
  return getAllBlots(boardState, player).length;
}

function isPointVulnerable(boardState: ExtendedBoardState, point: number, player: PlayerColor): boolean {
  if (!isBlot(boardState, point, player)) {
    return false;
  }
  
  // Check if any opponent can reach this point
  const opponent = player === PlayerColor.WHITE ? PlayerColor.BLACK : PlayerColor.WHITE;
  
  for (let from = 0; from < BOARD_SIZE; from++) {
    const fromPoint = boardState.board[from];
    const opponentIndex = opponent === PlayerColor.WHITE ? 0 : 1;
    
    if (fromPoint[opponentIndex] > 0) {
      // Check all possible dice values (1-6)
      for (let die = 1; die <= 6; die++) {
        const to = opponent === PlayerColor.WHITE ? from + die : from - die;
        if (to === point) {
          return true; // Opponent can reach this blot
        }
      }
    }
  }
  
  return false;
}

function getVulnerableBlots(boardState: ExtendedBoardState, player: PlayerColor): number[] {
  const allBlots = getAllBlots(boardState, player);
  return allBlots.filter(blot => isPointVulnerable(boardState, blot, player));
}

function getBlotRiskLevel(boardState: ExtendedBoardState, point: number, player: PlayerColor): 'low' | 'medium' | 'high' {
  if (!isBlot(boardState, point, player)) {
    return 'low';
  }
  
  const opponent = player === PlayerColor.WHITE ? PlayerColor.BLACK : PlayerColor.WHITE;
  let reachableCount = 0;
  
  // Count how many opponent pieces can reach this blot
  for (let from = 0; from < BOARD_SIZE; from++) {
    const fromPoint = boardState.board[from];
    const opponentIndex = opponent === PlayerColor.WHITE ? 0 : 1;
    
    if (fromPoint[opponentIndex] > 0) {
      for (let die = 1; die <= 6; die++) {
        const to = opponent === PlayerColor.WHITE ? from + die : from - die;
        if (to === point) {
          reachableCount += fromPoint[opponentIndex];
        }
      }
    }
  }
  
  if (reachableCount === 0) return 'low';
  if (reachableCount <= 2) return 'medium';
  return 'high';
}

function getBlotProtectionMoves(boardState: ExtendedBoardState, player: PlayerColor, dice: Dice, usedDice: number[]): [number, number][] {
  const moves: [number, number][] = [];
  const vulnerableBlots = getVulnerableBlots(boardState, player);
  const availableDice = dice.filter(d => !usedDice.includes(d));
  
  if (vulnerableBlots.length === 0) {
    return moves;
  }
  
  // Find moves that can protect vulnerable blots
  for (const die of availableDice) {
    for (let from = 0; from < BOARD_SIZE; from++) {
      const to = player === PlayerColor.WHITE ? from + die : from - die;
      
      if (to >= 0 && to < BOARD_SIZE) {
        const fromPoint = boardState.board[from];
        const toPoint = boardState.board[to];
        const playerIndex = player === PlayerColor.WHITE ? 0 : 1;
        const opponentIndex = player === PlayerColor.WHITE ? 1 : 0;
        
        // Check if player has pieces at from point
        if (fromPoint[playerIndex] > 0) {
          // Check if destination is valid and would protect a blot
          if (toPoint[opponentIndex] <= 1) {
            // Check if this move would protect a vulnerable blot
            const wouldProtectBlot = vulnerableBlots.some(blot => {
              if (to === blot) {
                // Moving to the blot itself would protect it
                return true;
              }
              // Check if this move blocks an opponent's path to the blot
              return false; // Simplified for now
            });
            
            if (wouldProtectBlot) {
              moves.push([from, to]);
            }
          }
        }
      }
    }
  }
  
  return moves;
}

function getBlotAttackMoves(boardState: ExtendedBoardState, player: PlayerColor, dice: Dice, usedDice: number[]): [number, number][] {
  const moves: [number, number][] = [];
  const opponent = player === PlayerColor.WHITE ? PlayerColor.BLACK : PlayerColor.WHITE;
  const opponentBlots = getAllBlots(boardState, opponent);
  const availableDice = dice.filter(d => !usedDice.includes(d));
  
  if (opponentBlots.length === 0) {
    return moves;
  }
  
  // Find moves that can hit opponent blots
  for (const die of availableDice) {
    for (let from = 0; from < BOARD_SIZE; from++) {
      const to = player === PlayerColor.WHITE ? from + die : from - die;
      
      if (to >= 0 && to < BOARD_SIZE) {
        const fromPoint = boardState.board[from];
        const toPoint = boardState.board[to];
        const playerIndex = player === PlayerColor.WHITE ? 0 : 1;
        const opponentIndex = player === PlayerColor.WHITE ? 1 : 0;
        
        // Check if player has pieces at from point
        if (fromPoint[playerIndex] > 0) {
          // Check if destination has an opponent blot
          if (toPoint[opponentIndex] === 1) {
            moves.push([from, to]);
          }
        }
      }
    }
  }
  
  return moves;
}

function getBlotStrategicValue(boardState: ExtendedBoardState, point: number, player: PlayerColor): number {
  if (!isBlot(boardState, point, player)) {
    return 0;
  }
  
  let value = 0;
  
  // Base value for being a blot
  value += 1;
  
  // Add value based on risk level
  const riskLevel = getBlotRiskLevel(boardState, point, player);
  switch (riskLevel) {
    case 'high':
      value += 3;
      break;
    case 'medium':
      value += 2;
      break;
    case 'low':
      value += 1;
      break;
  }
  
  // Add value based on position (home board is more valuable)
  if (player === PlayerColor.WHITE) {
    if (point >= 18 && point <= 23) { // White home board
      value += 2;
    }
  } else {
    if (point >= 0 && point <= 5) { // Black home board
      value += 2;
    }
  }
  
  return value;
}

function getBlotStatusMessage(boardState: ExtendedBoardState, player: PlayerColor): string {
  const blots = getAllBlots(boardState, player);
  const vulnerableBlots = getVulnerableBlots(boardState, player);
  
  if (blots.length === 0) {
    return '';
  }
  
  if (vulnerableBlots.length === 0) {
    return `ℹ️ You have ${blots.length} blot(s) but none are vulnerable.`;
  }
  
  const riskLevels = vulnerableBlots.map(blot => getBlotRiskLevel(boardState, blot, player));
  const highRiskCount = riskLevels.filter(level => level === 'high').length;
  const mediumRiskCount = riskLevels.filter(level => level === 'medium').length;
  
  if (highRiskCount > 0) {
    return `⚠️ You have ${vulnerableBlots.length} vulnerable blot(s) - ${highRiskCount} at high risk!`;
  } else if (mediumRiskCount > 0) {
    return `⚠️ You have ${vulnerableBlots.length} vulnerable blot(s) - ${mediumRiskCount} at medium risk.`;
  } else {
    return `ℹ️ You have ${vulnerableBlots.length} vulnerable blot(s) at low risk.`;
  }
}

// Gammon detection functions
function hasAllPiecesBorneOff(boardState: ExtendedBoardState, player: PlayerColor): boolean {
  const playerIndex = player === PlayerColor.WHITE ? 0 : 1;
  
  // Check if all pieces are borne off
  const piecesBorneOff = boardState.offBoard[playerIndex];
  const piecesOnBar = boardState.bar[playerIndex];
  const piecesOnBoard = boardState.board.reduce((total, point) => total + point[playerIndex], 0);
  
  // Total pieces should be 15 (standard backgammon)
  const totalPieces = piecesBorneOff + piecesOnBar + piecesOnBoard;
  return totalPieces === 15 && piecesBorneOff === 15;
}

function hasOpponentBorneOffAnyPieces(boardState: ExtendedBoardState, player: PlayerColor): boolean {
  const opponentIndex = player === PlayerColor.WHITE ? 1 : 0;
  return boardState.offBoard[opponentIndex] > 0;
}

function isGammonWin(boardState: ExtendedBoardState, player: PlayerColor): boolean {
  // Player must have borne off all pieces
  if (!hasAllPiecesBorneOff(boardState, player)) {
    return false;
  }
  
  // Opponent must not have borne off any pieces
  return !hasOpponentBorneOffAnyPieces(boardState, player);
}

function isBackgammonWin(boardState: ExtendedBoardState, player: PlayerColor): boolean {
  // Player must have borne off all pieces
  if (!hasAllPiecesBorneOff(boardState, player)) {
    return false;
  }
  
  // Opponent must not have borne off any pieces
  if (hasOpponentBorneOffAnyPieces(boardState, player)) {
    return false;
  }
  
  // Opponent must still have pieces on the bar
  const opponentIndex = player === PlayerColor.WHITE ? 1 : 0;
  return boardState.bar[opponentIndex] > 0;
}

function getWinType(boardState: ExtendedBoardState, player: PlayerColor): 'normal' | 'gammon' | 'backgammon' | null {
  if (!hasAllPiecesBorneOff(boardState, player)) {
    return null;
  }
  
  if (isBackgammonWin(boardState, player)) {
    return 'backgammon';
  }
  
  if (isGammonWin(boardState, player)) {
    return 'gammon';
  }
  
  return 'normal';
}

function getWinMessage(boardState: ExtendedBoardState, player: PlayerColor): string {
  const winType = getWinType(boardState, player);
  
  if (!winType) {
    return '';
  }
  
  const playerName = player === PlayerColor.WHITE ? 'White' : 'Black';
  
  switch (winType) {
    case 'backgammon':
      return `🎉 ${playerName} wins by Backgammon! (3x points)`;
    case 'gammon':
      return `🎉 ${playerName} wins by Gammon! (2x points)`;
    case 'normal':
      return `🎉 ${playerName} wins!`;
    default:
      return '';
  }
}

function calculateWinPoints(boardState: ExtendedBoardState, player: PlayerColor): number {
  const winType = getWinType(boardState, player);
  
  switch (winType) {
    case 'backgammon':
      return 3;
    case 'gammon':
      return 2;
    case 'normal':
      return 1;
    default:
      return 0;
  }
}

function getGameEndState(boardState: ExtendedBoardState): { winner: PlayerColor | null; winType: 'normal' | 'gammon' | 'backgammon' | null; points: number } {
  // Check if white has won
  if (hasAllPiecesBorneOff(boardState, PlayerColor.WHITE)) {
    const winType = getWinType(boardState, PlayerColor.WHITE);
    const points = calculateWinPoints(boardState, PlayerColor.WHITE);
    return { winner: PlayerColor.WHITE, winType, points };
  }
  
  // Check if black has won
  if (hasAllPiecesBorneOff(boardState, PlayerColor.BLACK)) {
    const winType = getWinType(boardState, PlayerColor.BLACK);
    const points = calculateWinPoints(boardState, PlayerColor.BLACK);
    return { winner: PlayerColor.BLACK, winType, points };
  }
  
  // Game is still ongoing
  return { winner: null, winType: null, points: 0 };
}

// Doubling cube functions
function canOfferDouble(cubeState: DoublingCubeState, turn: PlayerColor, gameState: string): boolean {
  // Can't double if game is over
  if (gameState !== 'playing') {
    return false;
  }
  
  // Can't double if there's already a pending offer
  if (cubeState.pendingOffer) {
    return false;
  }
  
  // Can't double on first roll
  if (cubeState.value === 1 && cubeState.owner === null) {
    return false;
  }
  
  // Can double if cube is centered or player owns the cube
  return cubeState.owner === null || cubeState.owner === turn;
}

function offerDouble(cubeState: DoublingCubeState, offeringPlayer: PlayerColor): DoublingCubeState {
  const newCubeState = cloneDoublingCubeState(cubeState);
  
  // Double the cube value
  newCubeState.value *= 2;
  
  // Set pending offer
  newCubeState.pendingOffer = true;
  newCubeState.offeringPlayer = offeringPlayer;
  
  return newCubeState;
}

function acceptDouble(cubeState: DoublingCubeState, acceptingPlayer: PlayerColor): DoublingCubeState {
  const newCubeState = cloneDoublingCubeState(cubeState);
  
  // Transfer cube ownership to the player who accepted
  newCubeState.owner = acceptingPlayer;
  
  // Clear pending offer
  newCubeState.pendingOffer = false;
  newCubeState.offeringPlayer = null;
  
  return newCubeState;
}

function rejectDouble(cubeState: DoublingCubeState): { cubeState: DoublingCubeState; gameEnded: boolean } {
  const newCubeState = cloneDoublingCubeState(cubeState);
  
  // Clear pending offer
  newCubeState.pendingOffer = false;
  newCubeState.offeringPlayer = null;
  
  // Game ends when double is rejected
  return { cubeState: newCubeState, gameEnded: true };
}

function getDoublingCubeMessage(cubeState: DoublingCubeState, turn: PlayerColor): string {
  if (cubeState.pendingOffer) {
    const offeringPlayerName = cubeState.offeringPlayer === PlayerColor.WHITE ? 'White' : 'Black';
    return `${offeringPlayerName} offers to double to ${cubeState.value}. Accept or reject?`;
  }
  
  if (cubeState.value > 1) {
    const ownerName = cubeState.owner === PlayerColor.WHITE ? 'White' : 'Black';
    return `Cube at ${cubeState.value} (owned by ${ownerName})`;
  }
  
  return 'Cube at 1 (centered)';
}

function calculateFinalPoints(basePoints: number, cubeState: DoublingCubeState): number {
  return basePoints * cubeState.value;
}

function getCubeValueDisplay(cubeState: DoublingCubeState): string {
  return cubeState.value.toString();
}

function isCubeCentered(cubeState: DoublingCubeState): boolean {
  return cubeState.owner === null;
}

function getCubeOwner(cubeState: DoublingCubeState): PlayerColor | null {
  return cubeState.owner;
}

function getNextCubeValue(cubeState: DoublingCubeState): number {
  return cubeState.value * 2;
}

function canBeaver(cubeState: DoublingCubeState): boolean {
  // Beaver is when the cube value is 2 and it's the first double
  return cubeState.value === 2 && cubeState.owner !== null;
}

function beaverDouble(cubeState: DoublingCubeState, beaverPlayer: PlayerColor): DoublingCubeState {
  const newCubeState = cloneDoublingCubeState(cubeState);
  
  // Double the cube value again
  newCubeState.value *= 2;
  
  // Transfer ownership to the beaver player
  newCubeState.owner = beaverPlayer;
  
  return newCubeState;
}

function canRaccoon(cubeState: DoublingCubeState): boolean {
  // Raccoon is when the cube value is 4 and it's the second double
  return cubeState.value === 4 && cubeState.owner !== null;
}

function raccoonDouble(cubeState: DoublingCubeState, raccoonPlayer: PlayerColor): DoublingCubeState {
  const newCubeState = cloneDoublingCubeState(cubeState);
  
  // Double the cube value again
  newCubeState.value *= 2;
  
  // Transfer ownership to the raccoon player
  newCubeState.owner = raccoonPlayer;
  
  return newCubeState;
}

// Game end detection with doubling cube integration
function checkGameEndWithCube(boardState: ExtendedBoardState, cubeState: DoublingCubeState): { 
  gameEnded: boolean; 
  winner: PlayerColor | null; 
  winType: 'normal' | 'gammon' | 'backgammon' | null; 
  basePoints: number; 
  finalPoints: number; 
  message: string 
} {
  const gameEndState = getGameEndState(boardState);
  
  if (gameEndState.winner) {
    const basePoints = gameEndState.points;
    const finalPoints = calculateFinalPoints(basePoints, cubeState);
    const winMessage = getWinMessage(boardState, gameEndState.winner);
    const cubeMessage = cubeState.value > 1 ? ` (Cube: ${cubeState.value}x)` : '';
    
    return {
      gameEnded: true,
      winner: gameEndState.winner,
      winType: gameEndState.winType,
      basePoints,
      finalPoints,
      message: `${winMessage}${cubeMessage} Final score: ${finalPoints} points`
    };
  }
  
  return {
    gameEnded: false,
    winner: null,
    winType: null,
    basePoints: 0,
    finalPoints: 0,
    message: ''
  };
}

function updateCubeCanDouble(cubeState: DoublingCubeState, turn: PlayerColor, gameState: string): DoublingCubeState {
  const newCubeState = cloneDoublingCubeState(cubeState);
  newCubeState.canDouble = canOfferDouble(cubeState, turn, gameState);
  return newCubeState;
}

// Match scoring functions
function isCrawfordGame(matchState: MatchState): boolean {
  // Crawford game occurs when one player is 1 point away from winning
  return (matchState.whiteScore === matchState.matchLength - 1) || 
         (matchState.blackScore === matchState.matchLength - 1);
}

function isPostCrawford(matchState: MatchState): boolean {
  // Post-Crawford occurs after the Crawford game
  return matchState.crawfordGame && 
         (matchState.whiteScore < matchState.matchLength - 1) && 
         (matchState.blackScore < matchState.matchLength - 1);
}

function updateMatchState(matchState: MatchState, gameWinner: PlayerColor, gamePoints: number): MatchState {
  const newMatchState = cloneMatchState(matchState);
  
  // Add points to winner
  if (gameWinner === PlayerColor.WHITE) {
    newMatchState.whiteScore += gamePoints;
  } else {
    newMatchState.blackScore += gamePoints;
  }
  
  // Check if match is won
  if (newMatchState.whiteScore >= newMatchState.matchLength) {
    newMatchState.matchWinner = PlayerColor.WHITE;
  } else if (newMatchState.blackScore >= newMatchState.matchLength) {
    newMatchState.matchWinner = PlayerColor.BLACK;
  }
  
  // Update game number if match continues
  if (!newMatchState.matchWinner) {
    newMatchState.gameNumber++;
  }
  
  // Update Crawford game status
  newMatchState.crawfordGame = isCrawfordGame(newMatchState);
  newMatchState.postCrawford = isPostCrawford(newMatchState);
  
  return newMatchState;
}

function canDoubleInMatch(matchState: MatchState, cubeState: DoublingCubeState, turn: PlayerColor, gameState: string): boolean {
  // Can't double if game is not playing
  if (gameState !== 'playing') {
    return false;
  }
  
  // Can't double if there's already a pending offer
  if (cubeState.pendingOffer) {
    return false;
  }
  
  // Can't double on first roll
  if (cubeState.value === 1 && cubeState.owner === null) {
    return false;
  }
  
  // Can double if cube is centered or player owns the cube
  const canDouble = cubeState.owner === null || cubeState.owner === turn;
  
  // In match play, doubling is always allowed unless it's the Crawford game
  if (matchState.isMatchPlay && matchState.crawfordGame) {
    return false; // No doubling in Crawford game
  }
  
  return canDouble;
}

function getMatchScoreDisplay(matchState: MatchState): string {
  if (!matchState.isMatchPlay) {
    return 'Single Game';
  }
  
  const matchLengthText = `Match to ${matchState.matchLength}`;
  const scoreText = `White ${matchState.whiteScore} - ${matchState.blackScore} Black`;
  const gameText = `Game ${matchState.gameNumber}`;
  
  let statusText = '';
  if (matchState.matchWinner) {
    statusText = ` - ${matchState.matchWinner === PlayerColor.WHITE ? 'White' : 'Black'} wins match!`;
  } else if (matchState.crawfordGame) {
    statusText = ' - Crawford Game (no doubling)';
  } else if (matchState.postCrawford) {
    statusText = ' - Post-Crawford';
  }
  
  return `${matchLengthText} | ${scoreText} | ${gameText}${statusText}`;
}

function getMatchLengthOptions(): { value: number; label: string }[] {
  return [
    { value: MatchLength.POINT_1, label: '1 Point' },
    { value: MatchLength.POINT_3, label: '3 Points' },
    { value: MatchLength.POINT_5, label: '5 Points' },
    { value: MatchLength.POINT_7, label: '7 Points' },
    { value: MatchLength.POINT_9, label: '9 Points' },
    { value: MatchLength.POINT_11, label: '11 Points' },
    { value: MatchLength.POINT_13, label: '13 Points' },
    { value: MatchLength.POINT_15, label: '15 Points' },
    { value: MatchLength.POINT_17, label: '17 Points' },
    { value: MatchLength.POINT_19, label: '19 Points' },
    { value: MatchLength.POINT_21, label: '21 Points' },
    { value: MatchLength.POINT_23, label: '23 Points' },
    { value: MatchLength.POINT_25, label: '25 Points' },
  ];
}

function calculateMatchPoints(gamePoints: number, matchState: MatchState): number {
  // In match play, points are capped at what's needed to win
  if (!matchState.isMatchPlay) {
    return gamePoints;
  }
  
  // Calculate how many points each player needs to win
  const whiteNeeds = matchState.matchLength - matchState.whiteScore;
  const blackNeeds = matchState.matchLength - matchState.blackScore;
  
  // Return the minimum of game points and what's needed to win
  return Math.min(gamePoints, Math.max(whiteNeeds, blackNeeds));
}

function getMatchStatusMessage(matchState: MatchState, gameWinner: PlayerColor | null, gamePoints: number): string {
  if (!matchState.isMatchPlay) {
    return 'Single game mode';
  }
  
  if (matchState.matchWinner) {
    return `${matchState.matchWinner === PlayerColor.WHITE ? 'White' : 'Black'} wins the match ${matchState.whiteScore}-${matchState.blackScore}!`;
  }
  
  if (gameWinner) {
    const matchPoints = calculateMatchPoints(gamePoints, matchState);
    const winnerName = gameWinner === PlayerColor.WHITE ? 'White' : 'Black';
    const newWhiteScore = gameWinner === PlayerColor.WHITE ? matchState.whiteScore + matchPoints : matchState.whiteScore;
    const newBlackScore = gameWinner === PlayerColor.BLACK ? matchState.blackScore + matchPoints : matchState.blackScore;
    
    return `${winnerName} wins ${matchPoints} point${matchPoints > 1 ? 's' : ''}. Match score: ${newWhiteScore}-${newBlackScore}`;
  }
  
  if (matchState.crawfordGame) {
    return 'Crawford Game - No doubling allowed';
  }
  
  if (matchState.postCrawford) {
    return 'Post-Crawford phase - Doubling allowed';
  }
  
  return `Match to ${matchState.matchLength} points`;
}

function resetMatch(matchLength: number = MatchLength.POINT_7): MatchState {
  return initialMatchState(matchLength);
}

function isMatchComplete(matchState: MatchState): boolean {
  return matchState.matchWinner !== null;
}

function getLeader(matchState: MatchState): PlayerColor | null {
  if (matchState.whiteScore > matchState.blackScore) {
    return PlayerColor.WHITE;
  } else if (matchState.blackScore > matchState.whiteScore) {
    return PlayerColor.BLACK;
  }
  return null; // Tie
}

function getMatchProgress(matchState: MatchState): { whiteProgress: number; blackProgress: number } {
  const whiteProgress = (matchState.whiteScore / matchState.matchLength) * 100;
  const blackProgress = (matchState.blackScore / matchState.matchLength) * 100;
  return { whiteProgress, blackProgress };
}

// Higher die first rule functions
function canUseBothDice(boardState: ExtendedBoardState, turn: PlayerColor, dice: Dice): boolean {
  if (dice.length < 2) return true; // Can't use both if only one die
  
  const [die1, die2] = dice;
  const higherDie = Math.max(die1, die2);
  const lowerDie = Math.min(die1, die2);
  
  // Check if both dice can be used
  const movesWithHigherDie = getValidMovesForDie(boardState, turn, higherDie);
  const movesWithLowerDie = getValidMovesForDie(boardState, turn, lowerDie);
  
  // If player has pieces on bar, check bar re-entry for both dice
  if (hasPiecesOnBar(boardState, turn)) {
    const barReentryHigher = getBarReentryMoves(boardState, turn, [higherDie], []);
    const barReentryLower = getBarReentryMoves(boardState, turn, [lowerDie], []);
    
    // Can use both if can re-enter with both dice
    return barReentryHigher.length > 0 && barReentryLower.length > 0;
  }
  
  // If bearing off, check bearing off for both dice
  if (canBearOff(boardState, turn)) {
    const bearingOffHigher = getBearingOffMoves(boardState, turn, [higherDie], []);
    const bearingOffLower = getBearingOffMoves(boardState, turn, [lowerDie], []);
    
    // Can use both if can bear off with both dice
    return bearingOffHigher.length > 0 && bearingOffLower.length > 0;
  }
  
  // Regular moves - check if both dice can be used
  return movesWithHigherDie.length > 0 && movesWithLowerDie.length > 0;
}

function getValidMovesForDie(boardState: ExtendedBoardState, turn: PlayerColor, die: number): [number, number][] {
  const moves: [number, number][] = [];
  
  // Check bar re-entry moves
  if (hasPiecesOnBar(boardState, turn)) {
    const barReentryMoves = getBarReentryMoves(boardState, turn, [die], []);
    moves.push(...barReentryMoves);
    return moves;
  }
  
  // Check bearing off moves
  if (canBearOff(boardState, turn)) {
    const bearingOffMoves = getBearingOffMoves(boardState, turn, [die], []);
    moves.push(...bearingOffMoves);
    return moves;
  }
  
  // Check regular moves
  for (let from = 0; from < BOARD_SIZE; from++) {
    const to = turn === PlayerColor.WHITE ? from + die : from - die;
    
    if (to >= 0 && to < BOARD_SIZE) {
      const fromPoint = boardState.board[from];
      const toPoint = boardState.board[to];
      
      // Check if player has pieces at from point
      const playerIndex = turn === PlayerColor.WHITE ? 0 : 1;
      if (fromPoint[playerIndex] > 0) {
        // Check if destination is valid
        const opponentIndex = turn === PlayerColor.WHITE ? 1 : 0;
        if (toPoint[opponentIndex] <= 1) {
          moves.push([from, to]);
        }
      }
    }
  }
  
  return moves;
}

function validateHigherDieFirst(boardState: ExtendedBoardState, turn: PlayerColor, dice: Dice, usedDice: number[], move: [number, number]): boolean {
  if (dice.length < 2) return true; // Only one die, no rule applies
  if (usedDice.length > 0) return true; // Already used a die, rule doesn't apply
  
  const [die1, die2] = dice;
  const higherDie = Math.max(die1, die2);
  const lowerDie = Math.min(die1, die2);
  
  // Calculate which die this move uses
  const [from, to] = move;
  let usedDie: number;
  
  if (from === BAR_WHITE) { // Bar re-entry
    usedDie = turn === PlayerColor.WHITE ? 24 - to : to + 1;
  } else if (to === 24 || to === -1) { // Bearing off
    usedDie = turn === PlayerColor.WHITE ? 24 - from : from - (-1);
  } else { // Regular move
    usedDie = turn === PlayerColor.WHITE ? to - from : from - to;
  }
  
  // If using lower die, check if higher die can be used
  if (usedDie === lowerDie) {
    const movesWithHigherDie = getValidMovesForDie(boardState, turn, higherDie);
    if (movesWithHigherDie.length > 0) {
      return false; // Must use higher die first
    }
  }
  
  return true;
}

function enforceHigherDieFirst(boardState: ExtendedBoardState, turn: PlayerColor, dice: Dice, usedDice: number[]): [number, number][] {
  const moves: [number, number][] = [];
  const availableDice = dice.filter(d => !usedDice.includes(d));
  
  if (availableDice.length < 2) {
    // Only one die available, return all valid moves
    return getValidMoves(boardState, turn, dice, usedDice);
  }
  
  const [die1, die2] = availableDice;
  const higherDie = Math.max(die1, die2);
  const lowerDie = Math.min(die1, die2);
  
  // Check if both dice can be used
  if (canUseBothDice(boardState, turn, availableDice)) {
    // Both dice can be used, return all valid moves
    return getValidMoves(boardState, turn, dice, usedDice);
  }
  
  // Only one die can be used, must use higher die first if possible
  const movesWithHigherDie = getValidMovesForDie(boardState, turn, higherDie);
  const movesWithLowerDie = getValidMovesForDie(boardState, turn, lowerDie);
  
  if (movesWithHigherDie.length > 0) {
    // Higher die can be used, must use it
    return movesWithHigherDie;
  } else if (movesWithLowerDie.length > 0) {
    // Only lower die can be used
    return movesWithLowerDie;
  }
  
  return moves;
}

function getHigherDieFirstMessage(boardState: ExtendedBoardState, turn: PlayerColor, dice: Dice, usedDice: number[]): string {
  const availableDice = dice.filter(d => !usedDice.includes(d));
  
  if (availableDice.length < 2) return '';
  
  const [die1, die2] = availableDice;
  const higherDie = Math.max(die1, die2);
  const lowerDie = Math.min(die1, die2);
  
  if (canUseBothDice(boardState, turn, availableDice)) {
    return '';
  }
  
  const movesWithHigherDie = getValidMovesForDie(boardState, turn, higherDie);
  const movesWithLowerDie = getValidMovesForDie(boardState, turn, lowerDie);
  
  if (movesWithHigherDie.length > 0) {
    return `⚠️ Must use higher die (${higherDie}) first! Both dice cannot be used.`;
  } else if (movesWithLowerDie.length > 0) {
    return `ℹ️ Only lower die (${lowerDie}) can be used. Higher die (${higherDie}) has no valid moves.`;
  }
  
  return '';
}

// Enhanced home board/outer board functions
function isInHomeBoard(point: number, player: PlayerColor): boolean {
  const homeRange = player === PlayerColor.WHITE ? BOARD_REGIONS.WHITE_HOME : BOARD_REGIONS.BLACK_HOME;
  return point >= homeRange[0] && point <= homeRange[1];
}

function isInOuterBoard(point: number): boolean {
  return point >= BOARD_REGIONS.OUTER_BOARD[0] && point <= BOARD_REGIONS.OUTER_BOARD[1];
}

function getHomeBoardRange(player: PlayerColor): [number, number] {
  return player === PlayerColor.WHITE ? BOARD_REGIONS.WHITE_HOME : BOARD_REGIONS.BLACK_HOME;
}

function getOuterBoardRange(): [number, number] {
  return BOARD_REGIONS.OUTER_BOARD;
}

function isPointInRegion(point: number, region: [number, number]): boolean {
  return point >= region[0] && point <= region[1];
}

function getBoardRegion(point: number): 'whiteHome' | 'blackHome' | 'outerBoard' | 'invalid' {
  if (isInHomeBoard(point, PlayerColor.WHITE)) return 'whiteHome';
  if (isInHomeBoard(point, PlayerColor.BLACK)) return 'blackHome';
  if (isInOuterBoard(point)) return 'outerBoard';
  return 'invalid';
}

function validateMoveByRegion(boardState: ExtendedBoardState, from: number, to: number, player: PlayerColor, die: number): boolean {
  // Basic validation
  if (from < 0 || from >= BOARD_SIZE || to < 0 || to >= BOARD_SIZE) {
    return false;
  }
  
  // Check if move distance matches die value
  const distance = Math.abs(to - from);
  if (distance !== die) {
    return false;
  }
  
  // Check direction (white moves forward, black moves backward)
  const direction = player === PlayerColor.WHITE ? 1 : -1;
  const expectedDirection = to - from;
  if (Math.sign(expectedDirection) !== direction) {
    return false;
  }
  
  // Check if destination is blocked by opponent
  const opponentIndex = player === PlayerColor.WHITE ? 1 : 0;
  if (boardState.board[to][opponentIndex] > 1) {
    return false; // Blocked by opponent
  }
  
  return true;
}

function canMoveFromRegion(boardState: ExtendedBoardState, from: number, player: PlayerColor): boolean {
  if (from < 0 || from >= BOARD_SIZE) return false;
  
  const playerIndex = player === PlayerColor.WHITE ? 0 : 1;
  return boardState.board[from][playerIndex] > 0;
}

function canMoveToRegion(boardState: ExtendedBoardState, to: number, player: PlayerColor): boolean {
  if (to < 0 || to >= BOARD_SIZE) return false;
  
  const opponentIndex = player === PlayerColor.WHITE ? 1 : 0;
  const playerIndex = player === PlayerColor.WHITE ? 0 : 1;
  
  // Can move to empty point
  if (boardState.board[to][0] === 0 && boardState.board[to][1] === 0) {
    return true;
  }
  
  // Can hit opponent blot
  if (boardState.board[to][opponentIndex] === 1 && boardState.board[to][playerIndex] === 0) {
    return true;
  }
  
  // Can move to own point
  if (boardState.board[to][playerIndex] > 0 && boardState.board[to][opponentIndex] === 0) {
    return true;
  }
  
  return false;
}

function getValidMovesFromRegion(boardState: ExtendedBoardState, from: number, player: PlayerColor, die: number): number[] {
  if (!canMoveFromRegion(boardState, from, player)) {
    return [];
  }
  
  const direction = player === PlayerColor.WHITE ? 1 : -1;
  const to = from + (die * direction);
  
  if (to < 0 || to >= BOARD_SIZE) {
    return []; // Move would go off board
  }
  
  if (canMoveToRegion(boardState, to, player)) {
    return [to];
  }
  
  return [];
}

function getRegionStatus(boardState: ExtendedBoardState, player: PlayerColor): {
  homeBoardPieces: number;
  outerBoardPieces: number;
  homeBoardPoints: number[];
  outerBoardPoints: number[];
  canBearOff: boolean;
  regionMessage: string;
} {
  const homeRange = getHomeBoardRange(player);
  const outerRange = getOuterBoardRange();
  const playerIndex = player === PlayerColor.WHITE ? 0 : 1;
  
  let homeBoardPieces = 0;
  let outerBoardPieces = 0;
  const homeBoardPoints: number[] = [];
  const outerBoardPoints: number[] = [];
  
  // Count pieces in each region
  for (let i = 0; i < BOARD_SIZE; i++) {
    const pieceCount = boardState.board[i][playerIndex];
    if (pieceCount > 0) {
      if (isInHomeBoard(i, player)) {
        homeBoardPieces += pieceCount;
        homeBoardPoints.push(i);
      } else if (isInOuterBoard(i)) {
        outerBoardPieces += pieceCount;
        outerBoardPoints.push(i);
      }
    }
  }
  
  const canBearOff = homeBoardPieces === 15 && outerBoardPieces === 0;
  
  let regionMessage = '';
  if (canBearOff) {
    regionMessage = `${player === PlayerColor.WHITE ? 'White' : 'Black'} can bear off pieces`;
  } else if (outerBoardPieces > 0) {
    regionMessage = `${player === PlayerColor.WHITE ? 'White' : 'Black'} has ${outerBoardPieces} pieces in outer board`;
  } else {
    regionMessage = `${player === PlayerColor.WHITE ? 'White' : 'Black'} has all pieces in home board`;
  }
  
  return {
    homeBoardPieces,
    outerBoardPieces,
    homeBoardPoints,
    outerBoardPoints,
    canBearOff,
    regionMessage,
  };
}

function validateBearingOffByRegion(boardState: ExtendedBoardState, from: number, player: PlayerColor, die: number): boolean {
  const regionStatus = getRegionStatus(boardState, player);
  
  if (!regionStatus.canBearOff) {
    return false; // Can't bear off if not all pieces are in home board
  }
  
  if (!isInHomeBoard(from, player)) {
    return false; // Can only bear off from home board
  }
  
  const playerIndex = player === PlayerColor.WHITE ? 0 : 1;
  if (boardState.board[from][playerIndex] === 0) {
    return false; // No pieces at source point
  }
  
  // Check if exact die roll is needed
  const homeRange = getHomeBoardRange(player);
  const exactPosition = player === PlayerColor.WHITE ? 
    homeRange[1] - die + 1 : // White: 23 - die + 1
    homeRange[0] + die - 1;  // Black: 0 + die - 1
  
  if (from !== exactPosition) {
    // Check if there are pieces on higher numbered points
    for (let i = from + (player === PlayerColor.WHITE ? 1 : -1); 
         player === PlayerColor.WHITE ? i <= homeRange[1] : i >= homeRange[0]; 
         i += (player === PlayerColor.WHITE ? 1 : -1)) {
      if (boardState.board[i][playerIndex] > 0) {
        return false; // Must bear off from highest point first
      }
    }
  }
  
  return true;
}

function getBearingOffMovesByRegion(boardState: ExtendedBoardState, player: PlayerColor, dice: Dice, usedDice: number[]): [number, number][] {
  const regionStatus = getRegionStatus(boardState, player);
  
  if (!regionStatus.canBearOff) {
    return [];
  }
  
  const moves: [number, number][] = [];
  const playerIndex = player === PlayerColor.WHITE ? 0 : 1;
  const homeRange = getHomeBoardRange(player);
  
  dice.forEach(die => {
    if (usedDice.includes(die)) return;
    
    const exactPosition = player === PlayerColor.WHITE ? 
      homeRange[1] - die + 1 : // White: 23 - die + 1
      homeRange[0] + die - 1;  // Black: 0 + die - 1
    
    // Check exact position first
    if (exactPosition >= 0 && exactPosition < BOARD_SIZE && 
        boardState.board[exactPosition][playerIndex] > 0) {
      moves.push([exactPosition, OFF_WHITE]);
      return;
    }
    
    // Check for highest point with pieces
    for (let i = player === PlayerColor.WHITE ? homeRange[1] : homeRange[0];
         player === PlayerColor.WHITE ? i >= homeRange[0] : i <= homeRange[1];
         i += (player === PlayerColor.WHITE ? -1 : 1)) {
      if (boardState.board[i][playerIndex] > 0) {
        moves.push([i, OFF_WHITE]);
        break;
      }
    }
  });
  
  return moves;
}

function getRegionBasedValidMoves(boardState: ExtendedBoardState, turn: PlayerColor, dice: Dice, usedDice: number[]): [number, number][] {
  const moves: [number, number][] = [];
  const playerIndex = turn === PlayerColor.WHITE ? 0 : 1;
  
  // Check for bar re-entry first
  if (boardState.bar[playerIndex] > 0) {
    return getBarReentryMoves(boardState, turn, dice, usedDice);
  }
  
  // Check for bearing off
  const regionStatus = getRegionStatus(boardState, turn);
  if (regionStatus.canBearOff) {
    moves.push(...getBearingOffMovesByRegion(boardState, turn, dice, usedDice));
  }
  
  // Regular moves
  for (let from = 0; from < BOARD_SIZE; from++) {
    if (boardState.board[from][playerIndex] === 0) continue;
    
    dice.forEach(die => {
      if (usedDice.includes(die)) return;
      
      const direction = turn === PlayerColor.WHITE ? 1 : -1;
      const to = from + (die * direction);
      
      if (to >= 0 && to < BOARD_SIZE && canMoveToRegion(boardState, to, turn)) {
        moves.push([from, to]);
      }
    });
  }
  
  return moves;
}

function getRegionDisplayInfo(point: number): {
  region: string;
  color: string;
  label: string;
} {
  const region = getBoardRegion(point);
  
  switch (region) {
    case 'whiteHome':
      return {
        region: 'White Home Board',
        color: '#f0f8ff', // Light blue
        label: `W${point + 1}`,
      };
    case 'blackHome':
      return {
        region: 'Black Home Board',
        color: '#fff8f0', // Light orange
        label: `B${24 - point}`,
      };
    case 'outerBoard':
      return {
        region: 'Outer Board',
        color: '#f8f8f8', // Light gray
        label: `${point + 1}`,
      };
    default:
      return {
        region: 'Invalid',
        color: '#ff0000',
        label: 'X',
      };
  }
}

// Enhanced board representation functions
function getBoardPointRepresentation(boardState: ExtendedBoardState, pointIndex: number): Point {
  if (pointIndex >= 0 && pointIndex < BOARD_SIZE) {
    return boardState.board[pointIndex];
  }
  
  // Handle special areas
  switch (pointIndex) {
    case BAR_WHITE:
      return [boardState.bar[0], boardState.bar[1]]; // [white on bar, black on bar]
    case BAR_BLACK:
      return [boardState.bar[0], boardState.bar[1]]; // Same as BAR_WHITE for consistency
    case OFF_WHITE:
      return [boardState.offBoard[0], 0]; // White pieces borne off
    case OFF_BLACK:
      return [0, boardState.offBoard[1]]; // Black pieces borne off
    default:
      return [0, 0];
  }
}

function isBarPoint(pointIndex: number): boolean {
  return pointIndex === BAR_WHITE || pointIndex === BAR_BLACK;
}

function isOffBoardPoint(pointIndex: number): boolean {
  return pointIndex === OFF_WHITE || pointIndex === OFF_BLACK;
}

function isSpecialPoint(pointIndex: number): boolean {
  return isBarPoint(pointIndex) || isOffBoardPoint(pointIndex);
}

function getPointLabel(pointIndex: number): string {
  if (pointIndex >= 0 && pointIndex < BOARD_SIZE) {
    return `${pointIndex + 1}`;
  }
  
  switch (pointIndex) {
    case BAR_WHITE:
    case BAR_BLACK:
      return 'Bar';
    case OFF_WHITE:
      return 'White Off';
    case OFF_BLACK:
      return 'Black Off';
    default:
      return '';
  }
}

function getPointStyle(pointIndex: number): { background: string; border: string; cursor: string } {
  if (isBarPoint(pointIndex)) {
    return {
      background: '#8B0000',
      border: '2px solid #660000',
      cursor: 'pointer'
    };
  }
  
  if (isOffBoardPoint(pointIndex)) {
    if (pointIndex === OFF_WHITE) {
      return {
        background: '#f0f0f0',
        border: '2px solid #ccc',
        cursor: 'pointer'
      };
    } else {
      return {
        background: '#333',
        border: '2px solid #666',
        cursor: 'pointer'
      };
    }
  }
  
  // Regular board points
  return {
    background: '#DEB887',
    border: '1px solid #666',
    cursor: 'pointer'
  };
}

function canClickPoint(boardState: ExtendedBoardState, pointIndex: number, turn: PlayerColor): boolean {
  if (isBarPoint(pointIndex)) {
    return hasPiecesOnBar(boardState, turn);
  }
  
  if (isOffBoardPoint(pointIndex)) {
    return canBearOff(boardState, turn);
  }
  
  // Regular board points
  const point = boardState.board[pointIndex];
  const playerIndex = turn === PlayerColor.WHITE ? 0 : 1;
  return point[playerIndex] > 0;
}

// ... existing code ...

interface GameStats {
  wins: number;
  losses: number;
  totalGames: number;
}

function loadStats(): GameStats {
  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem('backgammonStats');
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {}
    }
  }
  return { wins: 0, losses: 0, totalGames: 0 };
}

function saveStats(stats: GameStats) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('backgammonStats', JSON.stringify(stats));
  }
}

function saveGameState(state: any) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('backgammonGameState', JSON.stringify({
      board: state.board,
      turn: state.turn,
      gameState: state.gameState,
      dice: state.dice,
      usedDice: state.usedDice,
      history: state.history,
      historyIndex: state.historyIndex,
      botDifficulty: state.botDifficulty,
      gameMode: state.gameMode,
    }));
  }
}

function loadGameState(): any {
  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem('backgammonGameState');
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {}
    }
  }
  return null;
}

function rollDice(): Dice {
  const die1 = Math.floor(Math.random() * 6) + 1;
  const die2 = Math.floor(Math.random() * 6) + 1;
  return die1 === die2 ? [die1, die1, die1, die1] : [die1, die2];
}

function isAllPiecesInHomeBoard(boardState: ExtendedBoardState, player: PlayerColor): boolean {
  const playerIndex = player === PlayerColor.WHITE ? 0 : 1;
  const homeStart = player === PlayerColor.WHITE ? 18 : 0;
  const homeEnd = player === PlayerColor.WHITE ? 23 : 5;
  
  // Check if any pieces are outside the home board
  for (let i = 0; i < BOARD_SIZE; i++) {
    if (i < homeStart || i > homeEnd) {
      if (boardState.board[i][playerIndex] > 0) {
        return false;
      }
    }
  }
  
  // Also check if any pieces are on bar
  if (boardState.bar[playerIndex] > 0) {
    return false;
  }
  
  return true;
}

function canBearOff(boardState: ExtendedBoardState, player: PlayerColor): boolean {
  return isAllPiecesInHomeBoard(boardState, player);
}

function getBearingOffMoves(boardState: ExtendedBoardState, player: PlayerColor, dice: Dice, usedDice: number[]): [number, number][] {
  // Use the new region-based bearing off move generation
  return getBearingOffMovesByRegion(boardState, player, dice, usedDice);
}

function validateBearingOffMove(boardState: ExtendedBoardState, from: number, to: number, player: PlayerColor, die: number): boolean {
  // Use the new region-based bearing off validation (ignore 'to' parameter for now)
  return validateBearingOffByRegion(boardState, from, player, die);
}

function executeBearingOffMove(boardState: ExtendedBoardState, from: number, to: number, player: PlayerColor): ExtendedBoardState {
  const newBoardState = cloneExtendedBoardState(boardState);
  const playerIndex = player === PlayerColor.WHITE ? 0 : 1;
  
  // Remove piece from the board
  newBoardState.board[from][playerIndex]--;
  
  // Add piece to off-board
  newBoardState.offBoard[playerIndex]++;
  
  return newBoardState;
}

function getValidMoves(boardState: ExtendedBoardState, turn: PlayerColor, dice: Dice, usedDice: number[]): [number, number][] {
  const availableDice = dice.filter(d => !usedDice.includes(d));
  
  // Apply higher die first rule if both dice cannot be used
  if (availableDice.length >= 2 && !canUseBothDice(boardState, turn, availableDice)) {
    return enforceHigherDieFirst(boardState, turn, dice, usedDice);
  }
  
  // Use the new region-based move generation
  return getRegionBasedValidMoves(boardState, turn, dice, usedDice);
}

function makeBotMove(boardState: ExtendedBoardState, turn: PlayerColor, dice: Dice, usedDice: number[], difficulty: BotDifficulty): [number, number] | null {
  const validMoves = getValidMoves(boardState, turn, dice, usedDice);
  if (validMoves.length === 0) return null;
  
  switch (difficulty) {
    case BotDifficulty.EASY:
      // Random move
      return validMoves[Math.floor(Math.random() * validMoves.length)];
      
    case BotDifficulty.MEDIUM:
      // Sometimes random, sometimes strategic
      if (Math.random() < 0.4) {
        return validMoves[Math.floor(Math.random() * validMoves.length)];
      }
      // Fall through to strategic logic
      
    case BotDifficulty.HARD:
      // Strategic move - prefer moves that capture, protect, bear off, or re-enter from bar
      let bestMove = validMoves[0];
      let bestScore = -Infinity;
      
      for (const [from, to] of validMoves) {
        const testBoardState = cloneExtendedBoardState(boardState);
        const playerIndex = turn === PlayerColor.WHITE ? 0 : 1;
        const opponentIndex = turn === PlayerColor.WHITE ? 1 : 0;
        
        // Check if this is a bearing off move
        const isBearingOff = (turn === PlayerColor.WHITE && to === 24) || (turn === PlayerColor.BLACK && to === -1);
        
        // Check if this is a bar re-entry move
        const isBarReentry = from === BAR_WHITE;
        
        if (isBearingOff) {
          // Execute bearing off move
          testBoardState.board[from][playerIndex]--;
          testBoardState.offBoard[playerIndex]++;
        } else if (isBarReentry) {
          // Execute bar re-entry move
          testBoardState.bar[playerIndex]--;
          testBoardState.board[to][playerIndex]++;
          
          // Handle capture if opponent has exactly 1 piece
          if (testBoardState.board[to][opponentIndex] === 1) {
            testBoardState.board[to][opponentIndex] = 0;
            testBoardState.bar[opponentIndex]++;
          }
        } else {
          // Regular move
          testBoardState.board[from][playerIndex]--;
          testBoardState.board[to][playerIndex]++;
          
          // If capturing opponent piece
          if (testBoardState.board[to][opponentIndex] === 1) {
            testBoardState.board[to][opponentIndex] = 0;
            testBoardState.bar[opponentIndex]++;
          }
        }
        
        // Score the position
        let score = 0;
        
        // Bonus for bearing off
        if (isBearingOff) {
          score += 100; // High priority for bearing off
        }
        
        // Bonus for bar re-entry
        if (isBarReentry) {
          score += 80; // High priority for re-entering from bar
        }
        
        // Regular positional scoring
        for (let i = 0; i < BOARD_SIZE; i++) {
          score += testBoardState.board[i][playerIndex] * (turn === PlayerColor.WHITE ? i : (23 - i));
        }
        
        // Penalty for having pieces on bar
        score -= testBoardState.bar[playerIndex] * 50;
        
        // Bonus for being close to bearing off
        if (canBearOff(testBoardState, turn)) {
          score += 50;
        }
        
        if (score > bestScore) {
          bestScore = score;
          bestMove = [from, to];
        }
      }
      
      return bestMove;
  }
  
  return validMoves[0];
}

interface BackgammonState {
  boardState: ExtendedBoardState;
  turn: PlayerColor;
  message: string;
  gameState: string;
  history: ExtendedBoardState[];
  historyIndex: number;
  stats: GameStats;
  botDifficulty: BotDifficulty;
  gameMode: GameMode;
  dice: number[];
  usedDice: number[];
  doublingCube: DoublingCubeState;
  matchState: MatchState;
  setBoardState: (b: ExtendedBoardState) => void;
  setTurn: (t: PlayerColor) => void;
  setMessage: (m: string) => void;
  setGameState: (s: string) => void;
  setDice: (d: number[]) => void;
  setUsedDice: (d: number[]) => void;
  setDoublingCube: (cube: DoublingCubeState) => void;
  setMatchState: (match: MatchState) => void;
  resetGame: () => void;
  pushHistory: (b: ExtendedBoardState) => void;
  stepHistory: (dir: 1 | -1) => void;
  updateStats: (result: 'win' | 'loss') => void;
  resetStats: () => void;
  setBotDifficulty: (difficulty: BotDifficulty) => void;
  setGameMode: (mode: GameMode) => void;
  saveGame: () => void;
  loadGame: () => void;
  hasSavedGame: () => boolean;
  rollDice: () => void;
  offerDouble: () => void;
  acceptDouble: () => void;
  rejectDouble: () => void;
  beaverDouble: () => void;
  raccoonDouble: () => void;
  makeMove: (from: number, to: number) => void;
  startNewMatch: (matchLength: number) => void;
  endMatch: () => void;
}

// Export functions for use in components
export { 
  canBearOff, 
  isAllPiecesInHomeBoard, 
  getBearingOffMoves, 
  validateBearingOffMove, 
  executeBearingOffMove,
  hasPiecesOnBar,
  canReenterFromBar,
  getBarReentryMoves,
  validateBarReentryMove,
  executeBarReentryMove,
  hitPiece,
  isBlot,
  canHitBlot,
  canUseBothDice,
  getValidMovesForDie,
  validateHigherDieFirst,
  enforceHigherDieFirst,
  getHigherDieFirstMessage,
  getBoardPointRepresentation,
  isBarPoint,
  isOffBoardPoint,
  isSpecialPoint,
  getPointLabel,
  getPointStyle,
  canClickPoint,
  getAllBlots,
  getBlotCount,
  isPointVulnerable,
  getVulnerableBlots,
  getBlotRiskLevel,
  getBlotProtectionMoves,
  getBlotAttackMoves,
  getBlotStrategicValue,
  getBlotStatusMessage,
  hasAllPiecesBorneOff,
  hasOpponentBorneOffAnyPieces,
  isGammonWin,
  isBackgammonWin,
  getWinType,
  getWinMessage,
  calculateWinPoints,
  getGameEndState,
  canOfferDouble,
  offerDouble,
  acceptDouble,
  rejectDouble,
  getDoublingCubeMessage,
  calculateFinalPoints,
  getCubeValueDisplay,
  isCubeCentered,
  getCubeOwner,
  getNextCubeValue,
  canBeaver,
  beaverDouble,
  canRaccoon,
  raccoonDouble,
  checkGameEndWithCube,
  updateCubeCanDouble,
  isCrawfordGame,
  isPostCrawford,
  updateMatchState,
  canDoubleInMatch,
  getMatchScoreDisplay,
  getMatchLengthOptions,
  calculateMatchPoints,
  getMatchStatusMessage,
  resetMatch,
  isMatchComplete,
  getLeader,
  getMatchProgress,
  initialExtendedBoardState,
  initialDoublingCubeState,
  initialMatchState,
  initialEnhancedBoardState,
  cloneDoublingCubeState,
  cloneMatchState,
  cloneEnhancedBoardState,
  createPiece,
  generateInitialPieces,
  getPiecesAtPosition,
  getPiecesByPlayer,
  getPiecesByState,
  movePiece,
  updateBlotStates,
  synchronizeBoardFromPieces,
  synchronizeBarFromPieces,
  synchronizeOffBoardFromPieces,
  getPieceById,
  getPiecesInHomeBoard,
  getPiecesInOuterBoard,
  getPieceMovementHistory,
  getMostActivePieces,
  getLeastActivePieces,
  getPiecesNotMovedThisTurn,
  // New region-based functions
  isInHomeBoard,
  isInOuterBoard,
  getHomeBoardRange,
  getOuterBoardRange,
  isPointInRegion,
  getBoardRegion,
  validateMoveByRegion,
  canMoveFromRegion,
  canMoveToRegion,
  getValidMovesFromRegion,
  getRegionStatus,
  validateBearingOffByRegion,
  getBearingOffMovesByRegion,
  getRegionBasedValidMoves,
  getRegionDisplayInfo,
  // Enhanced bar and off-board tracking functions
  getBarStatus,
  getOffBoardStatus,
  addPieceToBar,
  removePieceFromBar,
  addPieceToOffBoard,
  removePieceFromOffBoard,
  getBarReentryOptions,
  validateBarAndOffBoardState,
  synchronizeBarAndOffBoardWithBoard,
  getBarAndOffBoardDisplayInfo,
  getBarAndOffBoardSummary,
  canMoveFromBarOrOffBoard,
  getBarAndOffBoardMoveValidation
};

export const useBackgammonStore = create<BackgammonState>((set, get) => {
  const savedState = loadGameState();
  const initialState = savedState || {
    boardState: initialExtendedBoardState(),
    turn: PlayerColor.WHITE,
    gameState: 'playing',
    dice: [],
    usedDice: [],
    history: [initialExtendedBoardState()],
    historyIndex: 0,
    botDifficulty: BotDifficulty.MEDIUM,
    gameMode: GameMode.HUMAN_VS_BOT,
  };

  return {
    boardState: initialState.boardState,
    turn: initialState.turn,
    message: initialState.gameState === 'playing' ? 'White to roll' : 'Game Over',
    gameState: initialState.gameState,
    dice: initialState.dice,
    usedDice: initialState.usedDice,
    history: initialState.history,
    historyIndex: initialState.historyIndex,
    stats: typeof window !== 'undefined' ? loadStats() : { wins: 0, losses: 0, totalGames: 0 },
    botDifficulty: initialState.botDifficulty,
    gameMode: initialState.gameMode,
    doublingCube: initialDoublingCubeState(), // Initialize doubling cube state
    matchState: initialMatchState(), // Initialize match state
    setBoardState: (b) => set({ boardState: b }),
    setTurn: (t) => set({ turn: t }),
    setMessage: (m) => set({ message: m }),
    setGameState: (s) => set({ gameState: s }),
    setDice: (d) => set({ dice: d }),
    setUsedDice: (d) => set({ usedDice: d }),
    setDoublingCube: (cube) => set({ doublingCube: cube }), // Add setDoublingCube
    setMatchState: (match) => set({ matchState: match }), // Add setMatchState
    resetGame: () => set(state => {
      const newState = {
        boardState: initialExtendedBoardState(),
        turn: PlayerColor.WHITE,
        message: 'White to roll',
        gameState: 'playing',
        dice: [],
        usedDice: [],
        history: [initialExtendedBoardState()],
        historyIndex: 0,
        stats: state.stats,
        botDifficulty: state.botDifficulty,
        gameMode: state.gameMode,
        doublingCube: initialDoublingCubeState(), // Reset doubling cube state
        matchState: initialMatchState(), // Reset match state
      };
      saveStats(state.stats);
      return newState;
    }),
    pushHistory: (b) => {
      const { history, historyIndex } = get();
      const newHistory = history.slice(0, historyIndex + 1).concat([cloneExtendedBoardState(b)]);
      set({ history: newHistory, historyIndex: newHistory.length - 1 });
    },
    stepHistory: (dir) => {
      const { history, historyIndex, setBoardState } = get();
      const newIndex = Math.max(0, Math.min(history.length - 1, historyIndex + dir));
      set({ historyIndex: newIndex });
      setBoardState(cloneExtendedBoardState(history[newIndex]));
    },
    updateStats: (result) => {
      const { stats } = get();
      const newStats = {
        ...stats,
        totalGames: stats.totalGames + 1,
        wins: result === 'win' ? stats.wins + 1 : stats.wins,
        losses: result === 'loss' ? stats.losses + 1 : stats.losses,
      };
      set({ stats: newStats });
      saveStats(newStats);
    },
    resetStats: () => {
      const zeroStats = { wins: 0, losses: 0, totalGames: 0 };
      set({ stats: zeroStats });
      saveStats(zeroStats);
    },
    setBotDifficulty: (difficulty) => set({ botDifficulty: difficulty }),
    setGameMode: (mode) => set({ gameMode: mode }),
    saveGame: () => {
      const state = get();
      saveGameState(state);
    },
    loadGame: () => {
      const savedState = loadGameState();
      if (savedState) {
        set({
          boardState: savedState.boardState || initialExtendedBoardState(),
          turn: savedState.turn,
          gameState: savedState.gameState,
          dice: savedState.dice,
          usedDice: savedState.usedDice,
          history: savedState.history || [initialExtendedBoardState()],
          historyIndex: savedState.historyIndex,
          botDifficulty: savedState.botDifficulty,
          gameMode: savedState.gameMode || GameMode.HUMAN_VS_BOT,
          message: savedState.gameState === 'playing' ? 'White to roll' : 'Game Over',
          doublingCube: savedState.doublingCube || initialDoublingCubeState(), // Load doubling cube state
          matchState: savedState.matchState || initialMatchState(), // Load match state
        });
      }
    },
    hasSavedGame: () => {
      return loadGameState() !== null;
    },
    rollDice: () => {
      const { turn, gameState, gameMode } = get();
      if (gameState !== 'playing') return;
      
      const newDice = rollDice();
      set({ dice: newDice, usedDice: [] });
      
      // Bot rolls if it's black's turn and we're in human vs bot mode
      if (turn === PlayerColor.BLACK && gameMode === GameMode.HUMAN_VS_BOT) {
        setTimeout(() => {
          const currentState = get();
          if (currentState.turn === PlayerColor.BLACK && currentState.gameState === 'playing') {
            const botMove = makeBotMove(currentState.boardState, currentState.turn, currentState.dice, currentState.usedDice, currentState.botDifficulty);
            if (botMove) {
              // Implement bot move logic here
              currentState.setMessage('Black moved');
            }
          }
        }, 1000);
      }
    },
    offerDouble: () => {
      const { turn, gameState, doublingCube, matchState } = get();
      if (gameState !== 'playing') return;
      
      // Use match-aware doubling validation
      if (!canDoubleInMatch(matchState, doublingCube, turn, gameState)) return;

      const newDoublingCube = offerDouble(doublingCube, turn);
      set({ doublingCube: newDoublingCube });
      set({ message: `${turn} offers to double to ${newDoublingCube.value}. Accept or reject?` });
    },
    acceptDouble: () => {
      const { turn, doublingCube } = get();
      const newDoublingCube = acceptDouble(doublingCube, turn);
      set({ doublingCube: newDoublingCube });
      set({ message: `${turn} accepted the double. New cube value: ${newDoublingCube.value}` });
    },
    rejectDouble: () => {
      const { doublingCube, matchState } = get();
      const { cubeState, gameEnded } = rejectDouble(doublingCube);
      set({ doublingCube: cubeState });
      
      if (gameEnded) {
        // Handle match scoring for double rejection
        if (matchState.isMatchPlay) {
          const newMatchState = updateMatchState(matchState, doublingCube.offeringPlayer!, 1);
          let finalMessage = 'Game Over: Double rejected.';
          
          if (newMatchState.matchWinner) {
            finalMessage = `${finalMessage} ${newMatchState.matchWinner === PlayerColor.WHITE ? 'White' : 'Black'} wins the match ${newMatchState.whiteScore}-${newMatchState.blackScore}!`;
            set({ gameState: 'gameOver', message: finalMessage, matchState: newMatchState });
          } else {
            finalMessage = `${finalMessage} ${getMatchStatusMessage(newMatchState, doublingCube.offeringPlayer, 1)}`;
            set({ gameState: 'gameOver', message: finalMessage, matchState: newMatchState });
          }
        } else {
          set({ gameState: 'gameOver', message: 'Game Over: Double rejected.' });
        }
      } else {
        set({ message: 'Double rejected.' });
      }
    },
    beaverDouble: () => {
      const { turn, doublingCube } = get();
      const newDoublingCube = beaverDouble(doublingCube, turn);
      set({ doublingCube: newDoublingCube });
      set({ message: `${turn} doubled the cube to ${newDoublingCube.value} (Beaver double).` });
    },
    raccoonDouble: () => {
      const { turn, doublingCube } = get();
      const newDoublingCube = raccoonDouble(doublingCube, turn);
      set({ doublingCube: newDoublingCube });
      set({ message: `${turn} doubled the cube to ${newDoublingCube.value} (Raccoon double).` });
    },
    makeMove: (from: number, to: number) => {
      const { turn, gameState, dice, usedDice, doublingCube, boardState, gameMode, matchState } = get();
      if (gameState !== 'playing') return;

      const validMoves = getValidMoves(boardState, turn, dice, usedDice);
      if (!validMoves.some(move => move[0] === from && move[1] === to)) {
        set({ message: 'Invalid move.' });
        return;
      }

      let newBoardState = cloneExtendedBoardState(boardState);
      const playerIndex = turn === PlayerColor.WHITE ? 0 : 1;
      const opponentIndex = turn === PlayerColor.WHITE ? 1 : 0;

      // Check if this is a bearing off move
      const isBearingOff = (turn === PlayerColor.WHITE && to === 24) || (turn === PlayerColor.BLACK && to === -1);
      
      // Check if this is a bar re-entry move
      const isBarReentry = from === BAR_WHITE;

      if (isBearingOff) {
        // Execute bearing off move
        newBoardState.board[from][playerIndex]--;
        newBoardState.offBoard[playerIndex]++;
      } else if (isBarReentry) {
        // Execute bar re-entry move
        newBoardState.bar[playerIndex]--;
        newBoardState.board[to][playerIndex]++;
        
        // Handle capture if opponent has exactly 1 piece
        if (newBoardState.board[to][opponentIndex] === 1) {
          newBoardState.board[to][opponentIndex] = 0;
          newBoardState.bar[opponentIndex]++;
        }
      } else {
        // Regular move
        newBoardState.board[from][playerIndex]--;
        newBoardState.board[to][playerIndex]++;
        
        // If capturing opponent piece
        if (newBoardState.board[to][opponentIndex] === 1) {
          newBoardState.board[to][opponentIndex] = 0;
          newBoardState.bar[opponentIndex]++;
        }
      }

      // Update game state and check for end
      const gameEndResult = checkGameEndWithCube(newBoardState, doublingCube);
      if (gameEndResult.gameEnded) {
        // Handle match scoring
        let newMatchState = cloneMatchState(matchState);
        let finalMessage = gameEndResult.message;
        
        if (matchState.isMatchPlay) {
          const matchPoints = calculateMatchPoints(gameEndResult.finalPoints, matchState);
          newMatchState = updateMatchState(matchState, gameEndResult.winner!, matchPoints);
          
          if (newMatchState.matchWinner) {
            // Match is complete
            finalMessage = `${gameEndResult.message} ${newMatchState.matchWinner === PlayerColor.WHITE ? 'White' : 'Black'} wins the match ${newMatchState.whiteScore}-${newMatchState.blackScore}!`;
            set({ 
              gameState: 'gameOver', 
              message: finalMessage,
              matchState: newMatchState
            });
          } else {
            // Game ends but match continues
            finalMessage = `${gameEndResult.message} ${getMatchStatusMessage(newMatchState, gameEndResult.winner, gameEndResult.finalPoints)}`;
            set({ 
              gameState: 'gameOver', 
              message: finalMessage,
              matchState: newMatchState
            });
          }
        } else {
          // Single game mode
          set({ gameState: 'gameOver', message: gameEndResult.message });
        }
        
        // Update stats for single game mode or match completion
        if (!matchState.isMatchPlay || newMatchState.matchWinner) {
          const { stats } = get();
          const newStats = {
            ...stats,
            totalGames: stats.totalGames + 1,
            wins: gameEndResult.winner === PlayerColor.WHITE ? stats.wins + 1 : stats.wins,
            losses: gameEndResult.winner === PlayerColor.BLACK ? stats.losses + 1 : stats.losses,
          };
          set({ stats: newStats });
          saveStats(newStats);
        }
        
        return;
      }

      // Switch turn
      set({
        boardState: newBoardState,
        turn: turn === PlayerColor.WHITE ? PlayerColor.BLACK : PlayerColor.WHITE,
        message: `${turn} to roll`,
        dice: [], // Clear dice after a move
        usedDice: [],
      });

      // Bot rolls if it's black's turn and we're in human vs bot mode
      if (turn === PlayerColor.BLACK && gameMode === GameMode.HUMAN_VS_BOT) {
        setTimeout(() => {
          const currentState = get();
          if (currentState.turn === PlayerColor.BLACK && currentState.gameState === 'playing') {
            const botMove = makeBotMove(currentState.boardState, currentState.turn, currentState.dice, currentState.usedDice, currentState.botDifficulty);
            if (botMove) {
              // Implement bot move logic here
              set({ message: 'Black moved' });
            }
          }
        }, 1000);
      }
    },
    startNewMatch: (matchLength) => {
      set({ matchState: initialMatchState(matchLength) });
    },
    endMatch: () => {
      set({ matchState: initialMatchState() });
    },
  };
}); 

// Individual piece management functions
function createPiece(id: string, player: PlayerColor, position: number): Piece {
  return {
    id,
    player,
    position,
    state: position === BAR_WHITE ? 'onBar' : position >= OFF_WHITE ? 'borneOff' : 'active',
    moveCount: 0,
    lastMoveTurn: 0,
    isBlot: false,
  };
}

function generateInitialPieces(): Piece[] {
  const pieces: Piece[] = [];
  let pieceId = 0;
  
  // White pieces
  pieces.push(createPiece(`w${pieceId++}`, PlayerColor.WHITE, 0)); // Point 0
  pieces.push(createPiece(`w${pieceId++}`, PlayerColor.WHITE, 0));
  pieces.push(createPiece(`w${pieceId++}`, PlayerColor.WHITE, 11)); // Point 11
  pieces.push(createPiece(`w${pieceId++}`, PlayerColor.WHITE, 11));
  pieces.push(createPiece(`w${pieceId++}`, PlayerColor.WHITE, 11));
  pieces.push(createPiece(`w${pieceId++}`, PlayerColor.WHITE, 11));
  pieces.push(createPiece(`w${pieceId++}`, PlayerColor.WHITE, 11));
  pieces.push(createPiece(`w${pieceId++}`, PlayerColor.WHITE, 16)); // Point 16
  pieces.push(createPiece(`w${pieceId++}`, PlayerColor.WHITE, 16));
  pieces.push(createPiece(`w${pieceId++}`, PlayerColor.WHITE, 16));
  pieces.push(createPiece(`w${pieceId++}`, PlayerColor.WHITE, 18)); // Point 18
  pieces.push(createPiece(`w${pieceId++}`, PlayerColor.WHITE, 18));
  pieces.push(createPiece(`w${pieceId++}`, PlayerColor.WHITE, 18));
  pieces.push(createPiece(`w${pieceId++}`, PlayerColor.WHITE, 18));
  pieces.push(createPiece(`w${pieceId++}`, PlayerColor.WHITE, 18));
  
  // Black pieces
  pieces.push(createPiece(`b${pieceId++}`, PlayerColor.BLACK, 5)); // Point 5
  pieces.push(createPiece(`b${pieceId++}`, PlayerColor.BLACK, 5));
  pieces.push(createPiece(`b${pieceId++}`, PlayerColor.BLACK, 5));
  pieces.push(createPiece(`b${pieceId++}`, PlayerColor.BLACK, 5));
  pieces.push(createPiece(`b${pieceId++}`, PlayerColor.BLACK, 5));
  pieces.push(createPiece(`b${pieceId++}`, PlayerColor.BLACK, 7)); // Point 7
  pieces.push(createPiece(`b${pieceId++}`, PlayerColor.BLACK, 7));
  pieces.push(createPiece(`b${pieceId++}`, PlayerColor.BLACK, 7));
  pieces.push(createPiece(`b${pieceId++}`, PlayerColor.BLACK, 12)); // Point 12
  pieces.push(createPiece(`b${pieceId++}`, PlayerColor.BLACK, 12));
  pieces.push(createPiece(`b${pieceId++}`, PlayerColor.BLACK, 12));
  pieces.push(createPiece(`b${pieceId++}`, PlayerColor.BLACK, 12));
  pieces.push(createPiece(`b${pieceId++}`, PlayerColor.BLACK, 12));
  pieces.push(createPiece(`b${pieceId++}`, PlayerColor.BLACK, 23)); // Point 23
  pieces.push(createPiece(`b${pieceId++}`, PlayerColor.BLACK, 23));
  
  return pieces;
}

function initialEnhancedBoardState(): EnhancedBoardState {
  const pieces = generateInitialPieces();
  const board = initialBoard();
  
  return {
    pieces,
    board,
    bar: [0, 0],
    offBoard: [0, 0],
    turnNumber: 1,
  };
}

// Piece state management functions
function getPiecesAtPosition(pieces: Piece[], position: number): Piece[] {
  return pieces.filter(piece => piece.position === position);
}

function getPiecesByPlayer(pieces: Piece[], player: PlayerColor): Piece[] {
  return pieces.filter(piece => piece.player === player);
}

function getPiecesByState(pieces: Piece[], state: 'active' | 'onBar' | 'borneOff'): Piece[] {
  return pieces.filter(piece => piece.state === state);
}

function movePiece(pieces: Piece[], pieceId: string, newPosition: number, turnNumber: number): Piece[] {
  return pieces.map(piece => {
    if (piece.id === pieceId) {
      return {
        ...piece,
        position: newPosition,
        state: newPosition === BAR_WHITE ? 'onBar' : newPosition >= OFF_WHITE ? 'borneOff' : 'active',
        moveCount: piece.moveCount + 1,
        lastMoveTurn: turnNumber,
        isBlot: false, // Will be updated by updateBlotStates
      };
    }
    return piece;
  });
}

function updateBlotStates(pieces: Piece[]): Piece[] {
  // Group pieces by position
  const piecesByPosition = new Map<number, Piece[]>();
  pieces.forEach(piece => {
    if (piece.state === 'active') {
      const pos = piece.position;
      if (!piecesByPosition.has(pos)) {
        piecesByPosition.set(pos, []);
      }
      piecesByPosition.get(pos)!.push(piece);
    }
  });
  
  // Update blot states
  return pieces.map(piece => {
    if (piece.state === 'active') {
      const piecesAtPosition = piecesByPosition.get(piece.position) || [];
      const playerPiecesAtPosition = piecesAtPosition.filter(p => p.player === piece.player);
      return {
        ...piece,
        isBlot: playerPiecesAtPosition.length === 1,
      };
    }
    return piece;
  });
}

function synchronizeBoardFromPieces(pieces: Piece[]): Board {
  const board: Board = Array.from({ length: BOARD_SIZE }, () => [0, 0]);
  
  pieces.forEach(piece => {
    if (piece.state === 'active' && piece.position >= 0 && piece.position < BOARD_SIZE) {
      const playerIndex = piece.player === PlayerColor.WHITE ? 0 : 1;
      board[piece.position][playerIndex]++;
    }
  });
  
  return board;
}

function synchronizeBarFromPieces(pieces: Piece[]): [number, number] {
  const bar: [number, number] = [0, 0];
  
  pieces.forEach(piece => {
    if (piece.state === 'onBar') {
      const playerIndex = piece.player === PlayerColor.WHITE ? 0 : 1;
      bar[playerIndex]++;
    }
  });
  
  return bar;
}

function synchronizeOffBoardFromPieces(pieces: Piece[]): [number, number] {
  const offBoard: [number, number] = [0, 0];
  
  pieces.forEach(piece => {
    if (piece.state === 'borneOff') {
      const playerIndex = piece.player === PlayerColor.WHITE ? 0 : 1;
      offBoard[playerIndex]++;
    }
  });
  
  return offBoard;
}

function getPieceById(pieces: Piece[], pieceId: string): Piece | undefined {
  return pieces.find(piece => piece.id === pieceId);
}

function getPiecesInHomeBoard(pieces: Piece[], player: PlayerColor): Piece[] {
  const homeBoardRange = player === PlayerColor.WHITE ? [0, 5] : [18, 23];
  return pieces.filter(piece => 
    piece.player === player && 
    piece.state === 'active' && 
    piece.position >= homeBoardRange[0] && 
    piece.position <= homeBoardRange[1]
  );
}

function getPiecesInOuterBoard(pieces: Piece[], player: PlayerColor): Piece[] {
  const outerBoardRange = player === PlayerColor.WHITE ? [6, 17] : [6, 17];
  return pieces.filter(piece => 
    piece.player === player && 
    piece.state === 'active' && 
    piece.position >= outerBoardRange[0] && 
    piece.position <= outerBoardRange[1]
  );
}

function getPieceMovementHistory(pieces: Piece[]): { pieceId: string; moves: number; lastMove: number }[] {
  return pieces.map(piece => ({
    pieceId: piece.id,
    moves: piece.moveCount,
    lastMove: piece.lastMoveTurn,
  }));
}

function getMostActivePieces(pieces: Piece[], player: PlayerColor, limit: number = 5): Piece[] {
  return getPiecesByPlayer(pieces, player)
    .sort((a, b) => b.moveCount - a.moveCount)
    .slice(0, limit);
}

function getLeastActivePieces(pieces: Piece[], player: PlayerColor, limit: number = 5): Piece[] {
  return getPiecesByPlayer(pieces, player)
    .sort((a, b) => a.moveCount - b.moveCount)
    .slice(0, limit);
}

function getPiecesNotMovedThisTurn(pieces: Piece[], player: PlayerColor, currentTurn: number): Piece[] {
  return getPiecesByPlayer(pieces, player).filter(piece => piece.lastMoveTurn < currentTurn);
}

// Enhanced bar and off-board piece tracking functions
function getBarStatus(boardState: ExtendedBoardState): {
  whitePieces: number;
  blackPieces: number;
  totalPieces: number;
  hasPieces: boolean;
  statusMessage: string;
} {
  const [whitePieces, blackPieces] = boardState.bar;
  const totalPieces = whitePieces + blackPieces;
  
  let statusMessage = '';
  if (totalPieces === 0) {
    statusMessage = 'No pieces on bar';
  } else if (whitePieces > 0 && blackPieces > 0) {
    statusMessage = `White: ${whitePieces}, Black: ${blackPieces} pieces on bar`;
  } else if (whitePieces > 0) {
    statusMessage = `${whitePieces} white piece${whitePieces > 1 ? 's' : ''} on bar`;
  } else {
    statusMessage = `${blackPieces} black piece${blackPieces > 1 ? 's' : ''} on bar`;
  }
  
  return {
    whitePieces,
    blackPieces,
    totalPieces,
    hasPieces: totalPieces > 0,
    statusMessage,
  };
}

function getOffBoardStatus(boardState: ExtendedBoardState): {
  whitePieces: number;
  blackPieces: number;
  totalPieces: number;
  hasPieces: boolean;
  statusMessage: string;
} {
  const [whitePieces, blackPieces] = boardState.offBoard;
  const totalPieces = whitePieces + blackPieces;
  
  let statusMessage = '';
  if (totalPieces === 0) {
    statusMessage = 'No pieces borne off';
  } else if (whitePieces > 0 && blackPieces > 0) {
    statusMessage = `White: ${whitePieces}, Black: ${blackPieces} pieces borne off`;
  } else if (whitePieces > 0) {
    statusMessage = `${whitePieces} white piece${whitePieces > 1 ? 's' : ''} borne off`;
  } else {
    statusMessage = `${blackPieces} black piece${blackPieces > 1 ? 's' : ''} borne off`;
  }
  
  return {
    whitePieces,
    blackPieces,
    totalPieces,
    hasPieces: totalPieces > 0,
    statusMessage,
  };
}

function addPieceToBar(boardState: ExtendedBoardState, player: PlayerColor, count: number = 1): ExtendedBoardState {
  const newBoardState = cloneExtendedBoardState(boardState);
  const playerIndex = player === PlayerColor.WHITE ? 0 : 1;
  newBoardState.bar[playerIndex] += count;
  return newBoardState;
}

function removePieceFromBar(boardState: ExtendedBoardState, player: PlayerColor, count: number = 1): ExtendedBoardState {
  const newBoardState = cloneExtendedBoardState(boardState);
  const playerIndex = player === PlayerColor.WHITE ? 0 : 1;
  newBoardState.bar[playerIndex] = Math.max(0, newBoardState.bar[playerIndex] - count);
  return newBoardState;
}

function addPieceToOffBoard(boardState: ExtendedBoardState, player: PlayerColor, count: number = 1): ExtendedBoardState {
  const newBoardState = cloneExtendedBoardState(boardState);
  const playerIndex = player === PlayerColor.WHITE ? 0 : 1;
  newBoardState.offBoard[playerIndex] += count;
  return newBoardState;
}

function removePieceFromOffBoard(boardState: ExtendedBoardState, player: PlayerColor, count: number = 1): ExtendedBoardState {
  const newBoardState = cloneExtendedBoardState(boardState);
  const playerIndex = player === PlayerColor.WHITE ? 0 : 1;
  newBoardState.offBoard[playerIndex] = Math.max(0, newBoardState.offBoard[playerIndex] - count);
  return newBoardState;
}

function getBarReentryOptions(boardState: ExtendedBoardState, player: PlayerColor, dice: Dice): {
  availableDice: number[];
  blockedDice: number[];
  reentryPoints: Map<number, number>; // die -> point
  statusMessage: string;
} {
  const availableDice: number[] = [];
  const blockedDice: number[] = [];
  const reentryPoints = new Map<number, number>();
  
  if (!hasPiecesOnBar(boardState, player)) {
    return {
      availableDice: [],
      blockedDice: [],
      reentryPoints: new Map(),
      statusMessage: 'No pieces on bar',
    };
  }
  
  dice.forEach(die => {
    const reentryPoint = player === PlayerColor.WHITE ? 24 - die : die - 1;
    
    if (reentryPoint >= 0 && reentryPoint < BOARD_SIZE) {
      const opponentIndex = player === PlayerColor.WHITE ? 1 : 0;
      const opponentPieces = boardState.board[reentryPoint][opponentIndex];
      
      if (opponentPieces < 2) {
        availableDice.push(die);
        reentryPoints.set(die, reentryPoint);
      } else {
        blockedDice.push(die);
      }
    } else {
      blockedDice.push(die);
    }
  });
  
  let statusMessage = '';
  if (availableDice.length === 0) {
    statusMessage = 'No re-entry options available';
  } else if (blockedDice.length === 0) {
    statusMessage = 'All re-entry options available';
  } else {
    statusMessage = `${availableDice.length} re-entry option${availableDice.length > 1 ? 's' : ''} available`;
  }
  
  return {
    availableDice,
    blockedDice,
    reentryPoints,
    statusMessage,
  };
}

function validateBarAndOffBoardState(boardState: ExtendedBoardState): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check for negative values
  if (boardState.bar[0] < 0) errors.push('White bar pieces cannot be negative');
  if (boardState.bar[1] < 0) errors.push('Black bar pieces cannot be negative');
  if (boardState.offBoard[0] < 0) errors.push('White off-board pieces cannot be negative');
  if (boardState.offBoard[1] < 0) errors.push('Black off-board pieces cannot be negative');
  
  // Check for reasonable maximum values
  if (boardState.bar[0] > 15) warnings.push('Unusually high number of white pieces on bar');
  if (boardState.bar[1] > 15) warnings.push('Unusually high number of black pieces on bar');
  if (boardState.offBoard[0] > 15) warnings.push('Unusually high number of white pieces borne off');
  if (boardState.offBoard[1] > 15) warnings.push('Unusually high number of black pieces borne off');
  
  // Check total pieces consistency
  const totalBoardPieces = boardState.board.reduce((sum, point) => sum + point[0] + point[1], 0);
  const totalBarPieces = boardState.bar[0] + boardState.bar[1];
  const totalOffBoardPieces = boardState.offBoard[0] + boardState.offBoard[1];
  const totalPieces = totalBoardPieces + totalBarPieces + totalOffBoardPieces;
  
  if (totalPieces !== 30) {
    errors.push(`Total pieces should be 30, found ${totalPieces}`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

function synchronizeBarAndOffBoardWithBoard(boardState: ExtendedBoardState): ExtendedBoardState {
  const newBoardState = cloneExtendedBoardState(boardState);
  
  // Count pieces on board
  let whiteBoardPieces = 0;
  let blackBoardPieces = 0;
  
  for (let i = 0; i < BOARD_SIZE; i++) {
    whiteBoardPieces += boardState.board[i][0];
    blackBoardPieces += boardState.board[i][1];
  }
  
  // Calculate expected bar and off-board pieces
  const expectedWhiteTotal = 15;
  const expectedBlackTotal = 15;
  
  const expectedWhiteBar = Math.max(0, expectedWhiteTotal - whiteBoardPieces - boardState.offBoard[0]);
  const expectedBlackBar = Math.max(0, expectedBlackTotal - blackBoardPieces - boardState.offBoard[1]);
  
  // Update bar state
  newBoardState.bar[0] = expectedWhiteBar;
  newBoardState.bar[1] = expectedBlackBar;
  
  return newBoardState;
}

function getBarAndOffBoardDisplayInfo(boardState: ExtendedBoardState): {
  bar: {
    whiteCount: number;
    blackCount: number;
    totalCount: number;
    hasPieces: boolean;
    style: { background: string; border: string; color: string };
    label: string;
  };
  offBoard: {
    whiteCount: number;
    blackCount: number;
    totalCount: number;
    hasPieces: boolean;
    style: { background: string; border: string; color: string };
    label: string;
  };
} {
  const barStatus = getBarStatus(boardState);
  const offBoardStatus = getOffBoardStatus(boardState);
  
  return {
    bar: {
      whiteCount: barStatus.whitePieces,
      blackCount: barStatus.blackPieces,
      totalCount: barStatus.totalPieces,
      hasPieces: barStatus.hasPieces,
      style: {
        background: barStatus.hasPieces ? '#8B0000' : '#f0f0f0',
        border: '2px solid #660000',
        color: barStatus.hasPieces ? '#ffffff' : '#666666',
      },
      label: barStatus.hasPieces ? `Bar: ${barStatus.totalPieces}` : 'Bar',
    },
    offBoard: {
      whiteCount: offBoardStatus.whitePieces,
      blackCount: offBoardStatus.blackPieces,
      totalCount: offBoardStatus.totalPieces,
      hasPieces: offBoardStatus.hasPieces,
      style: {
        background: offBoardStatus.hasPieces ? '#228B22' : '#f0f0f0',
        border: '2px solid #006400',
        color: offBoardStatus.hasPieces ? '#ffffff' : '#666666',
      },
      label: offBoardStatus.hasPieces ? `Off: ${offBoardStatus.totalPieces}` : 'Off',
    },
  };
}

function getBarAndOffBoardSummary(boardState: ExtendedBoardState): {
  whiteSummary: {
    onBoard: number;
    onBar: number;
    borneOff: number;
    total: number;
  };
  blackSummary: {
    onBoard: number;
    onBar: number;
    borneOff: number;
    total: number;
  };
  gamePhase: 'early' | 'mid' | 'late' | 'bearing-off';
} {
  // Count pieces on board
  let whiteBoardPieces = 0;
  let blackBoardPieces = 0;
  
  for (let i = 0; i < BOARD_SIZE; i++) {
    whiteBoardPieces += boardState.board[i][0];
    blackBoardPieces += boardState.board[i][1];
  }
  
  const whiteSummary = {
    onBoard: whiteBoardPieces,
    onBar: boardState.bar[0],
    borneOff: boardState.offBoard[0],
    total: whiteBoardPieces + boardState.bar[0] + boardState.offBoard[0],
  };
  
  const blackSummary = {
    onBoard: blackBoardPieces,
    onBar: boardState.bar[1],
    borneOff: boardState.offBoard[1],
    total: blackBoardPieces + boardState.bar[1] + boardState.offBoard[1],
  };
  
  // Determine game phase
  const totalBorneOff = boardState.offBoard[0] + boardState.offBoard[1];
  const totalOnBar = boardState.bar[0] + boardState.bar[1];
  
  let gamePhase: 'early' | 'mid' | 'late' | 'bearing-off';
  if (totalBorneOff >= 10) {
    gamePhase = 'bearing-off';
  } else if (totalBorneOff >= 5 || totalOnBar >= 3) {
    gamePhase = 'late';
  } else if (totalBorneOff >= 2 || totalOnBar >= 1) {
    gamePhase = 'mid';
  } else {
    gamePhase = 'early';
  }
  
  return {
    whiteSummary,
    blackSummary,
    gamePhase,
  };
}

function canMoveFromBarOrOffBoard(boardState: ExtendedBoardState, player: PlayerColor, source: 'bar' | 'offBoard'): boolean {
  if (source === 'bar') {
    return hasPiecesOnBar(boardState, player);
  } else {
    // Can't move from off-board (pieces are borne off)
    return false;
  }
}

function getBarAndOffBoardMoveValidation(boardState: ExtendedBoardState, from: number, to: number, player: PlayerColor): {
  isValid: boolean;
  errorMessage: string;
  sourceType: 'board' | 'bar' | 'offBoard';
} {
  // Determine source type
  let sourceType: 'board' | 'bar' | 'offBoard';
  if (from === BAR_WHITE || from === BAR_BLACK) {
    sourceType = 'bar';
  } else if (from === OFF_WHITE || from === OFF_BLACK) {
    sourceType = 'offBoard';
  } else {
    sourceType = 'board';
  }
  
  // Validate based on source type
  if (sourceType === 'bar') {
    if (!hasPiecesOnBar(boardState, player)) {
      return {
        isValid: false,
        errorMessage: 'No pieces on bar to move',
        sourceType,
      };
    }
    
    // Additional bar re-entry validation would go here
    return {
      isValid: true,
      errorMessage: '',
      sourceType,
    };
  } else if (sourceType === 'offBoard') {
    return {
      isValid: false,
      errorMessage: 'Cannot move pieces from off-board',
      sourceType,
    };
  } else {
    // Regular board move validation
    return {
      isValid: true,
      errorMessage: '',
      sourceType,
    };
  }
}