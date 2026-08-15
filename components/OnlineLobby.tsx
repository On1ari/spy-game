'use client';

import React from 'react';
import { RoomState, ConnectionStatus } from '../hooks/useMultiplayerGame';

interface OnlineLobbyProps {
  roomState: RoomState;
  currentPlayerId: string;
  connectionStatus: ConnectionStatus;
  onStartGame: () => void;
}

export const OnlineLobby: React.FC<OnlineLobbyProps> = ({
  roomState,
  currentPlayerId,
  connectionStatus,
  onStartGame
}) => {
  const currentPlayer = roomState.players.find(p => p.id === currentPlayerId);
  const isHost = currentPlayer?.isHost || false;
  const canStartGame = roomState.players.filter(p => p.isConnected).length >= 3;

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomState.code);
    // Можно добавить уведомление о копировании
  };

  const shareLink = () => {
    const url = `${window.location.origin}?room=${roomState.code}`;
    if (navigator.share) {
      navigator.share({
        title: 'Игра в шпиона',
        text: `Присоединяйся к игре! Код комнаты: ${roomState.code}`,
        url: url
      });
    } else {
      navigator.clipboard.writeText(url);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Статус подключения */}
        {connectionStatus === 'reconnecting' && (
          <div className="mb-4 bg-yellow-900/30 border-l-4 border-yellow-600 p-4 rounded">
            <p className="text-yellow-400 text-sm">
              ⚠️ Переподключение к серверу...
            </p>
          </div>
        )}

        <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-2xl p-6 mb-6">
          <h1 className="text-3xl font-bold text-center mb-2 text-gray-100">
            Игра в шпиона
          </h1>
          <p className="text-center text-gray-400 mb-4">Brawl Stars Edition - Online</p>

          {/* Код комнаты */}
          <div className="bg-gradient-to-r from-cyan-900/30 to-blue-900/30 border-2 border-cyan-700 rounded-lg p-6 mb-6">
            <p className="text-center text-gray-300 text-sm mb-2">Код комнаты</p>
            <div className="text-center text-4xl font-bold text-cyan-300 tracking-wider font-mono mb-4">
              {roomState.code}
            </div>
            <div className="flex gap-2">
              <button
                onClick={copyRoomCode}
                className="flex-1 py-2 bg-cyan-600 text-white rounded-lg font-medium hover:bg-cyan-500 transition text-sm"
              >
                📋 Копировать код
              </button>
              <button
                onClick={shareLink}
                className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-500 transition text-sm"
              >
                🔗 Поделиться ссылкой
              </button>
            </div>
          </div>

          {/* Список игроков */}
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 mb-6">
            <h2 className="text-lg font-semibold text-gray-200 mb-2">
              Игроки ({roomState.players.filter(p => p.isConnected).length})
            </h2>
            <div className="space-y-2">
              {roomState.players.map((player) => (
                <div
                  key={player.id}
                  className={`flex items-center justify-between bg-gray-800 border rounded-lg p-3 shadow transition ${
                    player.isConnected
                      ? 'border-gray-700'
                      : 'border-red-900 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                      player.isConnected
                        ? 'bg-gradient-to-br from-blue-600 to-cyan-600'
                        : 'bg-gray-600'
                    }`}>
                      {player.name[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`font-medium ${
                          player.isConnected ? 'text-gray-200' : 'text-gray-500'
                        }`}>
                          {player.name}
                        </span>
                        {player.id === currentPlayerId && (
                          <span className="text-xs bg-cyan-900 text-cyan-300 px-2 py-1 rounded-full border border-cyan-700">
                            Вы
                          </span>
                        )}
                        {player.isHost && (
                          <span className="text-xs bg-yellow-900 text-yellow-300 px-2 py-1 rounded-full border border-yellow-700">
                            Хост
                          </span>
                        )}
                      </div>
                      {!player.isConnected && (
                        <span className="text-xs text-red-400">Отключён</span>
                      )}
                    </div>
                  </div>

                  {player.isConnected ? (
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  ) : (
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Предупреждение о минимальном количестве игроков */}
          {!canStartGame && (
            <div className="bg-yellow-900/30 border-l-4 border-yellow-600 p-4 mb-4">
              <p className="text-yellow-400 text-sm">
                Минимум 3 игрока для начала игры. Ожидание игроков...
              </p>
            </div>
          )}

          {/* Кнопка старта (только для хоста) */}
          {isHost ? (
            <button
              onClick={onStartGame}
              disabled={!canStartGame || connectionStatus === 'reconnecting'}
              className={`w-full py-4 rounded-lg font-bold text-lg transition ${
                canStartGame && connectionStatus === 'connected'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:from-cyan-500 hover:to-blue-500'
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              }`}
            >
              {connectionStatus === 'reconnecting' ? 'Переподключение...' : 'Начать игру'}
            </button>
          ) : (
            <div className="text-center py-4 text-gray-400">
              Ожидание хоста для начала игры...
            </div>
          )}
        </div>

        {/* Правила игры */}
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
