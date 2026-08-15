import { Character } from '../models/Character';

export interface ICharacterRepository {
  getAllCharacters(): Character[];
  getRandomCharacter(): Character;
}
