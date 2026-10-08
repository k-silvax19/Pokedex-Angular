export interface ResultadoObjetoHttp {
  name: string;
  url: string;
}

export interface ObjetoRespostaHttp {
  count: number;
  next: string | null;
  previous: string | null;
  results: ResultadoObjetoHttp[];
}

export interface TipoPokemonRespostaHttp {
  type: {
    name: string;
  };
}

export interface PokemonRespostaHttp {
  readonly id: number;
  readonly name: string;
  readonly types: readonly TipoPokemonRespostaHttp[];
  readonly height: number;
  readonly weight: number;
  readonly abilities: readonly HabilidadePokemonRespostaHttp[];
  readonly stats: readonly EstatisticaPokemonRespostaHttp[];
  readonly cries?: SomPokemonRespostaHttp;
  readonly sprites: {
    readonly front_default: string | null;
    readonly other?: {
      readonly 'official-artwork'?: {
        readonly front_default: string | null;
      };
    };
  };
}
export interface SomPokemonRespostaHttp {
  readonly latest: string | null;
  readonly legacy: string | null;
}

export interface HabilidadePokemonRespostaHttp {
  readonly ability: {
    readonly name: string;
  };
}

export interface EstatisticaPokemonRespostaHttp {
  readonly base_stat: number;
  readonly stat: {
    readonly name: string;
  };
}
