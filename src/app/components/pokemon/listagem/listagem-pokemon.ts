import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { PokemonService } from '../data/pokemon.service';
import { Pokemon } from '../pokemon.model';
import { map } from 'rxjs';

interface PokemonTypeViewModel {
  readonly name: string;
  readonly displayName: string;
  readonly color: string;
}

interface PokemonCardViewModel {
  readonly id: number;
  readonly displayName: string;
  readonly imageUrl: string | null;
  readonly imageAlt: string;
  readonly types: readonly PokemonTypeViewModel[];
  readonly background: string;
}

const DEFAULT_TYPE_COLOR = '#6C757D';

const TYPE_COLORS: Readonly<Record<string, string>> = {
  normal: '#A8A77A',
  fire: '#EE8130',
  water: '#6390F0',
  electric: '#F7D02C',
  grass: '#7AC74C',
  ice: '#96D9D6',
  fighting: '#C22E28',
  poison: '#A33EA1',
  ground: '#E2BF65',
  flying: '#A98FF3',
  psychic: '#F95587',
  bug: '#A6B91A',
  rock: '#B6A136',
  ghost: '#735797',
  dragon: '#6F35FC',
  dark: '#705746',
  steel: '#B7B7CE',
  fairy: '#D685AD',
};

export function paraTitleCase(texto: string): string {
  // Este regex (/\b\w/g) varre o texto procurando a primeira letra de cada palavra
  return texto.toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase());
}

function obterCorDoTipo(type: string): string {
  return TYPE_COLORS[type] ?? DEFAULT_TYPE_COLOR;
}

function paraCardViewModel(dto: Pokemon): PokemonCardViewModel {
  const displayName = paraTitleCase(dto.name);
  const types = dto.types.map((type) => ({
    name: type,
    displayName: paraTitleCase(type),
    color: obterCorDoTipo(type.toLowerCase()),
  }));

  const primeiraCor = types[0]?.color ?? DEFAULT_TYPE_COLOR;
  const segundaCor = types[1]?.color ?? primeiraCor;

  return {
    id: dto.id,
    displayName: displayName,
    imageUrl: dto.sprite,
    imageAlt: `Imagem de ${displayName}`,
    types: types,
    background: `linear-gradient(var(--bs-card-bg), var(--bs-card-bg)) padding-box, linear-gradient(135deg, ${primeiraCor} 0 50%, ${segundaCor} 50% 100%) border-box`,
  };
}

@Component({
  imports: [],
  selector: 'app-listagem-pokemon',
  templateUrl: './listagem-pokemon.html',
})
export class ListagemPokemon {
  protected readonly pokemonService = inject(PokemonService);

  protected readonly pokemon = toSignal(
    this.pokemonService.listar().pipe(map((pokemon) => pokemon.map(paraCardViewModel))),
    {
      initialValue: [] as PokemonCardViewModel[],
    },
  );
}