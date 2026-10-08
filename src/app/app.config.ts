import { ApplicationConfig, Component, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, Routes } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { POKE_API_URL } from './components/pokemon/data/pokemon.service';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'pokemon',
    pathMatch: 'full',
  },
  {
    path: 'pokemon',
    loadComponent: () =>
      import('./components/pokemon/listagem/listagem-pokemon').then(
        (component) => component.ListagemPokemon,
      ),
  },
  {
    path: 'pokemon/:name',
    loadComponent: () => import('./components/pokemon/detalhes/detalhes-pokemon').then(component => component.DetalhesPokemon)
  },
];

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(),
    {
      provide: POKE_API_URL,
      useValue: 'https://pokeapi.co/api/v2/pokemon/',
    },
  ],
};
