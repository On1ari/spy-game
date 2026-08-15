'use client';

import React, { useState } from 'react';

interface RoomSelectionScreenProps {
  onCreateRoom: (playerName: string) => void;
  onJoinRoom: (roomCode: string, playerName: string) => void;
  error: string | null;
}

export const RoomSelectionScreen: React.FC<RoomSelectionScreenProps> = ({
  onCreateRoom,
  onJoinRoom,
  error
}) => {
  const [mode, setMode] = useState<'select' | 'create' | 'join'>('select');
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerName.trim()) {
      onCreateRoom(playerName.trim());
    }
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerName.trim() && roomCode.trim()) {
      onJoinRoom(roomCode.trim().toUpperCase(), playerName.trim());
    }
  };

  if (mode === 'select') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800 flex items-center justify-center p-4">
        <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-2xl p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold text-gray-100 mb-2">🕵️ Шпион</h1>
            <p className="text-gray-400">Выберите действие</p>
          </div>

          {error && (
            <div className="mb-6 bg-red-900/30 border-l-4 border-red-600 p-4 rounded">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <button
              onClick={() => setMode('create')}
              className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg font-bold hover:from-cyan-500 hover:to-blue-500 transition"
            >
              🎮 Создать новую игру
            </button>

            <button
              onClick={() => setMode('join')}
              className="w-full py-4 bg-gray-700 text-white rounded-lg font-bold hover:bg-gray-600 transition border-2 border-gray-600"
            >
              🔗 Присоединиться к игре
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-700">
            <h3 className="font-semibold text-gray-300 mb-2">Как играть:</h3>
            <ul className="text-sm text-gray-400 space-y-1 list-disc list-inside">
              <li>Создайте комнату и поделитесь кодом с друзьями</li>
              <li>Или введите код комнаты для присоединения</li>
              <li>Минимум 3 игрока для начала игры</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'create') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800 flex items-center justify-center p-4">
        <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-2xl p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-100 mb-2">Создать игру</h1>
            <p className="text-gray-400">Введите ваше имя</p>
          </div>

          {error && (
            <div className="mb-6 bg-red-900/30 border-l-4 border-red-600 p-4 rounded">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleCreateRoom}>
            <div className="mb-6">
              <label className="block text-gray-300 font-medium mb-2">
                Ваше имя
              </label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Введите ваше имя"
                className="w-full px-4 py-3 bg-gray-900 border-2 border-gray-700 text-gray-200 placeholder-gray-500 rounded-lg focus:outline-none focus:border-cyan-600"
                maxLength={20}
                required
                autoFocus
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setMode('select')}
                className="flex-1 py-3 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-600 transition"
              >
                Назад
              </button>
              <button
                type="submit"
                className="flex-1 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg font-bold hover:from-cyan-500 hover:to-blue-500 transition"
              >
                Создать
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // mode === 'join'
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800 flex items-center justify-center p-4">
      <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-2xl p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-100 mb-2">Присоединиться</h1>
          <p className="text-gray-400">Введите код комнаты и ваше имя</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-900/30 border-l-4 border-red-600 p-4 rounded">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleJoinRoom}>
          <div className="mb-4">
            <label className="block text-gray-300 font-medium mb-2">
              Код комнаты
            </label>
            <input
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="ABC123"
              className="w-full px-4 py-3 bg-gray-900 border-2 border-gray-700 text-gray-200 placeholder-gray-500 rounded-lg focus:outline-none focus:border-cyan-600 text-center text-2xl font-mono tracking-wider"
              maxLength={6}
              required
              autoFocus
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-300 font-medium mb-2">
              Ваше имя
            </label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Введите ваше имя"
              className="w-full px-4 py-3 bg-gray-900 border-2 border-gray-700 text-gray-200 placeholder-gray-500 rounded-lg focus:outline-none focus:border-cyan-600"
              maxLength={20}
              required
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setMode('select')}
              className="flex-1 py-3 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-600 transition"
            >
              Назад
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg font-bold hover:from-cyan-500 hover:to-blue-500 transition"
            >
              Войти
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
