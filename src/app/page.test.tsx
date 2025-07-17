import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import Home from './page';

describe('Home', () => {
  it('renders the lobby title and available games', () => {
    console.log('DEBUG: Test is running');
    render(<Home />);
    expect(screen.getByText('Game Lobby')).toBeInTheDocument();
    expect(screen.getByText('♔ Chess')).toBeInTheDocument();
    expect(screen.getByText('● Checkers')).toBeInTheDocument();
    expect(screen.getByText('⚀ Backgammon')).toBeInTheDocument();
    expect(screen.getByText('🃏 Gin Rummy')).toBeInTheDocument();
    expect(screen.getByText('🎴 Crazy 8s')).toBeInTheDocument();
  });
}); 