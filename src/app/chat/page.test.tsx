import { render, screen, fireEvent } from '@testing-library/react';
import Chat from './page';

// Mock Next.js Link component
jest.mock('next/link', () => {
  return function MockLink({ children, href, ...props }: any) {
    return <a href={href} {...props}>{children}</a>;
  };
});

describe('Chat Page', () => {
  it('renders chat page with correct title', () => {
    render(<Chat />);
    expect(screen.getByText('💬 Game Chat')).toBeInTheDocument();
  });

  it('displays channel list', () => {
    render(<Chat />);
    expect(screen.getByText('Channels')).toBeInTheDocument();
    expect(screen.getByText('🌍 Global Chat')).toBeInTheDocument();
    expect(screen.getByText('♔ Chess Lobby')).toBeInTheDocument();
    expect(screen.getByText('● Checkers Lobby')).toBeInTheDocument();
    expect(screen.getByText('⚀ Backgammon Lobby')).toBeInTheDocument();
    expect(screen.getByText('🃏 Card Games')).toBeInTheDocument();
  });

  it('shows connection status', () => {
    render(<Chat />);
    expect(screen.getByText('Connected')).toBeInTheDocument();
  });

  it('displays unread message counts', () => {
    render(<Chat />);
    expect(screen.getByText('3')).toBeInTheDocument(); // Chess Lobby unread
    expect(screen.getByText('1')).toBeInTheDocument(); // Checkers Lobby unread
    expect(screen.getByText('2')).toBeInTheDocument(); // Card Games unread
  });

  it('shows current channel information', () => {
    render(<Chat />);
    expect(screen.getByText('🌍 Global Chat')).toBeInTheDocument();
    expect(screen.getByText('7 messages')).toBeInTheDocument();
  });

  it('displays chat messages correctly', () => {
    render(<Chat />);
    expect(screen.getByText('ChessMaster2024')).toBeInTheDocument();
    expect(screen.getByText('Anyone up for a chess game?')).toBeInTheDocument();
    expect(screen.getByText('CheckersChamp')).toBeInTheDocument();
    expect(screen.getByText('I\'m looking for a checkers opponent!')).toBeInTheDocument();
  });

  it('shows message timestamps', () => {
    render(<Chat />);
    // Check for time format (HH:MM)
    const timeElements = screen.getAllByText(/\d{1,2}:\d{2}/);
    expect(timeElements.length).toBeGreaterThan(0);
  });

  it('displays user avatars', () => {
    render(<Chat />);
    expect(screen.getByText('♔')).toBeInTheDocument(); // ChessMaster2024 avatar
    expect(screen.getByText('●')).toBeInTheDocument(); // CheckersChamp avatar
    expect(screen.getByText('⚀')).toBeInTheDocument(); // BackgammonPro avatar
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