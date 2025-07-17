import { renderHook, act } from '@testing-library/react';
import { useChallengeStore, Challenge, ChallengeAttempt } from './challengeStore';

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

describe('ChallengeStore', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockReturnValue(null);
    localStorageMock.setItem.mockClear();
    localStorageMock.getItem.mockClear();
  });

  const mockChallenge: Challenge = {
    id: 'chess-2024-01-01',
    gameType: 'chess',
    title: 'Checkmate in 2',
    description: 'Find the fastest checkmate sequence. White to move.',
    date: '2024-01-01',
    initialBoard: {},
    targetMoves: 2,
    difficulty: 'easy',
    solution: [],
    completedBy: [],
  };

  const mockAttempt: ChallengeAttempt = {
    id: 'attempt-1',
    challengeId: 'chess-2024-01-01',
    playerName: 'TestPlayer',
    moves: [],
    completed: true,
    timeSpent: 120,
    date: '2024-01-01T00:00:00.000Z',
    score: 850,
  };

  test('initializes with empty state', () => {
    const { result } = renderHook(() => useChallengeStore());
    
    expect(result.current.dailyChallenges).toEqual([]);
    expect(result.current.attempts).toEqual([]);
    expect(result.current.currentChallenge).toBeNull();
  });

  test('sets current challenge', () => {
    const { result } = renderHook(() => useChallengeStore());
    
    act(() => {
      result.current.setCurrentChallenge(mockChallenge);
    });
    
    expect(result.current.currentChallenge).toEqual(mockChallenge);
  });

  test('adds attempt to attempts list', () => {
    const { result } = renderHook(() => useChallengeStore());
    
    act(() => {
      result.current.addAttempt(mockAttempt);
    });
    
    expect(result.current.attempts).toHaveLength(1);
    expect(result.current.attempts[0]).toEqual(mockAttempt);
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'challengeAttempts',
      JSON.stringify([mockAttempt])
    );
  });

  test('gets leaderboard for specific challenge', () => {
    const { result } = renderHook(() => useChallengeStore());
    
    const attempt1 = { ...mockAttempt, score: 900 };
    const attempt2 = { ...mockAttempt, id: 'attempt-2', playerName: 'Player2', score: 850 };
    const attempt3 = { ...mockAttempt, id: 'attempt-3', challengeId: 'different-challenge', score: 1000 };
    
    act(() => {
      result.current.addAttempt(attempt1);
      result.current.addAttempt(attempt2);
      result.current.addAttempt(attempt3);
    });
    
    const leaderboard = result.current.getLeaderboard('chess-2024-01-01');
    
    expect(leaderboard).toHaveLength(2);
    expect(leaderboard[0].score).toBe(900); // Highest score first
    expect(leaderboard[1].score).toBe(850);
  });

  test('generates daily challenges', () => {
    const { result } = renderHook(() => useChallengeStore());
    
    act(() => {
      result.current.generateDailyChallenges();
    });
    
    expect(result.current.dailyChallenges).toHaveLength(3);
    expect(result.current.dailyChallenges[0].gameType).toBe('chess');
    expect(result.current.dailyChallenges[1].gameType).toBe('checkers');
    expect(result.current.dailyChallenges[2].gameType).toBe('backgammon');
    
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'dailyChallenges',
      expect.any(String)
    );
  });

  test('loads challenges from storage', () => {
    const savedChallenges = [mockChallenge];
    const savedAttempts = [mockAttempt];
    
    localStorageMock.getItem
      .mockReturnValueOnce(JSON.stringify(savedChallenges))
      .mockReturnValueOnce(JSON.stringify(savedAttempts));
    
    const { result } = renderHook(() => useChallengeStore());
    
    act(() => {
      result.current.loadChallenges();
    });
    
    expect(result.current.dailyChallenges).toEqual(savedChallenges);
    expect(result.current.attempts).toEqual(savedAttempts);
    expect(localStorageMock.getItem).toHaveBeenCalledWith('dailyChallenges');
    expect(localStorageMock.getItem).toHaveBeenCalledWith('challengeAttempts');
  });

  test('saves challenges to storage', () => {
    const { result } = renderHook(() => useChallengeStore());
    
    act(() => {
      result.current.addAttempt(mockAttempt);
      result.current.generateDailyChallenges();
    });
    
    // Clear mocks to verify they're called again
    localStorageMock.setItem.mockClear();
    
    act(() => {
      result.current.saveChallenges();
    });
    
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'dailyChallenges',
      expect.any(String)
    );
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'challengeAttempts',
      expect.any(String)
    );
  });

  test('gets today challenges', () => {
    const { result } = renderHook(() => useChallengeStore());
    
    const today = new Date().toISOString().split('T')[0];
    const todayChallenge = { ...mockChallenge, date: today };
    const oldChallenge = { ...mockChallenge, id: 'old', date: '2023-01-01' };
    
    act(() => {
      result.current.dailyChallenges = [todayChallenge, oldChallenge];
    });
    
    const todayChallenges = result.current.getTodayChallenges();
    
    expect(todayChallenges).toHaveLength(1);
    expect(todayChallenges[0]).toEqual(todayChallenge);
  });

  test('calculates score correctly', () => {
    const { result } = renderHook(() => useChallengeStore());
    
    const moves: any[] = [];
    const timeSpent = 100;
    const targetMoves = 3;
    
    const score = result.current.calculateScore(moves, timeSpent, targetMoves);
    
    // Base score: 1000
    // Move bonus: (3 - 0) * 100 = 300
    // Time penalty: 100 / 10 = 10
    // Expected: 1000 + 300 - 10 = 1290
    expect(score).toBe(1290);
  });

  test('calculates score with move penalty', () => {
    const { result } = renderHook(() => useChallengeStore());
    
    const moves: any[] = [1, 2, 3, 4]; // 4 moves
    const timeSpent = 50;
    const targetMoves = 3;
    
    const score = result.current.calculateScore(moves, timeSpent, targetMoves);
    
    // Base score: 1000
    // Move bonus: (3 - 4) * 100 = -100 (clamped to 0)
    // Time penalty: 50 / 10 = 5
    // Expected: 1000 + 0 - 5 = 995
    expect(score).toBe(995);
  });

  test('calculates minimum score', () => {
    const { result } = renderHook(() => useChallengeStore());
    
    const moves: any[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]; // 10 moves
    const timeSpent = 10000; // Very slow
    const targetMoves = 2;
    
    const score = result.current.calculateScore(moves, timeSpent, targetMoves);
    
    // Should be minimum 100 points
    expect(score).toBe(100);
  });

  test('handles storage errors gracefully', () => {
    localStorageMock.getItem.mockImplementation(() => {
      throw new Error('Storage error');
    });
    
    const { result } = renderHook(() => useChallengeStore());
    
    act(() => {
      result.current.loadChallenges();
    });
    
    expect(result.current.dailyChallenges).toEqual([]);
    expect(result.current.attempts).toEqual([]);
  });

  test('leaderboard limits to top 10', () => {
    const { result } = renderHook(() => useChallengeStore());
    
    // Add 15 attempts
    for (let i = 0; i < 15; i++) {
      const attempt = {
        ...mockAttempt,
        id: `attempt-${i}`,
        playerName: `Player${i}`,
        score: 1000 - i, // Decreasing scores
      };
      
      act(() => {
        result.current.addAttempt(attempt);
      });
    }
    
    const leaderboard = result.current.getLeaderboard('chess-2024-01-01');
    
    expect(leaderboard).toHaveLength(10);
    expect(leaderboard[0].score).toBe(1000); // Highest score
    expect(leaderboard[9].score).toBe(991); // 10th highest score
  });

  test('generates different challenge types', () => {
    const { result } = renderHook(() => useChallengeStore());
    
    act(() => {
      result.current.generateDailyChallenges();
    });
    
    const challenges = result.current.dailyChallenges;
    
    expect(challenges).toHaveLength(3);
    
    const gameTypes = challenges.map(c => c.gameType);
    expect(gameTypes).toContain('chess');
    expect(gameTypes).toContain('checkers');
    expect(gameTypes).toContain('backgammon');
    
    // Each challenge should have required properties
    challenges.forEach(challenge => {
      expect(challenge.id).toBeDefined();
      expect(challenge.title).toBeDefined();
      expect(challenge.description).toBeDefined();
      expect(challenge.difficulty).toBeDefined();
      expect(challenge.targetMoves).toBeGreaterThan(0);
    });
  });
}); 