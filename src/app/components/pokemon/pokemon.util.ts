import { PokemonTypeViewModel } from './pokemon.model';

export const DEFAULT_TYPE_COLOR = '#6C757D';

export const TYPE_COLORS: Readonly<Record<string, string>> = {
  normal: '#9CA3AF',
  fire: '#FF6B6B',
  water: '#4DABF7',
  electric: '#FCC419',
  grass: '#51CF66',
  ice: '#99E9F2',
  fighting: '#FA5252',
  poison: '#CC5DE8',
  ground: '#EAA636',
  flying: '#84A59D',
  psychic: '#FF92A5',
  bug: '#94D82D',
  rock: '#B0A383',
  ghost: '#845EF7',
  dragon: '#5C7CFA',
  dark: '#858995',
  steel: '#ADB5BD',
  fairy: '#FFB8D2',
};

export function paraTitleCase(texto: string): string {
  return texto.toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase());
}

export function paraTiposViewModel(types: readonly string[]): readonly PokemonTypeViewModel[] {
  return types.map((type) => ({
    name: type,
    displayName: paraTitleCase(type),
    color: obterCorDoTipo(type.toLowerCase()),
  }));
}

export function obterCorDoTipo(tipos: string): string {
  return TYPE_COLORS[tipos] ?? DEFAULT_TYPE_COLOR;
}

export function obterCorDeBackgroundDosTipos(tipo: readonly PokemonTypeViewModel[]): string {
  const primeiraCor = tipo[0]?.color ?? DEFAULT_TYPE_COLOR;
  const segundaCor = tipo[1]?.color ?? primeiraCor;

  return `linear-gradient(var(--bs-card-bg), var(--bs-card-bg)) padding-box, linear-gradient(135deg, ${primeiraCor} 0 50%, ${segundaCor} 50% 100%) border-box`;
}
