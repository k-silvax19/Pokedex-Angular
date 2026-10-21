import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { PokemonService } from '../data/pokemon.service';
import { PesquisaPokemonService } from '../data/pesquisa-pokemon.service';
import { ListagemFavoritos } from '../favoritos/listagem-favoritos';
import { PokemonCard } from './pokemon-card';
import { catchError, map, of } from 'rxjs';
import { Pokemon } from '../pokemon.model';

@Component({
  imports: [PokemonCard, ListagemFavoritos],
  selector: 'app-listagem-pokemon',
  templateUrl: './listagem-pokemon.html',
  styleUrl: './catalogo-pokemon.scss',
})
export class ListagemPokemon {
  readonly catalogo = toSignal(
    inject(PokemonService)
      .listar()
      .pipe(
        map((pokemon) => ({ pokemon, carregando: false, erro: false })),
        catchError(() => of({ pokemon: [] as Pokemon[], carregando: false, erro: true })),
      ),
    { initialValue: { pokemon: [] as Pokemon[], carregando: true, erro: false } },
  );
  private readonly pesquisa = inject(PesquisaPokemonService);
  readonly resultado = this.pesquisa.resultado;
  readonly pokemonExibidos = computed(() =>
    this.resultado().termo ? this.resultado().pokemon : this.catalogo().pokemon,
  );
}
