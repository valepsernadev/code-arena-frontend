import { Component, Input } from '@angular/core';
import { Jugador } from '../../services/salas.service';

@Component({
  selector: 'app-hud',
  standalone: true,
  template: `
    <div class="hud">
      <p>Timer: {{ timer }}</p>
      <p>Vidas restantes: {{ vidas }}</p>
      <p>Tu puntaje: {{ puntajePropio }}</p>

      <ul>
        @for (jugador of otros; track jugador.id) {
          <li>{{ jugador.nickname }}: {{ jugador.puntaje }}</li>
        }
      </ul>
    </div>
  `,
  styles: [
    `
      .hud {
        position: fixed;
        top: 16px;
        left: 16px;
        color: #ffffff;
        background: rgba(26, 26, 46, 0.8);
        padding: 12px;
        font-family: sans-serif;
      }
      .hud p {
        margin: 4px 0;
      }
      .hud ul {
        margin: 4px 0;
        padding-left: 18px;
      }
    `,
  ],
})
export class HudComponent {
  @Input() jugadores: Jugador[] = [];
  @Input() jugadorId = '';
  @Input() nickname = '';

  timer = 300;

  private esPropio(jugador: Jugador): boolean {
    if (this.jugadorId !== '' && jugador.id === this.jugadorId) {
      return true;
    }

    return this.nickname !== '' && jugador.nickname === this.nickname;
  }

  get propio(): Jugador | undefined {
    return this.jugadores.find((jugador) => this.esPropio(jugador));
  }

  get puntajePropio(): number {
    return this.propio ? this.propio.puntaje : 0;
  }

  get vidas(): number {
    return this.propio ? this.propio.vidas : 0;
  }

  get otros(): Jugador[] {
    return this.jugadores.filter((jugador) => !this.esPropio(jugador));
  }
}
