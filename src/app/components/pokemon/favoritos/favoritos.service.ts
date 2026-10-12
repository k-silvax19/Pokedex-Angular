import { Injectable, signal } from '@angular/core';

import { PokemonFavorito } from './listagem-favoritos.model';

@Injectable({ providedIn: 'root' })
export class FavoritosService {
  private readonly favoritosState = signal<PokemonFavorito[]>(this.carregar());

  readonly favoritos = this.favoritosState.asReadonly();

  estaComoFavorito(id: number): boolean {
    return this.favoritosState().some((favorito) => favorito.id === id);
  }

  alternar(pokemon: PokemonFavorito): void {
    if (this.estaComoFavorito(pokemon.id)) {
      this.remover(pokemon.id);
      return;
    }

    this.favoritosState.update((favoritos) => [pokemon, ...favoritos]);
    this.salvar();
  }

  private remover(id: number): void {
    this.favoritosState.update((favoritos) => favoritos.filter((f) => f.id !== id)); // Where
    this.salvar();
  }

  private carregar(): PokemonFavorito[] {
    return JSON.parse(localStorage.getItem('pokedex:favoritos') ?? '[]') as PokemonFavorito[];
  }

  private salvar(): void {
    const jsonString = JSON.stringify(this.favoritosState());

    localStorage.setItem('pokedex:favoritos', jsonString);
  }
}