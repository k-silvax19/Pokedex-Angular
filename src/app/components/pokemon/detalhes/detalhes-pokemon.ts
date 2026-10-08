import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import {map, switchMap} from 'rxjs';
import { PokemonService } from '../data/pokemon.service';
import { PokemonDetails, PokemonTypeViewModel } from '../pokemon.model';
import {
  obterCorDeBackgroundDosTipos,
  obterCorDoTipo,
  paraTiposViewModel,
  paraTitleCase,
} from '../pokemon.util';

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

interface PokemonDetailsViewModel {
  readonly id: number;
  readonly number: string;
  readonly name: string;
  readonly displayName: string;
  readonly imageUrl: string | null;
  readonly imageAlt: string;
  readonly audioUrl: string | null;
  readonly height: string;
  readonly weight: string;
  readonly types: readonly PokemonTypeViewModel[];
  readonly abilities: readonly PokemonAbilityViewModel[];
  readonly stats: readonly PokemonStatViewModel[];
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

function paraDetalhesViewModel(dto: PokemonDetails): PokemonDetailsViewModel {
  const displayName = paraTitleCase(dto.name);

  return {
    id: dto.id,
    number: paraNumeroPokemon(dto.id),
    name: dto.name,
    displayName: displayName,
    imageUrl: dto.imageUrl,
    imageAlt: `Imagem de ${displayName}`,
    audioUrl: dto.audioUrl,
    height: paraAlturaPokemon(dto.height),
    weight: paraPesoPokemon(dto.weight),
    types: paraTiposViewModel(dto.types),
    abilities: dto.abilities.map((name) => ({ name: name, displayName: paraTitleCase(name), })),
    stats: dto.stats.map(({ name, baseValue }) => ({
      name: name,
      displayName: paraNomeEstatistica(name),
      value: baseValue,
      percentage: obterPercentualEstatistica(baseValue),
    }))
  };
}

@Component({
  imports: [],
  selector: 'app-detalhes-pokemon',
  templateUrl: './detalhes-pokemon.html',
})
export class DetalhesPokemon {
  private readonly route = inject(ActivatedRoute);
  private readonly pokemonService = inject(PokemonService);

  protected readonly pokemon = toSignal(
    this.route.paramMap.pipe(
      map((params) => params.get('name') ?? ''),
      switchMap((name) => this.pokemonService.buscarPorNome(name)),
      map(paraDetalhesViewModel),
    ),
  );
}
