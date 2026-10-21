import { inject, Injectable, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of, startWith, Subject, switchMap } from 'rxjs';
import { PokemonService } from './pokemon.service';
import { Pokemon } from '../pokemon.model';
interface ResultadoPesquisa {
  termo: string;
  pokemon: Pokemon[];
  carregando: boolean;
  erro: boolean;
}
const PESQUISA_VAZIA: ResultadoPesquisa = {
  termo: '',
  pokemon: [],
  carregando: false,
  erro: false,
};

@Injectable({ providedIn: 'root' })
export class PesquisaPokemonService {
  private readonly service = inject(PokemonService);
  readonly textoPesquisa = signal('');
  private readonly pesquisas = new Subject<string>();
  readonly resultado = toSignal(
    this.pesquisas.pipe(
      switchMap((termo) => {
        if (!termo) return of(PESQUISA_VAZIA);
        return this.service.buscarPorNome(termo).pipe(
          map((pokemon): ResultadoPesquisa => ({
            termo,
            pokemon: [pokemon],
            carregando: false,
            erro: false,
          })),
          startWith({ termo, pokemon: [], carregando: true, erro: false } as ResultadoPesquisa),
          catchError((erro) =>
            of({
              termo,
              pokemon: [],
              carregando: false,
              erro: erro.status !== 404,
            } as ResultadoPesquisa),
          ),
        );
      }),
    ),
    { initialValue: PESQUISA_VAZIA },
  );

  pesquisar(): void {
    let termo = this.textoPesquisa().trim().toLowerCase().replace(/\s+/g, '-');
    if (/^#?\d+$/.test(termo)) termo = String(Number(termo.replace('#', '')));
    this.pesquisas.next(termo);
  }

  limparPesquisa(): void {
    this.textoPesquisa.set('');
    this.pesquisas.next('');
  }
}
