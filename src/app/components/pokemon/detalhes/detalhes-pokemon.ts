import { catchError, forkJoin, map, Observable, of, startWith, switchMap } from 'rxjs';

import { Component, computed, effect, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { PokemonService } from '../data/pokemon.service';
import { FavoritosService } from '../favoritos/favoritos.service';
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
  const displayName = paraTitleCase(
    dto.name.replace(/-gmax\b/g, '-gigantamax').replaceAll('-', ' '),
  );
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
  private readonly route = inject(ActivatedRoute); // Permite acesso à dados da rota atual
  private readonly pokemonService = inject(PokemonService);
  private readonly favoritosService = inject(FavoritosService);

  private readonly dados = toSignal(
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
    ),
  );

  readonly selecionado = signal<PokemonDetails | null>(null);
  readonly shiny = signal(false);
  private readonly tentativa = signal(0);
  private readonly pedidoFormas = computed(() => ({
    base: this.dados()?.pokemon,
    tentativa: this.tentativa(),
  }));
  readonly formas = toSignal(
    toObservable(this.pedidoFormas).pipe(
      switchMap(({ base }) =>
        base
          ? this.pokemonService.listarFormas(base).pipe(
              map((opcoes) => ({ opcoes, carregando: false, erro: false })),
              startWith({ opcoes: [] as PokemonDetails[], carregando: true, erro: false }),
              catchError(() =>
                of({ opcoes: [] as PokemonDetails[], carregando: false, erro: true }),
              ),
            )
          : of({ opcoes: [] as PokemonDetails[], carregando: true, erro: false }),
      ),
    ),
    { initialValue: { opcoes: [] as PokemonDetails[], carregando: true, erro: false } },
  );
  readonly atual = computed(() => this.selecionado() ?? this.dados()?.pokemon);
  readonly pokemon = computed(() => {
    const dados = this.dados();
    const atual = this.atual();
    return dados && atual ? paraDetalhesViewModel(atual, dados.previous, dados.next) : undefined;
  });
  readonly imagem = computed(() =>
    this.shiny() ? this.atual()?.shinyImageUrl : this.atual()?.imageUrl,
  );

  constructor() {
    effect(() => {
      this.dados();
      this.selecionado.set(null);
      this.shiny.set(false);
    });
  }

  nomeForma(forma: PokemonDetails): string {
    const base = this.formas().opcoes[0];
    if (base?.name === forma.name) return 'Original';
    const prefixo = base?.name.split('-')[0];
    const nome =
      prefixo && forma.name.startsWith(prefixo + '-')
        ? forma.name.slice(prefixo.length + 1)
        : forma.name;
    return paraTitleCase(nome.replace(/gmax\b/g, 'gigantamax').replaceAll('-', ' '));
  }

  selecionarForma(forma: PokemonDetails): void {
    this.selecionado.set(forma);
    if (!forma.shinyImageUrl) this.shiny.set(false);
  }

  tentarFormas(): void {
    this.tentativa.update((valor) => valor + 1);
  }

  readonly estaFavoritado = computed(() =>
    this.pokemon() ? this.favoritosService.estaComoFavorito(this.pokemon()!.id) : false,
  );

  alternarStatusFavorito(): void {
    const pokemonSelecionado = this.pokemon();

    if (!pokemonSelecionado) return;

    this.favoritosService.alternar({
      id: pokemonSelecionado.id,
      name: pokemonSelecionado.name,
      spriteUrl: pokemonSelecionado.spriteUrl,
    });
  }

  private buscarVizinho(id: number): Observable<PokemonDetails | null> {
    if (id < 1) {
      return of(null);
    }

    return this.pokemonService.buscarPorId(id).pipe(catchError(() => of(null)));
  }
}
