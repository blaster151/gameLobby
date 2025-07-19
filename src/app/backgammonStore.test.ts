import { describe, it, expect, beforeEach } from 'vitest';
import { 
  PlayerColor, 
  BotDifficulty, 
  GameMode,
  initialExtendedBoardState,
  initialDoublingCubeState,
  initialMatchState,
  initialEnhancedBoardState,
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
  cloneDoublingCubeState,
  cloneMatchState,
  cloneEnhancedBoardState,
  getGameEndState,
  getWinMessage,
  hasAllPiecesBorneOff,
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
  MatchLength,
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
  BOARD_CONSTANTS,
  BOARD_REGIONS,
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
  getBarAndOffBoardMoveValidation,
  executeBearingOffMove
} from './backgammonStore';

describe('Doubling Cube Functions', () => {
  let initialCubeState: any;
  let initialBoardState: any;

  beforeEach(() => {
    initialCubeState = initialDoublingCubeState();
    initialBoardState = initialExtendedBoardState();
  });

  describe('Initial State', () => {
    it('should initialize doubling cube with correct default values', () => {
      expect(initialCubeState.value).toBe(1);
      expect(initialCubeState.owner).toBe(null);
      expect(initialCubeState.canDouble).toBe(false);
      expect(initialCubeState.pendingOffer).toBe(false);
      expect(initialCubeState.offeringPlayer).toBe(null);
    });

    it('should clone doubling cube state correctly', () => {
      const cloned = cloneDoublingCubeState(initialCubeState);
      expect(cloned).toEqual(initialCubeState);
      expect(cloned).not.toBe(initialCubeState); // Should be a new object
    });
  });

  describe('canOfferDouble', () => {
    it('should not allow doubling if game is not playing', () => {
      const result = canOfferDouble(initialCubeState, PlayerColor.WHITE, 'gameOver');
      expect(result).toBe(false);
    });

    it('should not allow doubling if there is a pending offer', () => {
      const cubeWithPending = { ...initialCubeState, pendingOffer: true };
      const result = canOfferDouble(cubeWithPending, PlayerColor.WHITE, 'playing');
      expect(result).toBe(false);
    });

    it('should not allow doubling on first roll when cube is centered', () => {
      const result = canOfferDouble(initialCubeState, PlayerColor.WHITE, 'playing');
      expect(result).toBe(false);
    });

    it('should allow doubling if cube is centered and not first roll', () => {
      const cubeNotFirstRoll = { ...initialCubeState, value: 2 };
      const result = canOfferDouble(cubeNotFirstRoll, PlayerColor.WHITE, 'playing');
      expect(result).toBe(true);
    });

    it('should allow doubling if player owns the cube', () => {
      const cubeOwnedByWhite = { ...initialCubeState, owner: PlayerColor.WHITE };
      const result = canOfferDouble(cubeOwnedByWhite, PlayerColor.WHITE, 'playing');
      expect(result).toBe(true);
    });

    it('should not allow doubling if opponent owns the cube', () => {
      const cubeOwnedByBlack = { ...initialCubeState, owner: PlayerColor.BLACK };
      const result = canOfferDouble(cubeOwnedByBlack, PlayerColor.WHITE, 'playing');
      expect(result).toBe(false);
    });
  });

  describe('offerDouble', () => {
    it('should double the cube value', () => {
      const result = offerDouble(initialCubeState, PlayerColor.WHITE);
      expect(result.value).toBe(2);
    });

    it('should set pending offer and offering player', () => {
      const result = offerDouble(initialCubeState, PlayerColor.WHITE);
      expect(result.pendingOffer).toBe(true);
      expect(result.offeringPlayer).toBe(PlayerColor.WHITE);
    });

    it('should not modify the original cube state', () => {
      const originalValue = initialCubeState.value;
      offerDouble(initialCubeState, PlayerColor.WHITE);
      expect(initialCubeState.value).toBe(originalValue);
    });

    it('should double from any current value', () => {
      const cubeAt4 = { ...initialCubeState, value: 4 };
      const result = offerDouble(cubeAt4, PlayerColor.BLACK);
      expect(result.value).toBe(8);
    });
  });

  describe('acceptDouble', () => {
    it('should transfer cube ownership to accepting player', () => {
      const cubeWithOffer = { ...initialCubeState, value: 2, pendingOffer: true, offeringPlayer: PlayerColor.WHITE };
      const result = acceptDouble(cubeWithOffer, PlayerColor.BLACK);
      expect(result.owner).toBe(PlayerColor.BLACK);
    });

    it('should clear pending offer and offering player', () => {
      const cubeWithOffer = { ...initialCubeState, value: 2, pendingOffer: true, offeringPlayer: PlayerColor.WHITE };
      const result = acceptDouble(cubeWithOffer, PlayerColor.BLACK);
      expect(result.pendingOffer).toBe(false);
      expect(result.offeringPlayer).toBe(null);
    });

    it('should not change cube value', () => {
      const cubeWithOffer = { ...initialCubeState, value: 4, pendingOffer: true, offeringPlayer: PlayerColor.WHITE };
      const result = acceptDouble(cubeWithOffer, PlayerColor.BLACK);
      expect(result.value).toBe(4);
    });
  });

  describe('rejectDouble', () => {
    it('should clear pending offer and offering player', () => {
      const cubeWithOffer = { ...initialCubeState, value: 2, pendingOffer: true, offeringPlayer: PlayerColor.WHITE };
      const result = rejectDouble(cubeWithOffer);
      expect(result.cubeState.pendingOffer).toBe(false);
      expect(result.cubeState.offeringPlayer).toBe(null);
    });

    it('should indicate game ended', () => {
      const cubeWithOffer = { ...initialCubeState, value: 2, pendingOffer: true, offeringPlayer: PlayerColor.WHITE };
      const result = rejectDouble(cubeWithOffer);
      expect(result.gameEnded).toBe(true);
    });
  });

  describe('getDoublingCubeMessage', () => {
    it('should show pending offer message', () => {
      const cubeWithOffer = { ...initialCubeState, value: 2, pendingOffer: true, offeringPlayer: PlayerColor.WHITE };
      const message = getDoublingCubeMessage(cubeWithOffer, PlayerColor.BLACK);
      expect(message).toContain('White offers to double to 2');
      expect(message).toContain('Accept or reject?');
    });

    it('should show cube ownership when not centered', () => {
      const cubeOwnedByWhite = { ...initialCubeState, value: 4, owner: PlayerColor.WHITE };
      const message = getDoublingCubeMessage(cubeOwnedByWhite, PlayerColor.BLACK);
      expect(message).toContain('Cube at 4 (owned by White)');
    });

    it('should show centered cube message', () => {
      const message = getDoublingCubeMessage(initialCubeState, PlayerColor.WHITE);
      expect(message).toBe('Cube at 1 (centered)');
    });
  });

  describe('calculateFinalPoints', () => {
    it('should multiply base points by cube value', () => {
      const cubeAt4 = { ...initialCubeState, value: 4 };
      const result = calculateFinalPoints(2, cubeAt4);
      expect(result).toBe(8);
    });

    it('should handle gammon with cube', () => {
      const cubeAt8 = { ...initialCubeState, value: 8 };
      const result = calculateFinalPoints(2, cubeAt8); // Gammon = 2 points
      expect(result).toBe(16);
    });

    it('should handle backgammon with cube', () => {
      const cubeAt16 = { ...initialCubeState, value: 16 };
      const result = calculateFinalPoints(3, cubeAt16); // Backgammon = 3 points
      expect(result).toBe(48);
    });
  });

  describe('getCubeValueDisplay', () => {
    it('should return cube value as string', () => {
      expect(getCubeValueDisplay(initialCubeState)).toBe('1');
      
      const cubeAt8 = { ...initialCubeState, value: 8 };
      expect(getCubeValueDisplay(cubeAt8)).toBe('8');
    });
  });

  describe('isCubeCentered', () => {
    it('should return true when cube has no owner', () => {
      expect(isCubeCentered(initialCubeState)).toBe(true);
    });

    it('should return false when cube has an owner', () => {
      const cubeOwnedByWhite = { ...initialCubeState, owner: PlayerColor.WHITE };
      expect(isCubeCentered(cubeOwnedByWhite)).toBe(false);
    });
  });

  describe('getCubeOwner', () => {
    it('should return null when cube is centered', () => {
      expect(getCubeOwner(initialCubeState)).toBe(null);
    });

    it('should return owner when cube has an owner', () => {
      const cubeOwnedByBlack = { ...initialCubeState, owner: PlayerColor.BLACK };
      expect(getCubeOwner(cubeOwnedByBlack)).toBe(PlayerColor.BLACK);
    });
  });

  describe('getNextCubeValue', () => {
    it('should return double the current value', () => {
      expect(getNextCubeValue(initialCubeState)).toBe(2);
      
      const cubeAt4 = { ...initialCubeState, value: 4 };
      expect(getNextCubeValue(cubeAt4)).toBe(8);
    });
  });

  describe('canBeaver', () => {
    it('should return true when cube value is 2 and has owner', () => {
      const cubeAt2 = { ...initialCubeState, value: 2, owner: PlayerColor.WHITE };
      expect(canBeaver(cubeAt2)).toBe(true);
    });

    it('should return false when cube value is not 2', () => {
      const cubeAt4 = { ...initialCubeState, value: 4, owner: PlayerColor.WHITE };
      expect(canBeaver(cubeAt4)).toBe(false);
    });

    it('should return false when cube has no owner', () => {
      const cubeAt2NoOwner = { ...initialCubeState, value: 2, owner: null };
      expect(canBeaver(cubeAt2NoOwner)).toBe(false);
    });
  });

  describe('beaverDouble', () => {
    it('should double the cube value', () => {
      const cubeAt2 = { ...initialCubeState, value: 2, owner: PlayerColor.WHITE };
      const result = beaverDouble(cubeAt2, PlayerColor.BLACK);
      expect(result.value).toBe(4);
    });

    it('should transfer ownership to beaver player', () => {
      const cubeAt2 = { ...initialCubeState, value: 2, owner: PlayerColor.WHITE };
      const result = beaverDouble(cubeAt2, PlayerColor.BLACK);
      expect(result.owner).toBe(PlayerColor.BLACK);
    });
  });

  describe('canRaccoon', () => {
    it('should return true when cube value is 4 and has owner', () => {
      const cubeAt4 = { ...initialCubeState, value: 4, owner: PlayerColor.WHITE };
      expect(canRaccoon(cubeAt4)).toBe(true);
    });

    it('should return false when cube value is not 4', () => {
      const cubeAt8 = { ...initialCubeState, value: 8, owner: PlayerColor.WHITE };
      expect(canRaccoon(cubeAt8)).toBe(false);
    });

    it('should return false when cube has no owner', () => {
      const cubeAt4NoOwner = { ...initialCubeState, value: 4, owner: null };
      expect(canRaccoon(cubeAt4NoOwner)).toBe(false);
    });
  });

  describe('raccoonDouble', () => {
    it('should double the cube value', () => {
      const cubeAt4 = { ...initialCubeState, value: 4, owner: PlayerColor.WHITE };
      const result = raccoonDouble(cubeAt4, PlayerColor.BLACK);
      expect(result.value).toBe(8);
    });

    it('should transfer ownership to raccoon player', () => {
      const cubeAt4 = { ...initialCubeState, value: 4, owner: PlayerColor.WHITE };
      const result = raccoonDouble(cubeAt4, PlayerColor.BLACK);
      expect(result.owner).toBe(PlayerColor.BLACK);
    });
  });

  describe('updateCubeCanDouble', () => {
    it('should update canDouble based on current state', () => {
      const cubeAt2 = { ...initialCubeState, value: 2 };
      const result = updateCubeCanDouble(cubeAt2, PlayerColor.WHITE, 'playing');
      expect(result.canDouble).toBe(true);
    });

    it('should set canDouble to false when game is not playing', () => {
      const cubeAt2 = { ...initialCubeState, value: 2 };
      const result = updateCubeCanDouble(cubeAt2, PlayerColor.WHITE, 'gameOver');
      expect(result.canDouble).toBe(false);
    });
  });

  describe('checkGameEndWithCube', () => {
    it('should return game not ended for ongoing game', () => {
      const result = checkGameEndWithCube(initialBoardState, initialCubeState);
      expect(result.gameEnded).toBe(false);
      expect(result.winner).toBe(null);
      expect(result.finalPoints).toBe(0);
    });

    it('should calculate final points with cube multiplier for normal win', () => {
      // Create a board state where white has won
      const winningBoard = { ...initialBoardState };
      winningBoard.offBoard[0] = 15; // White has borne off all pieces
      
      const cubeAt4 = { ...initialCubeState, value: 4 };
      const result = checkGameEndWithCube(winningBoard, cubeAt4);
      
      expect(result.gameEnded).toBe(true);
      expect(result.winner).toBe(PlayerColor.WHITE);
      expect(result.basePoints).toBe(1); // Normal win
      expect(result.finalPoints).toBe(4); // 1 * 4
      expect(result.message).toContain('(Cube: 4x)');
      expect(result.message).toContain('Final score: 4 points');
    });

    it('should calculate final points with cube multiplier for gammon win', () => {
      // Create a board state where white has won by gammon
      const gammonBoard = { ...initialBoardState };
      gammonBoard.offBoard[0] = 15; // White has borne off all pieces
      gammonBoard.offBoard[1] = 0; // Black hasn't borne off any pieces
      
      const cubeAt8 = { ...initialCubeState, value: 8 };
      const result = checkGameEndWithCube(gammonBoard, cubeAt8);
      
      expect(result.gameEnded).toBe(true);
      expect(result.winner).toBe(PlayerColor.WHITE);
      expect(result.basePoints).toBe(2); // Gammon win
      expect(result.finalPoints).toBe(16); // 2 * 8
      expect(result.message).toContain('(Cube: 8x)');
      expect(result.message).toContain('Final score: 16 points');
    });

    it('should calculate final points with cube multiplier for backgammon win', () => {
      // Create a board state where white has won by backgammon
      const backgammonBoard = { ...initialBoardState };
      backgammonBoard.offBoard[0] = 15; // White has borne off all pieces
      backgammonBoard.offBoard[1] = 0; // Black hasn't borne off any pieces
      backgammonBoard.bar[1] = 15; // Black has all pieces on bar
      
      const cubeAt16 = { ...initialCubeState, value: 16 };
      const result = checkGameEndWithCube(backgammonBoard, cubeAt16);
      
      expect(result.gameEnded).toBe(true);
      expect(result.winner).toBe(PlayerColor.WHITE);
      expect(result.basePoints).toBe(3); // Backgammon win
      expect(result.finalPoints).toBe(48); // 3 * 16
      expect(result.message).toContain('(Cube: 16x)');
      expect(result.message).toContain('Final score: 48 points');
    });

    it('should not show cube multiplier when cube is at 1', () => {
      // Create a board state where white has won
      const winningBoard = { ...initialBoardState };
      winningBoard.offBoard[0] = 15; // White has borne off all pieces
      
      const result = checkGameEndWithCube(winningBoard, initialCubeState);
      
      expect(result.gameEnded).toBe(true);
      expect(result.winner).toBe(PlayerColor.WHITE);
      expect(result.message).not.toContain('(Cube: 1x)');
      expect(result.message).toContain('Final score: 1 points');
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete doubling sequence', () => {
      // Start with centered cube
      let cube = initialCubeState;
      expect(isCubeCentered(cube)).toBe(true);
      expect(canOfferDouble(cube, PlayerColor.WHITE, 'playing')).toBe(false); // Can't double on first roll

      // White offers double (after first roll)
      cube = { ...cube, value: 2 };
      expect(canOfferDouble(cube, PlayerColor.WHITE, 'playing')).toBe(true);
      cube = offerDouble(cube, PlayerColor.WHITE);
      expect(cube.value).toBe(4);
      expect(cube.pendingOffer).toBe(true);
      expect(cube.offeringPlayer).toBe(PlayerColor.WHITE);

      // Black accepts
      cube = acceptDouble(cube, PlayerColor.BLACK);
      expect(cube.owner).toBe(PlayerColor.BLACK);
      expect(cube.pendingOffer).toBe(false);
      expect(cube.offeringPlayer).toBe(null);

      // Black can now offer double
      expect(canOfferDouble(cube, PlayerColor.BLACK, 'playing')).toBe(true);
      cube = offerDouble(cube, PlayerColor.BLACK);
      expect(cube.value).toBe(8);

      // White accepts
      cube = acceptDouble(cube, PlayerColor.WHITE);
      expect(cube.owner).toBe(PlayerColor.WHITE);
      expect(cube.value).toBe(8);
    });

    it('should handle beaver and raccoon doubles', () => {
      // White offers initial double
      let cube = { ...initialCubeState, value: 2 };
      cube = offerDouble(cube, PlayerColor.WHITE);
      expect(cube.value).toBe(4);

      // Black beavers
      expect(canBeaver(cube)).toBe(true);
      cube = beaverDouble(cube, PlayerColor.BLACK);
      expect(cube.value).toBe(8);
      expect(cube.owner).toBe(PlayerColor.BLACK);

      // Black offers another double
      cube = offerDouble(cube, PlayerColor.BLACK);
      expect(cube.value).toBe(16);

      // White raccoons
      expect(canRaccoon(cube)).toBe(true);
      cube = raccoonDouble(cube, PlayerColor.WHITE);
      expect(cube.value).toBe(32);
      expect(cube.owner).toBe(PlayerColor.WHITE);
    });

    it('should handle double rejection', () => {
      // White offers double
      let cube = { ...initialCubeState, value: 2 };
      cube = offerDouble(cube, PlayerColor.WHITE);
      expect(cube.pendingOffer).toBe(true);

      // Black rejects
      const result = rejectDouble(cube);
      expect(result.cubeState.pendingOffer).toBe(false);
      expect(result.gameEnded).toBe(true);
    });
  });
});

describe('Match Scoring Functions', () => {
  let initialMatch: any;

  beforeEach(() => {
    initialMatch = initialMatchState(MatchLength.POINT_7);
  });

  describe('Initial State', () => {
    it('should initialize match state with correct default values', () => {
      expect(initialMatch.matchLength).toBe(7);
      expect(initialMatch.whiteScore).toBe(0);
      expect(initialMatch.blackScore).toBe(0);
      expect(initialMatch.gameNumber).toBe(1);
      expect(initialMatch.matchWinner).toBe(null);
      expect(initialMatch.isMatchPlay).toBe(true);
      expect(initialMatch.crawfordGame).toBe(false);
      expect(initialMatch.postCrawford).toBe(false);
      expect(initialMatch.jacobyRule).toBe(false);
    });

    it('should clone match state correctly', () => {
      const cloned = cloneMatchState(initialMatch);
      expect(cloned).toEqual(initialMatch);
      expect(cloned).not.toBe(initialMatch); // Should be a new object
    });

    it('should initialize with different match lengths', () => {
      const match3 = initialMatchState(MatchLength.POINT_3);
      expect(match3.matchLength).toBe(3);
      
      const match25 = initialMatchState(MatchLength.POINT_25);
      expect(match25.matchLength).toBe(25);
    });
  });

  describe('Crawford Game Detection', () => {
    it('should detect Crawford game when white is 1 point away', () => {
      const matchNearWin = { ...initialMatch, whiteScore: 6, blackScore: 2 };
      expect(isCrawfordGame(matchNearWin)).toBe(true);
    });

    it('should detect Crawford game when black is 1 point away', () => {
      const matchNearWin = { ...initialMatch, whiteScore: 1, blackScore: 6 };
      expect(isCrawfordGame(matchNearWin)).toBe(true);
    });

    it('should not detect Crawford game when neither player is close', () => {
      const matchEarly = { ...initialMatch, whiteScore: 2, blackScore: 1 };
      expect(isCrawfordGame(matchEarly)).toBe(false);
    });

    it('should not detect Crawford game when match is already won', () => {
      const matchWon = { ...initialMatch, whiteScore: 7, blackScore: 3 };
      expect(isCrawfordGame(matchWon)).toBe(false);
    });
  });

  describe('Post-Crawford Detection', () => {
    it('should detect post-Crawford after Crawford game', () => {
      const postCrawford = { 
        ...initialMatch, 
        whiteScore: 5, 
        blackScore: 2, 
        crawfordGame: true 
      };
      expect(isPostCrawford(postCrawford)).toBe(true);
    });

    it('should not detect post-Crawford if not in Crawford game', () => {
      const notCrawford = { 
        ...initialMatch, 
        whiteScore: 5, 
        blackScore: 2, 
        crawfordGame: false 
      };
      expect(isPostCrawford(notCrawford)).toBe(false);
    });
  });

  describe('updateMatchState', () => {
    it('should add points to winner', () => {
      const result = updateMatchState(initialMatch, PlayerColor.WHITE, 2);
      expect(result.whiteScore).toBe(2);
      expect(result.blackScore).toBe(0);
    });

    it('should increment game number when match continues', () => {
      const result = updateMatchState(initialMatch, PlayerColor.WHITE, 1);
      expect(result.gameNumber).toBe(2);
    });

    it('should declare match winner when target reached', () => {
      const nearWin = { ...initialMatch, whiteScore: 6, blackScore: 2 };
      const result = updateMatchState(nearWin, PlayerColor.WHITE, 1);
      expect(result.matchWinner).toBe(PlayerColor.WHITE);
      expect(result.whiteScore).toBe(7);
    });

    it('should cap points at what is needed to win', () => {
      const nearWin = { ...initialMatch, whiteScore: 6, blackScore: 2 };
      const result = updateMatchState(nearWin, PlayerColor.WHITE, 3); // Gammon worth 2 points
      expect(result.whiteScore).toBe(7); // Should only get 1 point to win
      expect(result.matchWinner).toBe(PlayerColor.WHITE);
    });

    it('should update Crawford game status', () => {
      const nearCrawford = { ...initialMatch, whiteScore: 5, blackScore: 2 };
      const result = updateMatchState(nearCrawford, PlayerColor.WHITE, 1);
      expect(result.crawfordGame).toBe(true);
    });
  });

  describe('canDoubleInMatch', () => {
    it('should allow doubling in normal match play', () => {
      const cubeAt2 = { value: 2, owner: null, canDouble: false, pendingOffer: false, offeringPlayer: null };
      const result = canDoubleInMatch(initialMatch, cubeAt2, PlayerColor.WHITE, 'playing');
      expect(result).toBe(true);
    });

    it('should not allow doubling in Crawford game', () => {
      const cubeAt2 = { value: 2, owner: null, canDouble: false, pendingOffer: false, offeringPlayer: null };
      const crawfordMatch = { ...initialMatch, crawfordGame: true };
      const result = canDoubleInMatch(crawfordMatch, cubeAt2, PlayerColor.WHITE, 'playing');
      expect(result).toBe(false);
    });

    it('should not allow doubling if game is not playing', () => {
      const cubeAt2 = { value: 2, owner: null, canDouble: false, pendingOffer: false, offeringPlayer: null };
      const result = canDoubleInMatch(initialMatch, cubeAt2, PlayerColor.WHITE, 'gameOver');
      expect(result).toBe(false);
    });

    it('should not allow doubling if there is a pending offer', () => {
      const cubeWithOffer = { value: 2, owner: null, canDouble: false, pendingOffer: true, offeringPlayer: PlayerColor.WHITE };
      const result = canDoubleInMatch(initialMatch, cubeWithOffer, PlayerColor.WHITE, 'playing');
      expect(result).toBe(false);
    });
  });

  describe('getMatchScoreDisplay', () => {
    it('should display single game mode', () => {
      const singleGame = { ...initialMatch, isMatchPlay: false };
      const display = getMatchScoreDisplay(singleGame);
      expect(display).toBe('Single Game');
    });

    it('should display match score correctly', () => {
      const matchInProgress = { ...initialMatch, whiteScore: 3, blackScore: 2, gameNumber: 5 };
      const display = getMatchScoreDisplay(matchInProgress);
      expect(display).toContain('Match to 7');
      expect(display).toContain('White 3 - 2 Black');
      expect(display).toContain('Game 5');
    });

    it('should show match winner', () => {
      const matchWon = { ...initialMatch, whiteScore: 7, blackScore: 3, matchWinner: PlayerColor.WHITE };
      const display = getMatchScoreDisplay(matchWon);
      expect(display).toContain('White wins match!');
    });

    it('should show Crawford game status', () => {
      const crawfordMatch = { ...initialMatch, crawfordGame: true };
      const display = getMatchScoreDisplay(crawfordMatch);
      expect(display).toContain('Crawford Game (no doubling)');
    });

    it('should show post-Crawford status', () => {
      const postCrawfordMatch = { ...initialMatch, postCrawford: true };
      const display = getMatchScoreDisplay(postCrawfordMatch);
      expect(display).toContain('Post-Crawford');
    });
  });

  describe('getMatchLengthOptions', () => {
    it('should return all match length options', () => {
      const options = getMatchLengthOptions();
      expect(options).toHaveLength(13);
      expect(options[0]).toEqual({ value: 1, label: '1 Point' });
      expect(options[12]).toEqual({ value: 25, label: '25 Points' });
    });
  });

  describe('calculateMatchPoints', () => {
    it('should return game points for single game mode', () => {
      const singleGame = { ...initialMatch, isMatchPlay: false };
      const points = calculateMatchPoints(2, singleGame);
      expect(points).toBe(2);
    });

    it('should cap points at what is needed to win', () => {
      const nearWin = { ...initialMatch, whiteScore: 6, blackScore: 2 };
      const points = calculateMatchPoints(2, nearWin); // Gammon worth 2 points
      expect(points).toBe(1); // Only need 1 point to win
    });

    it('should return full points when not near win', () => {
      const earlyMatch = { ...initialMatch, whiteScore: 2, blackScore: 1 };
      const points = calculateMatchPoints(2, earlyMatch);
      expect(points).toBe(2);
    });
  });

  describe('getMatchStatusMessage', () => {
    it('should show single game mode message', () => {
      const singleGame = { ...initialMatch, isMatchPlay: false };
      const message = getMatchStatusMessage(singleGame, null, 0);
      expect(message).toBe('Single game mode');
    });

    it('should show match winner message', () => {
      const matchWon = { ...initialMatch, whiteScore: 7, blackScore: 3, matchWinner: PlayerColor.WHITE };
      const message = getMatchStatusMessage(matchWon, null, 0);
      expect(message).toContain('White wins the match 7-3!');
    });

    it('should show game winner with match points', () => {
      const message = getMatchStatusMessage(initialMatch, PlayerColor.WHITE, 2);
      expect(message).toContain('White wins 2 points');
      expect(message).toContain('Match score: 2-0');
    });

    it('should show Crawford game message', () => {
      const crawfordMatch = { ...initialMatch, crawfordGame: true };
      const message = getMatchStatusMessage(crawfordMatch, null, 0);
      expect(message).toBe('Crawford Game - No doubling allowed');
    });

    it('should show post-Crawford message', () => {
      const postCrawfordMatch = { ...initialMatch, postCrawford: true };
      const message = getMatchStatusMessage(postCrawfordMatch, null, 0);
      expect(message).toBe('Post-Crawford phase - Doubling allowed');
    });
  });

  describe('resetMatch', () => {
    it('should reset match to default length', () => {
      const matchInProgress = { ...initialMatch, whiteScore: 3, blackScore: 2, gameNumber: 5 };
      const reset = resetMatch();
      expect(reset.whiteScore).toBe(0);
      expect(reset.blackScore).toBe(0);
      expect(reset.gameNumber).toBe(1);
      expect(reset.matchLength).toBe(7);
    });

    it('should reset match to specified length', () => {
      const reset = resetMatch(MatchLength.POINT_11);
      expect(reset.matchLength).toBe(11);
    });
  });

  describe('isMatchComplete', () => {
    it('should return false for ongoing match', () => {
      expect(isMatchComplete(initialMatch)).toBe(false);
    });

    it('should return true for completed match', () => {
      const matchWon = { ...initialMatch, matchWinner: PlayerColor.WHITE };
      expect(isMatchComplete(matchWon)).toBe(true);
    });
  });

  describe('getLeader', () => {
    it('should return white when white leads', () => {
      const whiteLeading = { ...initialMatch, whiteScore: 3, blackScore: 1 };
      expect(getLeader(whiteLeading)).toBe(PlayerColor.WHITE);
    });

    it('should return black when black leads', () => {
      const blackLeading = { ...initialMatch, whiteScore: 1, blackScore: 3 };
      expect(getLeader(blackLeading)).toBe(PlayerColor.BLACK);
    });

    it('should return null when tied', () => {
      const tied = { ...initialMatch, whiteScore: 2, blackScore: 2 };
      expect(getLeader(tied)).toBe(null);
    });
  });

  describe('getMatchProgress', () => {
    it('should calculate progress percentages correctly', () => {
      const matchInProgress = { ...initialMatch, whiteScore: 3, blackScore: 2 };
      const progress = getMatchProgress(matchInProgress);
      expect(progress.whiteProgress).toBe((3 / 7) * 100);
      expect(progress.blackProgress).toBe((2 / 7) * 100);
    });

    it('should handle zero scores', () => {
      const progress = getMatchProgress(initialMatch);
      expect(progress.whiteProgress).toBe(0);
      expect(progress.blackProgress).toBe(0);
    });

    it('should handle completed match', () => {
      const matchWon = { ...initialMatch, whiteScore: 7, blackScore: 3 };
      const progress = getMatchProgress(matchWon);
      expect(progress.whiteProgress).toBe(100);
      expect(progress.blackProgress).toBe((3 / 7) * 100);
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete match progression', () => {
      let match = initialMatchState(MatchLength.POINT_5);
      
      // Game 1: White wins normal game
      match = updateMatchState(match, PlayerColor.WHITE, 1);
      expect(match.whiteScore).toBe(1);
      expect(match.blackScore).toBe(0);
      expect(match.gameNumber).toBe(2);
      expect(match.crawfordGame).toBe(false);
      
      // Game 2: Black wins gammon
      match = updateMatchState(match, PlayerColor.BLACK, 2);
      expect(match.whiteScore).toBe(1);
      expect(match.blackScore).toBe(2);
      expect(match.gameNumber).toBe(3);
      expect(match.crawfordGame).toBe(false);
      
      // Game 3: White wins normal game
      match = updateMatchState(match, PlayerColor.WHITE, 1);
      expect(match.whiteScore).toBe(2);
      expect(match.blackScore).toBe(2);
      expect(match.gameNumber).toBe(4);
      expect(match.crawfordGame).toBe(false);
      
      // Game 4: Black wins normal game (Crawford game)
      match = updateMatchState(match, PlayerColor.BLACK, 1);
      expect(match.whiteScore).toBe(2);
      expect(match.blackScore).toBe(3);
      expect(match.gameNumber).toBe(5);
      expect(match.crawfordGame).toBe(true);
      
      // Game 5: White wins normal game (post-Crawford)
      match = updateMatchState(match, PlayerColor.WHITE, 1);
      expect(match.whiteScore).toBe(3);
      expect(match.blackScore).toBe(3);
      expect(match.gameNumber).toBe(6);
      expect(match.crawfordGame).toBe(false);
      expect(match.postCrawford).toBe(true);
      
      // Game 6: Black wins match
      match = updateMatchState(match, PlayerColor.BLACK, 2);
      expect(match.whiteScore).toBe(3);
      expect(match.blackScore).toBe(5);
      expect(match.matchWinner).toBe(PlayerColor.BLACK);
    });

    it('should handle points capping correctly', () => {
      let match = initialMatchState(MatchLength.POINT_3);
      
      // White wins gammon when only 1 point needed
      match = updateMatchState(match, PlayerColor.WHITE, 1);
      match = updateMatchState(match, PlayerColor.WHITE, 1);
      expect(match.whiteScore).toBe(2);
      
      // White wins gammon but should only get 1 point
      match = updateMatchState(match, PlayerColor.WHITE, 2);
      expect(match.whiteScore).toBe(3);
      expect(match.matchWinner).toBe(PlayerColor.WHITE);
    });

    it('should handle Crawford game doubling restrictions', () => {
      let match = initialMatchState(MatchLength.POINT_3);
      
      // Get to Crawford game
      match = updateMatchState(match, PlayerColor.WHITE, 1);
      match = updateMatchState(match, PlayerColor.WHITE, 1);
      expect(match.crawfordGame).toBe(true);
      
      // Test doubling restrictions
      const cubeAt2 = { value: 2, owner: null, canDouble: false, pendingOffer: false, offeringPlayer: null };
      expect(canDoubleInMatch(match, cubeAt2, PlayerColor.WHITE, 'playing')).toBe(false);
      expect(canDoubleInMatch(match, cubeAt2, PlayerColor.BLACK, 'playing')).toBe(false);
    });
  });
}); 

describe('Individual Piece State Tracking', () => {
  let enhancedBoardState: any;
  let initialPieces: any[];

  beforeEach(() => {
    enhancedBoardState = initialEnhancedBoardState();
    initialPieces = generateInitialPieces();
  });

  describe('Piece Creation and Initialization', () => {
    it('should create a piece with correct initial state', () => {
      const piece = createPiece('test1', PlayerColor.WHITE, 5);
      expect(piece.id).toBe('test1');
      expect(piece.player).toBe(PlayerColor.WHITE);
      expect(piece.position).toBe(5);
      expect(piece.state).toBe('active');
      expect(piece.moveCount).toBe(0);
      expect(piece.lastMoveTurn).toBe(0);
      expect(piece.isBlot).toBe(false);
    });

    it('should create a piece on bar with correct state', () => {
      const piece = createPiece('test2', PlayerColor.BLACK, BOARD_CONSTANTS.BAR_WHITE);
      expect(piece.state).toBe('onBar');
    });

    it('should create a borne off piece with correct state', () => {
      const piece = createPiece('test3', PlayerColor.WHITE, BOARD_CONSTANTS.OFF_WHITE);
      expect(piece.state).toBe('borneOff');
    });

    it('should generate correct number of initial pieces', () => {
      expect(initialPieces).toHaveLength(30); // 15 white + 15 black
    });

    it('should generate pieces with correct player distribution', () => {
      const whitePieces = initialPieces.filter(p => p.player === PlayerColor.WHITE);
      const blackPieces = initialPieces.filter(p => p.player === PlayerColor.BLACK);
      expect(whitePieces).toHaveLength(15);
      expect(blackPieces).toHaveLength(15);
    });

    it('should generate pieces with correct initial positions', () => {
      const piecesAt0 = initialPieces.filter(p => p.position === 0);
      const piecesAt5 = initialPieces.filter(p => p.position === 5);
      const piecesAt11 = initialPieces.filter(p => p.position === 11);
      
      expect(piecesAt0).toHaveLength(2); // 2 white pieces at point 0
      expect(piecesAt5).toHaveLength(5); // 5 black pieces at point 5
      expect(piecesAt11).toHaveLength(5); // 5 white pieces at point 11
    });

    it('should generate unique piece IDs', () => {
      const ids = initialPieces.map(p => p.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(initialPieces.length);
    });
  });

  describe('Enhanced Board State', () => {
    it('should initialize enhanced board state correctly', () => {
      expect(enhancedBoardState.pieces).toHaveLength(30);
      expect(enhancedBoardState.board).toHaveLength(24);
      expect(enhancedBoardState.bar).toEqual([0, 0]);
      expect(enhancedBoardState.offBoard).toEqual([0, 0]);
      expect(enhancedBoardState.turnNumber).toBe(1);
    });

    it('should clone enhanced board state correctly', () => {
      const cloned = cloneEnhancedBoardState(enhancedBoardState);
      expect(cloned).toEqual(enhancedBoardState);
      expect(cloned).not.toBe(enhancedBoardState); // Should be a new object
      expect(cloned.pieces).not.toBe(enhancedBoardState.pieces); // Should be a new array
    });
  });

  describe('Piece Queries', () => {
    it('should get pieces at specific position', () => {
      const piecesAt0 = getPiecesAtPosition(initialPieces, 0);
      expect(piecesAt0).toHaveLength(2);
      expect(piecesAt0.every(p => p.position === 0)).toBe(true);
    });

    it('should get pieces by player', () => {
      const whitePieces = getPiecesByPlayer(initialPieces, PlayerColor.WHITE);
      const blackPieces = getPiecesByPlayer(initialPieces, PlayerColor.BLACK);
      expect(whitePieces).toHaveLength(15);
      expect(blackPieces).toHaveLength(15);
      expect(whitePieces.every(p => p.player === PlayerColor.WHITE)).toBe(true);
      expect(blackPieces.every(p => p.player === PlayerColor.BLACK)).toBe(true);
    });

    it('should get pieces by state', () => {
      const activePieces = getPiecesByState(initialPieces, 'active');
      const barPieces = getPiecesByState(initialPieces, 'onBar');
      const borneOffPieces = getPiecesByState(initialPieces, 'borneOff');
      
      expect(activePieces).toHaveLength(30); // All pieces start active
      expect(barPieces).toHaveLength(0);
      expect(borneOffPieces).toHaveLength(0);
    });

    it('should get piece by ID', () => {
      const piece = getPieceById(initialPieces, 'w0');
      expect(piece).toBeDefined();
      expect(piece?.id).toBe('w0');
      expect(piece?.player).toBe(PlayerColor.WHITE);
    });

    it('should return undefined for non-existent piece ID', () => {
      const piece = getPieceById(initialPieces, 'nonexistent');
      expect(piece).toBeUndefined();
    });
  });

  describe('Piece Movement', () => {
    it('should move a piece correctly', () => {
      const movedPieces = movePiece(initialPieces, 'w0', 5, 3);
      const movedPiece = getPieceById(movedPieces, 'w0');
      
      expect(movedPiece?.position).toBe(5);
      expect(movedPiece?.moveCount).toBe(1);
      expect(movedPiece?.lastMoveTurn).toBe(3);
      expect(movedPiece?.state).toBe('active');
    });

    it('should move a piece to bar', () => {
      const movedPieces = movePiece(initialPieces, 'w0', BOARD_CONSTANTS.BAR_WHITE, 3);
      const movedPiece = getPieceById(movedPieces, 'w0');
      
      expect(movedPiece?.position).toBe(BOARD_CONSTANTS.BAR_WHITE);
      expect(movedPiece?.state).toBe('onBar');
    });

    it('should move a piece off board', () => {
      const movedPieces = movePiece(initialPieces, 'w0', BOARD_CONSTANTS.OFF_WHITE, 3);
      const movedPiece = getPieceById(movedPieces, 'w0');
      
      expect(movedPiece?.position).toBe(BOARD_CONSTANTS.OFF_WHITE);
      expect(movedPiece?.state).toBe('borneOff');
    });

    it('should increment move count on subsequent moves', () => {
      let movedPieces = movePiece(initialPieces, 'w0', 5, 3);
      movedPieces = movePiece(movedPieces, 'w0', 8, 5);
      const movedPiece = getPieceById(movedPieces, 'w0');
      
      expect(movedPiece?.moveCount).toBe(2);
      expect(movedPiece?.lastMoveTurn).toBe(5);
    });

    it('should not affect other pieces when moving one piece', () => {
      const originalPiece = getPieceById(initialPieces, 'w1');
      const movedPieces = movePiece(initialPieces, 'w0', 5, 3);
      const unchangedPiece = getPieceById(movedPieces, 'w1');
      
      expect(unchangedPiece?.position).toBe(originalPiece?.position);
      expect(unchangedPiece?.moveCount).toBe(originalPiece?.moveCount);
    });
  });

  describe('Blot State Management', () => {
    it('should identify single pieces as blots', () => {
      // Move all pieces away from position 0 except one
      let pieces = movePiece(initialPieces, 'w0', 5, 1);
      pieces = updateBlotStates(pieces);
      
      const remainingPiece = getPieceById(pieces, 'w1');
      expect(remainingPiece?.isBlot).toBe(true);
    });

    it('should not identify multiple pieces as blots', () => {
      const pieces = updateBlotStates(initialPieces);
      const piecesAt0 = getPiecesAtPosition(pieces, 0);
      
      expect(piecesAt0.every(p => !p.isBlot)).toBe(true);
    });

    it('should handle mixed player pieces at same position', () => {
      // Move a black piece to position 0
      let pieces = movePiece(initialPieces, 'b0', 0, 1);
      pieces = updateBlotStates(pieces);
      
      const whitePiecesAt0 = getPiecesAtPosition(pieces, 0).filter(p => p.player === PlayerColor.WHITE);
      const blackPiecesAt0 = getPiecesAtPosition(pieces, 0).filter(p => p.player === PlayerColor.BLACK);
      
      expect(whitePiecesAt0.every(p => !p.isBlot)).toBe(true); // 2 white pieces
      expect(blackPiecesAt0.every(p => p.isBlot)).toBe(true); // 1 black piece
    });
  });

  describe('Board Synchronization', () => {
    it('should synchronize board from pieces correctly', () => {
      const board = synchronizeBoardFromPieces(initialPieces);
      
      expect(board[0]).toEqual([2, 0]); // 2 white pieces at point 0
      expect(board[5]).toEqual([0, 5]); // 5 black pieces at point 5
      expect(board[11]).toEqual([5, 0]); // 5 white pieces at point 11
    });

    it('should synchronize bar from pieces correctly', () => {
      // Move some pieces to bar
      let pieces = movePiece(initialPieces, 'w0', BOARD_CONSTANTS.BAR_WHITE, 1);
      pieces = movePiece(pieces, 'b0', BOARD_CONSTANTS.BAR_WHITE, 1);
      
      const bar = synchronizeBarFromPieces(pieces);
      expect(bar).toEqual([1, 1]); // 1 white, 1 black on bar
    });

    it('should synchronize off board from pieces correctly', () => {
      // Move some pieces off board
      let pieces = movePiece(initialPieces, 'w0', BOARD_CONSTANTS.OFF_WHITE, 1);
      pieces = movePiece(pieces, 'b0', BOARD_CONSTANTS.OFF_BLACK, 1);
      
      const offBoard = synchronizeOffBoardFromPieces(pieces);
      expect(offBoard).toEqual([1, 1]); // 1 white, 1 black borne off
    });
  });

  describe('Board Area Queries', () => {
    it('should get pieces in home board for white', () => {
      const homeBoardPieces = getPiecesInHomeBoard(initialPieces, PlayerColor.WHITE);
      const positions = homeBoardPieces.map(p => p.position);
      
      expect(positions.every(pos => pos >= 0 && pos <= 5)).toBe(true);
      expect(homeBoardPieces.every(p => p.player === PlayerColor.WHITE)).toBe(true);
    });

    it('should get pieces in home board for black', () => {
      const homeBoardPieces = getPiecesInHomeBoard(initialPieces, PlayerColor.BLACK);
      const positions = homeBoardPieces.map(p => p.position);
      
      expect(positions.every(pos => pos >= 18 && pos <= 23)).toBe(true);
      expect(homeBoardPieces.every(p => p.player === PlayerColor.BLACK)).toBe(true);
    });

    it('should get pieces in outer board', () => {
      // Move some pieces to outer board
      let pieces = movePiece(initialPieces, 'w0', 10, 1);
      pieces = movePiece(pieces, 'b0', 15, 1);
      
      const outerBoardPieces = getPiecesInOuterBoard(pieces, PlayerColor.WHITE);
      const positions = outerBoardPieces.map(p => p.position);
      
      expect(positions.every(pos => pos >= 6 && pos <= 17)).toBe(true);
    });
  });

  describe('Movement History and Analysis', () => {
    it('should get piece movement history', () => {
      const history = getPieceMovementHistory(initialPieces);
      
      expect(history).toHaveLength(30);
      expect(history.every(h => h.moves === 0)).toBe(true);
      expect(history.every(h => h.lastMove === 0)).toBe(true);
    });

    it('should get most active pieces', () => {
      // Move some pieces multiple times
      let pieces = movePiece(initialPieces, 'w0', 5, 1);
      pieces = movePiece(pieces, 'w0', 8, 2);
      pieces = movePiece(pieces, 'w1', 6, 1);
      
      const mostActive = getMostActivePieces(pieces, PlayerColor.WHITE, 3);
      expect(mostActive[0].id).toBe('w0'); // Most moves
      expect(mostActive[0].moveCount).toBe(2);
    });

    it('should get least active pieces', () => {
      // Move some pieces
      let pieces = movePiece(initialPieces, 'w0', 5, 1);
      pieces = movePiece(pieces, 'w1', 6, 1);
      
      const leastActive = getLeastActivePieces(pieces, PlayerColor.WHITE, 3);
      expect(leastActive.every(p => p.moveCount === 0 || p.moveCount === 1)).toBe(true);
    });

    it('should get pieces not moved this turn', () => {
      // Move some pieces in turn 3
      let pieces = movePiece(initialPieces, 'w0', 5, 3);
      pieces = movePiece(pieces, 'w1', 6, 3);
      
      const notMovedThisTurn = getPiecesNotMovedThisTurn(pieces, PlayerColor.WHITE, 3);
      expect(notMovedThisTurn.every(p => p.lastMoveTurn < 3)).toBe(true);
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete piece movement sequence', () => {
      let pieces = initialPieces;
      let turnNumber = 1;
      
      // Move a piece from initial position
      pieces = movePiece(pieces, 'w0', 5, turnNumber++);
      expect(getPieceById(pieces, 'w0')?.position).toBe(5);
      expect(getPieceById(pieces, 'w0')?.moveCount).toBe(1);
      
      // Move it to bar
      pieces = movePiece(pieces, 'w0', BOARD_CONSTANTS.BAR_WHITE, turnNumber++);
      expect(getPieceById(pieces, 'w0')?.state).toBe('onBar');
      
      // Move it back to board
      pieces = movePiece(pieces, 'w0', 10, turnNumber++);
      expect(getPieceById(pieces, 'w0')?.state).toBe('active');
      expect(getPieceById(pieces, 'w0')?.moveCount).toBe(3);
      
      // Update blot states
      pieces = updateBlotStates(pieces);
      expect(getPieceById(pieces, 'w0')?.isBlot).toBe(true); // Single piece at position 10
    });

    it('should maintain board synchronization through moves', () => {
      let pieces = initialPieces;
      
      // Move pieces around
      pieces = movePiece(pieces, 'w0', 5, 1);
      pieces = movePiece(pieces, 'w1', 5, 1);
      pieces = movePiece(pieces, 'b0', BOARD_CONSTANTS.BAR_WHITE, 1);
      
      // Synchronize board
      const board = synchronizeBoardFromPieces(pieces);
      const bar = synchronizeBarFromPieces(pieces);
      
      expect(board[5]).toEqual([2, 4]); // 2 white, 4 black at point 5
      expect(bar).toEqual([0, 1]); // 1 black on bar
    });

    it('should track piece activity correctly', () => {
      let pieces = initialPieces;
      let turnNumber = 1;
      
      // Move different pieces
      pieces = movePiece(pieces, 'w0', 5, turnNumber++);
      pieces = movePiece(pieces, 'w0', 8, turnNumber++);
      pieces = movePiece(pieces, 'w1', 6, turnNumber++);
      pieces = movePiece(pieces, 'b0', 15, turnNumber++);
      
      const mostActive = getMostActivePieces(pieces, PlayerColor.WHITE, 5);
      const leastActive = getLeastActivePieces(pieces, PlayerColor.WHITE, 5);
      
      expect(mostActive[0].id).toBe('w0'); // Most moves
      expect(mostActive[0].moveCount).toBe(2);
      expect(leastActive.every(p => p.moveCount <= 1)).toBe(true);
    });
  });
}); 

describe('Home Board and Outer Board Distinction', () => {
  describe('BOARD_REGIONS constants', () => {
    it('should define correct board regions', () => {
      expect(BOARD_REGIONS.WHITE_HOME).toEqual([0, 5]);
      expect(BOARD_REGIONS.BLACK_HOME).toEqual([18, 23]);
      expect(BOARD_REGIONS.OUTER_BOARD).toEqual([6, 17]);
    });
  });

  describe('isInHomeBoard', () => {
    it('should correctly identify white home board points', () => {
      expect(isInHomeBoard(0, PlayerColor.WHITE)).toBe(true);
      expect(isInHomeBoard(3, PlayerColor.WHITE)).toBe(true);
      expect(isInHomeBoard(5, PlayerColor.WHITE)).toBe(true);
      expect(isInHomeBoard(6, PlayerColor.WHITE)).toBe(false);
      expect(isInHomeBoard(18, PlayerColor.WHITE)).toBe(false);
    });

    it('should correctly identify black home board points', () => {
      expect(isInHomeBoard(18, PlayerColor.BLACK)).toBe(true);
      expect(isInHomeBoard(20, PlayerColor.BLACK)).toBe(true);
      expect(isInHomeBoard(23, PlayerColor.BLACK)).toBe(true);
      expect(isInHomeBoard(17, PlayerColor.BLACK)).toBe(false);
      expect(isInHomeBoard(5, PlayerColor.BLACK)).toBe(false);
    });
  });

  describe('isInOuterBoard', () => {
    it('should correctly identify outer board points', () => {
      expect(isInOuterBoard(6)).toBe(true);
      expect(isInOuterBoard(12)).toBe(true);
      expect(isInOuterBoard(17)).toBe(true);
      expect(isInOuterBoard(5)).toBe(false);
      expect(isInOuterBoard(18)).toBe(false);
    });
  });

  describe('getHomeBoardRange', () => {
    it('should return correct home board range for white', () => {
      expect(getHomeBoardRange(PlayerColor.WHITE)).toEqual([0, 5]);
    });

    it('should return correct home board range for black', () => {
      expect(getHomeBoardRange(PlayerColor.BLACK)).toEqual([18, 23]);
    });
  });

  describe('getOuterBoardRange', () => {
    it('should return correct outer board range', () => {
      expect(getOuterBoardRange()).toEqual([6, 17]);
    });
  });

  describe('isPointInRegion', () => {
    it('should correctly check if point is in region', () => {
      expect(isPointInRegion(3, [0, 5])).toBe(true);
      expect(isPointInRegion(6, [0, 5])).toBe(false);
      expect(isPointInRegion(20, [18, 23])).toBe(true);
      expect(isPointInRegion(17, [18, 23])).toBe(false);
    });
  });

  describe('getBoardRegion', () => {
    it('should correctly identify board regions', () => {
      expect(getBoardRegion(3)).toBe('whiteHome');
      expect(getBoardRegion(20)).toBe('blackHome');
      expect(getBoardRegion(12)).toBe('outerBoard');
      expect(getBoardRegion(25)).toBe('invalid');
    });
  });

  describe('validateMoveByRegion', () => {
    let boardState: any; // Changed from ExtendedBoardState to any as ExtendedBoardState is not defined here

    beforeEach(() => {
      boardState = initialExtendedBoardState();
    });

    it('should validate basic moves correctly', () => {
      // Set up a simple board state
      boardState.board[5] = [1, 0]; // White piece at point 5
      boardState.board[7] = [0, 0]; // Empty point 7

      expect(validateMoveByRegion(boardState, 5, 7, PlayerColor.WHITE, 2)).toBe(true);
      expect(validateMoveByRegion(boardState, 5, 8, PlayerColor.WHITE, 2)).toBe(false); // Wrong distance
      expect(validateMoveByRegion(boardState, 5, 3, PlayerColor.WHITE, 2)).toBe(false); // Wrong direction
    });

    it('should validate moves with opponent pieces', () => {
      boardState.board[5] = [1, 0]; // White piece at point 5
      boardState.board[7] = [0, 1]; // Black blot at point 7
      boardState.board[8] = [0, 2]; // Black stack at point 8

      expect(validateMoveByRegion(boardState, 5, 7, PlayerColor.WHITE, 2)).toBe(true); // Can hit blot
      expect(validateMoveByRegion(boardState, 5, 8, PlayerColor.WHITE, 3)).toBe(false); // Blocked by stack
    });

    it('should validate moves with own pieces', () => {
      boardState.board[5] = [1, 0]; // White piece at point 5
      boardState.board[7] = [2, 0]; // White stack at point 7

      expect(validateMoveByRegion(boardState, 5, 7, PlayerColor.WHITE, 2)).toBe(true); // Can move to own stack
    });
  });

  describe('canMoveFromRegion', () => {
    let boardState: any; // Changed from ExtendedBoardState to any

    beforeEach(() => {
      boardState = initialExtendedBoardState();
    });

    it('should check if player can move from point', () => {
      boardState.board[5] = [1, 0]; // White piece at point 5
      boardState.board[7] = [0, 1]; // Black piece at point 7

      expect(canMoveFromRegion(boardState, 5, PlayerColor.WHITE)).toBe(true);
      expect(canMoveFromRegion(boardState, 7, PlayerColor.WHITE)).toBe(false);
      expect(canMoveFromRegion(boardState, 7, PlayerColor.BLACK)).toBe(true);
      expect(canMoveFromRegion(boardState, 10, PlayerColor.WHITE)).toBe(false); // No pieces
    });
  });

  describe('canMoveToRegion', () => {
    let boardState: any; // Changed from ExtendedBoardState to any

    beforeEach(() => {
      boardState = initialExtendedBoardState();
    });

    it('should check if player can move to point', () => {
      boardState.board[7] = [0, 0]; // Empty point
      boardState.board[8] = [0, 1]; // Black blot
      boardState.board[9] = [0, 2]; // Black stack
      boardState.board[10] = [1, 0]; // White stack

      expect(canMoveToRegion(boardState, 7, PlayerColor.WHITE)).toBe(true); // Empty point
      expect(canMoveToRegion(boardState, 8, PlayerColor.WHITE)).toBe(true); // Can hit blot
      expect(canMoveToRegion(boardState, 9, PlayerColor.WHITE)).toBe(false); // Blocked by stack
      expect(canMoveToRegion(boardState, 10, PlayerColor.WHITE)).toBe(true); // Own stack
    });
  });

  describe('getValidMovesFromRegion', () => {
    let boardState: any; // Changed from ExtendedBoardState to any

    beforeEach(() => {
      boardState = initialExtendedBoardState();
    });

    it('should get valid moves from a point', () => {
      boardState.board[5] = [1, 0]; // White piece at point 5
      boardState.board[7] = [0, 0]; // Empty point 7
      boardState.board[8] = [0, 1]; // Black blot at point 8

      expect(getValidMovesFromRegion(boardState, 5, PlayerColor.WHITE, 2)).toEqual([7]);
      expect(getValidMovesFromRegion(boardState, 5, PlayerColor.WHITE, 3)).toEqual([8]);
      expect(getValidMovesFromRegion(boardState, 5, PlayerColor.WHITE, 1)).toEqual([]); // Would go off board
    });
  });

  describe('getRegionStatus', () => {
    let boardState: any; // Changed from ExtendedBoardState to any

    beforeEach(() => {
      boardState = initialExtendedBoardState();
    });

    it('should calculate region status for white', () => {
      // Set up board with pieces in different regions
      boardState.board[0] = [2, 0]; // White in home board
      boardState.board[3] = [1, 0]; // White in home board
      boardState.board[10] = [1, 0]; // White in outer board
      boardState.board[15] = [1, 0]; // White in outer board

      const status = getRegionStatus(boardState, PlayerColor.WHITE);

      expect(status.homeBoardPieces).toBe(3);
      expect(status.outerBoardPieces).toBe(2);
      expect(status.homeBoardPoints).toEqual([0, 3]);
      expect(status.outerBoardPoints).toEqual([10, 15]);
      expect(status.canBearOff).toBe(false);
      expect(status.regionMessage).toContain('has 2 pieces in outer board');
    });

    it('should detect when player can bear off', () => {
      // Set up board with all pieces in home board
      for (let i = 0; i <= 5; i++) {
        boardState.board[i] = [3, 0]; // 3 pieces per point = 18 total
      }
      boardState.board[0] = [2, 0]; // Adjust to exactly 15 pieces

      const status = getRegionStatus(boardState, PlayerColor.WHITE);

      expect(status.homeBoardPieces).toBe(15);
      expect(status.outerBoardPieces).toBe(0);
      expect(status.canBearOff).toBe(true);
      expect(status.regionMessage).toContain('can bear off pieces');
    });
  });

  describe('validateBearingOffByRegion', () => {
    let boardState: any; // Changed from ExtendedBoardState to any

    beforeEach(() => {
      boardState = initialExtendedBoardState();
    });

    it('should validate bearing off moves correctly', () => {
      // Set up board with all pieces in home board
      for (let i = 0; i <= 5; i++) {
        boardState.board[i] = [3, 0];
      }
      boardState.board[0] = [2, 0]; // Adjust to exactly 15 pieces

      // Test exact die roll
      expect(validateBearingOffByRegion(boardState, 5, PlayerColor.WHITE, 1)).toBe(true);
      expect(validateBearingOffByRegion(boardState, 4, PlayerColor.WHITE, 2)).toBe(true);

      // Test higher point bearing off
      expect(validateBearingOffByRegion(boardState, 3, PlayerColor.WHITE, 1)).toBe(false); // Must bear off from highest first
    });

    it('should reject bearing off when not all pieces are in home board', () => {
      boardState.board[0] = [1, 0]; // Only one piece in home board
      boardState.board[10] = [1, 0]; // Piece in outer board

      expect(validateBearingOffByRegion(boardState, 0, PlayerColor.WHITE, 1)).toBe(false);
    });

    it('should reject bearing off from outer board', () => {
      boardState.board[10] = [1, 0]; // Piece in outer board

      expect(validateBearingOffByRegion(boardState, 10, PlayerColor.WHITE, 1)).toBe(false);
    });
  });

  describe('getBearingOffMovesByRegion', () => {
    let boardState: any; // Changed from ExtendedBoardState to any

    beforeEach(() => {
      boardState = initialExtendedBoardState();
    });

    it('should get bearing off moves when all pieces are in home board', () => {
      // Set up board with all pieces in home board
      for (let i = 0; i <= 5; i++) {
        boardState.board[i] = [3, 0];
      }
      boardState.board[0] = [2, 0]; // Adjust to exactly 15 pieces

      const moves = getBearingOffMovesByRegion(boardState, PlayerColor.WHITE, [1, 2], []);

      expect(moves.length).toBeGreaterThan(0);
      expect(moves.every(([from, to]) => to === BOARD_CONSTANTS.OFF_WHITE)).toBe(true);
    });

    it('should return empty array when not all pieces are in home board', () => {
      boardState.board[0] = [1, 0]; // Only one piece in home board
      boardState.board[10] = [1, 0]; // Piece in outer board

      const moves = getBearingOffMovesByRegion(boardState, PlayerColor.WHITE, [1, 2], []);

      expect(moves).toEqual([]);
    });
  });

  describe('getRegionBasedValidMoves', () => {
    let boardState: any; // Changed from ExtendedBoardState to any

    beforeEach(() => {
      boardState = initialExtendedBoardState();
    });

    it('should prioritize bar re-entry moves', () => {
      boardState.bar = [1, 0]; // White has piece on bar
      boardState.board[5] = [0, 0]; // Empty point 5

      const moves = getRegionBasedValidMoves(boardState, PlayerColor.WHITE, [5], []);

      expect(moves.length).toBeGreaterThan(0);
      expect(moves.every(([from, to]) => from === BOARD_CONSTANTS.BAR_WHITE)).toBe(true);
    });

    it('should include bearing off moves when available', () => {
      // Set up board with all pieces in home board
      for (let i = 0; i <= 5; i++) {
        boardState.board[i] = [3, 0];
      }
      boardState.board[0] = [2, 0]; // Adjust to exactly 15 pieces

      const moves = getRegionBasedValidMoves(boardState, PlayerColor.WHITE, [1, 2], []);

      expect(moves.some(([from, to]) => to === BOARD_CONSTANTS.OFF_WHITE)).toBe(true);
    });

    it('should include regular moves', () => {
      boardState.board[5] = [1, 0]; // White piece at point 5
      boardState.board[7] = [0, 0]; // Empty point 7

      const moves = getRegionBasedValidMoves(boardState, PlayerColor.WHITE, [2], []);

      expect(moves.some(([from, to]) => from === 5 && to === 7)).toBe(true);
    });
  });

  describe('getRegionDisplayInfo', () => {
    it('should return correct display info for white home board', () => {
      const info = getRegionDisplayInfo(3);
      expect(info.region).toBe('White Home Board');
      expect(info.color).toBe('#f0f8ff');
      expect(info.label).toBe('W4');
    });

    it('should return correct display info for black home board', () => {
      const info = getRegionDisplayInfo(20);
      expect(info.region).toBe('Black Home Board');
      expect(info.color).toBe('#fff8f0');
      expect(info.label).toBe('B4');
    });

    it('should return correct display info for outer board', () => {
      const info = getRegionDisplayInfo(12);
      expect(info.region).toBe('Outer Board');
      expect(info.color).toBe('#f8f8f8');
      expect(info.label).toBe('13');
    });

    it('should return correct display info for invalid points', () => {
      const info = getRegionDisplayInfo(25);
      expect(info.region).toBe('Invalid');
      expect(info.color).toBe('#ff0000');
      expect(info.label).toBe('X');
    });
  });

  describe('Integration tests', () => {
    let boardState: any; // Changed from ExtendedBoardState to any

    beforeEach(() => {
      boardState = initialExtendedBoardState();
    });

    it('should handle complete game flow with region validation', () => {
      // Set up a realistic game state
      boardState.board[0] = [2, 0]; // White pieces in home board
      boardState.board[3] = [1, 0];
      boardState.board[10] = [1, 0]; // White piece in outer board
      boardState.board[20] = [0, 2]; // Black pieces in home board

      // Test region status
      const whiteStatus = getRegionStatus(boardState, PlayerColor.WHITE);
      expect(whiteStatus.homeBoardPieces).toBe(3);
      expect(whiteStatus.outerBoardPieces).toBe(1);
      expect(whiteStatus.canBearOff).toBe(false);

      // Test move validation
      expect(validateMoveByRegion(boardState, 10, 12, PlayerColor.WHITE, 2)).toBe(true);
      expect(validateMoveByRegion(boardState, 0, 2, PlayerColor.WHITE, 2)).toBe(true);

      // Test bearing off validation
      expect(validateBearingOffByRegion(boardState, 0, PlayerColor.WHITE, 1)).toBe(false); // Can't bear off yet
    });

    it('should handle bearing off phase correctly', () => {
      // Set up board ready for bearing off
      for (let i = 0; i <= 5; i++) {
        boardState.board[i] = [3, 0];
      }
      boardState.board[0] = [2, 0]; // Adjust to exactly 15 pieces

      const status = getRegionStatus(boardState, PlayerColor.WHITE);
      expect(status.canBearOff).toBe(true);

      // Test bearing off moves
      const moves = getBearingOffMovesByRegion(boardState, PlayerColor.WHITE, [1, 2], []);
      expect(moves.length).toBeGreaterThan(0);

      // Test bearing off validation
      expect(validateBearingOffByRegion(boardState, 5, PlayerColor.WHITE, 1)).toBe(true);
      expect(validateBearingOffByRegion(boardState, 4, PlayerColor.WHITE, 2)).toBe(true);
    });
  });
}); 

describe('Enhanced Bar and Off-Board Piece Tracking', () => {
  describe('getBarStatus', () => {
    it('should return correct status for empty bar', () => {
      const boardState = initialExtendedBoardState();
      const status = getBarStatus(boardState);
      
      expect(status.whitePieces).toBe(0);
      expect(status.blackPieces).toBe(0);
      expect(status.totalPieces).toBe(0);
      expect(status.hasPieces).toBe(false);
      expect(status.statusMessage).toBe('No pieces on bar');
    });

    it('should return correct status for white pieces on bar', () => {
      const boardState = initialExtendedBoardState();
      boardState.bar[0] = 2;
      
      const status = getBarStatus(boardState);
      
      expect(status.whitePieces).toBe(2);
      expect(status.blackPieces).toBe(0);
      expect(status.totalPieces).toBe(2);
      expect(status.hasPieces).toBe(true);
      expect(status.statusMessage).toBe('2 white pieces on bar');
    });

    it('should return correct status for black pieces on bar', () => {
      const boardState = initialExtendedBoardState();
      boardState.bar[1] = 1;
      
      const status = getBarStatus(boardState);
      
      expect(status.whitePieces).toBe(0);
      expect(status.blackPieces).toBe(1);
      expect(status.totalPieces).toBe(1);
      expect(status.hasPieces).toBe(true);
      expect(status.statusMessage).toBe('1 black piece on bar');
    });

    it('should return correct status for both players on bar', () => {
      const boardState = initialExtendedBoardState();
      boardState.bar[0] = 3;
      boardState.bar[1] = 2;
      
      const status = getBarStatus(boardState);
      
      expect(status.whitePieces).toBe(3);
      expect(status.blackPieces).toBe(2);
      expect(status.totalPieces).toBe(5);
      expect(status.hasPieces).toBe(true);
      expect(status.statusMessage).toBe('White: 3, Black: 2 pieces on bar');
    });
  });

  describe('getOffBoardStatus', () => {
    it('should return correct status for empty off-board', () => {
      const boardState = initialExtendedBoardState();
      const status = getOffBoardStatus(boardState);
      
      expect(status.whitePieces).toBe(0);
      expect(status.blackPieces).toBe(0);
      expect(status.totalPieces).toBe(0);
      expect(status.hasPieces).toBe(false);
      expect(status.statusMessage).toBe('No pieces borne off');
    });

    it('should return correct status for white pieces borne off', () => {
      const boardState = initialExtendedBoardState();
      boardState.offBoard[0] = 5;
      
      const status = getOffBoardStatus(boardState);
      
      expect(status.whitePieces).toBe(5);
      expect(status.blackPieces).toBe(0);
      expect(status.totalPieces).toBe(5);
      expect(status.hasPieces).toBe(true);
      expect(status.statusMessage).toBe('5 white pieces borne off');
    });

    it('should return correct status for black pieces borne off', () => {
      const boardState = initialExtendedBoardState();
      boardState.offBoard[1] = 1;
      
      const status = getOffBoardStatus(boardState);
      
      expect(status.whitePieces).toBe(0);
      expect(status.blackPieces).toBe(1);
      expect(status.totalPieces).toBe(1);
      expect(status.hasPieces).toBe(true);
      expect(status.statusMessage).toBe('1 black piece borne off');
    });

    it('should return correct status for both players borne off', () => {
      const boardState = initialExtendedBoardState();
      boardState.offBoard[0] = 8;
      boardState.offBoard[1] = 6;
      
      const status = getOffBoardStatus(boardState);
      
      expect(status.whitePieces).toBe(8);
      expect(status.blackPieces).toBe(6);
      expect(status.totalPieces).toBe(14);
      expect(status.hasPieces).toBe(true);
      expect(status.statusMessage).toBe('White: 8, Black: 6 pieces borne off');
    });
  });

  describe('addPieceToBar and removePieceFromBar', () => {
    it('should add pieces to bar correctly', () => {
      const boardState = initialExtendedBoardState();
      
      let newState = addPieceToBar(boardState, PlayerColor.WHITE, 2);
      expect(newState.bar[0]).toBe(2);
      expect(newState.bar[1]).toBe(0);
      
      newState = addPieceToBar(newState, PlayerColor.BLACK, 1);
      expect(newState.bar[0]).toBe(2);
      expect(newState.bar[1]).toBe(1);
    });

    it('should remove pieces from bar correctly', () => {
      const boardState = initialExtendedBoardState();
      boardState.bar[0] = 3;
      boardState.bar[1] = 2;
      
      let newState = removePieceFromBar(boardState, PlayerColor.WHITE, 1);
      expect(newState.bar[0]).toBe(2);
      expect(newState.bar[1]).toBe(2);
      
      newState = removePieceFromBar(newState, PlayerColor.BLACK, 2);
      expect(newState.bar[0]).toBe(2);
      expect(newState.bar[1]).toBe(0);
    });

    it('should not allow negative bar pieces', () => {
      const boardState = initialExtendedBoardState();
      boardState.bar[0] = 1;
      
      const newState = removePieceFromBar(boardState, PlayerColor.WHITE, 3);
      expect(newState.bar[0]).toBe(0);
    });
  });

  describe('addPieceToOffBoard and removePieceFromOffBoard', () => {
    it('should add pieces to off-board correctly', () => {
      const boardState = initialExtendedBoardState();
      
      let newState = addPieceToOffBoard(boardState, PlayerColor.WHITE, 3);
      expect(newState.offBoard[0]).toBe(3);
      expect(newState.offBoard[1]).toBe(0);
      
      newState = addPieceToOffBoard(newState, PlayerColor.BLACK, 2);
      expect(newState.offBoard[0]).toBe(3);
      expect(newState.offBoard[1]).toBe(2);
    });

    it('should remove pieces from off-board correctly', () => {
      const boardState = initialExtendedBoardState();
      boardState.offBoard[0] = 5;
      boardState.offBoard[1] = 3;
      
      let newState = removePieceFromOffBoard(boardState, PlayerColor.WHITE, 2);
      expect(newState.offBoard[0]).toBe(3);
      expect(newState.offBoard[1]).toBe(3);
      
      newState = removePieceFromOffBoard(newState, PlayerColor.BLACK, 3);
      expect(newState.offBoard[0]).toBe(3);
      expect(newState.offBoard[1]).toBe(0);
    });

    it('should not allow negative off-board pieces', () => {
      const boardState = initialExtendedBoardState();
      boardState.offBoard[1] = 1;
      
      const newState = removePieceFromOffBoard(boardState, PlayerColor.BLACK, 3);
      expect(newState.offBoard[1]).toBe(0);
    });
  });

  describe('getBarReentryOptions', () => {
    it('should return empty options when no pieces on bar', () => {
      const boardState = initialExtendedBoardState();
      const dice = [3, 4];
      
      const options = getBarReentryOptions(boardState, PlayerColor.WHITE, dice);
      
      expect(options.availableDice).toEqual([]);
      expect(options.blockedDice).toEqual([]);
      expect(options.reentryPoints.size).toBe(0);
      expect(options.statusMessage).toBe('No pieces on bar');
    });

    it('should return available re-entry options for white', () => {
      const boardState = initialExtendedBoardState();
      boardState.bar[0] = 1;
      const dice = [3, 4];
      
      const options = getBarReentryOptions(boardState, PlayerColor.WHITE, dice);
      
      expect(options.availableDice).toContain(3);
      expect(options.availableDice).toContain(4);
      expect(options.blockedDice).toEqual([]);
      expect(options.reentryPoints.get(3)).toBe(21); // 24 - 3
      expect(options.reentryPoints.get(4)).toBe(20); // 24 - 4
      expect(options.statusMessage).toBe('All re-entry options available');
    });

    it('should return available re-entry options for black', () => {
      const boardState = initialExtendedBoardState();
      boardState.bar[1] = 1;
      const dice = [2, 5];
      
      const options = getBarReentryOptions(boardState, PlayerColor.BLACK, dice);
      
      expect(options.availableDice).toContain(2);
      expect(options.availableDice).toContain(5);
      expect(options.blockedDice).toEqual([]);
      expect(options.reentryPoints.get(2)).toBe(1); // 2 - 1
      expect(options.reentryPoints.get(5)).toBe(4); // 5 - 1
      expect(options.statusMessage).toBe('All re-entry options available');
    });

    it('should handle blocked re-entry points', () => {
      const boardState = initialExtendedBoardState();
      boardState.bar[0] = 1;
      boardState.board[21][1] = 2; // Black blocks point 21
      const dice = [3, 4];
      
      const options = getBarReentryOptions(boardState, PlayerColor.WHITE, dice);
      
      expect(options.availableDice).toEqual([4]);
      expect(options.blockedDice).toEqual([3]);
      expect(options.reentryPoints.get(4)).toBe(20);
      expect(options.statusMessage).toBe('1 re-entry option available');
    });
  });

  describe('validateBarAndOffBoardState', () => {
    it('should validate correct state', () => {
      const boardState = initialExtendedBoardState();
      
      const validation = validateBarAndOffBoardState(boardState);
      
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toEqual([]);
      expect(validation.warnings).toEqual([]);
    });

    it('should detect negative values', () => {
      const boardState = initialExtendedBoardState();
      boardState.bar[0] = -1;
      boardState.offBoard[1] = -2;
      
      const validation = validateBarAndOffBoardState(boardState);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('White bar pieces cannot be negative');
      expect(validation.errors).toContain('Black off-board pieces cannot be negative');
    });

    it('should warn about unusually high values', () => {
      const boardState = initialExtendedBoardState();
      boardState.bar[0] = 16;
      boardState.offBoard[1] = 20;
      
      const validation = validateBarAndOffBoardState(boardState);
      
      expect(validation.isValid).toBe(true);
      expect(validation.warnings).toContain('Unusually high number of white pieces on bar');
      expect(validation.warnings).toContain('Unusually high number of black pieces borne off');
    });

    it('should detect total piece count inconsistency', () => {
      const boardState = initialExtendedBoardState();
      boardState.offBoard[0] = 20; // Too many pieces borne off
      
      const validation = validateBarAndOffBoardState(boardState);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Total pieces should be 30, found 35');
    });
  });

  describe('synchronizeBarAndOffBoardWithBoard', () => {
    it('should synchronize bar state correctly', () => {
      const boardState = initialExtendedBoardState();
      boardState.offBoard[0] = 5; // White has 5 pieces borne off
      boardState.offBoard[1] = 3; // Black has 3 pieces borne off
      
      const synchronized = synchronizeBarAndOffBoardWithBoard(boardState);
      
      // Should calculate bar pieces based on board pieces and off-board pieces
      expect(synchronized.bar[0]).toBeGreaterThanOrEqual(0);
      expect(synchronized.bar[1]).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getBarAndOffBoardDisplayInfo', () => {
    it('should return correct display info for empty state', () => {
      const boardState = initialExtendedBoardState();
      
      const displayInfo = getBarAndOffBoardDisplayInfo(boardState);
      
      expect(displayInfo.bar.hasPieces).toBe(false);
      expect(displayInfo.bar.totalCount).toBe(0);
      expect(displayInfo.bar.label).toBe('Bar');
      expect(displayInfo.offBoard.hasPieces).toBe(false);
      expect(displayInfo.offBoard.totalCount).toBe(0);
      expect(displayInfo.offBoard.label).toBe('Off');
    });

    it('should return correct display info with pieces', () => {
      const boardState = initialExtendedBoardState();
      boardState.bar[0] = 2;
      boardState.offBoard[1] = 4;
      
      const displayInfo = getBarAndOffBoardDisplayInfo(boardState);
      
      expect(displayInfo.bar.hasPieces).toBe(true);
      expect(displayInfo.bar.totalCount).toBe(2);
      expect(displayInfo.bar.label).toBe('Bar: 2');
      expect(displayInfo.offBoard.hasPieces).toBe(true);
      expect(displayInfo.offBoard.totalCount).toBe(4);
      expect(displayInfo.offBoard.label).toBe('Off: 4');
    });
  });

  describe('getBarAndOffBoardSummary', () => {
    it('should return correct summary for initial state', () => {
      const boardState = initialExtendedBoardState();
      
      const summary = getBarAndOffBoardSummary(boardState);
      
      expect(summary.whiteSummary.total).toBe(15);
      expect(summary.blackSummary.total).toBe(15);
      expect(summary.gamePhase).toBe('early');
    });

    it('should return correct summary with pieces in different locations', () => {
      const boardState = initialExtendedBoardState();
      boardState.bar[0] = 2;
      boardState.offBoard[1] = 5;
      
      const summary = getBarAndOffBoardSummary(boardState);
      
      expect(summary.whiteSummary.onBar).toBe(2);
      expect(summary.blackSummary.borneOff).toBe(5);
      expect(summary.gamePhase).toBe('late');
    });

    it('should determine bearing-off phase correctly', () => {
      const boardState = initialExtendedBoardState();
      boardState.offBoard[0] = 8;
      boardState.offBoard[1] = 6;
      
      const summary = getBarAndOffBoardSummary(boardState);
      
      expect(summary.gamePhase).toBe('bearing-off');
    });
  });

  describe('canMoveFromBarOrOffBoard', () => {
    it('should allow moves from bar when pieces are present', () => {
      const boardState = initialExtendedBoardState();
      boardState.bar[0] = 1;
      
      expect(canMoveFromBarOrOffBoard(boardState, PlayerColor.WHITE, 'bar')).toBe(true);
      expect(canMoveFromBarOrOffBoard(boardState, PlayerColor.BLACK, 'bar')).toBe(false);
    });

    it('should not allow moves from off-board', () => {
      const boardState = initialExtendedBoardState();
      boardState.offBoard[0] = 5;
      
      expect(canMoveFromBarOrOffBoard(boardState, PlayerColor.WHITE, 'offBoard')).toBe(false);
      expect(canMoveFromBarOrOffBoard(boardState, PlayerColor.BLACK, 'offBoard')).toBe(false);
    });
  });

  describe('getBarAndOffBoardMoveValidation', () => {
    it('should validate bar moves correctly', () => {
      const boardState = initialExtendedBoardState();
      boardState.bar[0] = 1;
      
      const validation = getBarAndOffBoardMoveValidation(boardState, BOARD_CONSTANTS.BAR_WHITE, 20, PlayerColor.WHITE);
      
      expect(validation.isValid).toBe(true);
      expect(validation.sourceType).toBe('bar');
      expect(validation.errorMessage).toBe('');
    });

    it('should reject moves from empty bar', () => {
      const boardState = initialExtendedBoardState();
      
      const validation = getBarAndOffBoardMoveValidation(boardState, BOARD_CONSTANTS.BAR_WHITE, 20, PlayerColor.WHITE);
      
      expect(validation.isValid).toBe(false);
      expect(validation.sourceType).toBe('bar');
      expect(validation.errorMessage).toBe('No pieces on bar to move');
    });

    it('should reject moves from off-board', () => {
      const boardState = initialExtendedBoardState();
      boardState.offBoard[0] = 5;
      
      const validation = getBarAndOffBoardMoveValidation(boardState, BOARD_CONSTANTS.OFF_WHITE, 20, PlayerColor.WHITE);
      
      expect(validation.isValid).toBe(false);
      expect(validation.sourceType).toBe('offBoard');
      expect(validation.errorMessage).toBe('Cannot move pieces from off-board');
    });

    it('should validate regular board moves', () => {
      const boardState = initialExtendedBoardState();
      
      const validation = getBarAndOffBoardMoveValidation(boardState, 5, 8, PlayerColor.WHITE);
      
      expect(validation.isValid).toBe(true);
      expect(validation.sourceType).toBe('board');
      expect(validation.errorMessage).toBe('');
    });
  });

  describe('executeBearingOffMove with ExtendedBoardState', () => {
    it('should execute bearing off move and update off-board tracking', () => {
      const boardState = initialExtendedBoardState();
      boardState.board[23][0] = 1; // White piece on point 23
      
      const newState = executeBearingOffMove(boardState, 23, 24, PlayerColor.WHITE);
      
      expect(newState.board[23][0]).toBe(0); // Piece removed from board
      expect(newState.offBoard[0]).toBe(1); // Piece added to off-board
      expect(newState.offBoard[1]).toBe(0); // Black off-board unchanged
    });

    it('should handle multiple bearing off moves', () => {
      const boardState = initialExtendedBoardState();
      boardState.board[23][0] = 3; // Multiple white pieces on point 23
      boardState.offBoard[0] = 2; // Already some pieces borne off
      
      const newState = executeBearingOffMove(boardState, 23, 24, PlayerColor.WHITE);
      
      expect(newState.board[23][0]).toBe(2); // One piece removed
      expect(newState.offBoard[0]).toBe(3); // One piece added to off-board
    });
  });
}); 