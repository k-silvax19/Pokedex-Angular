import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './components/navbar/navbar';
import { ListagemPokemon } from './components/listagem-pokemon/listagem-pokemon';

@Component({
  imports: [Navbar, ListagemPokemon],
  selector: 'app-root',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('Pokedex');
}
