import React from 'react';
import Link from 'next/link';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'game' | 'social' | 'skill' | 'collection';
  progress: number;
  maxProgress: number;
  completed: boolean;
  completedDate?: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export default function Achievements() {
  const achievements: Achievement[] = [
    // Game-specific achievements
    {
      id: 'first_chess_win',
      title: 'First Checkmate',
      description: 'Win your first game of Chess',
      icon: '♔',
      category: 'game',
      progress: 1,
      maxProgress: 1,
      completed: true,
      completedDate: '2024-01-15',
      rarity: 'common'
    },
    {
      id: 'chess_master',
      title: 'Chess Master',
      description: 'Win 50 games of Chess',
      icon: '♔',
      category: 'game',
      progress: 12,
      maxProgress: 50,
      completed: false,
      rarity: 'rare'
    },
    {
      id: 'checkers_king',
      title: 'Checkers King',
      description: 'Win 25 games of Checkers',
      icon: '●',
      category: 'game',
      progress: 15,
      maxProgress: 25,
      completed: false,
      rarity: 'rare'
    },
    {
      id: 'backgammon_expert',
      title: 'Backgammon Expert',
      description: 'Win 20 games of Backgammon',
      icon: '⚀',
      category: 'game',
      progress: 8,
      maxProgress: 20,
      completed: false,
      rarity: 'epic'
    },
    {
      id: 'card_shark',
      title: 'Card Shark',
      description: 'Win 30 card games (Gin Rummy + Crazy 8s)',
      icon: '🃏',
      category: 'game',
      progress: 28,
      maxProgress: 30,
      completed: false,
      rarity: 'rare'
    },
    {
      id: 'crazy8s_champion',
      title: 'Crazy 8s Champion',
      description: 'Win 40 games of Crazy 8s',
      icon: '🎴',
      category: 'game',
      progress: 18,
      maxProgress: 40,
      completed: false,
      rarity: 'epic'
    },
    // Skill achievements
    {
      id: 'winning_streak',
      title: 'Winning Streak',
      description: 'Win 5 games in a row',
      icon: '🔥',
      category: 'skill',
      progress: 3,
      maxProgress: 5,
      completed: false,
      rarity: 'rare'
    },
    {
      id: 'comeback_king',
      title: 'Comeback King',
      description: 'Win a game after being down by 5+ points',
      icon: '⚡',
      category: 'skill',
      progress: 1,
      maxProgress: 1,
      completed: true,
      completedDate: '2024-01-20',
      rarity: 'epic'
    },
    {
      id: 'speed_demon',
      title: 'Speed Demon',
      description: 'Win a game in under 2 minutes',
      icon: '⚡',
      category: 'skill',
      progress: 0,
      maxProgress: 1,
      completed: false,
      rarity: 'legendary'
    },
    // Collection achievements
    {
      id: 'game_collector',
      title: 'Game Collector',
      description: 'Play all 5 available games',
      icon: '🎮',
      category: 'collection',
      progress: 5,
      maxProgress: 5,
      completed: true,
      completedDate: '2024-01-10',
      rarity: 'common'
    },
    {
      id: 'tutorial_master',
      title: 'Tutorial Master',
      description: 'Complete all game tutorials',
      icon: '📚',
      category: 'collection',
      progress: 4,
      maxProgress: 5,
      completed: false,
      rarity: 'common'
    },
    // Social achievements
    {
      id: 'first_replay',
      title: 'First Replay',
      description: 'Watch your first game replay',
      icon: '📺',
      category: 'social',
      progress: 1,
      maxProgress: 1,
      completed: true,
      completedDate: '2024-01-18',
      rarity: 'common'
    },
    {
      id: 'challenge_accepter',
      title: 'Challenge Accepter',
      description: 'Complete 10 daily challenges',
      icon: '🎯',
      category: 'social',
      progress: 7,
      maxProgress: 10,
      completed: false,
      rarity: 'rare'
    }
  ];

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return '#6b7280';
      case 'rare': return '#3b82f6';
      case 'epic': return '#8b5cf6';
      case 'legendary': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'game': return '🎮';
      case 'skill': return '⚡';
      case 'collection': return '📦';
      case 'social': return '👥';
      default: return '🏆';
    }
  };

  const completedAchievements = achievements.filter(a => a.completed);
  const totalAchievements = achievements.length;
  const completionRate = Math.round((completedAchievements.length / totalAchievements) * 100);

  const categories = ['game', 'skill', 'collection', 'social'];

  return (
    <div style={{ padding: 24, color: 'white', minHeight: '100vh', background: 'linear-gradient(135deg, #1e3a8a, #6d28d9, #312e81)' }}>
      <Link href="/" style={{ color: '#60a5fa', textDecoration: 'underline' }}>← Back to Lobby</Link>
      <h1 style={{ fontSize: '2.5rem', margin: '1rem 0', textAlign: 'center' }}>🏆 Achievements</h1>
      
      {/* Progress Overview */}
      <div style={{ 
        background: 'rgba(255,255,255,0.1)', 
        padding: 24, 
        borderRadius: 12, 
        marginBottom: 24,
        backdropFilter: 'blur(10px)'
      }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: 16 }}>Progress Overview</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          <div style={{ textAlign: 'center', padding: 16, background: 'rgba(255,255,255,0.1)', borderRadius: 8 }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>{completedAchievements.length}</div>
            <div>Achievements Unlocked</div>
          </div>
          <div style={{ textAlign: 'center', padding: 16, background: 'rgba(255,255,255,0.1)', borderRadius: 8 }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>{totalAchievements}</div>
            <div>Total Achievements</div>
          </div>
          <div style={{ textAlign: 'center', padding: 16, background: 'rgba(255,255,255,0.1)', borderRadius: 8 }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6' }}>{completionRate}%</div>
            <div>Completion Rate</div>
          </div>
        </div>
      </div>

      {/* Achievement Categories */}
      {categories.map(category => {
        const categoryAchievements = achievements.filter(a => a.category === category);
        const categoryCompleted = categoryAchievements.filter(a => a.completed).length;
        const categoryTotal = categoryAchievements.length;
        
        return (
          <div key={category} style={{ 
            background: 'rgba(255,255,255,0.1)', 
            padding: 24, 
            borderRadius: 12, 
            marginBottom: 24,
            backdropFilter: 'blur(10px)'
          }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: 16 }}>
              {getCategoryIcon(category)} {category.charAt(0).toUpperCase() + category.slice(1)} Achievements
              <span style={{ fontSize: '1rem', marginLeft: 12, opacity: 0.8 }}>
                ({categoryCompleted}/{categoryTotal})
              </span>
            </h2>
            
            <div style={{ display: 'grid', gap: 16 }}>
              {categoryAchievements.map(achievement => (
                <div key={achievement.id} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  padding: 16, 
                  background: achievement.completed ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)', 
                  borderRadius: 8,
                  border: `2px solid ${getRarityColor(achievement.rarity)}`,
                  opacity: achievement.completed ? 1 : 0.7
                }}>
                  <div style={{ 
                    fontSize: '2rem', 
                    marginRight: 16,
                    filter: achievement.completed ? 'none' : 'grayscale(100%)'
                  }}>
                    {achievement.icon}
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <h3 style={{ 
                      margin: '0 0 4px 0', 
                      color: getRarityColor(achievement.rarity),
                      textDecoration: achievement.completed ? 'line-through' : 'none'
                    }}>
                      {achievement.title}
                      <span style={{ 
                        fontSize: '0.8rem', 
                        marginLeft: 8, 
                        padding: '2px 6px', 
                        background: getRarityColor(achievement.rarity),
                        borderRadius: 4,
                        textTransform: 'uppercase'
                      }}>
                        {achievement.rarity}
                      </span>
                    </h3>
                    <p style={{ margin: '0 0 8px 0', fontSize: '0.9rem', opacity: 0.8 }}>
                      {achievement.description}
                    </p>
                    
                    {achievement.completed ? (
                      <div style={{ fontSize: '0.8rem', color: '#10b981' }}>
                        ✅ Completed on {achievement.completedDate}
                      </div>
                    ) : (
                      <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>
                        Progress: {achievement.progress}/{achievement.maxProgress}
                        <div style={{ 
                          width: '100%', 
                          height: 4, 
                          background: 'rgba(255,255,255,0.2)', 
                          borderRadius: 2, 
                          marginTop: 4,
                          overflow: 'hidden'
                        }}>
                          <div style={{ 
                            width: `${(achievement.progress / achievement.maxProgress) * 100}%`, 
                            height: '100%', 
                            background: getRarityColor(achievement.rarity),
                            transition: 'width 0.3s ease'
                          }} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
} 