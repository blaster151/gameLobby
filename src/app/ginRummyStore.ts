import { create } from 'zustand';

export enum Suit {
  HEARTS = 'hearts',
  DIAMONDS = 'diamonds',
  CLUBS = 'clubs',
  SPADES = 'spades',
}

export enum Rank {
  ACE = 1,
  TWO = 2,
  THREE = 3,
  FOUR = 4,
  FIVE = 5,
  SIX = 6,
  SEVEN = 7,
  EIGHT = 8,
  NINE = 9,
  TEN = 10,
  JACK = 11,
  QUEEN = 12,
  KING = 13,
}

export interface Card {
  suit: Suit;
  rank: Rank;
  id: string;
}

export enum GameState {
  DEALING = 'dealing',
  PLAYING = 'playing',
  KNOCKED = 'knocked',
  GAME_OVER = 'game_over',
}

export enum BotDifficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
}

interface GameStats {
  wins: number;
  losses: number;
  totalGames: number;
  totalScore: number;
}

function createDeck(): Card[] {
  const deck: Card[] = [];
  Object.values(Suit).forEach(suit => {
    Object.values(Rank).forEach(rank => {
      deck.push({
        suit,
        rank: rank as Rank,
        id: `${suit}-${rank}`,
      });
    });
  });
  return deck;
}

function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function dealCards(deck: Card[]): { playerHand: Card[], botHand: Card[], stockPile: Card[], discardPile: Card[] } {
  const playerHand = deck.slice(0, 10);
  const botHand = deck.slice(10, 20);
  const stockPile = deck.slice(20, deck.length - 1);
  const discardPile = [deck[deck.length - 1]];
  
  return { playerHand, botHand, stockPile, discardPile };
}

function calculateDeadwood(hand: Card[]): number {
  // Simplified deadwood calculation - sum of card values
  return hand.reduce((sum, card) => {
    const value = card.rank > 10 ? 10 : card.rank;
    return sum + value;
  }, 0);
}

function findMelds(hand: Card[]): { sets: Card[][], runs: Card[][] } {
  const sets: Card[][] = [];
  const runs: Card[][] = [];
  
  // Find sets (3 or 4 cards of same rank)
  const rankGroups = new Map<Rank, Card[]>();
  hand.forEach(card => {
    if (!rankGroups.has(card.rank)) {
      rankGroups.set(card.rank, []);
    }
    rankGroups.get(card.rank)!.push(card);
  });
  
  rankGroups.forEach(cards => {
    if (cards.length >= 3) {
      sets.push(cards);
    }
  });
  
  // Find runs (3+ consecutive cards of same suit)
  const suitGroups = new Map<Suit, Card[]>();
  hand.forEach(card => {
    if (!suitGroups.has(card.suit)) {
      suitGroups.set(card.suit, []);
    }
    suitGroups.get(card.suit)!.push(card);
  });
  
  suitGroups.forEach(cards => {
    const sortedCards = cards.sort((a, b) => a.rank - b.rank);
    for (let i = 0; i <= sortedCards.length - 3; i++) {
      const run = [sortedCards[i]];
      for (let j = i + 1; j < sortedCards.length; j++) {
        if (sortedCards[j].rank === sortedCards[j - 1].rank + 1) {
          run.push(sortedCards[j]);
        } else {
          break;
        }
      }
      if (run.length >= 3) {
        runs.push([...run]);
      }
    }
  });
  
  return { sets, runs };
}

function canKnock(hand: Card[]): boolean {
  const deadwood = calculateDeadwood(hand);
  return deadwood <= 10;
}

function makeBotMove(hand: Card[], stockPile: Card[], discardPile: Card[], difficulty: BotDifficulty): { action: 'draw' | 'discard', card?: Card } {
  const topDiscard = discardPile[discardPile.length - 1];
  
  switch (difficulty) {
    case BotDifficulty.EASY:
      // Random decision
      return Math.random() < 0.5 ? { action: 'draw' } : { action: 'discard', card: hand[Math.floor(Math.random() * hand.length)] };
      
    case BotDifficulty.MEDIUM:
      // Sometimes strategic, sometimes random
      if (Math.random() < 0.3) {
        return Math.random() < 0.5 ? { action: 'draw' } : { action: 'discard', card: hand[Math.floor(Math.random() * hand.length)] };
      }
      // Fall through to strategic logic
      
    case BotDifficulty.HARD:
      // Strategic decision
      const currentDeadwood = calculateDeadwood(hand);
      
      // If we can knock, do it
      if (canKnock(hand)) {
        return { action: 'discard', card: hand[0] };
      }
      
      // Evaluate if top discard helps
      const handWithDiscard = [...hand, topDiscard];
      const newDeadwood = calculateDeadwood(handWithDiscard);
      
      if (newDeadwood < currentDeadwood) {
        return { action: 'draw' };
      }
      
      // Find worst card to discard
      let worstCard = hand[0];
      let worstDeadwood = currentDeadwood;
      
      hand.forEach(card => {
        const handWithoutCard = hand.filter(c => c.id !== card.id);
        const deadwood = calculateDeadwood(handWithoutCard);
        if (deadwood < worstDeadwood) {
          worstDeadwood = deadwood;
          worstCard = card;
        }
      });
      
      return { action: 'discard', card: worstCard };
  }
  
  return { action: 'draw' };
}

function loadStats(): GameStats {
  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem('ginRummyStats');
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {}
    }
  }
  return { wins: 0, losses: 0, totalGames: 0, totalScore: 0 };
}

function saveStats(stats: GameStats) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('ginRummyStats', JSON.stringify(stats));
  }
}

function saveGameState(state: any) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('ginRummyGameState', JSON.stringify({
      playerHand: state.playerHand,
      botHand: state.botHand,
      stockPile: state.stockPile,
      discardPile: state.discardPile,
      gameState: state.gameState,
      turn: state.turn,
      message: state.message,
      botDifficulty: state.botDifficulty,
    }));
  }
}

function loadGameState(): any {
  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem('ginRummyGameState');
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {}
    }
  }
  return null;
}

interface GinRummyState {
  playerHand: Card[];
  botHand: Card[];
  stockPile: Card[];
  discardPile: Card[];
  gameState: GameState;
  turn: 'player' | 'bot';
  message: string;
  stats: GameStats;
  botDifficulty: BotDifficulty;
  setPlayerHand: (hand: Card[]) => void;
  setBotHand: (hand: Card[]) => void;
  setStockPile: (pile: Card[]) => void;
  setDiscardPile: (pile: Card[]) => void;
  setGameState: (state: GameState) => void;
  setTurn: (turn: 'player' | 'bot') => void;
  setMessage: (message: string) => void;
  resetGame: () => void;
  updateStats: (result: 'win' | 'loss', score: number) => void;
  resetStats: () => void;
  setBotDifficulty: (difficulty: BotDifficulty) => void;
  saveGame: () => void;
  loadGame: () => void;
  hasSavedGame: () => boolean;
  drawFromStock: () => void;
  drawFromDiscard: () => void;
  discardCard: (card: Card) => void;
  knock: () => void;
}

export const useGinRummyStore = create<GinRummyState>((set, get) => {
  const savedState = loadGameState();
  const initialState = savedState || {
    playerHand: [],
    botHand: [],
    stockPile: [],
    discardPile: [],
    gameState: GameState.DEALING,
    turn: 'player' as const,
    message: 'Dealing cards...',
    botDifficulty: BotDifficulty.MEDIUM,
  };

  return {
    playerHand: initialState.playerHand,
    botHand: initialState.botHand,
    stockPile: initialState.stockPile,
    discardPile: initialState.discardPile,
    gameState: initialState.gameState,
    turn: initialState.turn,
    message: initialState.message,
    stats: typeof window !== 'undefined' ? loadStats() : { wins: 0, losses: 0, totalGames: 0, totalScore: 0 },
    botDifficulty: initialState.botDifficulty,
    
    setPlayerHand: (hand) => set({ playerHand: hand }),
    setBotHand: (hand) => set({ botHand: hand }),
    setStockPile: (pile) => set({ stockPile: pile }),
    setDiscardPile: (pile) => set({ discardPile: pile }),
    setGameState: (state) => set({ gameState: state }),
    setTurn: (turn) => set({ turn }),
    setMessage: (message) => set({ message }),
    
    resetGame: () => {
      const deck = shuffleDeck(createDeck());
      const { playerHand, botHand, stockPile, discardPile } = dealCards(deck);
      
      set({
        playerHand,
        botHand,
        stockPile,
        discardPile,
        gameState: GameState.PLAYING,
        turn: 'player',
        message: 'Your turn. Draw a card or pick up from discard pile.',
      });
    },
    
    updateStats: (result, score) => {
      const { stats } = get();
      const newStats = {
        ...stats,
        totalGames: stats.totalGames + 1,
        wins: result === 'win' ? stats.wins + 1 : stats.wins,
        losses: result === 'loss' ? stats.losses + 1 : stats.losses,
        totalScore: stats.totalScore + score,
      };
      set({ stats: newStats });
      saveStats(newStats);
    },
    
    resetStats: () => {
      const zeroStats = { wins: 0, losses: 0, totalGames: 0, totalScore: 0 };
      set({ stats: zeroStats });
      saveStats(zeroStats);
    },
    
    setBotDifficulty: (difficulty) => set({ botDifficulty: difficulty }),
    
    saveGame: () => {
      const state = get();
      saveGameState(state);
    },
    
    loadGame: () => {
      const savedState = loadGameState();
      if (savedState) {
        set({
          playerHand: savedState.playerHand,
          botHand: savedState.botHand,
          stockPile: savedState.stockPile,
          discardPile: savedState.discardPile,
          gameState: savedState.gameState,
          turn: savedState.turn,
          message: savedState.message,
          botDifficulty: savedState.botDifficulty,
        });
      }
    },
    
    hasSavedGame: () => {
      return loadGameState() !== null;
    },
    
    drawFromStock: () => {
      const { stockPile, playerHand, turn, gameState } = get();
      if (gameState !== GameState.PLAYING || turn !== 'player') return;
      
      if (stockPile.length === 0) {
        set({ gameState: GameState.GAME_OVER, message: 'Stock pile is empty. Game is a draw.' });
        return;
      }
      
      const newStockPile = [...stockPile];
      const drawnCard = newStockPile.pop()!;
      const newPlayerHand = [...playerHand, drawnCard];
      
      set({
        stockPile: newStockPile,
        playerHand: newPlayerHand,
        message: 'Card drawn. Now discard a card.',
      });
    },
    
    drawFromDiscard: () => {
      const { discardPile, playerHand, turn, gameState } = get();
      if (gameState !== GameState.PLAYING || turn !== 'player') return;
      
      if (discardPile.length === 0) return;
      
      const newDiscardPile = [...discardPile];
      const drawnCard = newDiscardPile.pop()!;
      const newPlayerHand = [...playerHand, drawnCard];
      
      set({
        discardPile: newDiscardPile,
        playerHand: newPlayerHand,
        message: 'Card picked up from discard. Now discard a card.',
      });
    },
    
    discardCard: (card) => {
      const { playerHand, discardPile, turn, gameState, botDifficulty } = get();
      if (gameState !== GameState.PLAYING || turn !== 'player') return;
      
      const newPlayerHand = playerHand.filter(c => c.id !== card.id);
      const newDiscardPile = [...discardPile, card];
      
      set({
        playerHand: newPlayerHand,
        discardPile: newDiscardPile,
        turn: 'bot',
        message: 'Bot is thinking...',
      });
      
      // Bot turn
      setTimeout(() => {
        const currentState = get();
        if (currentState.turn === 'bot' && currentState.gameState === GameState.PLAYING) {
          const botMove = makeBotMove(
            currentState.botHand,
            currentState.stockPile,
            currentState.discardPile,
            currentState.botDifficulty
          );
          
          if (botMove.action === 'draw') {
            if (currentState.stockPile.length > 0) {
              const newStockPile = [...currentState.stockPile];
              const drawnCard = newStockPile.pop()!;
              const newBotHand = [...currentState.botHand, drawnCard];
              
              set({
                stockPile: newStockPile,
                botHand: newBotHand,
                message: 'Bot drew from stock pile.',
              });
            }
          } else if (botMove.action === 'discard' && botMove.card) {
            const newBotHand = currentState.botHand.filter(c => c.id !== botMove.card!.id);
            const newDiscardPile = [...currentState.discardPile, botMove.card];
            
            set({
              botHand: newBotHand,
              discardPile: newDiscardPile,
              turn: 'player',
              message: 'Your turn. Draw a card or pick up from discard pile.',
            });
          }
        }
      }, 1000);
    },
    
    knock: () => {
      const { playerHand, turn, gameState } = get();
      if (gameState !== GameState.PLAYING || turn !== 'player') return;
      
      if (!canKnock(playerHand)) {
        set({ message: 'You cannot knock. Deadwood must be 10 or less.' });
        return;
      }
      
      const playerDeadwood = calculateDeadwood(playerHand);
      const botDeadwood = calculateDeadwood(get().botHand);
      
      if (playerDeadwood < botDeadwood) {
        const score = botDeadwood - playerDeadwood;
        set({ 
          gameState: GameState.GAME_OVER, 
          message: `You win! Score: ${score} points.`,
        });
        get().updateStats('win', score);
      } else {
        const score = playerDeadwood - botDeadwood;
        set({ 
          gameState: GameState.GAME_OVER, 
          message: `Bot wins! Score: ${score} points.`,
        });
        get().updateStats('loss', score);
      }
    },
  };
}); 