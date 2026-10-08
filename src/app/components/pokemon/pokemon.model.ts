export interface Pokemon {
  id: number;
  name: string;
  types: string[];
  sprite: string | null;
}

export interface PokemonStat {
  readonly name: string;
  readonly baseValue: number;
}

export interface PokemonDetails extends Pokemon {
  readonly imageUrl: string | null;
  readonly audioUrl: string | null;
  readonly height: number;
  readonly weight: number;
  readonly abilities: readonly string[];
  readonly stats: readonly PokemonStat[];
}

export interface PokemonTypeViewModel {
  readonly name: string;
  readonly displayName: string;
  readonly color: string;
}
