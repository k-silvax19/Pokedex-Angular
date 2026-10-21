import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { PokemonService } from '../data/pokemon.service';
import { PesquisaPokemonService } from '../data/pesquisa-pokemon.service';
import { ListagemFavoritos } from '../favoritos/listagem-favoritos';
import { PokemonCard } from './pokemon-card';

@Component({
  imports: [PokemonCard, ListagemFavoritos],
  selector: 'app-listagem-pokemon',
  templateUrl: './listagem-pokemon.html',
})
export class ListagemPokemon {
  private readonly pokemon = toSignal(inject(PokemonService).listar(), { initialValue: [] });
  private readonly pesquisa = inject(PesquisaPokemonService);
  readonly resultado = this.pesquisa.resultado;
  readonly pokemonExibidos = computed(() =>
    this.resultado().termo ? this.resultado().pokemon : this.pokemon(),
  );
}
