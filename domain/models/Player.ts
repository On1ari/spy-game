export class Player {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public isSpy: boolean,
    public isStrikedOut: boolean = false
  ) {}

  strikeOut(): Player {
    return new Player(this.id, this.name, this.isSpy, true);
  }

  unstrikeOut(): Player {
    return new Player(this.id, this.name, this.isSpy, false);
  }
}
