import { catchError, forkJoin, map, Observable, of, switchMap } from 'rxjs';

import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { PokemonService } from '../data/pokemon.service';
import { PokemonDetails, PokemonTypeViewModel } from '../pokemon.model';
import { obterCorDeBackgroundDosTipos, paraTiposViewModel, paraTitleCase } from '../pokemon.util';
interface PokemonAbilityViewModel {
  readonly name: string;
  readonly displayName: string;
}

interface PokemonStatViewModel {
  readonly name: string;
  readonly displayName: string;
  readonly value: number;
  readonly percentage: number;
}

interface PokemonNavigationViewModel {
  readonly id: number;
  readonly number: string;
  readonly name: string;
  readonly displayName: string;
  readonly spriteUrl: string | null;
  readonly spriteAlt: string;
}

interface PokemonDetailsViewModel {
  readonly id: number;
  readonly number: string;
  readonly name: string;
  readonly displayName: string;
  readonly background: string;
  readonly spriteUrl: string | null;
  readonly imageUrl: string | null;
  readonly imageAlt: string;
  readonly audioUrl: string | null;
  readonly height: string;
  readonly weight: string;
  readonly types: readonly PokemonTypeViewModel[];
  readonly abilities: readonly PokemonAbilityViewModel[];
  readonly stats: readonly PokemonStatViewModel[];

  readonly previous: PokemonNavigationViewModel | null;
  readonly next: PokemonNavigationViewModel | null;
}

const STAT_LABELS: Readonly<Record<string, string>> = {
  hp: 'HP',
  attack: 'Ataque',
  defense: 'Defesa',
  'special-attack': 'Ataque especial',
  'special-defense': 'Defesa especial',
  speed: 'Velocidade',
};

function paraNumeroPokemon(id: number): string {
  return `#${id.toString().padStart(3, '0')}`;
}

function paraAlturaPokemon(height: number): string {
  return `${(height / 10).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} m`;
}

function paraPesoPokemon(weight: number): string {
  return `${(weight / 10).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} kg`;
}

function paraNomeEstatistica(name: string): string {
  return STAT_LABELS[name] ?? paraTitleCase(name);
}

function obterPercentualEstatistica(value: number): number {
  return Math.min((value / 255) * 100, 100);
}

function paraNavegacaoViewModel(dto: PokemonDetails | null): PokemonNavigationViewModel | null {
  if (!dto) {
    return null;
  }

  const displayName = paraTitleCase(dto.name);

  return {
    id: dto.id,
    number: paraNumeroPokemon(dto.id),
    name: dto.name,
    displayName: displayName,
    spriteUrl: dto.spriteUrl,
    spriteAlt: `Sprite de ${displayName}`,
  };
}

function paraDetalhesViewModel(
  dto: PokemonDetails,
  previous: PokemonDetails | null,
  next: PokemonDetails | null,
): PokemonDetailsViewModel {
  const displayName = paraTitleCase(dto.name);
  const types = paraTiposViewModel(dto.types);

  return {
    id: dto.id,
    number: paraNumeroPokemon(dto.id),
    name: dto.name,
    displayName: displayName,
    background: obterCorDeBackgroundDosTipos(types),
    spriteUrl: dto.spriteUrl,
    imageUrl: dto.imageUrl,
    imageAlt: `Imagem de ${displayName}`,
    audioUrl: dto.audioUrl,
    height: paraAlturaPokemon(dto.height),
    weight: paraPesoPokemon(dto.weight),
    types: types,
    abilities: dto.abilities.map((name) => ({ name: name, displayName: paraTitleCase(name) })),
    stats: dto.stats.map(({ name, baseValue }) => ({
      name: name,
      displayName: paraNomeEstatistica(name),
      value: baseValue,
      percentage: obterPercentualEstatistica(baseValue),
    })),

    previous: paraNavegacaoViewModel(previous),
    next: paraNavegacaoViewModel(next),
  };
}

@Component({
  imports: [RouterLink],
  selector: 'app-detalhes-pokemon',
  styleUrl: './detalhes-pokemon.scss',
  templateUrl: './detalhes-pokemon.html',
})
export class DetalhesPokemon {
  private readonly route = inject(ActivatedRoute);
  private readonly pokemonService = inject(PokemonService);

  protected readonly pokemon = toSignal(
    this.route.paramMap.pipe(
      map((params) => params.get('name') ?? ''),
      switchMap((nome) => this.pokemonService.buscarPorNome(nome)),
      switchMap((pokemon) =>
        forkJoin({
          pokemon: of(pokemon),
          previous: this.buscarVizinho(pokemon.id - 1),
          next: this.buscarVizinho(pokemon.id + 1),
        }),
      ),
      map(({ pokemon, previous, next }) => paraDetalhesViewModel(pokemon, previous, next)),
    ),
  );
  private buscarVizinho(id: number): Observable<PokemonDetails | null> {
    if (id < 1) {
      return of(null);
    }

    return this.pokemonService.buscarPorId(id).pipe(catchError(() => of(null)));
  }
}
