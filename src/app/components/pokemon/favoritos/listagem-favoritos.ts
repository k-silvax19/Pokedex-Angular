import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { paraTitleCase } from '../pokemon.util';
import { FavoritosService } from './favoritos.service';

@Component({
  imports: [RouterLink],
  selector: 'app-listagem-favoritos',
  styleUrl: './listagem-favoritos.scss',
  templateUrl: './listagem-favoritos.html',
})
export class ListagemFavoritos {
  private readonly favoritosService = inject(FavoritosService);
  protected readonly favoritos = this.favoritosService.favoritos;
  protected readonly paraTitleCase = paraTitleCase;
}