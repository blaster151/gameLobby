import { renderHook, act } from '@testing-library/react';
import { useReplayStore, ReplayGame } from './replayStore';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('ReplayStore', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockReturnValue(null);
    localStorageMock.setItem.mockClear();
    localStorageMock.getItem.mockClear();
  });

  const mockReplay: ReplayGame = {
    id: 'test-1',
    gameType: 'chess',
    player1: 'Player 1',
    player2: 'Player 2',
    winner: 'Player 1',
    date: '2024-01-01T00:00:00.000Z',
    moves: [
      { description: 'e4', board: [] },
      { description: 'e5', board: [] },
      { description: 'Nf3', board: [] },
    ],
    initialState: {},
    duration: 300,
  };

  test('initializes with empty state', () => {
    const { result } = renderHook(() => useReplayStore());
    
    expect(result.current.savedGames).toEqual([]);
    expect(result.current.currentReplay).toBeNull();
    expect(result.current.currentMoveIndex).toBe(0);
    expect(result.current.isPlaying).toBe(false);
    expect(result.current.playbackSpeed).toBe(1);
  });

  test('adds replay to saved games', () => {
    const { result } = renderHook(() => useReplayStore());
    
    act(() => {
      result.current.addReplay(mockReplay);
    });
    
    expect(result.current.savedGames).toHaveLength(1);
    expect(result.current.savedGames[0]).toEqual(mockReplay);
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'gameReplays',
      JSON.stringify([mockReplay])
    );
  });

  test('removes replay from saved games', () => {
    const { result } = renderHook(() => useReplayStore());
    
    // Add a replay first
    act(() => {
      result.current.addReplay(mockReplay);
    });
    
    expect(result.current.savedGames).toHaveLength(1);
    
    // Remove the replay
    act(() => {
      result.current.removeReplay(mockReplay.id);
    });
    
    expect(result.current.savedGames).toHaveLength(0);
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'gameReplays',
      JSON.stringify([])
    );
  });

  test('sets current replay', () => {
    const { result } = renderHook(() => useReplayStore());
    
    act(() => {
      result.current.setCurrentReplay(mockReplay);
    });
    
    expect(result.current.currentReplay).toEqual(mockReplay);
    expect(result.current.currentMoveIndex).toBe(0);
    expect(result.current.isPlaying).toBe(false);
  });

  test('sets current move index within bounds', () => {
    const { result } = renderHook(() => useReplayStore());
    
    // Set current replay first
    act(() => {
      result.current.setCurrentReplay(mockReplay);
    });
    
    // Set move index within bounds
    act(() => {
      result.current.setCurrentMoveIndex(1);
    });
    
    expect(result.current.currentMoveIndex).toBe(1);
    
    // Set move index out of bounds (should clamp)
    act(() => {
      result.current.setCurrentMoveIndex(10);
    });
    
    expect(result.current.currentMoveIndex).toBe(2); // Max index is 2 (3 moves - 1)
    
    // Set move index below bounds (should clamp)
    act(() => {
      result.current.setCurrentMoveIndex(-1);
    });
    
    expect(result.current.currentMoveIndex).toBe(0);
  });

  test('sets playing state', () => {
    const { result } = renderHook(() => useReplayStore());
    
    act(() => {
      result.current.setIsPlaying(true);
    });
    
    expect(result.current.isPlaying).toBe(true);
    
    act(() => {
      result.current.setIsPlaying(false);
    });
    
    expect(result.current.isPlaying).toBe(false);
  });

  test('sets playback speed', () => {
    const { result } = renderHook(() => useReplayStore());
    
    act(() => {
      result.current.setPlaybackSpeed(2);
    });
    
    expect(result.current.playbackSpeed).toBe(2);
  });

  test('plays next move', () => {
    const { result } = renderHook(() => useReplayStore());
    
    // Set current replay first
    act(() => {
      result.current.setCurrentReplay(mockReplay);
    });
    
    expect(result.current.currentMoveIndex).toBe(0);
    
    act(() => {
      result.current.playNext();
    });
    
    expect(result.current.currentMoveIndex).toBe(1);
    
    // Play to end
    act(() => {
      result.current.playNext();
    });
    
    expect(result.current.currentMoveIndex).toBe(2);
    
    // Try to play beyond end (should stop playing)
    act(() => {
      result.current.playNext();
    });
    
    expect(result.current.currentMoveIndex).toBe(2);
    expect(result.current.isPlaying).toBe(false);
  });

  test('plays previous move', () => {
    const { result } = renderHook(() => useReplayStore());
    
    // Set current replay and move to middle
    act(() => {
      result.current.setCurrentReplay(mockReplay);
      result.current.setCurrentMoveIndex(2);
    });
    
    expect(result.current.currentMoveIndex).toBe(2);
    
    act(() => {
      result.current.playPrevious();
    });
    
    expect(result.current.currentMoveIndex).toBe(1);
    
    // Try to play before start (should not change)
    act(() => {
      result.current.playPrevious();
    });
    
    expect(result.current.currentMoveIndex).toBe(0);
    
    act(() => {
      result.current.playPrevious();
    });
    
    expect(result.current.currentMoveIndex).toBe(0);
  });

  test('plays to end', () => {
    const { result } = renderHook(() => useReplayStore());
    
    // Set current replay
    act(() => {
      result.current.setCurrentReplay(mockReplay);
    });
    
    expect(result.current.currentMoveIndex).toBe(0);
    
    act(() => {
      result.current.playToEnd();
    });
    
    expect(result.current.currentMoveIndex).toBe(2); // Last move index
    expect(result.current.isPlaying).toBe(false);
  });

  test('resets replay', () => {
    const { result } = renderHook(() => useReplayStore());
    
    // Set current replay and move to middle
    act(() => {
      result.current.setCurrentReplay(mockReplay);
      result.current.setCurrentMoveIndex(2);
      result.current.setIsPlaying(true);
    });
    
    expect(result.current.currentMoveIndex).toBe(2);
    expect(result.current.isPlaying).toBe(true);
    
    act(() => {
      result.current.resetReplay();
    });
    
    expect(result.current.currentMoveIndex).toBe(0);
    expect(result.current.isPlaying).toBe(false);
  });

  test('loads replays from storage', () => {
    const savedReplays = [mockReplay];
    localStorageMock.getItem.mockReturnValue(JSON.stringify(savedReplays));
    
    const { result } = renderHook(() => useReplayStore());
    
    act(() => {
      result.current.loadReplays();
    });
    
    expect(result.current.savedGames).toEqual(savedReplays);
    expect(localStorageMock.getItem).toHaveBeenCalledWith('gameReplays');
  });

  test('saves replays to storage', () => {
    const { result } = renderHook(() => useReplayStore());
    
    // Add a replay
    act(() => {
      result.current.addReplay(mockReplay);
    });
    
    // Clear the mock to verify it's called again
    localStorageMock.setItem.mockClear();
    
    act(() => {
      result.current.saveReplays();
    });
    
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'gameReplays',
      JSON.stringify([mockReplay])
    );
  });

  test('handles multiple replays', () => {
    const { result } = renderHook(() => useReplayStore());
    
    const replay1 = { ...mockReplay, id: 'test-1' };
    const replay2 = { ...mockReplay, id: 'test-2', gameType: 'checkers' as const };
    
    act(() => {
      result.current.addReplay(replay1);
      result.current.addReplay(replay2);
    });
    
    expect(result.current.savedGames).toHaveLength(2);
    expect(result.current.savedGames[0]).toEqual(replay2); // Newest first
    expect(result.current.savedGames[1]).toEqual(replay1);
  });

  test('handles storage errors gracefully', () => {
    localStorageMock.getItem.mockImplementation(() => {
      throw new Error('Storage error');
    });
    
    const { result } = renderHook(() => useReplayStore());
    
    act(() => {
      result.current.loadReplays();
    });
    
    expect(result.current.savedGames).toEqual([]);
  });
}); 