import { Component, signal } from '@angular/core';
import { Navbar } from './components/navbar/navbar';
import { ListagemPokemon } from './components/pokemon/listagem/listagem-pokemon';

@Component({
  imports: [Navbar, ListagemPokemon],
  selector: 'app-root',
  templateUrl: './app.html',
})
export class App { }
