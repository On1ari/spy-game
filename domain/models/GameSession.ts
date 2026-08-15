import { Player } from './Player';
import { Character } from './Character';

export enum GameStatus {
  LOBBY = 'LOBBY',
  IN_PROGRESS = 'IN_PROGRESS',
  FINISHED = 'FINISHED'
}

export class GameSession {
  constructor(
    public readonly id: string,
    public readonly players: Player[],
    public readonly characters: Character[],
    public readonly assignedCharacter: Character | null,
    public readonly status: GameStatus,
    public readonly spyCount: number = 1
  ) {}

  addPlayer(player: Player): GameSession {
    return new GameSession(
      this.id,
      [...this.players, player],
      this.characters,
      this.assignedCharacter,
      this.status,
      this.spyCount
    );
  }

  removePlayer(playerId: string): GameSession {
    return new GameSession(
      this.id,
      this.players.filter(p => p.id !== playerId),
      this.characters,
      this.assignedCharacter,
      this.status,
      this.spyCount
    );
  }

  startGame(assignedCharacter: Character, playersWithRoles: Player[]): GameSession {
    return new GameSession(
      this.id,
      playersWithRoles,
      this.characters,
      assignedCharacter,
      GameStatus.IN_PROGRESS,
      this.spyCount
    );
  }

  updateCharacters(characters: Character[]): GameSession {
    return new GameSession(
      this.id,
      this.players,
      characters,
      this.assignedCharacter,
      this.status,
      this.spyCount
    );
  }

  updatePlayers(players: Player[]): GameSession {
    return new GameSession(
      this.id,
      players,
      this.characters,
      this.assignedCharacter,
      this.status,
      this.spyCount
    );
  }

  resetGame(): GameSession {
    return new GameSession(
      this.id,
      this.players.map(p => new Player(p.id, p.name, false, false)),
      this.characters.map(c => new Character(c.id, c.name, c.imageUrl, false)),
      null,
      GameStatus.LOBBY,
      this.spyCount
    );
  }
}
