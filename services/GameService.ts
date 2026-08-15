import { GameSession, GameStatus } from '../domain/models/GameSession';
import { Player } from '../domain/models/Player';
import { Character } from '../domain/models/Character';
import { IGameService } from '../domain/interfaces/IGameService';
import { ICharacterRepository } from '../domain/interfaces/ICharacterRepository';

export class GameService implements IGameService {
  constructor(private characterRepository: ICharacterRepository) {}

  createSession(playerName: string): GameSession {
    const sessionId = this.generateSessionId();
    const player = new Player(this.generatePlayerId(), playerName, false);
    const characters = this.characterRepository.getAllCharacters();

    return new GameSession(
      sessionId,
      [player],
      characters,
      null,
      GameStatus.LOBBY,
      1
    );
  }

  joinSession(sessionId: string, playerName: string): GameSession {
    throw new Error('Method not implemented for MVP - using local state');
  }

  startGame(session: GameSession): GameSession {
    if (session.players.length < 3) {
      throw new Error('Minimum 3 players required');
    }

    const playersWithRoles = this.assignRoles(session.players, session.spyCount);
    const assignedCharacter = this.characterRepository.getRandomCharacter();

    return session.startGame(assignedCharacter, playersWithRoles);
  }

  togglePlayerStrikeOut(session: GameSession, playerId: string): GameSession {
    const updatedPlayers = session.players.map(player =>
      player.id === playerId
        ? player.isStrikedOut
          ? player.unstrikeOut()
          : player.strikeOut()
        : player
    );

    return session.updatePlayers(updatedPlayers);
  }

  toggleCharacterStrikeOut(session: GameSession, characterId: string): GameSession {
    const updatedCharacters = session.characters.map(character =>
      character.id === characterId
        ? character.isStrikedOut
          ? character.unstrikeOut()
          : character.strikeOut()
        : character
    );

    return session.updateCharacters(updatedCharacters);
  }

  restartGame(session: GameSession): GameSession {
    return session.resetGame();
  }

  private assignRoles(players: Player[], spyCount: number): Player[] {
    const shuffled = [...players].sort(() => Math.random() - 0.5);

    return shuffled.map((player, index) =>
      new Player(player.id, player.name, index < spyCount, false)
    );
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generatePlayerId(): string {
    return `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
