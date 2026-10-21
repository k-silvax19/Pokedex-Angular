import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { PokemonService } from '../data/pokemon.service';
import { PokemonDetails } from '../pokemon.model';
import { DetalhesPokemon } from './detalhes-pokemon';

const normal: PokemonDetails = {
  id: 6,
  name: 'charizard',
  types: ['fire', 'flying'],
  speciesUrl: '/species/6',
  spriteUrl: 'normal.png',
  shinySpriteUrl: 'shiny.png',
  imageUrl: 'art.png',
  shinyImageUrl: 'art-shiny.png',
  audioUrl: null,
  height: 17,
  weight: 905,
  abilities: ['blaze'],
  stats: [{ name: 'attack', baseValue: 84 }],
};
const mega: PokemonDetails = {
  ...normal,
  id: 10034,
  name: 'charizard-mega-x',
  types: ['fire', 'dragon'],
  imageUrl: 'mega.png',
  shinyImageUrl: 'mega-shiny.png',
  abilities: ['tough-claws'],
  stats: [{ name: 'attack', baseValue: 130 }],
};

function setup(fail = false) {
  const params = new BehaviorSubject(convertToParamMap({ name: normal.name }));
  const listarFormas = vi.fn().mockReturnValue(of([normal, mega]));
  if (fail) listarFormas.mockReturnValueOnce(throwError(() => new Error('offline')));
  TestBed.configureTestingModule({
    imports: [DetalhesPokemon],
    providers: [
      provideRouter([]),
      { provide: ActivatedRoute, useValue: { paramMap: params } },
      {
        provide: PokemonService,
        useValue: {
          buscarPorNome: vi.fn().mockReturnValue(of(normal)),
          buscarPorId: vi.fn().mockReturnValue(of(null)),
          listarFormas,
        },
      },
    ],
  });
  const fixture = TestBed.createComponent(DetalhesPokemon);
  fixture.detectChanges();
  TestBed.tick();
  fixture.detectChanges();
  return { fixture, card: fixture.componentInstance, params, listarFormas };
}

describe('formas nos detalhes', () => {
  it('exibe opções individuais e atualiza todos os detalhes mantendo shiny', () => {
    const { fixture, card } = setup();
    const buttons = fixture.nativeElement.querySelectorAll('.form-option');
    expect(buttons.length).toBe(2);
    expect(buttons[0].textContent).toContain('Original');
    expect(buttons[1].textContent).toContain('Mega X');
    fixture.nativeElement.querySelector('.shiny-toggle').click();
    buttons[1].click();
    fixture.detectChanges();
    expect(card.imagem()).toBe('mega-shiny.png');
    expect(card.pokemon()?.types.map((type) => type.name)).toEqual(['fire', 'dragon']);
    expect(card.pokemon()?.stats[0].value).toBe(130);
    expect(fixture.nativeElement.textContent).toContain('Tough-Claws');
    expect(buttons[1].getAttribute('aria-pressed')).toBe('true');
    buttons[0].click();
    fixture.detectChanges();
    expect(card.imagem()).toBe('art-shiny.png');
  });

  it('desativa shiny indisponível e limpa seleção ao navegar', () => {
    const { fixture, card, params } = setup();
    card.shiny.set(true);
    card.selecionarForma({ ...mega, shinyImageUrl: null });
    fixture.detectChanges();
    expect(card.shiny()).toBe(false);
    expect(fixture.nativeElement.querySelector('.shiny-toggle').disabled).toBe(true);
    params.next(convertToParamMap({ name: 'outro-pokemon' }));
    fixture.detectChanges();
    expect(card.selecionado()).toBeNull();
  });

  it('permite recuperar as opções após erro', () => {
    const { fixture, card } = setup(true);
    expect(fixture.nativeElement.textContent).toContain('Tentar novamente');
    card.tentarFormas();
    fixture.detectChanges();
    TestBed.tick();
    fixture.detectChanges();
    expect(card.formas().erro).toBe(false);
    expect(fixture.nativeElement.querySelectorAll('.form-option').length).toBe(2);
  });
});
