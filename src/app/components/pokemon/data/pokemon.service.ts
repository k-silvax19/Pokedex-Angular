import { HttpClient } from '@angular/common/http';
import { inject, Injectable, InjectionToken } from '@angular/core';
import { forkJoin, map, Observable, switchMap } from 'rxjs';
import { ObjetoRespostaHttp, PokemonRespostaHttp } from './pokemon.dto';
import { PokemonDetails, Pokemon } from '../pokemon.model';

export const POKE_API_URL = new InjectionToken<string>('POKE_API_URL');

function mapearRespostaPokemon(dto: PokemonRespostaHttp): Pokemon {
  return {
    id: dto.id,
    name: dto.name,
    types: dto.types.map((item) => item.type.name),
    sprite: dto.sprites.front_default,
  };
}

function mapearRespostaDetalhesPokemon(dto: PokemonRespostaHttp): PokemonDetails {
  return {
    ...mapearRespostaPokemon(dto),
    imageUrl: dto.sprites.other?.['official-artwork']?.front_default ?? dto.sprites.front_default,
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

  listar(): Observable<Pokemon[]> {
    return this.http.get<ObjetoRespostaHttp>(this.apiUrl).pipe(
      switchMap((obj) => {
        const requisicoes = obj.results.map((r) => this.http.get<PokemonRespostaHttp>(r.url));

        return forkJoin(requisicoes);
      }),
      map((detalhes: PokemonRespostaHttp[]): Pokemon[] => detalhes.map(mapearRespostaPokemon)),
    );
  }

  buscarPorNome(name: string): Observable<PokemonDetails> {
    const nomeNormalizado = name.trim().toLowerCase();
    const urlCompleto = `${this.apiUrl}${nomeNormalizado}`;
    return this.http.get<PokemonRespostaHttp>(urlCompleto).pipe(map(mapearRespostaDetalhesPokemon));
  }
}
