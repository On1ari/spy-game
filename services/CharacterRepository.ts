import { Character } from '../domain/models/Character';
import { ICharacterRepository } from '../domain/interfaces/ICharacterRepository';
import { BRAWL_STARS_CHARACTERS } from '../utils/characters';

export class BrawlStarsCharacterRepository implements ICharacterRepository {
  private characters: Character[];

  constructor() {
    this.characters = BRAWL_STARS_CHARACTERS.map(
      char => new Character(char.id, char.name)
    );
  }

  getAllCharacters(): Character[] {
    return this.characters;
  }

  getRandomCharacter(): Character {
    const randomIndex = Math.floor(Math.random() * this.characters.length);
    return this.characters[randomIndex];
  }
}
