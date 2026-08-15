import { GameSession } from '../models/GameSession';
import { Player } from '../models/Player';

export interface IGameService {
  createSession(playerName: string): GameSession;
  joinSession(sessionId: string, playerName: string): GameSession;
  startGame(session: GameSession): GameSession;
  togglePlayerStrikeOut(session: GameSession, playerId: string): GameSession;
  toggleCharacterStrikeOut(session: GameSession, characterId: string): GameSession;
  restartGame(session: GameSession): GameSession;
}
