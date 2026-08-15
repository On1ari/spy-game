import { useState, useCallback } from 'react';
import { GameSession } from '../domain/models/GameSession';
import { Player } from '../domain/models/Player';
import { IGameService } from '../domain/interfaces/IGameService';

export const useGameSession = (gameService: IGameService) => {
  const [session, setSession] = useState<GameSession | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);

  const createSession = useCallback((playerName: string) => {
    const newSession = gameService.createSession(playerName);
    setSession(newSession);
    setCurrentPlayer(newSession.players[0]);
  }, [gameService]);

  const addPlayer = useCallback((playerName: string) => {
    if (!session) return;

    const newPlayer = new Player(
      `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      playerName,
      false
    );
    const updatedSession = session.addPlayer(newPlayer);
    setSession(updatedSession);
  }, [session]);

  const removePlayer = useCallback((playerId: string) => {
    if (!session) return;

    const updatedSession = session.removePlayer(playerId);
    setSession(updatedSession);
  }, [session]);

  const startGame = useCallback(() => {
    if (!session) return;

    const updatedSession = gameService.startGame(session);
    setSession(updatedSession);
  }, [session, gameService]);

  const togglePlayerStrikeOut = useCallback((playerId: string) => {
    if (!session) return;

    const updatedSession = gameService.togglePlayerStrikeOut(session, playerId);
    setSession(updatedSession);
  }, [session, gameService]);

  const toggleCharacterStrikeOut = useCallback((characterId: string) => {
    if (!session) return;

    const updatedSession = gameService.toggleCharacterStrikeOut(session, characterId);
    setSession(updatedSession);
  }, [session, gameService]);

  const restartGame = useCallback(() => {
    if (!session) return;

    const updatedSession = gameService.restartGame(session);
    setSession(updatedSession);
  }, [session, gameService]);

  return {
    session,
    currentPlayer,
    createSession,
    addPlayer,
    removePlayer,
    startGame,
    togglePlayerStrikeOut,
    toggleCharacterStrikeOut,
    restartGame
  };
};
