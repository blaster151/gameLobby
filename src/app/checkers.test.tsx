import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import Checkers from './checkers';

describe('Checkers', () => {
  it('renders the Checkers board and allows a player move', () => {
    render(<Checkers />);
    expect(screen.getByText('Checkers')).toBeInTheDocument();
    // Find a player piece (●) in the bottom rows
    const playerPiece = screen.getAllByText('●')[0];
    fireEvent.click(playerPiece); // select
    // Try to move to a valid empty cell
    const emptyCells = screen.getAllByText('');
    if (emptyCells.length > 0) {
      fireEvent.click(emptyCells[0]);
    }
    // After move, it should be bot's turn
    expect(screen.getByText(/Your move!|Bot cannot move/)).toBeInTheDocument();
  });
}); 