import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Pokemon } from '../pokemon.model';
import { DEFAULT_TYPE_COLOR, paraTiposViewModel, paraTitleCase } from '../pokemon.util';

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
  readonly cor = computed(() => this.tipos()[0]?.color ?? DEFAULT_TYPE_COLOR);
  readonly numero = computed(() => this.pokemon().id.toString().padStart(3, '0'));
  readonly imagem = computed(() => this.pokemon().artworkUrl ?? this.pokemon().spriteUrl);
}
