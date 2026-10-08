import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { PokemonService } from '../data/pokemon.service';
import { Pokemon } from '../pokemon.model';
import { map } from 'rxjs';
import { DEFAULT_TYPE_COLOR, obterCorDoTipo, paraTitleCase, PokemonTypeViewModel, TYPE_COLORS } from '../pokemon.util';


interface PokemonCardViewModel {
  readonly id: number;
  readonly displayName: string;
  readonly imageUrl: string | null;
  readonly imageAlt: string;
  readonly types: readonly PokemonTypeViewModel[];
  readonly background: string;
}


function paraCardViewModel(dto: Pokemon): PokemonCardViewModel {
  const displayName = paraTitleCase(dto.name);
  const types = dto.types.map((type) => ({
    name: type,
    displayName: paraTitleCase(type),
    color: obterCorDoTipo(type.toLowerCase()),
}));

  const primeiraCor = types[0]?.color ?? DEFAULT_TYPE_COLOR;
  const segundaCor = types[1]?.color ?? primeiraCor;

  return {
    id: dto.id,
    displayName: displayName,
    imageUrl: dto.sprite,
    imageAlt: `Imagem de ${displayName}`,
    types: types,
    background: `linear-gradient(var(--bs-card-bg), var(--bs-card-bg)) padding-box, linear-gradient(135deg, ${primeiraCor} 0 50%, ${segundaCor} 50% 100%) border-box`,
  };
}

@Component({
  imports: [],
  selector: 'app-listagem-pokemon',
  styleUrl: './listagem-pokemon.scss',
  templateUrl: './listagem-pokemon.html',
})
export class ListagemPokemon {
  protected readonly pokemonService = inject(PokemonService);

  protected readonly pokemon = toSignal(
    this.pokemonService.listar().pipe(map((pokemon) => pokemon.map(paraCardViewModel))),
    {
      initialValue: [] as PokemonCardViewModel[],
    },
  );
}