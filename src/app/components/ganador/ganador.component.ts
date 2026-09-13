import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Jugador } from '../../services/salas.service';

@Component({
  selector: 'app-ganador',
  standalone: true,
  template: `
    @if (ganador) {
      <div class="ganador">
        <h1>¡{{ ganador }} GANA!</h1>

        <p>{{ razon }}</p>

        <ol>
          @for (jugador of clasificacion; track jugador.id) {
            <li>{{ jugador.nickname }}: {{ jugador.puntaje }} puntos</li>
          }
        </ol>

        <button type="button" (click)="volverAlMenu()">Volver al Menú</button>
      </div>
    }
  `,
  styles: [
    `
      .ganador {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        padding: 32px;
        background: #1a1a2e;
        color: #ffffff;
        border: 1px solid #4a4a6e;
        font-family: sans-serif;
        text-align: center;
      }
      .ganador ol {
        display: inline-block;
        text-align: left;
      }
    `,
  ],
})
export class GanadorComponent {
  @Input() ganador: string | null = null;
  @Input() razon = '';
  @Input() jugadores: Jugador[] = [];

  constructor(private readonly router: Router) {}

  get clasificacion(): Jugador[] {
    return [...this.jugadores].sort((a, b) => b.puntaje - a.puntaje);
  }

  volverAlMenu(): void {
    this.router.navigate(['/']);
  }
}
