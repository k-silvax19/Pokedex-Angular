import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { PesquisaPokemonService } from '../pokemon/data/pesquisa-pokemon.service';

interface ItemNavbar {
  titulo: string;
  url: string;
}

@Component({
  imports: [FormsModule, RouterLink],
  selector: 'app-navbar',
  styleUrl: './navbar.scss',
  templateUrl: './navbar.html',
})
export class Navbar {
  protected readonly itensNavbar: ItemNavbar[] = [{ titulo: 'Início', url: '/pokemon' }];
  readonly pesquisa = inject(PesquisaPokemonService);
  private readonly router = inject(Router);

  pesquisar(): void {
    this.pesquisa.pesquisar();
    void this.router.navigate(['/pokemon']);
    this.menuAberto.set(false);
  }

  limparPesquisa(): void {
    this.pesquisa.limparPesquisa();
  }

  protected readonly menuAberto = signal(false);

  protected altenarMenu(): void {
    this.menuAberto.update((aberto) => !aberto);
  }

  protected fecharMenu(): void {
    this.pesquisa.limparPesquisa();
    this.menuAberto.set(false);
  }
}
