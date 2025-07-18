import React from 'react';
import Link from 'next/link';
import { useGinRummyStore, Card, Suit, Rank, GameMode, BotDifficulty, GameState } from './ginRummyStore';
import Tutorial from './components/Tutorial';
import { ginRummyTutorial } from './data/tutorials';

function getCardDisplay(card: Card): { symbol: string; color: string } {
  const rankSymbols: { [key in Rank]: string } = {
    [Rank.ACE]: 'A',
    [Rank.TWO]: '2',
    [Rank.THREE]: '3',
    [Rank.FOUR]: '4',
    [Rank.FIVE]: '5',
    [Rank.SIX]: '6',
    [Rank.SEVEN]: '7',
    [Rank.EIGHT]: '8',
    [Rank.NINE]: '9',
    [Rank.TEN]: '10',
    [Rank.JACK]: 'J',
    [Rank.QUEEN]: 'Q',
    [Rank.KING]: 'K',
  };

  const suitSymbols: { [key in Suit]: string } = {
    [Suit.HEARTS]: '♥',
    [Suit.DIAMONDS]: '♦',
    [Suit.CLUBS]: '♣',
    [Suit.SPADES]: '♠',
  };

  const color = card.suit === Suit.HEARTS || card.suit === Suit.DIAMONDS ? '#dc2626' : '#000';
  
  return {
    symbol: `${rankSymbols[card.rank]}${suitSymbols[card.suit]}`,
    color,
  };
}

function calculateDeadwood(hand: Card[]): number {
  return hand.reduce((sum, card) => {
    const value = card.rank > 10 ? 10 : card.rank;
    return sum + value;
  }, 0);
}

export default function GinRummy() {
  const playerHand = useGinRummyStore(s => s.playerHand);
  const botHand = useGinRummyStore(s => s.botHand);
  const stockPile = useGinRummyStore(s => s.stockPile);
  const discardPile = useGinRummyStore(s => s.discardPile);
  const gameState = useGinRummyStore(s => s.gameState);
  const turn = useGinRummyStore(s => s.turn);
  const message = useGinRummyStore(s => s.message);
  const stats = useGinRummyStore(s => s.stats);
  const botDifficulty = useGinRummyStore(s => s.botDifficulty);
  const gameMode = useGinRummyStore(s => s.gameMode);
  const resetGame = useGinRummyStore(s => s.resetGame);
  const updateStats = useGinRummyStore(s => s.updateStats);
  const resetStats = useGinRummyStore(s => s.resetStats);
  const setBotDifficulty = useGinRummyStore(s => s.setBotDifficulty);
  const setGameMode = useGinRummyStore(s => s.setGameMode);
  const saveGame = useGinRummyStore(s => s.saveGame);
  const loadGame = useGinRummyStore(s => s.loadGame);
  const hasSavedGame = useGinRummyStore(s => s.hasSavedGame);
  const drawFromStock = useGinRummyStore(s => s.drawFromStock);
  const drawFromDiscard = useGinRummyStore(s => s.drawFromDiscard);
  const discardCard = useGinRummyStore(s => s.discardCard);
  const knock = useGinRummyStore(s => s.knock);

  const [showTutorial, setShowTutorial] = React.useState(false);

  const playerDeadwood = calculateDeadwood(playerHand);
  const canKnockNow = playerDeadwood <= 10;

  return (
    <div style={{ padding: 24, color: 'white', minHeight: '100vh', background: '#222' }}>
      <Link href="/" style={{ color: '#60a5fa', textDecoration: 'underline' }}>← Back to Lobby</Link>
      <h1 style={{ fontSize: '2rem', margin: '1rem 0' }}>Gin Rummy</h1>
      
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
            Total Score: {stats.totalScore}
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
        <strong>How to Play:</strong> Form sets (3+ same rank) and runs (3+ consecutive same suit) to reduce deadwood. Knock when deadwood ≤ 10.
        <button
          onClick={() => setShowTutorial(true)}
          style={{ marginLeft: 16, background: '#059669', color: 'white', border: 'none', borderRadius: 4, padding: '4px 12px', cursor: 'pointer' }}
        >
          📖 Full Tutorial
        </button>
      </div>
      
      <div style={{ marginBottom: 12 }}>{message}</div>
      
      {/* Game Controls */}
      <div style={{ marginBottom: 16 }}>
        <button 
          onClick={resetGame}
          style={{ 
            background: '#dc2626', 
            color: 'white', 
            border: 'none',
            padding: '8px 16px', 
            borderRadius: 4, 
            cursor: 'pointer',
            marginRight: 8
          }}
        >
          New Game
        </button>
        
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

      {/* Game Status */}
      <div style={{ background: '#333', padding: 12, borderRadius: 8, marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <strong>Turn:</strong> {turn === 'player' ? 'Your Turn' : 'Bot Turn'}
          </div>
          <div>
            <strong>Game Mode:</strong> {gameMode === GameMode.HUMAN_VS_BOT ? 'Human vs Bot' : 'Human vs Human'}
          </div>
          <div>
            <strong>Stock Pile:</strong> {stockPile.length} cards
          </div>
          <div>
            <strong>Your Deadwood:</strong> {playerDeadwood} {canKnockNow && '(Can Knock!)'}
          </div>
        </div>
      </div>

      {/* Bot Hand */}
      <div style={{ background: '#333', padding: 16, borderRadius: 8, marginBottom: 16 }}>
        <h3 style={{ margin: '0 0 12px 0' }}>
          {gameMode === GameMode.HUMAN_VS_BOT ? 'Bot' : 'Player 2'}'s Hand ({botHand.length} cards)
        </h3>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {botHand.map((card, index) => {
            if (gameMode === GameMode.HUMAN_VS_BOT) {
              // Show face down cards in bot mode
              return (
                <div
                  key={index}
                  style={{
                    width: 60,
                    height: 80,
                    background: '#444',
                    border: '2px solid #666',
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 24,
                    color: '#666',
                  }}
                >
                  🂠
                </div>
              );
            } else {
              // Show actual cards in human vs human mode
              const { symbol, color } = getCardDisplay(card);
              return (
                <div
                  key={card.id}
                  style={{
                    width: 60,
                    height: 80,
                    background: 'white',
                    border: '2px solid #333',
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 18,
                    fontWeight: 'bold',
                    color,
                  }}
                >
                  {symbol}
                </div>
              );
            }
          })}
        </div>
      </div>

      {/* Discard Pile */}
      <div style={{ background: '#333', padding: 16, borderRadius: 8, marginBottom: 16 }}>
        <h3 style={{ margin: '0 0 12px 0' }}>Discard Pile</h3>
        {discardPile.length > 0 && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div
              style={{
                width: 60,
                height: 80,
                background: 'white',
                border: '2px solid #333',
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 18,
                fontWeight: 'bold',
                color: getCardDisplay(discardPile[discardPile.length - 1]).color,
                cursor: gameState === GameState.PLAYING && turn === 'player' ? 'pointer' : 'default',
              }}
              onClick={() => {
                if (gameState === GameState.PLAYING && turn === 'player') {
                  drawFromDiscard();
                }
              }}
            >
              {getCardDisplay(discardPile[discardPile.length - 1]).symbol}
            </div>
            {gameState === GameState.PLAYING && turn === 'player' && (
              <span style={{ color: '#9ca3af', fontSize: 14 }}>Click to pick up</span>
            )}
          </div>
        )}
      </div>

      {/* Stock Pile */}
      <div style={{ background: '#333', padding: 16, borderRadius: 8, marginBottom: 16 }}>
        <h3 style={{ margin: '0 0 12px 0' }}>Stock Pile</h3>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div
            style={{
              width: 60,
              height: 80,
              background: '#444',
              border: '2px solid #666',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 24,
              color: '#666',
              cursor: gameState === GameState.PLAYING && turn === 'player' ? 'pointer' : 'default',
            }}
            onClick={() => {
              if (gameState === GameState.PLAYING && turn === 'player') {
                drawFromStock();
              }
            }}
          >
            🂠
          </div>
          {gameState === GameState.PLAYING && turn === 'player' && (
            <span style={{ color: '#9ca3af', fontSize: 14 }}>Click to draw</span>
          )}
        </div>
      </div>

      {/* Player Hand */}
      <div style={{ background: '#333', padding: 16, borderRadius: 8, marginBottom: 16 }}>
        <h3 style={{ margin: '0 0 12px 0' }}>Your Hand ({playerHand.length} cards)</h3>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
          {playerHand.map((card) => {
            const { symbol, color } = getCardDisplay(card);
            return (
              <div
                key={card.id}
                style={{
                  width: 60,
                  height: 80,
                  background: 'white',
                  border: '2px solid #333',
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 18,
                  fontWeight: 'bold',
                  color,
                  cursor: gameState === GameState.PLAYING && turn === 'player' ? 'pointer' : 'default',
                  transition: 'transform 0.2s',
                }}
                onClick={() => {
                  if (gameState === GameState.PLAYING && turn === 'player') {
                    discardCard(card);
                  }
                }}
              >
                {symbol}
              </div>
            );
          })}
        </div>
        
        {/* Knock Button */}
        {gameState === GameState.PLAYING && turn === 'player' && (
          <button
            onClick={knock}
            disabled={!canKnockNow}
            style={{
              background: canKnockNow ? '#059669' : '#666',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: 4,
              cursor: canKnockNow ? 'pointer' : 'not-allowed',
              marginRight: 8,
            }}
          >
            🚪 Knock
          </button>
        )}
      </div>

      {/* Game Instructions */}
      <div style={{ background: '#333', padding: 12, borderRadius: 8 }}>
        <strong>Instructions:</strong> Draw a card from stock or discard pile, then discard one card. Form sets and runs to reduce deadwood. Knock when deadwood ≤ 10.
      </div>

      {/* Tutorial Modal */}
      <Tutorial
        gameName="Gin Rummy"
        steps={ginRummyTutorial}
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
      />
    </div>
  );
} 