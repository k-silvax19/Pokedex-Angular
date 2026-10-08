import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, Routes } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { POKE_API_URL } from './components/pokemon/data/pokemon.service';
import { DEFAULT_TYPE_COLOR, PokemonTypeViewModel, TYPE_COLORS } from './components/pokemon/pokemon.util';

const routes: Routes = [];

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


