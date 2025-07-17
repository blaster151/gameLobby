import { render, screen, fireEvent } from '@testing-library/react';
import Settings from './page';

// Mock Next.js Link component
jest.mock('next/link', () => {
  return function MockLink({ children, href, ...props }: any) {
    return <a href={href} {...props}>{children}</a>;
  };
});

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn()
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock alert
global.alert = jest.fn();

describe('Settings Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders settings page with correct title', () => {
    render(<Settings />);
    expect(screen.getByText('⚙️ Game Settings')).toBeInTheDocument();
  });

  it('displays all setting categories', () => {
    render(<Settings />);
    expect(screen.getByText('🔊 Audio')).toBeInTheDocument();
    expect(screen.getByText('🎨 Visual')).toBeInTheDocument();
    expect(screen.getByText('🎮 Gameplay')).toBeInTheDocument();
    expect(screen.getByText('🔔 Notifications')).toBeInTheDocument();
  });

  it('shows audio settings with correct defaults', () => {
    render(<Settings />);
    expect(screen.getByText('Enable Sound Effects')).toBeInTheDocument();
    expect(screen.getByText('Enable Background Music')).toBeInTheDocument();
    expect(screen.getByText('Sound Volume: 70%')).toBeInTheDocument();
    expect(screen.getByText('Music Volume: 50%')).toBeInTheDocument();
  });

  it('shows visual settings with correct defaults', () => {
    render(<Settings />);
    expect(screen.getByText('Enable Animations')).toBeInTheDocument();
    expect(screen.getByText('Theme:')).toBeInTheDocument();
    expect(screen.getByText('Language:')).toBeInTheDocument();
  });

  it('shows gameplay settings with correct defaults', () => {
    render(<Settings />);
    expect(screen.getByText('Default Bot Difficulty:')).toBeInTheDocument();
    expect(screen.getByText('Auto-save Games')).toBeInTheDocument();
    expect(screen.getByText('Show Tutorials for New Games')).toBeInTheDocument();
  });

  it('shows notification settings', () => {
    render(<Settings />);
    expect(screen.getByText('Enable Notifications')).toBeInTheDocument();
  });

  it('has save and reset buttons', () => {
    render(<Settings />);
    expect(screen.getByText('💾 Save Settings')).toBeInTheDocument();
    expect(screen.getByText('🔄 Reset to Defaults')).toBeInTheDocument();
  });

  it('saves settings when save button is clicked', () => {
    render(<Settings />);
    const saveButton = screen.getByText('💾 Save Settings');
    fireEvent.click(saveButton);
    
    expect(localStorageMock.setItem).toHaveBeenCalledWith('gameSettings', expect.any(String));
    expect(global.alert).toHaveBeenCalledWith('Settings saved successfully!');
  });

  it('resets settings when reset button is clicked', () => {
    render(<Settings />);
    const resetButton = screen.getByText('🔄 Reset to Defaults');
    fireEvent.click(resetButton);
    
    // Check that defaults are restored
    expect(screen.getByText('Sound Volume: 70%')).toBeInTheDocument();
    expect(screen.getByText('Music Volume: 50%')).toBeInTheDocument();
  });

  it('toggles sound enabled checkbox', () => {
    render(<Settings />);
    const soundCheckbox = screen.getByLabelText('Enable Sound Effects');
    
    expect(soundCheckbox).toBeChecked();
    fireEvent.click(soundCheckbox);
    expect(soundCheckbox).not.toBeChecked();
  });

  it('toggles music enabled checkbox', () => {
    render(<Settings />);
    const musicCheckbox = screen.getByLabelText('Enable Background Music');
    
    expect(musicCheckbox).toBeChecked();
    fireEvent.click(musicCheckbox);
    expect(musicCheckbox).not.toBeChecked();
  });

  it('has back to lobby link', () => {
    render(<Settings />);
    const backLink = screen.getByText('← Back to Lobby');
    expect(backLink).toBeInTheDocument();
    expect(backLink.closest('a')).toHaveAttribute('href', '/');
  });
}); 