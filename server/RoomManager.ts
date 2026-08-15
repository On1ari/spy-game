import { GameRoom } from './GameRoom';
import { Character } from '../domain/models/Character';

export class RoomManager {
  private rooms: Map<string, GameRoom> = new Map();
  private codeToRoomId: Map<string, string> = new Map();
  private characters: Character[];

  constructor(characters: Character[]) {
    this.characters = characters;
    this.startCleanupInterval();
  }

  generateRoomCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code: string;

    do {
      code = '';
      for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
    } while (this.codeToRoomId.has(code));

    return code;
  }

  createRoom(): GameRoom {
    const code = this.generateRoomCode();
    const room = new GameRoom(code, this.characters);

    this.rooms.set(room.id, room);
    this.codeToRoomId.set(code, room.id);

    console.log(`[RoomManager] Room created: ${code} (${room.id})`);
    return room;
  }

  getRoom(roomId: string): GameRoom | undefined {
    return this.rooms.get(roomId);
  }

  getRoomByCode(code: string): GameRoom | undefined {
    const roomId = this.codeToRoomId.get(code.toUpperCase());
    return roomId ? this.rooms.get(roomId) : undefined;
  }

  deleteRoom(roomId: string): boolean {
    const room = this.rooms.get(roomId);
    if (room) {
      this.codeToRoomId.delete(room.code);
      this.rooms.delete(roomId);
      console.log(`[RoomManager] Room deleted: ${room.code} (${roomId})`);
      return true;
    }
    return false;
  }

  getAllRooms(): GameRoom[] {
    return Array.from(this.rooms.values());
  }

  private startCleanupInterval() {
    // Очищаем пустые и устаревшие комнаты каждые 5 минут
    setInterval(() => {
      this.cleanupRooms();
    }, 5 * 60 * 1000);
  }

  private cleanupRooms() {
    const roomsToDelete: string[] = [];

    for (const room of this.rooms.values()) {
      if (room.isEmpty() || room.isStale(60)) {
        roomsToDelete.push(room.id);
      }
    }

    roomsToDelete.forEach(roomId => {
      this.deleteRoom(roomId);
    });

    if (roomsToDelete.length > 0) {
      console.log(`[RoomManager] Cleaned up ${roomsToDelete.length} stale rooms`);
    }
  }

  getRoomStats() {
    return {
      totalRooms: this.rooms.size,
      activeRooms: Array.from(this.rooms.values()).filter(r => !r.isEmpty()).length,
      totalPlayers: Array.from(this.rooms.values()).reduce(
        (sum, room) => sum + room.getConnectedPlayers().length,
        0
      )
    };
  }
}
