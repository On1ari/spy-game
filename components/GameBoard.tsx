'use client';

import React, { useState } from 'react';
import { GameSession } from '../domain/models/GameSession';
import { Player } from '../domain/models/Player';

interface GameBoardProps {
  session: GameSession;
  currentPlayer: Player;
  onTogglePlayerStrikeOut: (playerId: string) => void;
  onToggleCharacterStrikeOut: (characterId: string) => void;
  onRestartGame: () => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  session,
  currentPlayer,
  onTogglePlayerStrikeOut,
  onToggleCharacterStrikeOut,
  onRestartGame
}) => {
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  const getCurrentPlayerRole = (): Player | undefined => {
    return session.players.find(p => p.id === currentPlayer.id);
  };

  const handleImageError = (characterId: string) => {
    setFailedImages(prev => new Set(prev).add(characterId));
  };

  const playerRole = getCurrentPlayerRole();
  const isSpy = playerRole?.isSpy || false;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Информация о роли */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-2xl p-6 mb-6">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-100 mb-2">
              {isSpy ? '🕵️ Вы ШПИОН!' : '🛡️ Вы МИРНЫЙ'}
            </h1>
            {isSpy ? (
              <div className="bg-red-900/30 border-l-4 border-red-600 p-4 rounded">
                <p className="text-red-400 font-medium">
                  Вы не знаете персонажа. Угадайте его по разговорам!
                </p>
              </div>
            ) : (
              <div className="bg-green-900/30 border-l-4 border-green-600 p-4 rounded">
                <p className="text-green-400 font-medium mb-2">
                  Персонаж: <span className="text-2xl font-bold text-green-300">{session.assignedCharacter?.name}</span>
                </p>
                <p className="text-green-400 text-sm">
                  Не выдайте персонажа шпионам!
                </p>
              </div>
            )}
          </div>

          {/* Список игроков */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-200 mb-3">
              Игроки ({session.players.length})
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {session.players.map((player) => (
                <button
                  key={player.id}
                  onClick={() => onTogglePlayerStrikeOut(player.id)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    player.isStrikedOut
                      ? 'bg-gray-900 border-gray-600 opacity-50'
                      : 'bg-gray-700 border-gray-600 hover:border-cyan-600 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                      player.isStrikedOut ? 'bg-gray-600' : 'bg-gradient-to-br from-blue-600 to-cyan-600'
                    }`}>
                      {player.name[0].toUpperCase()}
                    </div>
                    <span className={`font-medium text-sm ${
                      player.isStrikedOut ? 'line-through text-gray-500' : 'text-gray-200'
                    }`}>
                      {player.name}
                    </span>
                  </div>
                  {player.id === currentPlayer.id && (
                    <span className="text-xs text-cyan-400 mt-1 block">Вы</span>
                  )}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Нажмите на игрока, чтобы зачеркнуть
            </p>
          </div>

          {/* Список персонажей для всех */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-200 mb-3">
              Персонажи Brawl Stars ({session.characters.length})
            </h2>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3 max-h-[600px] overflow-y-auto p-2 bg-gray-900 border border-gray-700 rounded-lg">
              {session.characters.map((character) => (
                <button
                  key={character.id}
                  onClick={() => onToggleCharacterStrikeOut(character.id)}
                  className={`relative p-2 rounded-lg transition-all flex flex-col items-center gap-2 ${
                    character.isStrikedOut
                      ? 'opacity-30'
                      : 'hover:bg-gray-700 hover:scale-105'
                  }`}
                >
                  <div className={`relative w-16 h-16 rounded-lg flex items-center justify-center overflow-hidden ${
                    character.isStrikedOut ? 'bg-gray-700' : 'bg-gradient-to-br from-blue-600 to-cyan-600'
                  }`}>
                    {character.imageUrl && !failedImages.has(character.id) ? (
                      <img
                        src={character.imageUrl}
                        alt={character.name}
                        className={`w-full h-full object-cover rounded-lg ${character.isStrikedOut ? 'grayscale' : ''}`}
                        onError={() => handleImageError(character.id)}
                      />
                    ) : (
                      <span className="text-white font-bold text-xl">
                        {character.name[0]}
                      </span>
                    )}
                    {character.isStrikedOut && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <div className="w-full h-0.5 bg-red-500 rotate-45 transform"></div>
                        <div className="w-full h-0.5 bg-red-500 -rotate-45 transform absolute"></div>
                      </div>
                    )}
                  </div>
                  <span className={`text-[10px] font-medium text-center leading-tight ${
                    character.isStrikedOut ? 'line-through text-gray-600' : 'text-gray-300'
                  }`}>
                    {character.name}
                  </span>
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Зачеркивайте персонажей, которые точно не подходят
            </p>
          </div>

          {/* Кнопка перезапуска */}
          <button
            onClick={onRestartGame}
            className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg font-bold hover:from-cyan-500 hover:to-blue-500 transition"
          >
            🔄 Новая игра
          </button>
        </div>

        {/* Подсказки */}
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-lg p-4 text-gray-300">
          <h3 className="font-semibold mb-2 text-gray-200">💡 Советы:</h3>
          <ul className="text-sm space-y-1 list-disc list-inside">
            <li>Задавайте вопросы о персонаже, не называя его напрямую</li>
            <li>Шпионы: слушайте внимательно и отмечайте невозможные варианты</li>
            <li>Мирные: будьте осторожны, не выдайте персонажа!</li>
            <li>Голосуйте вместе, кто может быть шпионом</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
