import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

interface ChatMessage {
  id: string;
  user: string;
  message: string;
  timestamp: string;
  type: 'message' | 'system' | 'game' | 'emote';
  channel: string;
  avatar?: string;
}

interface ChatChannel {
  id: string;
  name: string;
  type: 'global' | 'lobby' | 'game' | 'private';
  unreadCount: number;
  isActive: boolean;
}

export default function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [channels, setChannels] = useState<ChatChannel[]>([]);
  const [currentChannel, setCurrentChannel] = useState<string>('global');
  const [messageInput, setMessageInput] = useState('');
  const [isConnected, setIsConnected] = useState(true);
  const [showEmotes, setShowEmotes] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mock chat data
  const mockChannels: ChatChannel[] = [
    { id: 'global', name: '🌍 Global Chat', type: 'global', unreadCount: 0, isActive: true },
    { id: 'chess', name: '♔ Chess Lobby', type: 'lobby', unreadCount: 3, isActive: false },
    { id: 'checkers', name: '● Checkers Lobby', type: 'lobby', unreadCount: 1, isActive: false },
    { id: 'backgammon', name: '⚀ Backgammon Lobby', type: 'lobby', unreadCount: 0, isActive: false },
    { id: 'card-games', name: '🃏 Card Games', type: 'lobby', unreadCount: 2, isActive: false },
    { id: 'game-123', name: '🎮 Chess Match #123', type: 'game', unreadCount: 0, isActive: false },
    { id: 'private-1', name: '💬 Private Chat', type: 'private', unreadCount: 0, isActive: false }
  ];

  const mockMessages: ChatMessage[] = [
    {
      id: '1',
      user: 'ChessMaster2024',
      message: 'Anyone up for a chess game?',
      timestamp: '2024-01-25T14:30:00',
      type: 'message',
      channel: 'global',
      avatar: '♔'
    },
    {
      id: '2',
      user: 'CheckersChamp',
      message: 'I\'m looking for a checkers opponent!',
      timestamp: '2024-01-25T14:31:00',
      type: 'message',
      channel: 'global',
      avatar: '●'
    },
    {
      id: '3',
      user: 'System',
      message: 'ChessMaster2024 joined the Chess Lobby',
      timestamp: '2024-01-25T14:32:00',
      type: 'system',
      channel: 'chess'
    },
    {
      id: '4',
      user: 'BackgammonPro',
      message: 'Great move! 👏',
      timestamp: '2024-01-25T14:33:00',
      type: 'message',
      channel: 'game-123',
      avatar: '⚀'
    },
    {
      id: '5',
      user: 'CardShark',
      message: 'Anyone want to play Gin Rummy?',
      timestamp: '2024-01-25T14:34:00',
      type: 'message',
      channel: 'card-games',
      avatar: '🃏'
    },
    {
      id: '6',
      user: 'SpeedPlayer',
      message: '🎉 Just won my 10th game in a row!',
      timestamp: '2024-01-25T14:35:00',
      type: 'message',
      channel: 'global',
      avatar: '⚡'
    },
    {
      id: '7',
      user: 'GameCollector',
      message: 'Check out the new achievements!',
      timestamp: '2024-01-25T14:36:00',
      type: 'message',
      channel: 'global',
      avatar: '🎮'
    }
  ];

  const emotes = ['😀', '😂', '😍', '🤔', '👏', '🎉', '🔥', '💪', '🏆', '🎮', '♔', '●', '⚀', '🃏', '🎴'];

  useEffect(() => {
    setChannels(mockChannels);
    setMessages(mockMessages.filter(msg => msg.channel === currentChannel));
  }, [currentChannel]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        user: 'You',
        message: messageInput.trim(),
        timestamp: new Date().toISOString(),
        type: 'message',
        channel: currentChannel,
        avatar: '👤'
      };
      setMessages(prev => [...prev, newMessage]);
      setMessageInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleChannelChange = (channelId: string) => {
    setCurrentChannel(channelId);
    setChannels(prev => prev.map(ch => ({
      ...ch,
      isActive: ch.id === channelId,
      unreadCount: ch.id === channelId ? 0 : ch.unreadCount
    })));
  };

  const addEmote = (emote: string) => {
    setMessageInput(prev => prev + emote);
    setShowEmotes(false);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getMessageStyle = (message: ChatMessage) => {
    switch (message.type) {
      case 'system':
        return { color: '#6b7280', fontStyle: 'italic' };
      case 'game':
        return { color: '#10b981', fontWeight: 'bold' };
      case 'emote':
        return { color: '#f59e0b', fontStyle: 'italic' };
      default:
        return {};
    }
  };

  const currentChannelData = channels.find(ch => ch.id === currentChannel);

  return (
    <div style={{ padding: 24, color: 'white', minHeight: '100vh', background: 'linear-gradient(135deg, #1e3a8a, #6d28d9, #312e81)' }}>
      <Link href="/" style={{ color: '#60a5fa', textDecoration: 'underline' }}>← Back to Lobby</Link>
      <h1 style={{ fontSize: '2.5rem', margin: '1rem 0', textAlign: 'center' }}>💬 Game Chat</h1>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '250px 1fr', 
        gap: 24, 
        height: 'calc(100vh - 200px)',
        background: 'rgba(255,255,255,0.1)',
        borderRadius: 12,
        backdropFilter: 'blur(10px)',
        overflow: 'hidden'
      }}>
        
        {/* Channel List */}
        <div style={{ 
          background: 'rgba(0,0,0,0.2)', 
          padding: 16,
          borderRight: '1px solid rgba(255,255,255,0.1)'
        }}>
          <h3 style={{ marginBottom: 16, fontSize: '1.2rem' }}>Channels</h3>
          
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ 
              width: 8, 
              height: 8, 
              borderRadius: '50%', 
              background: isConnected ? '#10b981' : '#ef4444',
              marginRight: 8
            }} />
            <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          
          <div style={{ display: 'grid', gap: 4 }}>
            {channels.map(channel => (
              <button
                key={channel.id}
                onClick={() => handleChannelChange(channel.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  background: channel.isActive ? 'rgba(255,255,255,0.2)' : 'transparent',
                  border: 'none',
                  borderRadius: 6,
                  color: 'white',
                  cursor: 'pointer',
                  textAlign: 'left',
                  width: '100%',
                  fontSize: '0.9rem'
                }}
              >
                <span>{channel.name}</span>
                {channel.unreadCount > 0 && (
                  <span style={{
                    background: '#ef4444',
                    color: 'white',
                    borderRadius: '50%',
                    width: 20,
                    height: 20,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.8rem',
                    fontWeight: 'bold'
                  }}>
                    {channel.unreadCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
        
        {/* Chat Area */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          
          {/* Channel Header */}
          <div style={{ 
            padding: 16, 
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.3rem' }}>
                {currentChannelData?.name}
              </h2>
              <div style={{ fontSize: '0.9rem', opacity: 0.7 }}>
                {messages.length} messages
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => setShowEmotes(!showEmotes)}
                style={{
                  background: '#6b7280',
                  color: 'white',
                  border: 'none',
                  padding: '8px 12px',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontSize: '1.2rem'
                }}
              >
                😀
              </button>
            </div>
          </div>
          
          {/* Messages */}
          <div style={{ 
            flex: 1, 
            padding: 16, 
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 8
          }}>
            {messages.map(message => (
              <div key={message.id} style={{ 
                display: 'flex', 
                alignItems: 'flex-start', 
                gap: 8,
                padding: '8px 0'
              }}>
                <div style={{ 
                  fontSize: '1.5rem', 
                  width: 32, 
                  textAlign: 'center',
                  marginTop: 2
                }}>
                  {message.avatar || '👤'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontWeight: 'bold', color: '#60a5fa' }}>
                      {message.user}
                    </span>
                    <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>
                      {formatTime(message.timestamp)}
                    </span>
                  </div>
                  <div style={getMessageStyle(message)}>
                    {message.message}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Emote Panel */}
          {showEmotes && (
            <div style={{ 
              padding: 16, 
              borderTop: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(0,0,0,0.2)'
            }}>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {emotes.map(emote => (
                  <button
                    key={emote}
                    onClick={() => addEmote(emote)}
                    style={{
                      background: 'transparent',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: 4,
                      padding: '4px 8px',
                      cursor: 'pointer',
                      fontSize: '1.2rem'
                    }}
                  >
                    {emote}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Message Input */}
          <div style={{ 
            padding: 16, 
            borderTop: '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            gap: 8
          }}>
            <textarea
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message... (Shift+Enter for new line)"
              style={{
                flex: 1,
                padding: '12px 16px',
                borderRadius: 8,
                border: '1px solid rgba(255,255,255,0.2)',
                background: 'rgba(0,0,0,0.3)',
                color: 'white',
                resize: 'none',
                minHeight: 44,
                maxHeight: 120,
                fontFamily: 'inherit'
              }}
            />
            <button
              onClick={handleSendMessage}
              disabled={!messageInput.trim()}
              style={{
                background: messageInput.trim() ? '#3b82f6' : '#6b7280',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: 8,
                cursor: messageInput.trim() ? 'pointer' : 'not-allowed',
                fontWeight: 'bold'
              }}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 