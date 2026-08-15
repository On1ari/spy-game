export class Character {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly imageUrl?: string,
    public isStrikedOut: boolean = false
  ) {}

  strikeOut(): Character {
    return new Character(this.id, this.name, this.imageUrl, true);
  }

  unstrikeOut(): Character {
    return new Character(this.id, this.name, this.imageUrl, false);
  }
}
