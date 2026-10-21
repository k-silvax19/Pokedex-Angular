import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { PokemonService } from '../data/pokemon.service';
import { PokemonDetails } from '../pokemon.model';
import { Navbar } from '../../navbar/navbar';
import { PesquisaPokemonService } from '../data/pesquisa-pokemon.service';
import { ListagemPokemon } from './listagem-pokemon';

const pikachu = { id: 25, name: 'pikachu', types: ['electric'], spriteUrl: null } as PokemonDetails;
function setup() {
  const buscarPorNome = vi.fn().mockReturnValue(of(pikachu));
  TestBed.configureTestingModule({
    imports: [ListagemPokemon, Navbar],
    providers: [
      provideRouter([]),
      {
        provide: PokemonService,
        useValue: { listar: () => of([]), buscarPorNome },
      },
    ],
  });
  const fixture = TestBed.createComponent(ListagemPokemon);
  fixture.detectChanges();
  const navbar = TestBed.createComponent(Navbar);
  vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
  navbar.detectChanges();
  return { fixture, navbar, component: TestBed.inject(PesquisaPokemonService), buscarPorNome };
}

describe('pesquisa de Pokémon', () => {
  it('pesquisa pelo formulário sem depender dos cards carregados e normaliza nome e número', () => {
    const { fixture, navbar, component, buscarPorNome } = setup();
    component.textoPesquisa.set('  PIKACHU  ');
    navbar.nativeElement
      .querySelector('form')
      .dispatchEvent(new Event('submit', { cancelable: true }));
    fixture.detectChanges();
    expect(buscarPorNome).toHaveBeenCalledWith('pikachu');
    expect(TestBed.inject(Router).navigate).toHaveBeenCalledWith(['/pokemon']);
    expect(fixture.nativeElement.querySelector('form')).toBeNull();
    expect(fixture.componentInstance.pokemonExibidos()).toEqual([pikachu]);
    expect(fixture.nativeElement.querySelector('app-pokemon-card')).not.toBeNull();
    component.textoPesquisa.set('#0025');
    component.pesquisar();
    expect(buscarPorNome).toHaveBeenLastCalledWith('25');
  });

  it('cancela a busca anterior e mantém a listagem restaurada ao limpar', () => {
    const { fixture, component, buscarPorNome } = setup();
    const antiga = new Subject<PokemonDetails>();
    buscarPorNome.mockReturnValueOnce(antiga);
    component.textoPesquisa.set('charizard');
    component.pesquisar();
    expect(component.resultado().carregando).toBe(true);
    component.textoPesquisa.set('pikachu');
    component.pesquisar();
    antiga.next({ ...pikachu, name: 'charizard' });
    expect(fixture.componentInstance.pokemonExibidos()).toEqual([pikachu]);
    component.limparPesquisa();
    expect(component.textoPesquisa()).toBe('');
    expect(fixture.componentInstance.pokemonExibidos()).toEqual([]);
  });

  it('diferencia ausência de resultado de erro e permite nova pesquisa', () => {
    const { fixture, navbar, component, buscarPorNome } = setup();
    buscarPorNome.mockReturnValueOnce(throwError(() => ({ status: 404 })));
    component.textoPesquisa.set('inexistente');
    component.pesquisar();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Nenhum Pokémon encontrado');
    buscarPorNome.mockReturnValueOnce(throwError(() => ({ status: 0 })));
    component.pesquisar();
    expect(component.resultado().erro).toBe(true);
    component.textoPesquisa.set('pikachu');
    component.pesquisar();
    expect(component.resultado().erro).toBe(false);
    expect(fixture.componentInstance.pokemonExibidos()).toEqual([pikachu]);
  });
});
