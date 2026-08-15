'use client';

import React, { useEffect } from 'react';
import { useMultiplayerGame } from '../hooks/useMultiplayerGame';
import { GameStatus } from '../domain/models/GameSession';
import { ConnectionScreen } from '../components/ConnectionScreen';
import { RoomSelectionScreen } from '../components/RoomSelectionScreen';
import { OnlineLobby } from '../components/OnlineLobby';
import { OnlineGameBoard } from '../components/OnlineGameBoard';

export default function Home() {
  const {
    connectionStatus,
    roomState,
    privateState,
    currentPlayerId,
    error,
    connect,
    createRoom,
    joinRoom,
    startGame,
    togglePlayerStrikeOut,
    toggleCharacterStrikeOut,
    restartGame,
    clearError
  } = useMultiplayerGame();

  // Автоматическое подключение к серверу при загрузке
  useEffect(() => {
    if (connectionStatus === 'disconnected') {
      connect();
    }
  }, [connectionStatus, connect]);

  // Проверка URL параметров для автоматического присоединения к комнате
  useEffect(() => {
    if (typeof window !== 'undefined' && connectionStatus === 'connected' && !roomState) {
      const params = new URLSearchParams(window.location.search);
      const roomCode = params.get('room');

      if (roomCode) {
        // Сохраним код комнаты для использования после ввода имени
        sessionStorage.setItem('pendingRoomCode', roomCode.toUpperCase());
      }
    }
  }, [connectionStatus, roomState]);

  // Если не подключены к серверу
  if (connectionStatus === 'disconnected' || connectionStatus === 'connecting' || connectionStatus === 'error') {
    return (
      <ConnectionScreen
        onConnect={connect}
        isConnecting={connectionStatus === 'connecting'}
        error={error}
      />
    );
  }

  // Если подключены, но не в комнате
  if (!roomState) {
    // Проверяем, есть ли сохраненный код комнаты
    const pendingRoomCode = typeof window !== 'undefined'
      ? sessionStorage.getItem('pendingRoomCode')
      : null;

    return (
      <RoomSelectionScreen
        onCreateRoom={(playerName) => {
          clearError();
          createRoom(playerName);
        }}
        onJoinRoom={(roomCode, playerName) => {
          clearError();
          joinRoom(roomCode, playerName);
          if (typeof window !== 'undefined') {
            sessionStorage.removeItem('pendingRoomCode');
          }
        }}
        error={error}
      />
    );
  }

  // Если в лобби
  if (!roomState.gameSession || roomState.gameSession.status === GameStatus.LOBBY) {
    return (
      <OnlineLobby
        roomState={roomState}
        currentPlayerId={currentPlayerId!}
        connectionStatus={connectionStatus}
        onStartGame={() => {
          clearError();
          startGame(1);
        }}
      />
    );
  }

  // Если игра началась
  if (privateState) {
    return (
      <OnlineGameBoard
        roomState={roomState}
        privateState={privateState}
        currentPlayerId={currentPlayerId!}
        connectionStatus={connectionStatus}
        onTogglePlayerStrikeOut={togglePlayerStrikeOut}
        onToggleCharacterStrikeOut={toggleCharacterStrikeOut}
        onRestartGame={restartGame}
      />
    );
  }

  // Fallback
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800 flex items-center justify-center">
      <div className="text-white text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-500 mx-auto mb-4"></div>
        <p className="text-gray-400">Загрузка...</p>
      </div>
    </div>
  );
}
