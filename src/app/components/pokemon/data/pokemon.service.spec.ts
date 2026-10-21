import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { expect, it } from 'vitest';
import { POKE_API_URL, PokemonService } from './pokemon.service';
import { Pokemon } from '../pokemon.model';

it('exclui transformações da listagem e preserva formas padrão com nomes compostos', () => {
  TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting(), { provide: POKE_API_URL, useValue: '/pokemon/' }] });
  const http = TestBed.inject(HttpTestingController);
  let resultado: Pokemon[] = [];
  TestBed.inject(PokemonService).listar().subscribe((pokemon) => resultado = pokemon);
  const entradas = [
    { id: 150, name: 'mewtwo', is_default: true },
    { id: 10043, name: 'mewtwo-mega-x', is_default: false },
    { id: 386, name: 'deoxys-normal', is_default: true },
    { id: 10206, name: 'charizard-gmax', is_default: false },
  ];
  http.expectOne('/pokemon/').flush({ next: null, results: entradas.map((pokemon) => ({ name: pokemon.name, url: '/pokemon/' + pokemon.id })) });
  for (const entrada of entradas) {
    http.expectOne('/pokemon/' + entrada.id).flush({ ...entrada, types: [], species: { url: '/species/' + entrada.id }, sprites: { front_default: null, front_shiny: null } });
  }
  expect(resultado.map((pokemon) => pokemon.name)).toEqual(['mewtwo', 'deoxys-normal']);
  http.verify();
});
