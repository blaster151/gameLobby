import React from 'react';
import Link from 'next/link';
import { useBackgammonStore, PlayerColor, BotDifficulty, GameMode, canBearOff, hasPiecesOnBar, getBarReentryMoves, validateBarReentryMove, executeBarReentryMove, hitPiece, isBlot, canHitBlot, canUseBothDice, validateHigherDieFirst, getHigherDieFirstMessage, BOARD_CONSTANTS, getBoardPointRepresentation, isBarPoint, isOffBoardPoint, getPointLabel, getPointStyle, canClickPoint, getAllBlots, getBlotCount, isPointVulnerable, getVulnerableBlots, getBlotRiskLevel, getBlotStatusMessage, getGameEndState, getWinMessage, calculateWinPoints, canOfferDouble, getDoublingCubeMessage, getCubeValueDisplay, isCubeCentered, getCubeOwner, getNextCubeValue, canBeaver, canRaccoon, getMatchScoreDisplay, getMatchLengthOptions, getMatchStatusMessage, isMatchComplete, getLeader, getMatchProgress, MatchLength } from './backgammonStore';
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
  const boardState = useBackgammonStore(s => s.boardState);
  const turn = useBackgammonStore(s => s.turn);
  const message = useBackgammonStore(s => s.message);
  const gameState = useBackgammonStore(s => s.gameState);
  const stats = useBackgammonStore(s => s.stats);
  const botDifficulty = useBackgammonStore(s => s.botDifficulty);
  const gameMode = useBackgammonStore(s => s.gameMode);
  const dice = useBackgammonStore(s => s.dice);
  const usedDice = useBackgammonStore(s => s.usedDice);
  const history = useBackgammonStore(s => s.history);
  const historyIndex = useBackgammonStore(s => s.historyIndex);
  const doublingCube = useBackgammonStore(s => s.doublingCube);
  const matchState = useBackgammonStore(s => s.matchState);
  const setBoardState = useBackgammonStore(s => s.setBoardState);
  const setTurn = useBackgammonStore(s => s.setTurn);
  const setMessage = useBackgammonStore(s => s.setMessage);
  const setGameState = useBackgammonStore(s => s.setGameState);
  const setDice = useBackgammonStore(s => s.setDice);
  const setUsedDice = useBackgammonStore(s => s.setUsedDice);
  const setDoublingCube = useBackgammonStore(s => s.setDoublingCube);
  const setMatchState = useBackgammonStore(s => s.setMatchState);
  const resetGame = useBackgammonStore(s => s.resetGame);
  const pushHistory = useBackgammonStore(s => s.pushHistory);
  const stepHistory = useBackgammonStore(s => s.stepHistory);
  const updateStats = useBackgammonStore(s => s.updateStats);
  const resetStats = useBackgammonStore(s => s.resetStats);
  const setBotDifficulty = useBackgammonStore(s => s.setBotDifficulty);
  const setGameMode = useBackgammonStore(s => s.setGameMode);
  const saveGame = useBackgammonStore(s => s.saveGame);
  const loadGame = useBackgammonStore(s => s.loadGame);
  const hasSavedGame = useBackgammonStore(s => s.hasSavedGame);
  const rollDice = useBackgammonStore(s => s.rollDice);
  const offerDouble = useBackgammonStore(s => s.offerDouble);
  const acceptDouble = useBackgammonStore(s => s.acceptDouble);
  const rejectDouble = useBackgammonStore(s => s.rejectDouble);
  const beaverDouble = useBackgammonStore(s => s.beaverDouble);
  const raccoonDouble = useBackgammonStore(s => s.raccoonDouble);
  const startNewMatch = useBackgammonStore(s => s.startNewMatch);
  const endMatch = useBackgammonStore(s => s.endMatch);

  const [selectedPoint, setSelectedPoint] = React.useState<number | null>(null);
  const [showTutorial, setShowTutorial] = React.useState(false);

  function handlePointClick(pointIndex: number) {
    if (gameState !== 'playing') return;
    
    // Check for game end state
    const gameEndState = getGameEndState(boardState);
    if (gameEndState.winner) {
      const winMessage = getWinMessage(boardState, gameEndState.winner);
      setMessage(winMessage);
      setGameState('gameOver');
      return;
    }
    
    // Check if player has pieces on bar and must re-enter
    if (hasPiecesOnBar(boardState, turn)) {
      // Handle bar re-entry
      const availableDice = dice.filter(d => !usedDice.includes(d));
      const barReentryMoves = getBarReentryMoves(boardState, turn, dice, usedDice);
      
      // Check if this point is a valid re-entry point
      const isValidReentry = barReentryMoves.some(([from, to]) => to === pointIndex);
      
      if (isValidReentry) {
        const usedDie = turn === PlayerColor.WHITE ? 24 - pointIndex : pointIndex + 1;
        
        if (availableDice.includes(usedDie)) {
          // Validate higher die first rule
          if (!validateHigherDieFirst(boardState, turn, dice, usedDice, [25, pointIndex])) {
            setSelectedPoint(null);
            return;
          }
          
          const newBoardState = executeBarReentryMove(boardState, 25, pointIndex, turn);
          
          setBoardState(newBoardState);
          pushHistory(newBoardState);
          
          // Check for game end after bar re-entry
          const newGameEndState = getGameEndState(newBoardState);
          if (newGameEndState.winner) {
            const winMessage = getWinMessage(newBoardState, newGameEndState.winner);
            setMessage(winMessage);
            setGameState('gameOver');
            return;
          }
          
          setSelectedPoint(null);
          setUsedDice([...usedDice, usedDie]);
          
          // Check if all dice used
          if (usedDice.length + 1 >= dice.length) {
            setTurn(turn === PlayerColor.WHITE ? PlayerColor.BLACK : PlayerColor.WHITE);
            setMessage(turn === PlayerColor.WHITE ? 'Black to roll' : 'White to roll');
            setDice([]);
            setUsedDice([]);
          }
        }
      }
      return;
    }
    
    // In human vs human mode, allow both players to move their pieces
    // In human vs bot mode, only allow white (human) to move
    const canMovePiece = gameMode === GameMode.HUMAN_VS_HUMAN ? 
      (turn === PlayerColor.WHITE && boardState.board[pointIndex][0] > 0) || 
      (turn === PlayerColor.BLACK && boardState.board[pointIndex][1] > 0) :
      (turn === PlayerColor.WHITE && boardState.board[pointIndex][0] > 0);
    
    if (selectedPoint === null) {
      // Select point if it has player pieces
      if (canMovePiece) {
        setSelectedPoint(pointIndex);
      }
    } else {
      // Try to move piece
      const availableDice = dice.filter(d => !usedDice.includes(d));
      const currentPlayerIndex = turn === PlayerColor.WHITE ? 0 : 1;
      const opponentIndex = turn === PlayerColor.WHITE ? 1 : 0;
      
      // Check if this is a bearing off move
      const isBearingOff = (turn === PlayerColor.WHITE && pointIndex === BOARD_CONSTANTS.OFF_WHITE) || (turn === PlayerColor.BLACK && pointIndex === BOARD_CONSTANTS.OFF_BLACK);
      
      if (isBearingOff) {
        // Handle bearing off
        const usedDie = turn === PlayerColor.WHITE ? 
          24 - selectedPoint : 
          selectedPoint - (-1);
        
        if (availableDice.includes(usedDie)) {
          // Validate higher die first rule
          if (!validateHigherDieFirst(boardState, turn, dice, usedDice, [selectedPoint, pointIndex])) {
            setSelectedPoint(null);
            return;
          }
          
          const newBoardState = { ...boardState };
          newBoardState.board[selectedPoint][currentPlayerIndex]--;
          newBoardState.offBoard[currentPlayerIndex]++;
          
          setBoardState(newBoardState);
          pushHistory(newBoardState);
          
          // Check for game end after bearing off
          const newGameEndState = getGameEndState(newBoardState);
          if (newGameEndState.winner) {
            const winMessage = getWinMessage(newBoardState, newGameEndState.winner);
            setMessage(winMessage);
            setGameState('gameOver');
            return;
          }
          
          setSelectedPoint(null);
          setUsedDice([...usedDice, usedDie]);
          
          // Check if all dice used
          if (usedDice.length + 1 >= dice.length) {
            setTurn(turn === PlayerColor.WHITE ? PlayerColor.BLACK : PlayerColor.WHITE);
            setMessage(turn === PlayerColor.WHITE ? 'Black to roll' : 'White to roll');
            setDice([]);
            setUsedDice([]);
          }
        } else {
          setSelectedPoint(null);
        }
      } else {
        // Regular move
        const validMoves = turn === PlayerColor.WHITE ? 
          availableDice.map(die => selectedPoint + die).filter(to => to < BOARD_SIZE) :
          availableDice.map(die => selectedPoint - die).filter(to => to >= 0);
        
        if (validMoves.includes(pointIndex)) {
          // Mark die as used
          const usedDie = turn === PlayerColor.WHITE ? 
            pointIndex - selectedPoint : 
            selectedPoint - pointIndex;
          
          // Validate higher die first rule
          if (!validateHigherDieFirst(boardState, turn, dice, usedDice, [selectedPoint, pointIndex])) {
            setSelectedPoint(null);
            return;
          }
          
          const newBoardState = { ...boardState };
          newBoardState.board[selectedPoint][currentPlayerIndex]--;
          newBoardState.board[pointIndex][currentPlayerIndex]++;
          
          // Handle capture (hit piece) using the hitPiece function
          if (isBlot(newBoardState, pointIndex, turn === PlayerColor.WHITE ? PlayerColor.BLACK : PlayerColor.WHITE)) {
            const updatedState = hitPiece(newBoardState, pointIndex, turn);
            newBoardState.board = updatedState.board;
            newBoardState.bar = updatedState.bar;
          }
          
          setBoardState(newBoardState);
          pushHistory(newBoardState);
          
          // Check for game end after regular move
          const newGameEndState = getGameEndState(newBoardState);
          if (newGameEndState.winner) {
            const winMessage = getWinMessage(newBoardState, newGameEndState.winner);
            setMessage(winMessage);
            setGameState('gameOver');
            return;
          }
          
          setSelectedPoint(null);
          setUsedDice([...usedDice, usedDie]);
          
          // Check if all dice used
          if (usedDice.length + 1 >= dice.length) {
            setTurn(turn === PlayerColor.WHITE ? PlayerColor.BLACK : PlayerColor.WHITE);
            setMessage(turn === PlayerColor.WHITE ? 'Black to roll' : 'White to roll');
            setDice([]);
            setUsedDice([]);
          }
        } else {
          setSelectedPoint(null);
        }
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
        <strong>How to Play:</strong> Backgammon is a race game. Roll dice and move pieces around the board. First to bear off all pieces wins.
        <button
          onClick={() => setShowTutorial(true)}
          style={{ marginLeft: 16, background: '#059669', color: 'white', border: 'none', borderRadius: 4, padding: '4px 12px', cursor: 'pointer' }}
        >
          📖 Full Tutorial
        </button>
      </div>
      
      <div style={{ 
        marginBottom: 12, 
        fontSize: '1.2rem',
        fontWeight: 'bold',
        color: message.includes('Gammon') ? '#fbbf24' : 
               message.includes('Backgammon') ? '#dc2626' : 
               message.includes('wins') ? '#10b981' : 'white'
      }}>
        {message}
        {gameState === 'gameOver' && (
          <div style={{ 
            marginTop: 8, 
            fontSize: '1rem',
            color: message.includes('Gammon') ? '#fbbf24' : 
                   message.includes('Backgammon') ? '#dc2626' : '#10b981'
          }}>
            {message.includes('Gammon') && '🎯 Double points!'}
            {message.includes('Backgammon') && '🎯 Triple points!'}
          </div>
        )}
      </div>
      
      {/* Bar Status */}
      {turn === PlayerColor.WHITE && hasPiecesOnBar(boardState, PlayerColor.WHITE) && (
        <div style={{ 
          background: '#dc2626', 
          color: 'white', 
          padding: '8px 12px', 
          borderRadius: 4, 
          marginBottom: 12,
          fontWeight: 'bold',
          textAlign: 'center'
        }}>
          ⚠️ White has {boardState.bar[0]} piece(s) on bar! Must re-enter before making other moves.
        </div>
      )}
      
      {turn === PlayerColor.BLACK && hasPiecesOnBar(boardState, PlayerColor.BLACK) && (
        <div style={{ 
          background: '#dc2626', 
          color: 'white', 
          padding: '8px 12px', 
          borderRadius: 4, 
          marginBottom: 12,
          fontWeight: 'bold',
          textAlign: 'center'
        }}>
          ⚠️ Black has {boardState.bar[1]} piece(s) on bar! Must re-enter before making other moves.
        </div>
      )}
      
      {/* Higher Die First Warning */}
      {turn === PlayerColor.WHITE && getHigherDieFirstMessage(boardState, PlayerColor.WHITE, dice, usedDice) && (
        <div style={{ 
          background: '#f59e0b', 
          color: 'white', 
          padding: '8px 12px', 
          borderRadius: 4, 
          marginBottom: 12,
          fontWeight: 'bold',
          textAlign: 'center'
        }}>
          {getHigherDieFirstMessage(boardState, PlayerColor.WHITE, dice, usedDice)}
        </div>
      )}
      
      {turn === PlayerColor.BLACK && getHigherDieFirstMessage(boardState, PlayerColor.BLACK, dice, usedDice) && (
        <div style={{ 
          background: '#f59e0b', 
          color: 'white', 
          padding: '8px 12px', 
          borderRadius: 4, 
          marginBottom: 12,
          fontWeight: 'bold',
          textAlign: 'center'
        }}>
          {getHigherDieFirstMessage(boardState, PlayerColor.BLACK, dice, usedDice)}
        </div>
      )}
      
      {/* Blot Status */}
      {turn === PlayerColor.WHITE && getBlotStatusMessage(boardState, PlayerColor.WHITE) && (
        <div style={{ 
          background: getBlotStatusMessage(boardState, PlayerColor.WHITE).includes('high risk') ? '#dc2626' : 
                   getBlotStatusMessage(boardState, PlayerColor.WHITE).includes('medium risk') ? '#f59e0b' : '#3b82f6', 
          color: 'white', 
          padding: '8px 12px', 
          borderRadius: 4, 
          marginBottom: 12,
          fontWeight: 'bold',
          textAlign: 'center'
        }}>
          {getBlotStatusMessage(boardState, PlayerColor.WHITE)}
        </div>
      )}
      
      {turn === PlayerColor.BLACK && getBlotStatusMessage(boardState, PlayerColor.BLACK) && (
        <div style={{ 
          background: getBlotStatusMessage(boardState, PlayerColor.BLACK).includes('high risk') ? '#dc2626' : 
                   getBlotStatusMessage(boardState, PlayerColor.BLACK).includes('medium risk') ? '#f59e0b' : '#3b82f6', 
          color: 'white', 
          padding: '8px 12px', 
          borderRadius: 4, 
          marginBottom: 12,
          fontWeight: 'bold',
          textAlign: 'center'
        }}>
          {getBlotStatusMessage(boardState, PlayerColor.BLACK)}
        </div>
      )}
      
      {/* Bearing Off Status */}
      {turn === PlayerColor.WHITE && canBearOff(boardState, PlayerColor.WHITE) && (
        <div style={{ 
          background: '#059669', 
          color: 'white', 
          padding: '8px 12px', 
          borderRadius: 4, 
          marginBottom: 12,
          fontWeight: 'bold',
          textAlign: 'center'
        }}>
          🎯 White can bear off! All pieces are in home board.
        </div>
      )}
      
      {turn === PlayerColor.BLACK && canBearOff(boardState, PlayerColor.BLACK) && (
        <div style={{ 
          background: '#059669', 
          color: 'white', 
          padding: '8px 12px', 
          borderRadius: 4, 
          marginBottom: 12,
          fontWeight: 'bold',
          textAlign: 'center'
        }}>
          🎯 Black can bear off! All pieces are in home board.
        </div>
      )}
      
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
            disabled={gameMode === GameMode.HUMAN_VS_BOT ? 
              (turn !== PlayerColor.WHITE || gameState !== 'playing') : 
              gameState !== 'playing'}
            style={{
              marginLeft: 12,
              background: gameMode === GameMode.HUMAN_VS_BOT ? 
                (turn === PlayerColor.WHITE ? '#059669' : '#666') : 
                '#059669',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              padding: '8px 16px',
              cursor: gameMode === GameMode.HUMAN_VS_BOT ? 
                (turn === PlayerColor.WHITE ? 'pointer' : 'not-allowed') : 
                'pointer',
            }}
          >
            Roll Dice
          </button>
        )}
      </div>
      
      {/* Doubling Cube Section */}
      <div style={{ background: '#333', padding: 12, borderRadius: 8, marginBottom: 16 }}>
        <strong>Doubling Cube:</strong>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
          {/* Cube Display */}
          <div style={{
            width: 50,
            height: 50,
            background: isCubeCentered(doublingCube) ? '#fbbf24' : 
                       getCubeOwner(doublingCube) === PlayerColor.WHITE ? '#fff' : '#000',
            color: isCubeCentered(doublingCube) ? '#000' : 
                   getCubeOwner(doublingCube) === PlayerColor.WHITE ? '#000' : '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 4,
            fontSize: 16,
            fontWeight: 'bold',
            border: '2px solid #666',
          }}>
            {getCubeValueDisplay(doublingCube)}
          </div>
          
          {/* Cube Status */}
          <div style={{ fontSize: 14, color: '#ccc' }}>
            {getDoublingCubeMessage(doublingCube, turn)}
          </div>
        </div>
        
        {/* Doubling Controls */}
        {gameState === 'playing' && (
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            {/* Offer Double Button */}
            {canOfferDouble(doublingCube, turn, gameState) && !doublingCube.pendingOffer && (
              <button
                onClick={offerDouble}
                style={{
                  background: '#fbbf24',
                  color: '#000',
                  border: 'none',
                  borderRadius: 4,
                  padding: '6px 12px',
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: 'bold',
                }}
              >
                Double to {getNextCubeValue(doublingCube)}
              </button>
            )}
            
            {/* Accept/Reject Buttons */}
            {doublingCube.pendingOffer && doublingCube.offeringPlayer !== turn && (
              <>
                <button
                  onClick={acceptDouble}
                  style={{
                    background: '#059669',
                    color: 'white',
                    border: 'none',
                    borderRadius: 4,
                    padding: '6px 12px',
                    cursor: 'pointer',
                    fontSize: 12,
                    fontWeight: 'bold',
                  }}
                >
                  Accept
                </button>
                <button
                  onClick={rejectDouble}
                  style={{
                    background: '#dc2626',
                    color: 'white',
                    border: 'none',
                    borderRadius: 4,
                    padding: '6px 12px',
                    cursor: 'pointer',
                    fontSize: 12,
                    fontWeight: 'bold',
                  }}
                >
                  Reject
                </button>
              </>
            )}
            
            {/* Beaver Double Button */}
            {canBeaver(doublingCube) && doublingCube.offeringPlayer !== turn && !doublingCube.pendingOffer && (
              <button
                onClick={beaverDouble}
                style={{
                  background: '#7c3aed',
                  color: 'white',
                  border: 'none',
                  borderRadius: 4,
                  padding: '6px 12px',
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: 'bold',
                }}
              >
                Beaver to {getNextCubeValue(doublingCube)}
              </button>
            )}
            
            {/* Raccoon Double Button */}
            {canRaccoon(doublingCube) && doublingCube.offeringPlayer !== turn && !doublingCube.pendingOffer && (
              <button
                onClick={raccoonDouble}
                style={{
                  background: '#059669',
                  color: 'white',
                  border: 'none',
                  borderRadius: 4,
                  padding: '6px 12px',
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: 'bold',
                }}
              >
                Raccoon to {getNextCubeValue(doublingCube)}
              </button>
            )}
          </div>
        )}
      </div>
      
      {/* Match Scoring Section */}
      <div style={{ background: '#333', padding: 12, borderRadius: 8, marginBottom: 16 }}>
        <strong>Match Scoring:</strong>
        <div style={{ marginTop: 8 }}>
          {/* Match Score Display */}
          <div style={{ fontSize: 14, color: '#ccc', marginBottom: 8 }}>
            {getMatchScoreDisplay(matchState)}
          </div>
          
          {/* Match Progress Bars */}
          {matchState.isMatchPlay && (
            <div style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#ccc', marginBottom: 4 }}>
                <span>White: {matchState.whiteScore}</span>
                <span>Black: {matchState.blackScore}</span>
              </div>
              <div style={{ display: 'flex', gap: 4, height: 8 }}>
                <div style={{ 
                  flex: 1, 
                  background: '#666', 
                  borderRadius: 4,
                  position: 'relative'
                }}>
                  <div style={{ 
                    width: `${getMatchProgress(matchState).whiteProgress}%`, 
                    height: '100%', 
                    background: '#fff', 
                    borderRadius: 4,
                    transition: 'width 0.3s ease'
                  }} />
                </div>
                <div style={{ 
                  flex: 1, 
                  background: '#666', 
                  borderRadius: 4,
                  position: 'relative'
                }}>
                  <div style={{ 
                    width: `${getMatchProgress(matchState).blackProgress}%`, 
                    height: '100%', 
                    background: '#000', 
                    borderRadius: 4,
                    transition: 'width 0.3s ease'
                  }} />
                </div>
              </div>
            </div>
          )}
          
          {/* Match Controls */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {/* Start New Match */}
            <select
              onChange={(e) => startNewMatch(Number(e.target.value))}
              value={matchState.matchLength}
              style={{
                background: '#444',
                color: '#fff',
                border: '1px solid #666',
                borderRadius: 4,
                padding: '4px 8px',
                fontSize: 12,
              }}
            >
              {getMatchLengthOptions().map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            
            {/* End Match */}
            <button
              onClick={endMatch}
              style={{
                background: '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: 4,
                padding: '4px 8px',
                cursor: 'pointer',
                fontSize: 12,
              }}
            >
              End Match
            </button>
            
            {/* Toggle Match/Single Game */}
            <button
              onClick={() => setMatchState({ ...matchState, isMatchPlay: !matchState.isMatchPlay })}
              style={{
                background: matchState.isMatchPlay ? '#059669' : '#7c3aed',
                color: 'white',
                border: 'none',
                borderRadius: 4,
                padding: '4px 8px',
                cursor: 'pointer',
                fontSize: 12,
              }}
            >
              {matchState.isMatchPlay ? 'Switch to Single Game' : 'Switch to Match Play'}
            </button>
          </div>
          
          {/* Match Status Messages */}
          {matchState.isMatchPlay && (
            <div style={{ marginTop: 8, fontSize: 12, color: '#ffcc00' }}>
              {matchState.crawfordGame && '🔄 Crawford Game - No doubling allowed'}
              {matchState.postCrawford && '🔄 Post-Crawford phase - Doubling allowed'}
              {getLeader(matchState) && `${getLeader(matchState) === PlayerColor.WHITE ? 'White' : 'Black'} leads`}
              {isMatchComplete(matchState) && '🏆 Match Complete!'}
            </div>
          )}
        </div>
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
          disabled={historyIndex === 0 || (gameMode === GameMode.HUMAN_VS_BOT && turn !== PlayerColor.WHITE)}
          style={{ marginRight: 8, background: '#6366f1', color: 'white', border: 'none', padding: '8px 16px', borderRadius: 4, cursor: 'pointer' }}
        >
          ↩ Undo
        </button>
        <button 
          onClick={handleRedo} 
          disabled={historyIndex === history.length - 1 || (gameMode === GameMode.HUMAN_VS_BOT && turn !== PlayerColor.WHITE)}
          style={{ background: '#6366f1', color: 'white', border: 'none', padding: '8px 16px', borderRadius: 4, cursor: 'pointer' }}
        >
          ↪ Redo
        </button>
      </div>
      
      {/* Backgammon Board */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(15, 1fr)', 
        gap: 1, 
        maxWidth: 950, 
        margin: '0 auto',
        background: '#8B4513',
        padding: 16,
        borderRadius: 8,
      }}>
        {/* Top half (points 13-24) */}
        {Array.from({ length: 12 }, (_, i) => {
          const pointIndex = 23 - i;
          const point = boardState.board[pointIndex];
          const isSelected = selectedPoint === pointIndex;
          const isWhiteBlot = isBlot(boardState, pointIndex, PlayerColor.WHITE);
          const isBlackBlot = isBlot(boardState, pointIndex, PlayerColor.BLACK);
          const whiteBlotRisk = isWhiteBlot ? getBlotRiskLevel(boardState, pointIndex, PlayerColor.WHITE) : null;
          const blackBlotRisk = isBlackBlot ? getBlotRiskLevel(boardState, pointIndex, PlayerColor.BLACK) : null;
          
          return (
            <div
              key={`top-${i}`}
              onClick={() => handlePointClick(pointIndex)}
              style={{
                ...pointStyle,
                background: isSelected ? '#fbbf24' : (i % 2 === 0 ? '#DEB887' : '#F5DEB3'),
                cursor: 'pointer',
                border: isSelected ? '2px solid #fbbf24' : 
                        isWhiteBlot && whiteBlotRisk === 'high' ? '2px solid #dc2626' :
                        isWhiteBlot && whiteBlotRisk === 'medium' ? '2px solid #f59e0b' :
                        isWhiteBlot && whiteBlotRisk === 'low' ? '2px solid #3b82f6' :
                        isBlackBlot && blackBlotRisk === 'high' ? '2px solid #dc2626' :
                        isBlackBlot && blackBlotRisk === 'medium' ? '2px solid #f59e0b' :
                        isBlackBlot && blackBlotRisk === 'low' ? '2px solid #3b82f6' :
                        '1px solid #666',
                position: 'relative',
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
              {/* Blot indicator */}
              {(isWhiteBlot || isBlackBlot) && (
                <div style={{
                  position: 'absolute',
                  top: 2,
                  right: 2,
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: isWhiteBlot && whiteBlotRisk === 'high' ? '#dc2626' :
                             isWhiteBlot && whiteBlotRisk === 'medium' ? '#f59e0b' :
                             isWhiteBlot && whiteBlotRisk === 'low' ? '#3b82f6' :
                             isBlackBlot && blackBlotRisk === 'high' ? '#dc2626' :
                             isBlackBlot && blackBlotRisk === 'medium' ? '#f59e0b' :
                             isBlackBlot && blackBlotRisk === 'low' ? '#3b82f6' : '#666',
                  border: '1px solid white',
                }} />
              )}
            </div>
          );
        })}
        
        {/* White bearing off area */}
        <div
          onClick={() => handlePointClick(BOARD_CONSTANTS.OFF_WHITE)}
          style={{
            ...pointStyle,
            ...getPointStyle(BOARD_CONSTANTS.OFF_WHITE),
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: canClickPoint(boardState, BOARD_CONSTANTS.OFF_WHITE, turn) ? 'pointer' : 'default',
            opacity: canClickPoint(boardState, BOARD_CONSTANTS.OFF_WHITE, turn) ? 1 : 0.7,
          }}
        >
          <div style={{ fontSize: 12, color: '#333', marginBottom: 4 }}>{getPointLabel(BOARD_CONSTANTS.OFF_WHITE)}</div>
          <div style={{ fontSize: 10, color: '#666', marginBottom: 4 }}>
            Pieces: {boardState.offBoard[0]}
          </div>
          {canClickPoint(boardState, BOARD_CONSTANTS.OFF_WHITE, turn) && (
            <div style={{ fontSize: 8, color: '#059669', marginTop: 2 }}>
              Click to bear off
            </div>
          )}
        </div>
        
        {/* Bar */}
        <div
          onClick={() => handlePointClick(BOARD_CONSTANTS.BAR_WHITE)}
          style={{
            ...pointStyle,
            ...getPointStyle(BOARD_CONSTANTS.BAR_WHITE),
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: canClickPoint(boardState, BOARD_CONSTANTS.BAR_WHITE, turn) ? 'pointer' : 'default',
            opacity: canClickPoint(boardState, BOARD_CONSTANTS.BAR_WHITE, turn) ? 1 : 0.7,
          }}
        >
          <div style={{ fontSize: 12, color: '#fff', marginBottom: 4 }}>{getPointLabel(BOARD_CONSTANTS.BAR_WHITE)}</div>
          <div style={{ fontSize: 10, color: '#ccc', marginBottom: 4 }}>
            White: {boardState.bar[0]}
          </div>
          <div style={{ fontSize: 10, color: '#ccc' }}>
            Black: {boardState.bar[1]}
          </div>
          {canClickPoint(boardState, BOARD_CONSTANTS.BAR_WHITE, turn) && (
            <div style={{ fontSize: 8, color: '#ffcc00', marginTop: 2 }}>
              Click to re-enter
            </div>
          )}
        </div>
        
        {/* Black bearing off area */}
        <div
          onClick={() => handlePointClick(BOARD_CONSTANTS.OFF_BLACK)}
          style={{
            ...pointStyle,
            ...getPointStyle(BOARD_CONSTANTS.OFF_BLACK),
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: canClickPoint(boardState, BOARD_CONSTANTS.OFF_BLACK, turn) ? 'pointer' : 'default',
            opacity: canClickPoint(boardState, BOARD_CONSTANTS.OFF_BLACK, turn) ? 1 : 0.7,
          }}
        >
          <div style={{ fontSize: 12, color: '#fff', marginBottom: 4 }}>{getPointLabel(BOARD_CONSTANTS.OFF_BLACK)}</div>
          <div style={{ fontSize: 10, color: '#ccc', marginBottom: 4 }}>
            Pieces: {boardState.offBoard[1]}
          </div>
          {canClickPoint(boardState, BOARD_CONSTANTS.OFF_BLACK, turn) && (
            <div style={{ fontSize: 8, color: '#059669', marginTop: 2 }}>
              Click to bear off
            </div>
          )}
        </div>
        
        {/* Bottom half (points 1-12) */}
        {Array.from({ length: 12 }, (_, i) => {
          const pointIndex = i;
          const point = boardState.board[pointIndex];
          const isSelected = selectedPoint === pointIndex;
          const isWhiteBlot = isBlot(boardState, pointIndex, PlayerColor.WHITE);
          const isBlackBlot = isBlot(boardState, pointIndex, PlayerColor.BLACK);
          const whiteBlotRisk = isWhiteBlot ? getBlotRiskLevel(boardState, pointIndex, PlayerColor.WHITE) : null;
          const blackBlotRisk = isBlackBlot ? getBlotRiskLevel(boardState, pointIndex, PlayerColor.BLACK) : null;
          
          return (
            <div
              key={`bottom-${i}`}
              onClick={() => handlePointClick(pointIndex)}
              style={{
                ...pointStyle,
                background: isSelected ? '#fbbf24' : (i % 2 === 0 ? '#F5DEB3' : '#DEB887'),
                cursor: 'pointer',
                border: isSelected ? '2px solid #fbbf24' : 
                        isWhiteBlot && whiteBlotRisk === 'high' ? '2px solid #dc2626' :
                        isWhiteBlot && whiteBlotRisk === 'medium' ? '2px solid #f59e0b' :
                        isWhiteBlot && whiteBlotRisk === 'low' ? '2px solid #3b82f6' :
                        isBlackBlot && blackBlotRisk === 'high' ? '2px solid #dc2626' :
                        isBlackBlot && blackBlotRisk === 'medium' ? '2px solid #f59e0b' :
                        isBlackBlot && blackBlotRisk === 'low' ? '2px solid #3b82f6' :
                        '1px solid #666',
                position: 'relative',
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
              {/* Blot indicator */}
              {(isWhiteBlot || isBlackBlot) && (
                <div style={{
                  position: 'absolute',
                  top: 2,
                  right: 2,
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: isWhiteBlot && whiteBlotRisk === 'high' ? '#dc2626' :
                             isWhiteBlot && whiteBlotRisk === 'medium' ? '#f59e0b' :
                             isWhiteBlot && whiteBlotRisk === 'low' ? '#3b82f6' :
                             isBlackBlot && blackBlotRisk === 'high' ? '#dc2626' :
                             isBlackBlot && blackBlotRisk === 'medium' ? '#f59e0b' :
                             isBlackBlot && blackBlotRisk === 'low' ? '#3b82f6' : '#666',
                  border: '1px solid white',
                }} />
              )}
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