import { WebSocketServer, WebSocket } from 'ws';
import { IncomingMessage } from 'http';
import { RoomManager } from './RoomManager';
import { GameRoom } from './GameRoom';
import { BrawlStarsCharacterRepository } from '../services/CharacterRepository';

interface ClientConnection {
  ws: WebSocket;
  playerId?: string;
  roomId?: string;
}

interface WebSocketMessage {
  type: string;
  payload?: any;
}

export class GameWebSocketServer {
  private wss: WebSocketServer;
  private roomManager: RoomManager;
  private clients: Map<WebSocket, ClientConnection> = new Map();

  constructor(port: number) {
    const characterRepository = new BrawlStarsCharacterRepository();
    const characters = characterRepository.getAllCharacters();
    this.roomManager = new RoomManager(characters);

    this.wss = new WebSocketServer({ port });

    this.wss.on('connection', (ws: WebSocket, request: IncomingMessage) => {
      this.handleConnection(ws, request);
    });

    console.log(`[WebSocket Server] Started on port ${port}`);
  }

  private handleConnection(ws: WebSocket, request: IncomingMessage) {
    console.log('[WebSocket Server] New connection');

    const clientInfo: ClientConnection = { ws };
    this.clients.set(ws, clientInfo);

    ws.on('message', (data: Buffer) => {
      try {
        const message: WebSocketMessage = JSON.parse(data.toString());
        this.handleMessage(ws, message);
      } catch (error) {
        console.error('[WebSocket Server] Error parsing message:', error);
        this.sendError(ws, 'Invalid message format');
      }
    });

    ws.on('close', () => {
      this.handleDisconnect(ws);
    });

    ws.on('error', (error) => {
      console.error('[WebSocket Server] WebSocket error:', error);
    });

    // Отправляем подтверждение подключения
    this.send(ws, {
      type: 'connected',
      payload: { message: 'Connected to game server' }
    });
  }

  private handleMessage(ws: WebSocket, message: WebSocketMessage) {
    const { type, payload } = message;

    console.log(`[WebSocket Server] Received: ${type}`, payload);

    try {
      switch (type) {
        case 'create_room':
          this.handleCreateRoom(ws, payload);
          break;
        case 'join_room':
          this.handleJoinRoom(ws, payload);
          break;
        case 'start_game':
          this.handleStartGame(ws, payload);
          break;
        case 'toggle_player_strikeout':
          this.handleTogglePlayerStrikeOut(ws, payload);
          break;
        case 'toggle_character_strikeout':
          this.handleToggleCharacterStrikeOut(ws, payload);
          break;
        case 'restart_game':
          this.handleRestartGame(ws, payload);
          break;
        case 'ping':
          this.send(ws, { type: 'pong' });
          break;
        default:
          this.sendError(ws, `Unknown message type: ${type}`);
      }
    } catch (error: any) {
      console.error(`[WebSocket Server] Error handling ${type}:`, error);
      this.sendError(ws, error.message || 'Internal server error');
    }
  }

  private handleCreateRoom(ws: WebSocket, payload: { playerName: string }) {
    const { playerName } = payload;

    if (!playerName || playerName.trim().length === 0) {
      throw new Error('Player name is required');
    }

    const room = this.roomManager.createRoom();
    const player = room.addPlayer(this.getConnectionId(ws), playerName.trim(), true);

    const clientInfo = this.clients.get(ws);
    if (clientInfo) {
      clientInfo.playerId = player.id;
      clientInfo.roomId = room.id;
    }

    this.send(ws, {
      type: 'room_created',
      payload: {
        roomCode: room.code,
        roomId: room.id,
        playerId: player.id,
        publicState: room.getPublicState()
      }
    });

    console.log(`[WebSocket Server] Room ${room.code} created by ${playerName}`);
  }

  private handleJoinRoom(ws: WebSocket, payload: { roomCode: string; playerName: string }) {
    const { roomCode, playerName } = payload;

    if (!roomCode || !playerName) {
      throw new Error('Room code and player name are required');
    }

    const room = this.roomManager.getRoomByCode(roomCode);
    if (!room) {
      throw new Error('Room not found');
    }

    const player = room.addPlayer(this.getConnectionId(ws), playerName.trim(), false);

    const clientInfo = this.clients.get(ws);
    if (clientInfo) {
      clientInfo.playerId = player.id;
      clientInfo.roomId = room.id;
    }

    // Отправляем подтверждение присоединившемуся игроку
    this.send(ws, {
      type: 'room_joined',
      payload: {
        roomCode: room.code,
        roomId: room.id,
        playerId: player.id,
        publicState: room.getPublicState()
      }
    });

    // Уведомляем всех игроков в комнате о новом игроке
    this.broadcastToRoom(room.id, {
      type: 'player_joined',
      payload: {
        player: {
          id: player.id,
          name: player.name,
          isHost: player.isHost,
          isConnected: player.isConnected
        },
        publicState: room.getPublicState()
      }
    });

    console.log(`[WebSocket Server] ${playerName} joined room ${roomCode}`);
  }

  private handleStartGame(ws: WebSocket, payload: { spyCount?: number }) {
    const clientInfo = this.clients.get(ws);
    if (!clientInfo?.roomId || !clientInfo?.playerId) {
      throw new Error('Not in a room');
    }

    const room = this.roomManager.getRoom(clientInfo.roomId);
    if (!room) {
      throw new Error('Room not found');
    }

    const player = room.getPlayer(clientInfo.playerId);
    if (!player?.isHost) {
      throw new Error('Only host can start the game');
    }

    if (!room.canStartGame()) {
      throw new Error('Cannot start game - minimum 3 players required');
    }

    room.startGame(payload?.spyCount || 1);

    // Отправляем каждому игроку его приватное состояние
    for (const roomPlayer of room.getAllPlayers()) {
      const playerWs = this.findWebSocketByPlayerId(roomPlayer.id);
      if (playerWs) {
        const privateState = room.getPrivateStateForPlayer(roomPlayer.id);
        this.send(playerWs, {
          type: 'game_started',
          payload: {
            publicState: room.getPublicState(),
            privateState
          }
        });
      }
    }

    console.log(`[WebSocket Server] Game started in room ${room.code}`);
  }

  private handleTogglePlayerStrikeOut(ws: WebSocket, payload: { playerId: string }) {
    const clientInfo = this.clients.get(ws);
    if (!clientInfo?.roomId) {
      throw new Error('Not in a room');
    }

    const room = this.roomManager.getRoom(clientInfo.roomId);
    if (!room) {
      throw new Error('Room not found');
    }

    room.togglePlayerStrikeOut(payload.playerId);

    this.broadcastToRoom(room.id, {
      type: 'game_state_updated',
      payload: {
        publicState: room.getPublicState()
      }
    });
  }

  private handleToggleCharacterStrikeOut(ws: WebSocket, payload: { characterId: string }) {
    const clientInfo = this.clients.get(ws);
    if (!clientInfo?.roomId) {
      throw new Error('Not in a room');
    }

    const room = this.roomManager.getRoom(clientInfo.roomId);
    if (!room) {
      throw new Error('Room not found');
    }

    room.toggleCharacterStrikeOut(payload.characterId);

    this.broadcastToRoom(room.id, {
      type: 'game_state_updated',
      payload: {
        publicState: room.getPublicState()
      }
    });
  }

  private handleRestartGame(ws: WebSocket, payload: any) {
    const clientInfo = this.clients.get(ws);
    if (!clientInfo?.roomId || !clientInfo?.playerId) {
      throw new Error('Not in a room');
    }

    const room = this.roomManager.getRoom(clientInfo.roomId);
    if (!room) {
      throw new Error('Room not found');
    }

    const player = room.getPlayer(clientInfo.playerId);
    if (!player?.isHost) {
      throw new Error('Only host can restart the game');
    }

    room.restartGame();

    this.broadcastToRoom(room.id, {
      type: 'game_restarted',
      payload: {
        publicState: room.getPublicState()
      }
    });

    console.log(`[WebSocket Server] Game restarted in room ${room.code}`);
  }

  private handleDisconnect(ws: WebSocket) {
    const clientInfo = this.clients.get(ws);

    if (clientInfo?.roomId && clientInfo?.playerId) {
      const room = this.roomManager.getRoom(clientInfo.roomId);
      if (room) {
        room.disconnectPlayer(this.getConnectionId(ws));

        this.broadcastToRoom(room.id, {
          type: 'player_disconnected',
          payload: {
            playerId: clientInfo.playerId,
            publicState: room.getPublicState()
          }
        });

        console.log(`[WebSocket Server] Player ${clientInfo.playerId} disconnected from room ${room.code}`);
      }
    }

    this.clients.delete(ws);
    console.log('[WebSocket Server] Connection closed');
  }

  private send(ws: WebSocket, message: WebSocketMessage) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  private sendError(ws: WebSocket, error: string) {
    this.send(ws, {
      type: 'error',
      payload: { error }
    });
  }

  private broadcastToRoom(roomId: string, message: WebSocketMessage) {
    for (const [ws, clientInfo] of this.clients.entries()) {
      if (clientInfo.roomId === roomId) {
        this.send(ws, message);
      }
    }
  }

  private findWebSocketByPlayerId(playerId: string): WebSocket | null {
    for (const [ws, clientInfo] of this.clients.entries()) {
      if (clientInfo.playerId === playerId) {
        return ws;
      }
    }
    return null;
  }

  private getConnectionId(ws: WebSocket): string {
    // Используем уникальный идентификатор для каждого WebSocket соединения
    return (ws as any)._socket?.remoteAddress + ':' + (ws as any)._socket?.remotePort || String(Math.random());
  }

  public close() {
    this.wss.close();
    console.log('[WebSocket Server] Closed');
  }
}
