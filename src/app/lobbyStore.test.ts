import { useLobbyStore } from './lobbyStore';

describe('Lobby Store', () => {
  beforeEach(() => {
    // Reset store to initial state
    useLobbyStore.setState({
      lobbies: [
        {
          id: 'demo-1',
          name: 'Demo Checkers Game',
          game: 'checkers',
          maxPlayers: 2,
          players: [
            { id: 'player-1', name: 'Alice', isHost: true, isReady: true, isSpectator: false },
            { id: 'player-2', name: 'Bob', isHost: false, isReady: false, isSpectator: false },
          ],
          isPrivate: false,
          status: 'waiting',
          createdAt: new Date(Date.now() - 1000 * 60 * 5),
        },
      ],
      currentLobby: null,
      currentPlayer: null,
    });
  });

  it('creates a new lobby', () => {
    const { createLobby } = useLobbyStore.getState();
    
    createLobby('Test Lobby', 'chess', 2, false);
    
    const state = useLobbyStore.getState();
    expect(state.lobbies).toHaveLength(2);
    expect(state.currentLobby).toBeTruthy();
    expect(state.currentPlayer).toBeTruthy();
    expect(state.currentLobby?.name).toBe('Test Lobby');
    expect(state.currentLobby?.game).toBe('chess');
  });

  it('joins an existing lobby', () => {
    const { joinLobby } = useLobbyStore.getState();
    
    joinLobby('demo-1', 'Charlie');
    
    const state = useLobbyStore.getState();
    expect(state.currentLobby).toBeTruthy();
    expect(state.currentPlayer).toBeTruthy();
    expect(state.currentPlayer?.name).toBe('Charlie');
    expect(state.currentPlayer?.isHost).toBe(false);
  });

  it('prevents joining a full lobby', () => {
    const { joinLobby } = useLobbyStore.getState();
    
    // First join should work
    joinLobby('demo-1', 'Charlie');
    const state1 = useLobbyStore.getState();
    expect(state1.currentLobby).toBeTruthy();
    
    // Reset to test second join
    useLobbyStore.setState({ currentLobby: null, currentPlayer: null });
    
    // Second join should not work (lobby is full)
    joinLobby('demo-1', 'David');
    const state2 = useLobbyStore.getState();
    expect(state2.currentLobby).toBeNull();
  });

  it('leaves a lobby', () => {
    const { joinLobby, leaveLobby } = useLobbyStore.getState();
    
    joinLobby('demo-1', 'Charlie');
    expect(useLobbyStore.getState().currentLobby).toBeTruthy();
    
    leaveLobby();
    expect(useLobbyStore.getState().currentLobby).toBeNull();
    expect(useLobbyStore.getState().currentPlayer).toBeNull();
  });

  it('sets player ready status', () => {
    const { joinLobby, setPlayerReady } = useLobbyStore.getState();
    
    joinLobby('demo-1', 'Charlie');
    expect(useLobbyStore.getState().currentPlayer?.isReady).toBe(false);
    
    setPlayerReady(true);
    expect(useLobbyStore.getState().currentPlayer?.isReady).toBe(true);
  });

  it('starts a game when host calls startGame', () => {
    const { createLobby, startGame } = useLobbyStore.getState();
    
    createLobby('Test Lobby', 'chess', 2, false);
    expect(useLobbyStore.getState().currentLobby?.status).toBe('waiting');
    
    startGame();
    expect(useLobbyStore.getState().currentLobby?.status).toBe('playing');
  });

  it('deletes a lobby', () => {
    const { deleteLobby } = useLobbyStore.getState();
    
    const initialLobbies = useLobbyStore.getState().lobbies.length;
    deleteLobby('demo-1');
    
    expect(useLobbyStore.getState().lobbies).toHaveLength(initialLobbies - 1);
    expect(useLobbyStore.getState().lobbies.find(l => l.id === 'demo-1')).toBeUndefined();
  });

  it('allows joining as a spectator', () => {
    const { joinAsSpectator } = useLobbyStore.getState();
    
    joinAsSpectator('demo-1', 'Spectator');
    
    const state = useLobbyStore.getState();
    expect(state.currentPlayer).toBeTruthy();
    expect(state.currentPlayer?.name).toBe('Spectator');
    expect(state.currentPlayer?.isSpectator).toBe(true);
  });

  it('allows multiple spectators to join', () => {
    const { joinAsSpectator } = useLobbyStore.getState();
    
    // First spectator
    joinAsSpectator('demo-1', 'Spectator1');
    const state1 = useLobbyStore.getState();
    expect(state1.currentPlayer?.isSpectator).toBe(true);
    
    // Reset to test second spectator
    useLobbyStore.setState({ currentLobby: null, currentPlayer: null });
    
    // Second spectator should work
    joinAsSpectator('demo-1', 'Spectator2');
    const state2 = useLobbyStore.getState();
    expect(state2.currentPlayer?.isSpectator).toBe(true);
  });

  it('prevents joining as player when lobby is full but allows spectators', () => {
    const { joinLobby, joinAsSpectator } = useLobbyStore.getState();
    
    // Try to join as player (should fail - lobby is full)
    joinLobby('demo-1', 'Player3');
    const state1 = useLobbyStore.getState();
    expect(state1.currentLobby).toBeNull();
    
    // Join as spectator (should work)
    joinAsSpectator('demo-1', 'Spectator');
    const state2 = useLobbyStore.getState();
    expect(state2.currentPlayer?.isSpectator).toBe(true);
  });
}); 