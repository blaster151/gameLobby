import React, { useState } from 'react';
import Link from 'next/link';

interface GameSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  soundVolume: number;
  musicVolume: number;
  animationsEnabled: boolean;
  autoSave: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
  theme: 'dark' | 'light' | 'auto';
  language: 'en' | 'es' | 'fr';
  notifications: boolean;
  tutorialEnabled: boolean;
}

export default function Settings() {
  const [settings, setSettings] = useState<GameSettings>({
    soundEnabled: true,
    musicEnabled: true,
    soundVolume: 70,
    musicVolume: 50,
    animationsEnabled: true,
    autoSave: true,
    difficulty: 'medium',
    theme: 'dark',
    language: 'en',
    notifications: true,
    tutorialEnabled: true
  });

  const handleSettingChange = (key: keyof GameSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const resetToDefaults = () => {
    setSettings({
      soundEnabled: true,
      musicEnabled: true,
      soundVolume: 70,
      musicVolume: 50,
      animationsEnabled: true,
      autoSave: true,
      difficulty: 'medium',
      theme: 'dark',
      language: 'en',
      notifications: true,
      tutorialEnabled: true
    });
  };

  const saveSettings = () => {
    localStorage.setItem('gameSettings', JSON.stringify(settings));
    // In a real app, this would also sync with a backend
    alert('Settings saved successfully!');
  };

  return (
    <div style={{ padding: 24, color: 'white', minHeight: '100vh', background: 'linear-gradient(135deg, #1e3a8a, #6d28d9, #312e81)' }}>
      <Link href="/" style={{ color: '#60a5fa', textDecoration: 'underline' }}>← Back to Lobby</Link>
      <h1 style={{ fontSize: '2.5rem', margin: '1rem 0', textAlign: 'center' }}>⚙️ Game Settings</h1>
      
      {/* Audio Settings */}
      <div style={{ 
        background: 'rgba(255,255,255,0.1)', 
        padding: 24, 
        borderRadius: 12, 
        marginBottom: 24,
        backdropFilter: 'blur(10px)'
      }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: 16, color: '#60a5fa' }}>🔊 Audio</h2>
        
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
            <input
              type="checkbox"
              checked={settings.soundEnabled}
              onChange={(e) => handleSettingChange('soundEnabled', e.target.checked)}
              style={{ marginRight: 8 }}
            />
            Enable Sound Effects
          </label>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
            <input
              type="checkbox"
              checked={settings.musicEnabled}
              onChange={(e) => handleSettingChange('musicEnabled', e.target.checked)}
              style={{ marginRight: 8 }}
            />
            Enable Background Music
          </label>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 8 }}>
            Sound Volume: {settings.soundVolume}%
            <input
              type="range"
              min="0"
              max="100"
              value={settings.soundVolume}
              onChange={(e) => handleSettingChange('soundVolume', parseInt(e.target.value))}
              style={{ width: '100%', marginTop: 4 }}
              disabled={!settings.soundEnabled}
            />
          </label>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 8 }}>
            Music Volume: {settings.musicVolume}%
            <input
              type="range"
              min="0"
              max="100"
              value={settings.musicVolume}
              onChange={(e) => handleSettingChange('musicVolume', parseInt(e.target.value))}
              style={{ width: '100%', marginTop: 4 }}
              disabled={!settings.musicEnabled}
            />
          </label>
        </div>
      </div>

      {/* Visual Settings */}
      <div style={{ 
        background: 'rgba(255,255,255,0.1)', 
        padding: 24, 
        borderRadius: 12, 
        marginBottom: 24,
        backdropFilter: 'blur(10px)'
      }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: 16, color: '#10b981' }}>🎨 Visual</h2>
        
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
            <input
              type="checkbox"
              checked={settings.animationsEnabled}
              onChange={(e) => handleSettingChange('animationsEnabled', e.target.checked)}
              style={{ marginRight: 8 }}
            />
            Enable Animations
          </label>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 8 }}>
            Theme:
            <select
              value={settings.theme}
              onChange={(e) => handleSettingChange('theme', e.target.value)}
              style={{ 
                marginLeft: 12, 
                padding: '8px 12px', 
                borderRadius: 4, 
                background: '#333',
                color: 'white',
                border: '1px solid #555'
              }}
            >
              <option value="dark">Dark</option>
              <option value="light">Light</option>
              <option value="auto">Auto (System)</option>
            </select>
          </label>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 8 }}>
            Language:
            <select
              value={settings.language}
              onChange={(e) => handleSettingChange('language', e.target.value)}
              style={{ 
                marginLeft: 12, 
                padding: '8px 12px', 
                borderRadius: 4, 
                background: '#333',
                color: 'white',
                border: '1px solid #555'
              }}
            >
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
            </select>
          </label>
        </div>
      </div>

      {/* Gameplay Settings */}
      <div style={{ 
        background: 'rgba(255,255,255,0.1)', 
        padding: 24, 
        borderRadius: 12, 
        marginBottom: 24,
        backdropFilter: 'blur(10px)'
      }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: 16, color: '#f59e0b' }}>🎮 Gameplay</h2>
        
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 8 }}>
            Default Bot Difficulty:
            <select
              value={settings.difficulty}
              onChange={(e) => handleSettingChange('difficulty', e.target.value)}
              style={{ 
                marginLeft: 12, 
                padding: '8px 12px', 
                borderRadius: 4, 
                background: '#333',
                color: 'white',
                border: '1px solid #555'
              }}
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </label>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
            <input
              type="checkbox"
              checked={settings.autoSave}
              onChange={(e) => handleSettingChange('autoSave', e.target.checked)}
              style={{ marginRight: 8 }}
            />
            Auto-save Games
          </label>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
            <input
              type="checkbox"
              checked={settings.tutorialEnabled}
              onChange={(e) => handleSettingChange('tutorialEnabled', e.target.checked)}
              style={{ marginRight: 8 }}
            />
            Show Tutorials for New Games
          </label>
        </div>
      </div>

      {/* Notification Settings */}
      <div style={{ 
        background: 'rgba(255,255,255,0.1)', 
        padding: 24, 
        borderRadius: 12, 
        marginBottom: 24,
        backdropFilter: 'blur(10px)'
      }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: 16, color: '#8b5cf6' }}>🔔 Notifications</h2>
        
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
            <input
              type="checkbox"
              checked={settings.notifications}
              onChange={(e) => handleSettingChange('notifications', e.target.checked)}
              style={{ marginRight: 8 }}
            />
            Enable Notifications
          </label>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ 
        display: 'flex', 
        gap: 16, 
        justifyContent: 'center',
        flexWrap: 'wrap'
      }}>
        <button
          onClick={saveSettings}
          style={{
            background: '#10b981',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: 8,
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: 'bold'
          }}
        >
          💾 Save Settings
        </button>
        
        <button
          onClick={resetToDefaults}
          style={{
            background: '#ef4444',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: 8,
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: 'bold'
          }}
        >
          🔄 Reset to Defaults
        </button>
      </div>
    </div>
  );
} 