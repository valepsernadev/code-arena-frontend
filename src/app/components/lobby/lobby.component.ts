import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Jugador, Sala, SalasService } from '../../services/salas.service';

@Component({
  selector: 'app-lobby',
  standalone: true,
  template: `
    @if (sala) {
      <h1>Lobby</h1>

      <p>Código de sala para compartir: <strong>{{ sala.codigo }}</strong></p>

      <p>{{ jugadores.length }}/{{ sala.capacidad }} jugadores</p>

      <ul>
        @for (jugador of jugadores; track jugador.id) {
          <li>{{ jugador.nickname }}</li>
        }
      </ul>

      <button type="button" [disabled]="!puedeIniciar">Iniciar Partida</button>
    }

    @if (error) {
      <p>{{ error }}</p>
    }
  `,
  styles: [],
})
export class LobbyComponent implements OnInit {
  sala: Sala | null = null;
  jugadores: Jugador[] = [];
  error: string | null = null;

  constructor(
    private readonly salasService: SalasService,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    const codigo = localStorage.getItem('codigo');

    if (!codigo) {
      this.router.navigate(['/']);
      return;
    }

    this.salasService.obtenerSala(codigo).subscribe({
      next: (detalle) => {
        this.sala = detalle.sala;
        this.jugadores = detalle.jugadores;
      },
      error: (respuesta) => {
        this.error = respuesta.error?.error ?? 'No se pudo cargar la sala';
      },
    });
  }

  get puedeIniciar(): boolean {
    return this.jugadores.length >= 2;
  }
}
