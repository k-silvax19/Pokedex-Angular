import {
  concatMap,
  EMPTY,
  expand,
  forkJoin,
  map,
  Observable,
  of,
  scan,
  shareReplay,
  switchMap,
} from 'rxjs';

import { HttpClient } from '@angular/common/http';
import { inject, Injectable, InjectionToken } from '@angular/core';

import { Pokemon, PokemonDetails } from '../pokemon.model';
import { EspeciePokemonRespostaHttp, ObjetoRespostaHttp, PokemonRespostaHttp } from './pokemon.dto';

export const POKE_API_URL = new InjectionToken<string>('POKE_API_URL');

function mapearRespostaPokemon(dto: PokemonRespostaHttp): Pokemon {
  return {
    id: dto.id,
    name: dto.name,
    types: dto.types.map((item) => item.type.name),
    spriteUrl:
      dto.sprites.front_default ?? dto.sprites.other?.['official-artwork']?.front_default ?? null,
    shinySpriteUrl:
      dto.sprites.front_shiny ?? dto.sprites.other?.['official-artwork']?.front_shiny ?? null,
    speciesUrl: dto.species.url,
    artworkUrl: dto.sprites.other?.['official-artwork']?.front_default ?? dto.sprites.front_default,
  };
}

function mapearRespostaDetalhesPokemon(dto: PokemonRespostaHttp): PokemonDetails {
  return {
    ...mapearRespostaPokemon(dto),
    imageUrl: dto.sprites.other?.['official-artwork']?.front_default ?? dto.sprites.front_default,
    shinyImageUrl:
      dto.sprites.other?.['official-artwork']?.front_shiny ?? dto.sprites.front_shiny ?? null,
    audioUrl: dto.cries?.latest ?? dto.cries?.legacy ?? null,
    height: dto.height,
    weight: dto.weight,
    abilities: dto.abilities.map(({ ability }) => ability.name),
    stats: dto.stats.map(({ stat, base_stat }) => ({ name: stat.name, baseValue: base_stat })),
  };
}

@Injectable({ providedIn: 'root' })
export class PokemonService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(POKE_API_URL);
  private readonly formasCache = new Map<string, Observable<PokemonDetails[]>>();

  listarFormas(pokemon: PokemonDetails): Observable<PokemonDetails[]> {
    const cached = this.formasCache.get(pokemon.speciesUrl);
    if (cached) return cached;

    const formas = this.http.get<EspeciePokemonRespostaHttp>(pokemon.speciesUrl).pipe(
      switchMap((especie) =>
        forkJoin(
          especie.varieties.map((variedade) =>
            variedade.pokemon.name === pokemon.name
              ? of(pokemon)
              : this.http
                  .get<PokemonRespostaHttp>(variedade.pokemon.url)
                  .pipe(map(mapearRespostaDetalhesPokemon)),
          ),
        ),
      ),
      shareReplay({ bufferSize: 1, refCount: true }),
    );
    this.formasCache.set(pokemon.speciesUrl, formas);
    return formas;
  }

  listar(): Observable<Pokemon[]> {
    return this.http.get<ObjetoRespostaHttp>(this.apiUrl).pipe(
      expand((obj) => (obj.next ? this.http.get<ObjetoRespostaHttp>(obj.next) : EMPTY)),
      concatMap((obj) => {
        const requisicoes = obj.results.map((r) => this.http.get<PokemonRespostaHttp>(r.url));

        return forkJoin(requisicoes);
      }),
      map((detalhes: PokemonRespostaHttp[]): Pokemon[] =>
        detalhes.filter((pokemon) => pokemon.is_default).map(mapearRespostaPokemon),
      ),
      scan((pokemon: Pokemon[], pagina: Pokemon[]) => [...pokemon, ...pagina], []),
    );
  }

  buscarPorNome(nome: string): Observable<PokemonDetails> {
    const nomeNormalizado = nome.trim().toLowerCase();

    return this.http
      .get<PokemonRespostaHttp>(`${this.apiUrl}${encodeURIComponent(nomeNormalizado)}`)
      .pipe(map(mapearRespostaDetalhesPokemon));
  }

  buscarPorId(id: number): Observable<PokemonDetails> {
    return this.http
      .get<PokemonRespostaHttp>(`${this.apiUrl}${id}`)
      .pipe(map(mapearRespostaDetalhesPokemon));
  }
}
