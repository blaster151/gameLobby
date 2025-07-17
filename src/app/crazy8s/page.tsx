import React, { useState } from 'react';
import Link from 'next/link';
import { useCrazy8sStore, Suit, Rank, Card, GameState, BotDifficulty } from './crazy8sStore';
import Tutorial from './components/Tutorial';
import { crazy8sTutorial } from './data/tutorials';

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

function canPlayCard(card: Card, topCard: Card, currentSuit?: Suit): boolean {
  // 8s are always wild
  if (card.rank === Rank.EIGHT) return true;
  
  // Check if suit matches (either top card suit or current suit from 8)
  if (currentSuit && card.suit === currentSuit) return true;
  if (!currentSuit && card.suit === topCard.suit) return true;
  
  // Check if rank matches
  if (card.rank === topCard.rank) return true;
  
  return false;
}

export default function Crazy8s() {
  const playerHand = useCrazy8sStore(s => s.playerHand);
  const botHand = useCrazy8sStore(s => s.botHand);
  const stockPile = useCrazy8sStore(s => s.stockPile);
  const topCard = useCrazy8sStore(s => s.topCard);
  const currentSuit = useCrazy8sStore(s => s.currentSuit);
  const gameState = useCrazy8sStore(s => s.gameState);
  const turn = useCrazy8sStore(s => s.turn);
  const message = useCrazy8sStore(s => s.message);
  const stats = useCrazy8sStore(s => s.stats);
  const botDifficulty = useCrazy8sStore(s => s.botDifficulty);
  const resetGame = useCrazy8sStore(s => s.resetGame);
  const updateStats = useCrazy8sStore(s => s.updateStats);
  const resetStats = useCrazy8sStore(s => s.resetStats);
  const setBotDifficulty = useCrazy8sStore(s => s.setBotDifficulty);
  const saveGame = useCrazy8sStore(s => s.saveGame);
  const loadGame = useCrazy8sStore(s => s.loadGame);
  const hasSavedGame = useCrazy8sStore(s => s.hasSavedGame);
  const playCard = useCrazy8sStore(s => s.playCard);
  const drawCard = useCrazy8sStore(s => s.drawCard);

  const [showTutorial, setShowTutorial] = useState(false);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [showSuitSelector, setShowSuitSelector] = useState(false);

  const validMoves = topCard ? playerHand.filter(card => canPlayCard(card, topCard, currentSuit)) : [];

  function handleCardClick(card: Card) {
    if (gameState !== GameState.PLAYING || turn !== 'player') return;
    
    if (card.rank === Rank.EIGHT) {
      setSelectedCard(card);
      setShowSuitSelector(true);
    } else if (canPlayCard(card, topCard!, currentSuit)) {
      playCard(card);
    }
  }

  function handleSuitSelect(suit: Suit) {
    if (selectedCard) {
      playCard(selectedCard, suit);
      setSelectedCard(null);
      setShowSuitSelector(false);
    }
  }

  function getSuitDisplayName(suit: Suit): string {
    switch (suit) {
      case Suit.HEARTS: return 'Hearts ♥';
      case Suit.DIAMONDS: return 'Diamonds ♦';
      case Suit.CLUBS: return 'Clubs ♣';
      case Suit.SPADES: return 'Spades ♠';
    }
  }

  return (
    <div style={{ padding: 24, color: 'white', minHeight: '100vh', background: '#222' }}>
      <Link href="/" style={{ color: '#60a5fa', textDecoration: 'underline' }}>← Back to Lobby</Link>
      <h1 style={{ fontSize: '2rem', margin: '1rem 0' }}>Crazy 8s</h1>
      
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
        <strong>How to Play:</strong> Match cards by suit or rank. 8s are wild and let you choose the next suit. First to play all cards wins!
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
            <strong>Stock Pile:</strong> {stockPile.length} cards
          </div>
          <div>
            <strong>Valid Moves:</strong> {validMoves.length} cards
          </div>
        </div>
      </div>

      {/* Bot Hand (Face Down) */}
      <div style={{ background: '#333', padding: 16, borderRadius: 8, marginBottom: 16 }}>
        <h3 style={{ margin: '0 0 12px 0' }}>Bot's Hand ({botHand.length} cards)</h3>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {botHand.map((_, index) => (
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
          ))}
        </div>
      </div>

      {/* Top Card */}
      <div style={{ background: '#333', padding: 16, borderRadius: 8, marginBottom: 16 }}>
        <h3 style={{ margin: '0 0 12px 0' }}>Top Card</h3>
        {topCard ? (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div
              style={{
                width: 80,
                height: 100,
                background: 'white',
                border: '3px solid #333',
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 24,
                fontWeight: 'bold',
                color: getCardDisplay(topCard).color,
              }}
            >
              {getCardDisplay(topCard).symbol}
            </div>
            {currentSuit && (
              <div style={{ color: '#9ca3af', fontSize: 14 }}>
                Current suit: {getSuitDisplayName(currentSuit)}
              </div>
            )}
          </div>
        ) : (
          <div style={{ color: '#9ca3af' }}>No top card</div>
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
                drawCard();
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
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {playerHand.map((card) => {
            const { symbol, color } = getCardDisplay(card);
            const isValidMove = validMoves.some(validCard => validCard.id === card.id);
            const isSelected = selectedCard?.id === card.id;
            
            return (
              <div
                key={card.id}
                style={{
                  width: 60,
                  height: 80,
                  background: isSelected ? '#fbbf24' : 'white',
                  border: isValidMove ? '3px solid #059669' : '2px solid #333',
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 18,
                  fontWeight: 'bold',
                  color: isSelected ? '#000' : color,
                  cursor: gameState === GameState.PLAYING && turn === 'player' ? 'pointer' : 'default',
                  transition: 'transform 0.2s',
                }}
                onClick={() => handleCardClick(card)}
              >
                {symbol}
              </div>
            );
          })}
        </div>
      </div>

      {/* Suit Selector Modal */}
      {showSuitSelector && (
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
            <h3 style={{ margin: '0 0 16px 0' }}>Choose a Suit</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
              {Object.values(Suit).map((suit) => (
                <button
                  key={suit}
                  onClick={() => handleSuitSelect(suit)}
                  style={{
                    background: '#059669',
                    color: 'white',
                    border: 'none',
                    padding: '12px 16px',
                    borderRadius: 4,
                    cursor: 'pointer',
                    fontSize: 16,
                  }}
                >
                  {getSuitDisplayName(suit)}
                </button>
              ))}
            </div>
            <button
              onClick={() => {
                setShowSuitSelector(false);
                setSelectedCard(null);
              }}
              style={{
                background: '#dc2626',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: 4,
                cursor: 'pointer',
                marginTop: 16,
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Game Instructions */}
      <div style={{ background: '#333', padding: 12, borderRadius: 8 }}>
        <strong>Instructions:</strong> Play cards that match the top card's suit or rank. 8s are wild and let you choose the next suit. Draw a card if you can't play.
      </div>

      {/* Tutorial Modal */}
      <Tutorial
        gameName="Crazy 8s"
        steps={crazy8sTutorial}
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
      />
    </div>
  );
} 