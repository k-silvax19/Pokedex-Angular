import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { expect, it } from 'vitest';
import { PokemonCard } from './pokemon-card';

it('mantém a listagem simples, com link para os detalhes e sem controles de formas', () => {
  TestBed.configureTestingModule({ imports: [PokemonCard], providers: [provideRouter([])] });
  const fixture = TestBed.createComponent(PokemonCard);
  fixture.componentRef.setInput('pokemon', {
    id: 6,
    name: 'charizard',
    types: ['fire'],
    spriteUrl: 'normal.png',
    shinySpriteUrl: 'shiny.png',
    speciesUrl: '/species/6',
  });
  fixture.detectChanges();
  expect(fixture.nativeElement.querySelector('a').getAttribute('href')).toBe('/pokemon/charizard');
  expect(fixture.nativeElement.querySelector('button')).toBeNull();
});
