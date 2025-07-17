import { create } from 'zustand';

export interface ReplayGame {
  id: string;
  gameType: 'chess' | 'checkers' | 'backgammon';
  player1: string;
  player2: string;
  winner: string;
  date: string;
  moves: any[];
  initialState: any;
  duration: number;
}

export interface ReplayState {
  savedGames: ReplayGame[];
  currentReplay: ReplayGame | null;
  currentMoveIndex: number;
  isPlaying: boolean;
  playbackSpeed: number;
  addReplay: (game: ReplayGame) => void;
  removeReplay: (id: string) => void;
  setCurrentReplay: (game: ReplayGame | null) => void;
  setCurrentMoveIndex: (index: number) => void;
  setIsPlaying: (playing: boolean) => void;
  setPlaybackSpeed: (speed: number) => void;
  playNext: () => void;
  playPrevious: () => void;
  playToEnd: () => void;
  resetReplay: () => void;
  loadReplays: () => void;
  saveReplays: () => void;
}

function loadReplaysFromStorage(): ReplayGame[] {
  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem('gameReplays');
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {}
    }
  }
  return [];
}

function saveReplaysToStorage(replays: ReplayGame[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('gameReplays', JSON.stringify(replays));
  }
}

export const useReplayStore = create<ReplayState>((set, get) => ({
  savedGames: [],
  currentReplay: null,
  currentMoveIndex: 0,
  isPlaying: false,
  playbackSpeed: 1,
  
  addReplay: (game) => {
    const { savedGames, saveReplays } = get();
    const newGames = [game, ...savedGames];
    set({ savedGames: newGames });
    saveReplays();
  },
  
  removeReplay: (id) => {
    const { savedGames, saveReplays } = get();
    const newGames = savedGames.filter(game => game.id !== id);
    set({ savedGames: newGames });
    saveReplays();
  },
  
  setCurrentReplay: (game) => {
    set({ currentReplay: game, currentMoveIndex: 0, isPlaying: false });
  },
  
  setCurrentMoveIndex: (index) => {
    const { currentReplay } = get();
    if (currentReplay) {
      const maxIndex = currentReplay.moves.length - 1;
      const clampedIndex = Math.max(0, Math.min(index, maxIndex));
      set({ currentMoveIndex: clampedIndex });
    }
  },
  
  setIsPlaying: (playing) => {
    set({ isPlaying: playing });
  },
  
  setPlaybackSpeed: (speed) => {
    set({ playbackSpeed: speed });
  },
  
  playNext: () => {
    const { currentReplay, currentMoveIndex, setCurrentMoveIndex } = get();
    if (currentReplay && currentMoveIndex < currentReplay.moves.length - 1) {
      setCurrentMoveIndex(currentMoveIndex + 1);
    } else {
      set({ isPlaying: false });
    }
  },
  
  playPrevious: () => {
    const { currentMoveIndex, setCurrentMoveIndex } = get();
    if (currentMoveIndex > 0) {
      setCurrentMoveIndex(currentMoveIndex - 1);
    }
  },
  
  playToEnd: () => {
    const { currentReplay, setCurrentMoveIndex } = get();
    if (currentReplay) {
      setCurrentMoveIndex(currentReplay.moves.length - 1);
      set({ isPlaying: false });
    }
  },
  
  resetReplay: () => {
    set({ currentMoveIndex: 0, isPlaying: false });
  },
  
  loadReplays: () => {
    const replays = loadReplaysFromStorage();
    set({ savedGames: replays });
  },
  
  saveReplays: () => {
    const { savedGames } = get();
    saveReplaysToStorage(savedGames);
  },
})); 