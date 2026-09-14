import { Component, Input } from '@angular/core';
import { Jugador } from '../../services/salas.service';

const VIDAS_MAXIMAS = 3;

@Component({
  selector: 'app-hud',
  standalone: true,
  template: `
    <div class="hud">
      <div class="bloque bloque-timer" [class]="'urgencia-' + urgencia">
        <span class="etiqueta">TIEMPO DE COMBATE</span>
        <strong class="reloj">{{ reloj }}</strong>
        <span class="segundos">
          {{ tiempoRestante === null ? 'sin reloj' : tiempoRestante + 's' }}
        </span>
      </div>

      <div class="bloque bloque-puntaje">
        <span class="etiqueta">TU PUNTAJE</span>
        <strong class="puntaje">{{ puntajePropio }}<small>PTS</small></strong>

        <div class="vidas">
          <span class="etiqueta">
            VIDAS DE DRON {{ vidas }} / {{ vidasMaximas }}
          </span>
          <div class="segmentos">
            @for (viva of segmentosVidas; track $index) {
              <span class="segmento" [class.perdida]="!viva"></span>
            }
          </div>
        </div>
      </div>

      <div class="bloque bloque-telemetria">
        <span class="etiqueta">TELEMETRÍA DE RIVALES</span>

        @if (rivales.length === 0) {
          <p class="sin-rivales">SIN RIVALES</p>
        }

        @for (rival of rivales; track rival.id; let i = $index) {
          <div class="rival">
            <span class="puesto">#{{ i + 1 }}</span>
            <span class="rival-nombre">{{ rival.nickname }}</span>
            <span class="rival-puntaje">{{ rival.puntaje }} PTS</span>
          </div>
        }
      </div>
    </div>
  `,
  styles: [
    `
      .hud {
        position: fixed;
        inset: 0;
        pointer-events: none;
        font-family: var(--ca-mono);
      }

      .bloque {
        position: absolute;
        padding: 12px 16px;
        background: rgba(13, 20, 37, 0.92);
        border: 1px solid var(--ca-borde);
        border-radius: 3px;
        box-shadow: 0 0 18px rgba(34, 211, 238, 0.22),
          inset 0 0 22px rgba(34, 211, 238, 0.05);
      }

      .etiqueta {
        display: block;
        font-size: 10px;
        letter-spacing: 2px;
        color: var(--ca-tenue);
      }

      /* --- Timer --- */
      .bloque-timer {
        top: 16px;
        left: 50%;
        transform: translateX(-50%);
        min-width: 190px;
        text-align: center;
      }

      .reloj {
        display: block;
        margin: 4px 0 2px;
        font-size: 42px;
        letter-spacing: 4px;
        color: #4ade80;
        text-shadow: 0 0 18px rgba(74, 222, 128, 0.7);
      }

      .segundos {
        font-size: 11px;
        letter-spacing: 2px;
        color: var(--ca-tenue);
      }

      .urgencia-media .reloj {
        color: #facc15;
        text-shadow: 0 0 18px rgba(250, 204, 21, 0.75);
      }

      .urgencia-alta .reloj {
        color: #f43f5e;
        text-shadow: 0 0 20px rgba(244, 63, 94, 0.85);
      }

      .urgencia-sin-datos .reloj {
        color: var(--ca-tenue);
        text-shadow: none;
      }

      /* --- Puntaje propio + vidas --- */
      .bloque-puntaje {
        top: 16px;
        right: 16px;
        min-width: 210px;
        text-align: right;
      }

      .puntaje {
        display: block;
        margin: 2px 0 12px;
        font-size: 44px;
        letter-spacing: 3px;
        color: var(--ca-cian-brillo);
        text-shadow: 0 0 20px rgba(34, 211, 238, 0.75);
      }

      .puntaje small {
        margin-left: 6px;
        font-size: 14px;
        letter-spacing: 2px;
        color: var(--ca-tenue);
      }

      .vidas {
        padding-top: 10px;
        border-top: 1px solid var(--ca-borde);
      }

      .segmentos {
        display: flex;
        justify-content: flex-end;
        gap: 6px;
        margin-top: 8px;
      }

      .segmento {
        width: 34px;
        height: 12px;
        background: #4ade80;
        box-shadow: 0 0 12px rgba(74, 222, 128, 0.8);
      }

      .segmento.perdida {
        background: #7f1d1d;
        box-shadow: none;
        outline: 1px solid #f43f5e;
        outline-offset: -1px;
      }

      /* --- Telemetria de rivales --- */
      .bloque-telemetria {
        top: 16px;
        left: 16px;
        min-width: 240px;
      }

      .sin-rivales {
        margin: 10px 0 0;
        font-size: 12px;
        letter-spacing: 2px;
        color: var(--ca-tenue);
      }

      .rival {
        display: flex;
        align-items: baseline;
        gap: 10px;
        margin-top: 8px;
        font-size: 13px;
        letter-spacing: 1px;
      }

      .puesto {
        color: var(--ca-morado-brillo);
      }

      .rival-nombre {
        flex: 1;
        color: var(--ca-texto);
      }

      .rival-puntaje {
        color: var(--ca-cian-brillo);
      }
    `,
  ],
})
export class HudComponent {
  @Input() jugadores: Jugador[] = [];
  @Input() jugadorId = '';
  @Input() nickname = '';
  @Input() estado = '';
  @Input() tiempoRestante: number | null = null;

  vidasMaximas = VIDAS_MAXIMAS;

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

  get rivales(): Jugador[] {
    return [...this.otros].sort((a, b) => b.puntaje - a.puntaje);
  }

  get segmentosVidas(): boolean[] {
    const segmentos: boolean[] = [];

    for (let i = 0; i < VIDAS_MAXIMAS; i++) {
      segmentos.push(i < this.vidas);
    }

    return segmentos;
  }

  get reloj(): string {
    if (this.tiempoRestante === null) {
      return '--:--';
    }

    const minutos = Math.floor(this.tiempoRestante / 60);
    const segundos = this.tiempoRestante % 60;

    return `${minutos.toString().padStart(2, '0')}:${segundos
      .toString()
      .padStart(2, '0')}`;
  }

  get urgencia(): string {
    if (this.tiempoRestante === null) {
      return 'sin-datos';
    }

    if (this.tiempoRestante <= 60) {
      return 'alta';
    }

    if (this.tiempoRestante <= 120) {
      return 'media';
    }

    return 'baja';
  }
}
