import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Chat from './page';

// Mock Next.js Link component
jest.mock('next/link', () => {
  return function MockLink({ children, href, ...props }: any) {
    return <a href={href} {...props}>{children}</a>;
  };
});

// Mock scrollIntoView function
const mockScrollIntoView = jest.fn();
Element.prototype.scrollIntoView = mockScrollIntoView;

describe('Chat Page', () => {
  beforeEach(() => {
    mockScrollIntoView.mockClear();
  });

  it('renders chat page with correct title', () => {
    render(<Chat />);
    expect(screen.getByText('💬 Game Chat')).toBeInTheDocument();
  });

  it('displays channel list', () => {
    render(<Chat />);
    // Use getAllByText for repeated elements
    expect(screen.getAllByText('🌍 Global Chat').length).toBeGreaterThan(0);
    expect(screen.getAllByText('♔ Chess Lobby').length).toBeGreaterThan(0);
    expect(screen.getAllByText('● Checkers Lobby').length).toBeGreaterThan(0);
    expect(screen.getAllByText('⚀ Backgammon Lobby').length).toBeGreaterThan(0);
    expect(screen.getAllByText('🃏 Card Games').length).toBeGreaterThan(0);
  });

  it('shows connection status', () => {
    render(<Chat />);
    // Only match the text part, not the emoji
    expect(screen.getByText('Connected')).toBeInTheDocument();
  });

  it('displays unread message counts', () => {
    render(<Chat />);
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('shows current channel information', () => {
    render(<Chat />);
    // Use getAllByText for repeated elements
    expect(screen.getAllByText('🌍 Global Chat').length).toBeGreaterThan(0);
    expect(screen.getAllByText('4 messages').length).toBeGreaterThan(0);
  });

  it('displays chat messages correctly', () => {
    render(<Chat />);
    expect(screen.getAllByText('Anyone up for a chess game?').length).toBeGreaterThan(0);
    expect(screen.getAllByText("I'm looking for a checkers opponent!").length).toBeGreaterThan(0);
    expect(screen.getAllByText('🎉 Just won my 10th game in a row!').length).toBeGreaterThan(0);
  });

  it('shows message timestamps', () => {
    render(<Chat />);
    expect(screen.getByText('02:30 PM')).toBeInTheDocument();
    expect(screen.getByText('02:31 PM')).toBeInTheDocument();
    expect(screen.getByText('02:35 PM')).toBeInTheDocument();
  });

  it('displays user avatars', () => {
    render(<Chat />);
    expect(screen.getByText('♔')).toBeInTheDocument();
    expect(screen.getByText('●')).toBeInTheDocument();
    expect(screen.getByText('⚡')).toBeInTheDocument();
  });

  it('has message input field', () => {
    render(<Chat />);
    const input = screen.getByPlaceholderText('Type your message... (Shift+Enter for new line)');
    expect(input).toBeInTheDocument();
  });

  it('has send button', () => {
    render(<Chat />);
    expect(screen.getByText('Send')).toBeInTheDocument();
  });

  it('has emote button', () => {
    render(<Chat />);
    expect(screen.getByText('😀')).toBeInTheDocument();
  });

  it('allows typing in message input', () => {
    render(<Chat />);
    const input = screen.getByPlaceholderText('Type your message... (Shift+Enter for new line)');
    fireEvent.change(input, { target: { value: 'Hello, world!' } });
    expect(input).toHaveValue('Hello, world!');
  });

  it('has back to lobby link', () => {
    render(<Chat />);
    const backLink = screen.getByText('← Back to Lobby');
    expect(backLink).toBeInTheDocument();
    expect(backLink.closest('a')).toHaveAttribute('href', '/');
  });
}); 