import { create } from 'zustand';

export interface Player {
  id: string;
  name: string;
  isHost: boolean;
  isReady: boolean;
  isSpectator: boolean;
}

export interface GameLobby {
  id: string;
  name: string;
  game: 'checkers' | 'chess' | 'backgammon' | 'gin-rummy' | 'crazy-8s';
  maxPlayers: number;
  players: Player[];
  isPrivate: boolean;
  status: 'waiting' | 'playing' | 'finished';
  createdAt: Date;
}

interface LobbyState {
  lobbies: GameLobby[];
  currentLobby: GameLobby | null;
  currentPlayer: Player | null;
  createLobby: (name: string, game: GameLobby['game'], maxPlayers: number, isPrivate: boolean) => void;
  joinLobby: (lobbyId: string, playerName: string) => void;
  joinAsSpectator: (lobbyId: string, playerName: string) => void;
  leaveLobby: () => void;
  setPlayerReady: (isReady: boolean) => void;
  startGame: () => void;
  deleteLobby: (lobbyId: string) => void;
}

function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export const useLobbyStore = create<LobbyState>((set, get) => ({
  lobbies: [
    {
      id: 'demo-1',
      name: 'Demo Checkers Game',
      game: 'checkers',
      maxPlayers: 2,
      players: [
        { id: 'player-1', name: 'Alice', isHost: true, isReady: true, isSpectator: false },
        { id: 'player-2', name: 'Bob', isHost: false, isReady: false, isSpectator: false },
      ],
      isPrivate: false,
      status: 'waiting',
      createdAt: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
    },
    {
      id: 'demo-2',
      name: 'Chess Tournament',
      game: 'chess',
      maxPlayers: 2,
      players: [
        { id: 'player-3', name: 'Charlie', isHost: true, isReady: true, isSpectator: false },
        { id: 'player-4', name: 'David', isHost: false, isReady: false, isSpectator: true },
      ],
      isPrivate: false,
      status: 'playing',
      createdAt: new Date(Date.now() - 1000 * 60 * 2), // 2 minutes ago
    },
  ],
  currentLobby: null,
  currentPlayer: null,
  
  createLobby: (name, game, maxPlayers, isPrivate) => {
    const lobbyId = generateId();
    const playerId = generateId();
    const newLobby: GameLobby = {
      id: lobbyId,
      name,
      game,
      maxPlayers,
      players: [
        {
          id: playerId,
          name: 'You',
          isHost: true,
          isReady: true,
          isSpectator: false,
        },
      ],
      isPrivate,
      status: 'waiting',
      createdAt: new Date(),
    };
    
    const newPlayer: Player = {
      id: playerId,
      name: 'You',
      isHost: true,
      isReady: true,
      isSpectator: false,
    };
    
    set(state => ({
      lobbies: [...state.lobbies, newLobby],
      currentLobby: newLobby,
      currentPlayer: newPlayer,
    }));
  },
  
  joinLobby: (lobbyId, playerName) => {
    const state = get();
    const lobby = state.lobbies.find(l => l.id === lobbyId);
    
    if (!lobby || lobby.players.filter(p => !p.isSpectator).length >= lobby.maxPlayers) {
      return;
    }
    
    const playerId = generateId();
    const newPlayer: Player = {
      id: playerId,
      name: playerName,
      isHost: false,
      isReady: false,
      isSpectator: false,
    };
    
    const updatedLobby: GameLobby = {
      ...lobby,
      players: [...lobby.players, newPlayer],
    };
    
    set(state => ({
      lobbies: state.lobbies.map(l => l.id === lobbyId ? updatedLobby : l),
      currentLobby: updatedLobby,
      currentPlayer: newPlayer,
    }));
  },
  
  joinAsSpectator: (lobbyId, playerName) => {
    const state = get();
    const lobby = state.lobbies.find(l => l.id === lobbyId);
    
    if (!lobby) return;
    
    const playerId = generateId();
    const newPlayer: Player = {
      id: playerId,
      name: playerName,
      isHost: false,
      isReady: false,
      isSpectator: true,
    };
    
    const updatedLobby: GameLobby = {
      ...lobby,
      players: [...lobby.players, newPlayer],
    };
    
    set(state => ({
      lobbies: state.lobbies.map(l => l.id === lobbyId ? updatedLobby : l),
      currentLobby: updatedLobby,
      currentPlayer: newPlayer,
    }));
  },
  
  leaveLobby: () => {
    const state = get();
    if (!state.currentLobby || !state.currentPlayer) return;
    
    const updatedLobby: GameLobby = {
      ...state.currentLobby,
      players: state.currentLobby.players.filter(p => p.id !== state.currentPlayer!.id),
    };
    
    // If no players left, delete the lobby
    if (updatedLobby.players.length === 0) {
      set(state => ({
        lobbies: state.lobbies.filter(l => l.id !== state.currentLobby!.id),
        currentLobby: null,
        currentPlayer: null,
      }));
    } else {
      // If host left, make the next player the host
      if (state.currentPlayer.isHost && updatedLobby.players.length > 0) {
        updatedLobby.players[0].isHost = true;
      }
      
      set(state => ({
        lobbies: state.lobbies.map(l => l.id === state.currentLobby!.id ? updatedLobby : l),
        currentLobby: null,
        currentPlayer: null,
      }));
    }
  },
  
  setPlayerReady: (isReady) => {
    const state = get();
    if (!state.currentLobby || !state.currentPlayer) return;
    
    const updatedLobby: GameLobby = {
      ...state.currentLobby,
      players: state.currentLobby.players.map(p => 
        p.id === state.currentPlayer!.id ? { ...p, isReady } : p
      ),
    };
    
    set(state => ({
      lobbies: state.lobbies.map(l => l.id === state.currentLobby!.id ? updatedLobby : l),
      currentLobby: updatedLobby,
      currentPlayer: { ...state.currentPlayer!, isReady },
    }));
  },
  
  startGame: () => {
    const state = get();
    if (!state.currentLobby || !state.currentPlayer?.isHost) return;
    
    const updatedLobby: GameLobby = {
      ...state.currentLobby,
      status: 'playing',
    };
    
    set(state => ({
      lobbies: state.lobbies.map(l => l.id === state.currentLobby!.id ? updatedLobby : l),
      currentLobby: updatedLobby,
    }));
  },
  
  deleteLobby: (lobbyId) => {
    set(state => ({
      lobbies: state.lobbies.filter(l => l.id !== lobbyId),
      currentLobby: state.currentLobby?.id === lobbyId ? null : state.currentLobby,
      currentPlayer: state.currentLobby?.id === lobbyId ? null : state.currentPlayer,
    }));
  },
})); 