import { GameSession, GameStatus } from '../domain/models/GameSession';
import { Player } from '../domain/models/Player';
import { Character } from '../domain/models/Character';
import { v4 as uuidv4 } from 'uuid';

export interface RoomPlayer {
  id: string;
  connectionId: string;
  name: string;
  isHost: boolean;
  isConnected: boolean;
}

export class GameRoom {
  public readonly id: string;
  public readonly code: string;
  private players: Map<string, RoomPlayer> = new Map();
  private gameSession: GameSession | null = null;
  private characters: Character[];
  public createdAt: Date = new Date();
  public lastActivityAt: Date = new Date();

  constructor(code: string, characters: Character[]) {
    this.id = uuidv4();
    this.code = code;
    this.characters = characters;
  }

  addPlayer(connectionId: string, name: string, isHost: boolean = false): RoomPlayer {
    const playerId = uuidv4();
    const player: RoomPlayer = {
      id: playerId,
      connectionId,
      name,
      isHost,
      isConnected: true
    };

    this.players.set(playerId, player);
    this.lastActivityAt = new Date();
    return player;
  }

  removePlayer(playerId: string): boolean {
    const removed = this.players.delete(playerId);
    this.lastActivityAt = new Date();
    return removed;
  }

  disconnectPlayer(connectionId: string): string | null {
    for (const [playerId, player] of this.players.entries()) {
      if (player.connectionId === connectionId) {
        player.isConnected = false;
        this.lastActivityAt = new Date();
        return playerId;
      }
    }
    return null;
  }

  reconnectPlayer(playerId: string, newConnectionId: string): boolean {
    const player = this.players.get(playerId);
    if (player) {
      player.connectionId = newConnectionId;
      player.isConnected = true;
      this.lastActivityAt = new Date();
      return true;
    }
    return false;
  }

  getPlayer(playerId: string): RoomPlayer | undefined {
    return this.players.get(playerId);
  }

  getPlayerByConnectionId(connectionId: string): RoomPlayer | undefined {
    for (const player of this.players.values()) {
      if (player.connectionId === connectionId) {
        return player;
      }
    }
    return undefined;
  }

  getAllPlayers(): RoomPlayer[] {
    return Array.from(this.players.values());
  }

  getConnectedPlayers(): RoomPlayer[] {
    return Array.from(this.players.values()).filter(p => p.isConnected);
  }

  getHost(): RoomPlayer | undefined {
    return Array.from(this.players.values()).find(p => p.isHost);
  }

  canStartGame(): boolean {
    return this.getConnectedPlayers().length >= 3 && this.gameSession?.status !== GameStatus.IN_PROGRESS;
  }

  startGame(spyCount: number = 1): GameSession {
    const connectedPlayers = this.getConnectedPlayers();

    if (connectedPlayers.length < 3) {
      throw new Error('Minimum 3 players required');
    }

    // Создаем игроков для GameSession
    const gamePlayers = connectedPlayers.map(rp =>
      new Player(rp.id, rp.name, false, false)
    );

    // Назначаем роли случайным образом
    const shuffled = [...gamePlayers].sort(() => Math.random() - 0.5);
    const playersWithRoles = shuffled.map((player, index) =>
      new Player(player.id, player.name, index < spyCount, false)
    );

    // Выбираем случайного персонажа
    const randomCharacter = this.characters[Math.floor(Math.random() * this.characters.length)];

    // Создаем игровую сессию
    this.gameSession = new GameSession(
      this.id,
      playersWithRoles,
      this.characters,
      randomCharacter,
      GameStatus.IN_PROGRESS,
      spyCount
    );

    this.lastActivityAt = new Date();
    return this.gameSession;
  }

  getGameSession(): GameSession | null {
    return this.gameSession;
  }

  togglePlayerStrikeOut(playerId: string): GameSession {
    if (!this.gameSession) {
      throw new Error('Game not started');
    }

    const updatedPlayers = this.gameSession.players.map(player =>
      player.id === playerId
        ? player.isStrikedOut
          ? player.unstrikeOut()
          : player.strikeOut()
        : player
    );

    this.gameSession = this.gameSession.updatePlayers(updatedPlayers);
    this.lastActivityAt = new Date();
    return this.gameSession;
  }

  toggleCharacterStrikeOut(characterId: string): GameSession {
    if (!this.gameSession) {
      throw new Error('Game not started');
    }

    const updatedCharacters = this.gameSession.characters.map(character =>
      character.id === characterId
        ? character.isStrikedOut
          ? character.unstrikeOut()
          : character.strikeOut()
        : character
    );

    this.gameSession = this.gameSession.updateCharacters(updatedCharacters);
    this.lastActivityAt = new Date();
    return this.gameSession;
  }

  restartGame(): void {
    if (this.gameSession) {
      this.gameSession = this.gameSession.resetGame();
      this.lastActivityAt = new Date();
    }
  }

  // Получить публичное состояние (без приватных данных о шпионах)
  getPublicState() {
    return {
      roomId: this.id,
      code: this.code,
      players: this.getAllPlayers().map(p => ({
        id: p.id,
        name: p.name,
        isHost: p.isHost,
        isConnected: p.isConnected
      })),
      gameSession: this.gameSession ? {
        id: this.gameSession.id,
        status: this.gameSession.status,
        players: this.gameSession.players.map(p => ({
          id: p.id,
          name: p.name,
          isStrikedOut: p.isStrikedOut,
          // НЕ отправляем isSpy!
        })),
        characters: this.gameSession.characters,
        spyCount: this.gameSession.spyCount
        // НЕ отправляем assignedCharacter!
      } : null
    };
  }

  // Получить приватное состояние для конкретного игрока
  getPrivateStateForPlayer(playerId: string) {
    const gamePlayer = this.gameSession?.players.find(p => p.id === playerId);

    return {
      isSpy: gamePlayer?.isSpy || false,
      assignedCharacter: gamePlayer?.isSpy ? null : this.gameSession?.assignedCharacter
    };
  }

  isEmpty(): boolean {
    return this.getConnectedPlayers().length === 0;
  }

  isStale(maxInactiveMinutes: number = 60): boolean {
    const now = new Date();
    const diffMs = now.getTime() - this.lastActivityAt.getTime();
    const diffMinutes = diffMs / (1000 * 60);
    return diffMinutes > maxInactiveMinutes;
  }
}
