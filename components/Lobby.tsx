'use client';

import React, { useState } from 'react';
import { GameSession, GameStatus } from '../domain/models/GameSession';
import { Player } from '../domain/models/Player';

interface LobbyProps {
  session: GameSession;
  currentPlayer: Player;
  onAddPlayer: (name: string) => void;
  onRemovePlayer: (playerId: string) => void;
  onStartGame: () => void;
}

export const Lobby: React.FC<LobbyProps> = ({
  session,
  currentPlayer,
  onAddPlayer,
  onRemovePlayer,
  onStartGame
}) => {
  const [newPlayerName, setNewPlayerName] = useState('');

  const handleAddPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPlayerName.trim()) {
      onAddPlayer(newPlayerName.trim());
      setNewPlayerName('');
    }
  };

  const canStartGame = session.players.length >= 3;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-2xl p-6 mb-6">
          <h1 className="text-3xl font-bold text-center mb-2 text-gray-100">
            Игра в шпиона
          </h1>
          <p className="text-center text-gray-400 mb-4">Brawl Stars Edition</p>

          <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 mb-6">
            <h2 className="text-lg font-semibold text-gray-200 mb-2">Игроки ({session.players.length})</h2>
            <div className="space-y-2">
              {session.players.map((player) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between bg-gray-800 border border-gray-700 rounded-lg p-3 shadow"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center text-white font-bold">
                      {player.name[0].toUpperCase()}
                    </div>
                    <span className="font-medium text-gray-200">{player.name}</span>
                    {player.id === currentPlayer.id && (
                      <span className="text-xs bg-cyan-900 text-cyan-300 px-2 py-1 rounded-full border border-cyan-700">
                        Вы
                      </span>
                    )}
                  </div>
                  {player.id !== currentPlayer.id && (
                    <button
                      onClick={() => onRemovePlayer(player.id)}
                      className="text-red-400 hover:text-red-300 font-medium text-sm"
                    >
                      Удалить
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleAddPlayer} className="mb-6">
            <div className="flex gap-2">
              <input
                type="text"
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
                placeholder="Имя нового игрока"
                className="flex-1 px-4 py-3 bg-gray-900 border-2 border-gray-700 text-gray-200 placeholder-gray-500 rounded-lg focus:outline-none focus:border-cyan-600"
                maxLength={20}
              />
              <button
                type="submit"
                className="px-6 py-3 bg-cyan-600 text-white rounded-lg font-medium hover:bg-cyan-500 transition"
              >
                Добавить
              </button>
            </div>
          </form>

          {!canStartGame && (
            <div className="bg-yellow-900/30 border-l-4 border-yellow-600 p-4 mb-4">
              <p className="text-yellow-400 text-sm">
                Минимум 3 игрока для начала игры
              </p>
            </div>
          )}

          <button
            onClick={onStartGame}
            disabled={!canStartGame}
            className={`w-full py-4 rounded-lg font-bold text-lg transition ${
              canStartGame
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:from-cyan-500 hover:to-blue-500'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            }`}
          >
            Начать игру
          </button>
        </div>

        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-lg p-4 text-gray-300">
          <h3 className="font-semibold mb-2 text-gray-200">Правила игры:</h3>
          <ul className="text-sm space-y-1 list-disc list-inside">
            <li>Один или несколько игроков будут шпионами</li>
            <li>Шпионы не знают персонажа и должны его угадать</li>
            <li>Мирные жители знают персонажа и не должны его выдать</li>
            <li>Обсуждайте и голосуйте, кто шпион!</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
