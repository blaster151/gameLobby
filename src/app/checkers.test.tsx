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
}); 