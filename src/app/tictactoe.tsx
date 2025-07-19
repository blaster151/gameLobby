'use client';

import React, { useEffect } from 'react';
import { useTicTacToeStore, Player, GameState, GameMode, BotDifficulty } from './tictactoeStore';

const TicTacToe: React.FC = () => {
  const {
    board,
    currentPlayer,
    gameState,
    gameMode,
    botDifficulty,
    stats,
    history,
    historyIndex,
    message,
    lastMove,
    winningLine,
    makeMove,
    resetGame,
    setGameMode,
    setBotDifficulty,
    undoMove,
    redoMove,
    updateStats,
    resetStats,
    saveGame,
    loadGame,
    hasSavedGame,
  } = useTicTacToeStore();

  // Auto-save game when it changes
  useEffect(() => {
    if (gameState === GameState.PLAYING && historyIndex > 0) {
      saveGame();
    }
  }, [board, gameState, historyIndex, saveGame]);

  const isWinningCell = (row: number, col: number): boolean => {
    return winningLine?.some(pos => pos.row === row && pos.col === col) ?? false;
  };

  const isLastMove = (row: number, col: number): boolean => {
    return lastMove?.row === row && lastMove?.col === col;
  };

  const getCellStyle = (row: number, col: number): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      width: '80px',
      height: '80px',
      border: '2px solid #333',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '2rem',
      fontWeight: 'bold',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      backgroundColor: '#fff',
    };

    if (isWinningCell(row, col)) {
      baseStyle.backgroundColor = '#4ade80';
      baseStyle.color = '#fff';
      baseStyle.transform = 'scale(1.05)';
    } else if (isLastMove(row, col)) {
      baseStyle.backgroundColor = '#fbbf24';
      baseStyle.transform = 'scale(1.02)';
    }

    return baseStyle;
  };

  const getPlayerColor = (player: Player): string => {
    return player === Player.X ? '#ef4444' : '#3b82f6';
  };

  const handleCellClick = (row: number, col: number) => {
    if (gameState === GameState.PLAYING && board[row][col] === null) {
      makeMove(row, col);
    }
  };

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Tic-Tac-Toe</h1>
          <p className="text-lg text-gray-600">Classic game with AI opponents</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Game Board */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6">
              {/* Game Status */}
              <div className="text-center mb-6">
                <div className="text-xl font-semibold text-gray-800 mb-2">
                  {message}
                </div>
                {gameState === GameState.PLAYING && (
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-gray-600">Current Player:</span>
                    <span 
                      className="text-2xl font-bold"
                      style={{ color: getPlayerColor(currentPlayer) }}
                    >
                      {currentPlayer}
                    </span>
                  </div>
                )}
              </div>

              {/* Game Board */}
              <div className="flex justify-center mb-6">
                <div className="grid grid-cols-3 gap-1 bg-gray-300 p-2 rounded-lg">
                  {board.map((row, rowIndex) =>
                    row.map((cell, colIndex) => (
                      <div
                        key={`${rowIndex}-${colIndex}`}
                        style={getCellStyle(rowIndex, colIndex)}
                        onClick={() => handleCellClick(rowIndex, colIndex)}
                        className="hover:bg-gray-50 active:scale-95"
                      >
                        {cell && (
                          <span style={{ color: getPlayerColor(cell) }}>
                            {cell}
                          </span>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Game Controls */}
              <div className="flex flex-wrap gap-3 justify-center">
                <button
                  onClick={resetGame}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  New Game
                </button>
                
                <button
                  onClick={undoMove}
                  disabled={!canUndo}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    canUndo 
                      ? 'bg-gray-600 text-white hover:bg-gray-700' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Undo
                </button>
                
                <button
                  onClick={redoMove}
                  disabled={!canRedo}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    canRedo 
                      ? 'bg-gray-600 text-white hover:bg-gray-700' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Redo
                </button>

                {hasSavedGame() && (
                  <button
                    onClick={loadGame}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Load Game
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Game Settings */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Game Settings</h2>
              
              {/* Game Mode */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Game Mode
                </label>
                <select
                  value={gameMode}
                  onChange={(e) => setGameMode(e.target.value as GameMode)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={GameMode.HUMAN_VS_HUMAN}>Human vs Human</option>
                  <option value={GameMode.HUMAN_VS_BOT}>Human vs Bot</option>
                  <option value={GameMode.BOT_VS_BOT}>Bot vs Bot</option>
                </select>
              </div>

              {/* Bot Difficulty */}
              {(gameMode === GameMode.HUMAN_VS_BOT || gameMode === GameMode.BOT_VS_BOT) && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bot Difficulty
                  </label>
                  <select
                    value={botDifficulty}
                    onChange={(e) => setBotDifficulty(e.target.value as BotDifficulty)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value={BotDifficulty.EASY}>Easy</option>
                    <option value={BotDifficulty.MEDIUM}>Medium</option>
                    <option value={BotDifficulty.HARD}>Hard</option>
                  </select>
                </div>
              )}

              {/* Move History */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Move History
                </label>
                <div className="text-sm text-gray-600">
                  Move {historyIndex} of {history.length - 1}
                </div>
              </div>
            </div>

            {/* Statistics */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Statistics</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Player X Wins:</span>
                  <span className="font-semibold text-red-600">{stats.xWins}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Player O Wins:</span>
                  <span className="font-semibold text-blue-600">{stats.oWins}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Draws:</span>
                  <span className="font-semibold text-gray-600">{stats.draws}</span>
                </div>
                
                <div className="border-t pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Games:</span>
                    <span className="font-semibold text-gray-800">{stats.totalGames}</span>
                  </div>
                </div>

                {stats.totalGames > 0 && (
                  <div className="border-t pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Win Rate X:</span>
                      <span className="font-semibold text-red-600">
                        {((stats.xWins / stats.totalGames) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Win Rate O:</span>
                      <span className="font-semibold text-blue-600">
                        {((stats.oWins / stats.totalGames) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={resetStats}
                className="w-full mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Reset Statistics
              </button>
            </div>

            {/* Game Info */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">How to Play</h2>
              
              <div className="text-sm text-gray-600 space-y-2">
                <p>• Click on any empty cell to make a move</p>
                <p>• Get three of your symbols in a row to win</p>
                <p>• Rows, columns, and diagonals all count</p>
                <p>• Use Undo/Redo to review moves</p>
                <p>• Games are automatically saved</p>
              </div>

              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">Bot Difficulties:</h3>
                <div className="text-sm text-blue-700 space-y-1">
                  <p><strong>Easy:</strong> Random moves</p>
                  <p><strong>Medium:</strong> Mix of random and smart moves</p>
                  <p><strong>Hard:</strong> Perfect play (unbeatable)</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500">
          <p>Enjoy playing Tic-Tac-Toe! 🎮</p>
        </div>
      </div>
    </div>
  );
};

export default TicTacToe; 