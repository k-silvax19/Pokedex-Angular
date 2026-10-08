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
  id: number;
  name: string;
  types: TipoPokemonRespostaHttp[];
  sprites: {
    front_default: string | null;
  };
}

