import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Pokemon } from '../pokemon.model';
import { obterCorDeBackgroundDosTipos, paraTiposViewModel, paraTitleCase } from '../pokemon.util';

@Component({
  selector: 'app-pokemon-card',
  imports: [RouterLink],
  templateUrl: './pokemon-card.html',
  styleUrl: './listagem-pokemon.scss',
})
export class PokemonCard {
  readonly pokemon = input.required<Pokemon>();
  readonly nome = computed(() => paraTitleCase(this.pokemon().name));
  readonly tipos = computed(() => paraTiposViewModel(this.pokemon().types));
  readonly background = computed(() => obterCorDeBackgroundDosTipos(this.tipos()));
}
