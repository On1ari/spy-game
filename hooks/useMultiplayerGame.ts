import { useState, useEffect, useCallback, useRef } from 'react';
import { WebSocketClient } from '../lib/websocket-client';
import { GameStatus } from '../domain/models/GameSession';

export interface RoomPlayer {
  id: string;
  name: string;
  isHost: boolean;
  isConnected: boolean;
}

export interface GameSessionState {
  id: string;
  status: GameStatus;
  players: {
    id: string;
    name: string;
    isStrikedOut: boolean;
  }[];
  characters: {
    id: string;
    name: string;
    imageUrl?: string;
    isStrikedOut: boolean;
  }[];
  spyCount: number;
}

export interface RoomState {
  roomId: string;
  code: string;
  players: RoomPlayer[];
  gameSession: GameSessionState | null;
}

export interface PrivateState {
  isSpy: boolean;
  assignedCharacter: {
    id: string;
    name: string;
    imageUrl?: string;
  } | null;
}

export type ConnectionStatus =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'error';

export const useMultiplayerGame = () => {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [privateState, setPrivateState] = useState<PrivateState | null>(null);
  const [currentPlayerId, setCurrentPlayerId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const wsClient = useRef<WebSocketClient | null>(null);

  // Инициализация WebSocket клиента
  useEffect(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001';

    const client = new WebSocketClient({
      url: wsUrl,
      reconnectInterval: 3000,
      maxReconnectAttempts: 10
    });

    // Обработчики событий подключения
    client.on('connected', () => {
      setConnectionStatus('connected');
      setError(null);
    });

    client.on('disconnected', () => {
      setConnectionStatus('disconnected');
    });

    client.on('reconnecting', ({ attempt }) => {
      setConnectionStatus('reconnecting');
      console.log(`Переподключение... Попытка ${attempt}`);
    });

    client.on('reconnect_failed', () => {
      setConnectionStatus('error');
      setError('Не удалось переподключиться к серверу');
    });

    client.on('error', (err) => {
      setConnectionStatus('error');
      setError('Ошибка подключения к серверу');
    });

    // Обработчики игровых событий
    client.on('room_created', (data) => {
      setRoomState(data.publicState);
      setCurrentPlayerId(data.playerId);
    });

    client.on('room_joined', (data) => {
      setRoomState(data.publicState);
      setCurrentPlayerId(data.playerId);
    });

    client.on('player_joined', (data) => {
      setRoomState(data.publicState);
    });

    client.on('player_disconnected', (data) => {
      setRoomState(data.publicState);
    });

    client.on('game_started', (data) => {
      setRoomState(data.publicState);
      setPrivateState(data.privateState);
    });

    client.on('game_state_updated', (data) => {
      setRoomState(data.publicState);
    });

    client.on('game_restarted', (data) => {
      setRoomState(data.publicState);
      setPrivateState(null);
    });

    client.on('error', (data) => {
      setError(data.error);
      console.error('Server error:', data.error);
    });

    wsClient.current = client;

    return () => {
      client.disconnect();
    };
  }, []);

  // Подключение к серверу
  const connect = useCallback(async () => {
    if (!wsClient.current) return;

    try {
      setConnectionStatus('connecting');
      await wsClient.current.connect();
    } catch (error) {
      console.error('Failed to connect:', error);
      setConnectionStatus('error');
      setError('Не удалось подключиться к серверу');
    }
  }, []);

  // Создать комнату
  const createRoom = useCallback(async (playerName: string) => {
    if (!wsClient.current || !wsClient.current.isConnected()) {
      throw new Error('Not connected to server');
    }

    wsClient.current.send('create_room', { playerName });
  }, []);

  // Присоединиться к комнате
  const joinRoom = useCallback(async (roomCode: string, playerName: string) => {
    if (!wsClient.current || !wsClient.current.isConnected()) {
      throw new Error('Not connected to server');
    }

    wsClient.current.send('join_room', { roomCode, playerName });
  }, []);

  // Начать игру
  const startGame = useCallback((spyCount: number = 1) => {
    if (!wsClient.current || !wsClient.current.isConnected()) {
      throw new Error('Not connected to server');
    }

    wsClient.current.send('start_game', { spyCount });
  }, []);

  // Зачеркнуть игрока
  const togglePlayerStrikeOut = useCallback((playerId: string) => {
    if (!wsClient.current || !wsClient.current.isConnected()) {
      throw new Error('Not connected to server');
    }

    wsClient.current.send('toggle_player_strikeout', { playerId });
  }, []);

  // Зачеркнуть персонажа
  const toggleCharacterStrikeOut = useCallback((characterId: string) => {
    if (!wsClient.current || !wsClient.current.isConnected()) {
      throw new Error('Not connected to server');
    }

    wsClient.current.send('toggle_character_strikeout', { characterId });
  }, []);

  // Перезапустить игру
  const restartGame = useCallback(() => {
    if (!wsClient.current || !wsClient.current.isConnected()) {
      throw new Error('Not connected to server');
    }

    wsClient.current.send('restart_game');
  }, []);

  // Очистить ошибку
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
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
  };
};
