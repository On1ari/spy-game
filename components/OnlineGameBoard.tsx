'use client';

import React from 'react';
import { RoomState, PrivateState, ConnectionStatus } from '../hooks/useMultiplayerGame';
import Image from 'next/image';

interface OnlineGameBoardProps {
  roomState: RoomState;
  privateState: PrivateState;
  currentPlayerId: string;
  connectionStatus: ConnectionStatus;
  onTogglePlayerStrikeOut: (playerId: string) => void;
  onToggleCharacterStrikeOut: (characterId: string) => void;
  onRestartGame: () => void;
}

export const OnlineGameBoard: React.FC<OnlineGameBoardProps> = ({
  roomState,
  privateState,
  currentPlayerId,
  connectionStatus,
  onTogglePlayerStrikeOut,
  onToggleCharacterStrikeOut,
  onRestartGame
}) => {
  const currentPlayer = roomState.players.find(p => p.id === currentPlayerId);
  const isHost = currentPlayer?.isHost || false;
  const isSpy = privateState.isSpy;
  const gameSession = roomState.gameSession;

  if (!gameSession) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Статус подключения */}
        {connectionStatus === 'reconnecting' && (
          <div className="mb-4 bg-yellow-900/30 border-l-4 border-yellow-600 p-4 rounded">
            <p className="text-yellow-400 text-sm">
              ⚠️ Переподключение к серверу...
            </p>
          </div>
        )}

        {/* Информация о роли */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-2xl p-6 mb-6">
          <div className="text-center mb-6">
            {privateState.assignedCharacter?.imageUrl && (
              <Image
                src={privateState.assignedCharacter.imageUrl}
                alt={privateState.assignedCharacter.name || 'Character'}
                width={64}
                height={64}
                className="mx-auto mb-2"
                unoptimized
              />
            )}
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
                  Персонаж: <span className="text-2xl font-bold text-green-300">{privateState.assignedCharacter?.name}</span>
                </p>
                <p className="text-green-400 text-sm">
                  Не выдайте персонажа шпионам!
                </p>
              </div>
            )}
          </div>

          {/* Код комнаты */}
          <div className="text-center mb-6 p-3 bg-gray-900 border border-gray-700 rounded-lg">
            <span className="text-gray-400 text-sm">Код комнаты: </span>
            <span className="text-cyan-300 font-mono font-bold text-lg">{roomState.code}</span>
          </div>

          {/* Список игроков */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-200 mb-3">
              Игроки ({gameSession.players.length})
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {gameSession.players.map((player) => {
                const roomPlayer = roomState.players.find(p => p.id === player.id);
                const isConnected = roomPlayer?.isConnected ?? true;

                return (
                  <button
                    key={player.id}
                    onClick={() => onTogglePlayerStrikeOut(player.id)}
                    disabled={connectionStatus === 'reconnecting'}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      player.isStrikedOut
                        ? 'bg-gray-900 border-gray-600 opacity-50'
                        : isConnected
                        ? 'bg-gray-700 border-gray-600 hover:border-cyan-600 hover:shadow-md'
                        : 'bg-gray-800 border-red-900 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                        player.isStrikedOut
                          ? 'bg-gray-600'
                          : isConnected
                          ? 'bg-gradient-to-br from-blue-600 to-cyan-600'
                          : 'bg-gray-600'
                      }`}>
                        {player.name[0].toUpperCase()}
                      </div>
                      <div className="flex-1 text-left">
                        <span className={`font-medium text-sm block ${
                          player.isStrikedOut ? 'line-through text-gray-500' : 'text-gray-200'
                        }`}>
                          {player.name}
                        </span>
                        {!isConnected && (
                          <span className="text-xs text-red-400">Отключён</span>
                        )}
                      </div>
                    </div>
                    {player.id === currentPlayerId && (
                      <span className="text-xs text-cyan-400 mt-1 block">Вы</span>
                    )}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Нажмите на игрока, чтобы зачеркнуть
            </p>
          </div>

          {/* Список персонажей */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-200 mb-3">
              Персонажи Brawl Stars ({gameSession.characters.length})
            </h2>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3 max-h-[600px] overflow-y-auto p-2 bg-gray-900 border border-gray-700 rounded-lg">
              {gameSession.characters.map((character) => (
                <button
                  key={character.id}
                  onClick={() => onToggleCharacterStrikeOut(character.id)}
                  disabled={connectionStatus === 'reconnecting'}
                  className={`relative p-2 rounded-lg transition-all flex flex-col items-center gap-2 ${
                    character.isStrikedOut
                      ? 'opacity-30'
                      : 'hover:bg-gray-700 hover:scale-105'
                  }`}
                >
                  {character.imageUrl ? (
                    <div className={`relative w-16 h-16 ${character.isStrikedOut ? 'grayscale' : ''}`}>
                      <Image
                        src={character.imageUrl}
                        alt={character.name}
                        width={64}
                        height={64}
                        className="rounded-lg"
                        unoptimized
                      />
                      {character.isStrikedOut && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-full h-0.5 bg-red-500 rotate-45 transform"></div>
                          <div className="w-full h-0.5 bg-red-500 -rotate-45 transform absolute"></div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className={`relative w-16 h-16 rounded-lg flex items-center justify-center ${
                      character.isStrikedOut ? 'bg-gray-700' : 'bg-gradient-to-br from-blue-600 to-cyan-600'
                    }`}>
                      <span className="text-white font-bold text-xl">
                        {character.name[0]}
                      </span>
                      {character.isStrikedOut && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-full h-0.5 bg-red-500 rotate-45 transform"></div>
                          <div className="w-full h-0.5 bg-red-500 -rotate-45 transform absolute"></div>
                        </div>
                      )}
                    </div>
                  )}
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

          {/* Кнопка перезапуска (только для хоста) */}
          {isHost ? (
            <button
              onClick={onRestartGame}
              disabled={connectionStatus === 'reconnecting'}
              className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg font-bold hover:from-cyan-500 hover:to-blue-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {connectionStatus === 'reconnecting' ? 'Переподключение...' : '🔄 Новая игра'}
            </button>
          ) : (
            <div className="text-center py-3 text-gray-400">
              Только хост может перезапустить игру
            </div>
          )}
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
