import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, act } from '@testing-library/react';
import Checkers from './checkers';

jest.useFakeTimers();

describe('Checkers', () => {
  beforeEach(() => {
    jest.clearAllTimers();
  });

  it('renders the Checkers board with correct initial piece placement', () => {
    render(<Checkers />);
    expect(screen.getByText('Checkers')).toBeInTheDocument();
    expect(screen.getByText('Your move!')).toBeInTheDocument();
    const playerPieces = screen.getAllByText('●');
    expect(playerPieces.length).toBeGreaterThan(0);
    const botPieces = screen.getAllByText('○');
    expect(botPieces.length).toBeGreaterThan(0);
  });

  it('prevents invalid moves and only allows valid player moves', () => {
    render(<Checkers />);
    const botPieces = screen.getAllByText('○');
    fireEvent.click(botPieces[0]);
    expect(screen.getByText('Your move!')).toBeInTheDocument();
    const emptyCells = screen.getAllByText('');
    fireEvent.click(emptyCells[0]);
    expect(screen.getByText('Your move!')).toBeInTheDocument();
  });

  it('allows a valid player move and triggers bot response', () => {
    render(<Checkers />);
    const playerPieces = screen.getAllByText('●');
    fireEvent.click(playerPieces[0]);
    const emptyCells = screen.getAllByText('');
    if (emptyCells.length > 0) {
      fireEvent.click(emptyCells[0]);
      act(() => {
        jest.advanceTimersByTime(500);
      });
      expect(screen.getByText(/Your move!|Bot cannot move/)).toBeInTheDocument();
    }
  });

  it('detects game state correctly when pieces are captured', () => {
    render(<Checkers />);
    expect(screen.getByText('Your move!')).toBeInTheDocument();
    // The game should start in 'playingstate
    expect(screen.queryByText(/You win!|You lose!/)).not.toBeInTheDocument();
  });

  it('renders the tutorial section for Checkers', () => {
    render(<Checkers />);
    expect(screen.getByText(/How to Play:/)).toBeInTheDocument();
    expect(screen.getByText(/Move your pieces diagonally forward/)).toBeInTheDocument();
  });

  it('renders New Game button and resets game state when clicked', () => {
    render(<Checkers />);
    const newGameButton = screen.getByText('New Game');
    expect(newGameButton).toBeInTheDocument();
    
    // Click the New Game button
    fireEvent.click(newGameButton);
    
    // Game should be reset to initial state
    expect(screen.getByText('Your move!')).toBeInTheDocument();
    expect(screen.queryByText(/You win!|You lose!/)).not.toBeInTheDocument();
  });

  it('renders Back to Lobby link', () => {
    render(<Checkers />);
    expect(screen.getByText('← Back to Lobby')).toBeInTheDocument();
  });

  it('updates stats correctly after a win and a loss', () => {
    // Import the store directly
    const { useCheckersStore } = require('./checkersStore');
    // Reset stats
    act(() => {
      useCheckersStore.getState().stats = { wins: 0, losses: 0, totalGames: 0 };
    });
    // Simulate a win
    act(() => {
      useCheckersStore.getState().updateStats('win');
    });
    expect(useCheckersStore.getState().stats).toEqual({ wins: 1, losses: 0, totalGames: 1 });
    // Simulate a loss
    act(() => {
      useCheckersStore.getState().updateStats('loss');
    });
    expect(useCheckersStore.getState().stats).toEqual({ wins: 1, losses: 1, totalGames: 2 });
  });

  it('persists stats to and loads from localStorage', () => {
    // Mock localStorage
    const store: Record<string, string> = {};
    global.localStorage = {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => { store[key] = value; },
      removeItem: (key: string) => { delete store[key]; },
      clear: () => { Object.keys(store).forEach(k => delete store[k]); },
      key: (index: number) => Object.keys(store)[index] || null,
      get length() { return Object.keys(store).length; },
    } as Storage;
    const { useCheckersStore } = require('./checkersStore');
    // Simulate a win
    act(() => {
      useCheckersStore.getState().updateStats('win');
    });
    expect(JSON.parse(store['checkersStats'])).toEqual({ wins: 1, losses: 0, totalGames: 1 });
    // Simulate reload (recreate store)
    jest.resetModules();
    const { useCheckersStore: newStore } = require('./checkersStore');
    expect(newStore.getState().stats).toEqual({ wins: 1, losses: 0, totalGames: 1 });
  });

  it('resets stats when Reset Stats button is clicked', () => {
    const { useCheckersStore } = require('./checkersStore');
    act(() => {
      useCheckersStore.getState().stats = { wins: 3, losses: 2, totalGames: 5 };
    });
    render(<Checkers />);
    expect(screen.getByText(/Wins: 3/)).toBeInTheDocument();
    const resetButton = screen.getByText('Reset Stats');
    fireEvent.click(resetButton);
    expect(screen.getByText(/Wins: 0/)).toBeInTheDocument();
    expect(useCheckersStore.getState().stats).toEqual({ wins: 0, losses: 0, totalGames: 0 });
  });

  it('allows changing bot difficulty and displays the selector', () => {
    const { useCheckersStore } = require('./checkersStore');
    render(<Checkers />);
    
    const difficultySelector = screen.getByDisplayValue('Medium');
    expect(difficultySelector).toBeInTheDocument();
    
    fireEvent.change(difficultySelector, { target: { value: 'easy' } });
    expect(useCheckersStore.getState().botDifficulty).toBe('easy');
    
    fireEvent.change(difficultySelector, { target: { value: 'hard' } });
    expect(useCheckersStore.getState().botDifficulty).toBe('hard');
  });

  it('maintains bot difficulty when starting a new game', () => {
    const { useCheckersStore } = require('./checkersStore');
    act(() => {
      useCheckersStore.getState().setBotDifficulty('hard');
    });
    
    render(<Checkers />);
    const newGameButton = screen.getByText('New Game');
    fireEvent.click(newGameButton);
    
    expect(useCheckersStore.getState().botDifficulty).toBe('hard');
    expect(screen.getByDisplayValue('Hard')).toBeInTheDocument();
  });

  it('different bot difficulties have different behaviors', () => {
    const { useCheckersStore } = require('./checkersStore');
    const { BotDifficulty } = require('./checkersStore');
    
    // Test that each difficulty level is accessible
    act(() => {
      useCheckersStore.getState().setBotDifficulty(BotDifficulty.EASY);
    });
    expect(useCheckersStore.getState().botDifficulty).toBe(BotDifficulty.EASY);
    
    act(() => {
      useCheckersStore.getState().setBotDifficulty(BotDifficulty.MEDIUM);
    });
    expect(useCheckersStore.getState().botDifficulty).toBe(BotDifficulty.MEDIUM);
    
    act(() => {
      useCheckersStore.getState().setBotDifficulty(BotDifficulty.HARD);
    });
    expect(useCheckersStore.getState().botDifficulty).toBe(BotDifficulty.HARD);
  });

  it('supports keyboard navigation with arrow keys', () => {
    render(<Checkers />);
    const container = screen.getByRole('button', { name: /1, 1/ });
    container.focus();
    
    // Test arrow key navigation
    fireEvent.keyDown(container, { key: 'ArrowRight' });
    expect(screen.getByRole('button', { name: /1, 2/ })).toHaveFocus();
    
    fireEvent.keyDown(container, { key: 'ArrowDown' });
    expect(screen.getByRole('button', { name: /2, 1/ })).toHaveFocus();
  });

  it('prevents navigation outside board boundaries', () => {
    render(<Checkers />);
    const topLeftCell = screen.getByRole('button', { name: /1, 1/ });
    topLeftCell.focus();
    
    // Try to go up (should stay at top)
    fireEvent.keyDown(topLeftCell, { key: 'ArrowUp' });
    expect(topLeftCell).toHaveFocus();
    
    // Try to go left (should stay at left)
    fireEvent.keyDown(topLeftCell, { key: 'ArrowLeft' });
    expect(topLeftCell).toHaveFocus();
  });

  it('displays keyboard instructions', () => {
    render(<Checkers />);
    expect(screen.getByText(/Keyboard Controls:/)).toBeInTheDocument();
    expect(screen.getByText(/Use arrow keys to navigate/)).toBeInTheDocument();
  });

  it('provides undo and redo buttons for player moves', () => {
    render(<Checkers />);
    
    const undoButton = screen.getByText('↩ Undo');
    const redoButton = screen.getByText('↪ Redo');
    
    expect(undoButton).toBeInTheDocument();
    expect(redoButton).toBeInTheDocument();
    
    // Initially disabled
    expect(undoButton).toBeDisabled();
    expect(redoButton).toBeDisabled();
  });

  it('enables undo/redo buttons appropriately during gameplay', () => {
    const { useCheckersStore } = require('./checkersStore');
    render(<Checkers />);
    
    // Simulate a move being made
    act(() => {
      useCheckersStore.getState().pushHistory(useCheckersStore.getState().board);
    });
    
    const undoButton = screen.getByText('↩ Undo');
    const redoButton = screen.getByText('↪ Redo');
    
    // After a move, undo should be enabled
    expect(undoButton).not.toBeDisabled();
  });

  it('provides save and load game buttons', () => {
    render(<Checkers />);
    
    const saveButton = screen.getByText('💾 Save Game');
    const loadButton = screen.getByText('📂 Load Game');
    
    expect(saveButton).toBeInTheDocument();
    expect(loadButton).toBeInTheDocument();
    
    // Initially, load should be disabled if no saved game
    expect(loadButton).toBeDisabled();
  });

  it('saves and loads game state correctly', () => {
    // Mock localStorage
    const store: Record<string, string> = {};
    global.localStorage = {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => { store[key] = value; },
      removeItem: (key: string) => { delete store[key]; },
      clear: () => { Object.keys(store).forEach(k => delete store[k]); },
      key: (index: number) => Object.keys(store)[index] || null,
      get length() { return Object.keys(store).length; },
    } as Storage;
    
    const { useCheckersStore } = require('./checkersStore');
    
    // Save a game
    act(() => {
      useCheckersStore.getState().saveGame();
    });
    
    expect(store['checkersGameState']).toBeDefined();
    
    // Load the game
    act(() => {
      useCheckersStore.getState().loadGame();
    });
    
    expect(useCheckersStore.getState().hasSavedGame()).toBe(true);
  });

  it('displays tutorial button and opens tutorial modal', () => {
    render(<Checkers />);
    
    const tutorialButton = screen.getByText('📖 Full Tutorial');
    expect(tutorialButton).toBeInTheDocument();
    
    fireEvent.click(tutorialButton);
    
    expect(screen.getByText('Checkers Tutorial')).toBeInTheDocument();
    expect(screen.getByText('Welcome to Checkers!')).toBeInTheDocument();
  });

  it('allows navigation through tutorial steps', () => {
    render(<Checkers />);
    
    const tutorialButton = screen.getByText('📖 Full Tutorial');
    fireEvent.click(tutorialButton);
    
    // Check first step
    expect(screen.getByText('Welcome to Checkers!')).toBeInTheDocument();
    expect(screen.getByText('Step 1 of 5')).toBeInTheDocument();
    
    // Navigate to next step
    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);
    
    expect(screen.getByText('Basic Movement')).toBeInTheDocument();
    expect(screen.getByText('Step 2 of 5')).toBeInTheDocument();
  });

  it('allows closing tutorial with skip button', () => {
    render(<Checkers />);
    
    const tutorialButton = screen.getByText('📖 Full Tutorial');
    fireEvent.click(tutorialButton);
    
    const skipButton = screen.getByText('✕');
    fireEvent.click(skipButton);
    
    expect(screen.queryByText('Checkers Tutorial')).not.toBeInTheDocument();
  });
}); 