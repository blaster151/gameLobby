import { create } from 'zustand';

export interface Challenge {
  id: string;
  gameType: 'chess' | 'checkers' | 'backgammon';
  title: string;
  description: string;
  date: string;
  initialBoard: any;
  targetMoves: number;
  difficulty: 'easy' | 'medium' | 'hard';
  solution: any[];
  completedBy: string[];
}

export interface ChallengeAttempt {
  id: string;
  challengeId: string;
  playerName: string;
  moves: any[];
  completed: boolean;
  timeSpent: number;
  date: string;
  score: number;
}

export interface ChallengeState {
  dailyChallenges: Challenge[];
  attempts: ChallengeAttempt[];
  currentChallenge: Challenge | null;
  setCurrentChallenge: (challenge: Challenge | null) => void;
  addAttempt: (attempt: ChallengeAttempt) => void;
  getLeaderboard: (challengeId: string) => ChallengeAttempt[];
  generateDailyChallenges: () => void;
  loadChallenges: () => void;
  saveChallenges: () => void;
  getTodayChallenges: () => Challenge[];
  calculateScore: (moves: any[], timeSpent: number, targetMoves: number) => number;
}

function loadChallengesFromStorage(): { challenges: Challenge[], attempts: ChallengeAttempt[] } {
  if (typeof window !== 'undefined') {
    const challengesRaw = localStorage.getItem('dailyChallenges');
    const attemptsRaw = localStorage.getItem('challengeAttempts');
    
    const challenges = challengesRaw ? JSON.parse(challengesRaw) : [];
    const attempts = attemptsRaw ? JSON.parse(attemptsRaw) : [];
    
    return { challenges, attempts };
  }
  return { challenges: [], attempts: [] };
}

function saveChallengesToStorage(challenges: Challenge[], attempts: ChallengeAttempt[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('dailyChallenges', JSON.stringify(challenges));
    localStorage.setItem('challengeAttempts', JSON.stringify(attempts));
  }
}

function generateChessChallenge(date: string): Challenge {
  const challenges = [
    {
      title: "Checkmate in 2",
      description: "Find the fastest checkmate sequence. White to move.",
      difficulty: 'easy' as const,
      targetMoves: 2,
    },
    {
      title: "Tactical Advantage",
      description: "Gain material advantage in 3 moves. Black to move.",
      difficulty: 'medium' as const,
      targetMoves: 3,
    },
    {
      title: "Endgame Mastery",
      description: "Convert your advantage to victory in 4 moves.",
      difficulty: 'hard' as const,
      targetMoves: 4,
    },
  ];
  
  const challenge = challenges[Math.floor(Math.random() * challenges.length)];
  
  return {
    id: `chess-${date}`,
    gameType: 'chess',
    title: challenge.title,
    description: challenge.description,
    date,
    initialBoard: {}, // Simplified for now
    targetMoves: challenge.targetMoves,
    difficulty: challenge.difficulty,
    solution: [],
    completedBy: [],
  };
}

function generateCheckersChallenge(date: string): Challenge {
  const challenges = [
    {
      title: "Triple Jump",
      description: "Execute a triple capture sequence. Red to move.",
      difficulty: 'easy' as const,
      targetMoves: 1,
    },
    {
      title: "King the Piece",
      description: "Promote a piece to king in 2 moves.",
      difficulty: 'medium' as const,
      targetMoves: 2,
    },
    {
      title: "Strategic Capture",
      description: "Capture 3 pieces in a single sequence.",
      difficulty: 'hard' as const,
      targetMoves: 1,
    },
  ];
  
  const challenge = challenges[Math.floor(Math.random() * challenges.length)];
  
  return {
    id: `checkers-${date}`,
    gameType: 'checkers',
    title: challenge.title,
    description: challenge.description,
    date,
    initialBoard: {},
    targetMoves: challenge.targetMoves,
    difficulty: challenge.difficulty,
    solution: [],
    completedBy: [],
  };
}

function generateBackgammonChallenge(date: string): Challenge {
  const challenges = [
    {
      title: "Perfect Roll",
      description: "Use both dice optimally to advance pieces.",
      difficulty: 'easy' as const,
      targetMoves: 2,
    },
    {
      title: "Hit and Run",
      description: "Hit an opponent piece and safely re-enter.",
      difficulty: 'medium' as const,
      targetMoves: 3,
    },
    {
      title: "Bearing Off",
      description: "Bear off 3 pieces in the most efficient way.",
      difficulty: 'hard' as const,
      targetMoves: 3,
    },
  ];
  
  const challenge = challenges[Math.floor(Math.random() * challenges.length)];
  
  return {
    id: `backgammon-${date}`,
    gameType: 'backgammon',
    title: challenge.title,
    description: challenge.description,
    date,
    initialBoard: {},
    targetMoves: challenge.targetMoves,
    difficulty: challenge.difficulty,
    solution: [],
    completedBy: [],
  };
}

export const useChallengeStore = create<ChallengeState>((set, get) => ({
  dailyChallenges: [],
  attempts: [],
  currentChallenge: null,
  
  setCurrentChallenge: (challenge) => {
    set({ currentChallenge: challenge });
  },
  
  addAttempt: (attempt) => {
    const { attempts, saveChallenges } = get();
    const newAttempts = [attempt, ...attempts];
    set({ attempts: newAttempts });
    saveChallenges();
  },
  
  getLeaderboard: (challengeId) => {
    const { attempts } = get();
    return attempts
      .filter(attempt => attempt.challengeId === challengeId)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10); // Top 10
  },
  
  generateDailyChallenges: () => {
    const today = new Date().toISOString().split('T')[0];
    const challenges = [
      generateChessChallenge(today),
      generateCheckersChallenge(today),
      generateBackgammonChallenge(today),
    ];
    
    set({ dailyChallenges: challenges });
    get().saveChallenges();
  },
  
  loadChallenges: () => {
    const { challenges, attempts } = loadChallengesFromStorage();
    set({ dailyChallenges: challenges, attempts });
  },
  
  saveChallenges: () => {
    const { dailyChallenges, attempts } = get();
    saveChallengesToStorage(dailyChallenges, attempts);
  },
  
  getTodayChallenges: () => {
    const { dailyChallenges } = get();
    const today = new Date().toISOString().split('T')[0];
    return dailyChallenges.filter(challenge => challenge.date === today);
  },
  
  calculateScore: (moves, timeSpent, targetMoves) => {
    // Base score: 1000 points
    let score = 1000;
    
    // Bonus for completing in fewer moves
    const moveBonus = Math.max(0, (targetMoves - moves.length) * 100);
    score += moveBonus;
    
    // Time penalty (faster is better)
    const timePenalty = Math.min(500, timeSpent / 10);
    score -= timePenalty;
    
    // Difficulty multiplier
    score = Math.round(score);
    
    return Math.max(100, score); // Minimum 100 points
  },
})); 