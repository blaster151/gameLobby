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

function dealCards(deck: Card[]): { playerHand: Card[], botHand: Card[], stockPile: Card[], topCard: Card } {
  const playerHand = deck.slice(0, 7);
  const botHand = deck.slice(7, 14);
  const stockPile = deck.slice(14, deck.length - 1);
  const topCard = deck[deck.length - 1];
  
  return { playerHand, botHand, stockPile, topCard };
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

function getValidMoves(hand: Card[], topCard: Card, currentSuit?: Suit): Card[] {
  return hand.filter(card => canPlayCard(card, topCard, currentSuit));
}

function makeBotMove(hand: Card[], topCard: Card, currentSuit: Suit | undefined, stockPile: Card[], difficulty: BotDifficulty): { action: 'play' | 'draw', card?: Card, newSuit?: Suit } {
  const validMoves = getValidMoves(hand, topCard, currentSuit);
  
  if (validMoves.length === 0) {
    return { action: 'draw' };
  }
  
  switch (difficulty) {
    case BotDifficulty.EASY:
      // Random move
      const randomCard = validMoves[Math.floor(Math.random() * validMoves.length)];
      if (randomCard.rank === Rank.EIGHT) {
        const randomSuit = Object.values(Suit)[Math.floor(Math.random() * Object.values(Suit).length)];
        return { action: 'play', card: randomCard, newSuit: randomSuit };
      }
      return { action: 'play', card: randomCard };
      
    case BotDifficulty.MEDIUM:
      // Sometimes random, sometimes strategic
      if (Math.random() < 0.4) {
        const randomCard = validMoves[Math.floor(Math.random() * validMoves.length)];
        if (randomCard.rank === Rank.EIGHT) {
          const randomSuit = Object.values(Suit)[Math.floor(Math.random() * Object.values(Suit).length)];
          return { action: 'play', card: randomCard, newSuit: randomSuit };
        }
        return { action: 'play', card: randomCard };
      }
      // Fall through to strategic logic
      
    case BotDifficulty.HARD:
      // Strategic move - prefer non-8s, then 8s
      const nonEights = validMoves.filter(card => card.rank !== Rank.EIGHT);
      const eights = validMoves.filter(card => card.rank === Rank.EIGHT);
      
      if (nonEights.length > 0) {
        // Play the first non-8 card
        return { action: 'play', card: nonEights[0] };
      } else if (eights.length > 0) {
        // Play an 8 and choose the suit with most cards in hand
        const suitCounts = new Map<Suit, number>();
        hand.forEach(card => {
          suitCounts.set(card.suit, (suitCounts.get(card.suit) || 0) + 1);
        });
        
        let bestSuit = Suit.HEARTS;
        let maxCount = 0;
        suitCounts.forEach((count, suit) => {
          if (count > maxCount) {
            maxCount = count;
            bestSuit = suit;
          }
        });
        
        return { action: 'play', card: eights[0], newSuit: bestSuit };
      }
  }
  
  return { action: 'draw' };
}

function loadStats(): GameStats {
  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem('crazy8sStats');
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
    localStorage.setItem('crazy8sStats', JSON.stringify(stats));
  }
}

function saveGameState(state: any) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('crazy8sGameState', JSON.stringify({
      playerHand: state.playerHand,
      botHand: state.botHand,
      stockPile: state.stockPile,
      topCard: state.topCard,
      currentSuit: state.currentSuit,
      gameState: state.gameState,
      turn: state.turn,
      message: state.message,
      botDifficulty: state.botDifficulty,
    }));
  }
}

function loadGameState(): any {
  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem('crazy8sGameState');
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {}
    }
  }
  return null;
}

interface Crazy8sState {
  playerHand: Card[];
  botHand: Card[];
  stockPile: Card[];
  topCard: Card | null;
  currentSuit: Suit | undefined;
  gameState: GameState;
  turn: 'player' | 'bot';
  message: string;
  stats: GameStats;
  botDifficulty: BotDifficulty;
  setPlayerHand: (hand: Card[]) => void;
  setBotHand: (hand: Card[]) => void;
  setStockPile: (pile: Card[]) => void;
  setTopCard: (card: Card) => void;
  setCurrentSuit: (suit: Suit | undefined) => void;
  setGameState: (state: GameState) => void;
  setTurn: (turn: 'player' | 'bot') => void;
  setMessage: (message: string) => void;
  resetGame: () => void;
  updateStats: (result: 'win' | 'loss') => void;
  resetStats: () => void;
  setBotDifficulty: (difficulty: BotDifficulty) => void;
  saveGame: () => void;
  loadGame: () => void;
  hasSavedGame: () => boolean;
  playCard: (card: Card, newSuit?: Suit) => void;
  drawCard: () => void;
}

export const useCrazy8sStore = create<Crazy8sState>((set, get) => {
  const savedState = loadGameState();
  const initialState = savedState || {
    playerHand: [],
    botHand: [],
    stockPile: [],
    topCard: null,
    currentSuit: undefined,
    gameState: GameState.DEALING,
    turn: 'player' as const,
    message: 'Dealing cards...',
    botDifficulty: BotDifficulty.MEDIUM,
  };

  return {
    playerHand: initialState.playerHand,
    botHand: initialState.botHand,
    stockPile: initialState.stockPile,
    topCard: initialState.topCard,
    currentSuit: initialState.currentSuit,
    gameState: initialState.gameState,
    turn: initialState.turn,
    message: initialState.message,
    stats: typeof window !== 'undefined' ? loadStats() : { wins: 0, losses: 0, totalGames: 0 },
    botDifficulty: initialState.botDifficulty,
    
    setPlayerHand: (hand) => set({ playerHand: hand }),
    setBotHand: (hand) => set({ botHand: hand }),
    setStockPile: (pile) => set({ stockPile: pile }),
    setTopCard: (card) => set({ topCard: card }),
    setCurrentSuit: (suit) => set({ currentSuit: suit }),
    setGameState: (state) => set({ gameState: state }),
    setTurn: (turn) => set({ turn }),
    setMessage: (message) => set({ message }),
    
    resetGame: () => {
      const deck = shuffleDeck(createDeck());
      const { playerHand, botHand, stockPile, topCard } = dealCards(deck);
      
      set({
        playerHand,
        botHand,
        stockPile,
        topCard,
        currentSuit: undefined,
        gameState: GameState.PLAYING,
        turn: 'player',
        message: 'Your turn. Play a card or draw from the deck.',
      });
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
          topCard: savedState.topCard,
          currentSuit: savedState.currentSuit,
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
    
    playCard: (card, newSuit) => {
      const { playerHand, topCard, currentSuit, turn, gameState, botDifficulty } = get();
      if (gameState !== GameState.PLAYING || turn !== 'player') return;
      
      if (!topCard) return;
      
      if (!canPlayCard(card, topCard, currentSuit)) {
        set({ message: 'Invalid move. Card must match suit or rank.' });
        return;
      }
      
      const newPlayerHand = playerHand.filter(c => c.id !== card.id);
      const newTopCard = card;
      const newCurrentSuit = card.rank === Rank.EIGHT ? newSuit : undefined;
      
      set({
        playerHand: newPlayerHand,
        topCard: newTopCard,
        currentSuit: newCurrentSuit,
        turn: 'bot',
        message: 'Bot is thinking...',
      });
      
      // Check for win
      if (newPlayerHand.length === 0) {
        set({ 
          gameState: GameState.GAME_OVER, 
          message: 'You win! You played all your cards!',
        });
        get().updateStats('win');
        return;
      }
      
      // Bot turn
      setTimeout(() => {
        const currentState = get();
        if (currentState.turn === 'bot' && currentState.gameState === GameState.PLAYING) {
          const botMove = makeBotMove(
            currentState.botHand,
            currentState.topCard!,
            currentState.currentSuit,
            currentState.stockPile,
            currentState.botDifficulty
          );
          
          if (botMove.action === 'play' && botMove.card) {
            const newBotHand = currentState.botHand.filter(c => c.id !== botMove.card!.id);
            const newTopCard = botMove.card;
            const newCurrentSuit = botMove.card.rank === Rank.EIGHT ? botMove.newSuit : undefined;
            
            set({
              botHand: newBotHand,
              topCard: newTopCard,
              currentSuit: newCurrentSuit,
              turn: 'player',
              message: 'Your turn. Play a card or draw from the deck.',
            });
            
            // Check for bot win
            if (newBotHand.length === 0) {
              set({ 
                gameState: GameState.GAME_OVER, 
                message: 'Bot wins! Bot played all cards!',
              });
              get().updateStats('loss');
            }
          } else {
            // Bot draws
            if (currentState.stockPile.length > 0) {
              const newStockPile = [...currentState.stockPile];
              const drawnCard = newStockPile.pop()!;
              const newBotHand = [...currentState.botHand, drawnCard];
              
              set({
                stockPile: newStockPile,
                botHand: newBotHand,
                turn: 'player',
                message: 'Bot drew a card. Your turn.',
              });
            } else {
              // No cards left to draw
              set({ 
                gameState: GameState.GAME_OVER, 
                message: 'No cards left to draw. Game is a draw!',
              });
            }
          }
        }
      }, 1000);
    },
    
    drawCard: () => {
      const { stockPile, playerHand, turn, gameState } = get();
      if (gameState !== GameState.PLAYING || turn !== 'player') return;
      
      if (stockPile.length === 0) {
        set({ message: 'No cards left to draw.' });
        return;
      }
      
      const newStockPile = [...stockPile];
      const drawnCard = newStockPile.pop()!;
      const newPlayerHand = [...playerHand, drawnCard];
      
      set({
        stockPile: newStockPile,
        playerHand: newPlayerHand,
        turn: 'bot',
        message: 'Bot is thinking...',
      });
      
      // Bot turn
      setTimeout(() => {
        const currentState = get();
        if (currentState.turn === 'bot' && currentState.gameState === GameState.PLAYING) {
          const botMove = makeBotMove(
            currentState.botHand,
            currentState.topCard!,
            currentState.currentSuit,
            currentState.stockPile,
            currentState.botDifficulty
          );
          
          if (botMove.action === 'play' && botMove.card) {
            const newBotHand = currentState.botHand.filter(c => c.id !== botMove.card!.id);
            const newTopCard = botMove.card;
            const newCurrentSuit = botMove.card.rank === Rank.EIGHT ? botMove.newSuit : undefined;
            
            set({
              botHand: newBotHand,
              topCard: newTopCard,
              currentSuit: newCurrentSuit,
              turn: 'player',
              message: 'Your turn. Play a card or draw from the deck.',
            });
            
            // Check for bot win
            if (newBotHand.length === 0) {
              set({ 
                gameState: GameState.GAME_OVER, 
                message: 'Bot wins! Bot played all cards!',
              });
              get().updateStats('loss');
            }
          } else {
            // Bot draws
            if (currentState.stockPile.length > 0) {
              const newStockPile = [...currentState.stockPile];
              const drawnCard = newStockPile.pop()!;
              const newBotHand = [...currentState.botHand, drawnCard];
              
              set({
                stockPile: newStockPile,
                botHand: newBotHand,
                turn: 'player',
                message: 'Bot drew a card. Your turn.',
              });
            } else {
              // No cards left to draw
              set({ 
                gameState: GameState.GAME_OVER, 
                message: 'No cards left to draw. Game is a draw!',
              });
            }
          }
        }
      }, 1000);
    },
  };
}); 