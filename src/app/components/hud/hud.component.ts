import { Component, Input } from '@angular/core';
import { Jugador } from '../../services/salas.service';

@Component({
  selector: 'app-hud',
  standalone: true,
  template: `
    <div class="hud">
      <div class="datos">
        <div class="dato">
          <span class="etiqueta">TIEMPO</span>
          <strong class="valor">{{ timer }}</strong>
        </div>

        <div class="dato">
          <span class="etiqueta">VIDAS</span>
          <strong class="valor">{{ vidas }}</strong>
        </div>

        <div class="dato">
          <span class="etiqueta">TU PUNTAJE</span>
          <strong class="valor destacado">{{ puntajePropio }}</strong>
        </div>
      </div>

      @if (otros.length) {
        <div class="rivales">
          <span class="etiqueta">RIVALES</span>

          @for (jugador of otros; track jugador.id) {
            <div class="rival">
              <span class="rival-nombre">{{ jugador.nickname }}</span>
              <span class="rival-puntaje">{{ jugador.puntaje }}</span>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [
    `
      .hud {
        position: fixed;
        top: 16px;
        left: 16px;
        padding: 14px 16px;
        background: rgba(13, 20, 37, 0.9);
        border: 1px solid var(--ca-borde);
        border-radius: 3px;
        box-shadow: 0 0 18px rgba(34, 211, 238, 0.25),
          inset 0 0 22px rgba(34, 211, 238, 0.05);
        color: var(--ca-texto);
        font-family: var(--ca-mono);
      }

      .datos {
        display: flex;
        gap: 22px;
      }

      .dato {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .etiqueta {
        font-size: 10px;
        letter-spacing: 2px;
        color: var(--ca-tenue);
      }

      .valor {
        font-size: 22px;
        letter-spacing: 2px;
        color: var(--ca-cian-brillo);
        text-shadow: 0 0 12px rgba(34, 211, 238, 0.6);
      }

      .valor.destacado {
        color: var(--ca-morado-brillo);
        text-shadow: 0 0 12px rgba(168, 85, 247, 0.7);
      }

      .rivales {
        margin-top: 14px;
        padding-top: 12px;
        border-top: 1px solid var(--ca-borde);
      }

      .rival {
        display: flex;
        justify-content: space-between;
        gap: 18px;
        margin-top: 6px;
        font-size: 12px;
        letter-spacing: 1px;
      }

      .rival-nombre {
        color: var(--ca-texto);
      }

      .rival-puntaje {
        color: var(--ca-morado-brillo);
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
