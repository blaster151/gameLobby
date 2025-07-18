import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import Home from './page';

describe('Home', () => {
  it('renders the lobby title and available games', () => {
    render(<Home />);
    expect(screen.getByText('Game Lobby')).toBeInTheDocument();
    expect(screen.getAllByText((content, element) => Boolean(element?.textContent?.includes('Chess'))).length).toBeGreaterThan(0);
    expect(screen.getAllByText((content, element) => Boolean(element?.textContent?.includes('Checkers'))).length).toBeGreaterThan(0);
    expect(screen.getAllByText((content, element) => Boolean(element?.textContent?.includes('Backgammon'))).length).toBeGreaterThan(0);
    expect(screen.getAllByText((content, element) => Boolean(element?.textContent?.includes('Gin Rummy'))).length).toBeGreaterThan(0);
    expect(screen.getAllByText((content, element) => Boolean(element?.textContent?.includes('Crazy 8s'))).length).toBeGreaterThan(0);
  });
}); 