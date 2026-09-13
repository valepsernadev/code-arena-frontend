import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Jugador, Sala, SalasService } from '../../services/salas.service';

@Component({
  selector: 'app-lobby',
  standalone: true,
  template: `
    <div class="pantalla">
      <header class="marca">
        <h1>SALA DE ESPERA <span class="neon">// LOBBY</span></h1>
      </header>

      @if (sala) {
        <section class="panel">
          <span class="etiqueta">CÓDIGO DE SALA</span>
          <strong class="codigo">{{ sala.codigo }}</strong>
        </section>

        <section class="panel">
          <div class="fila-titulo">
            <span class="etiqueta">JUGADORES</span>
            <strong class="contador">
              {{ jugadores.length }}/{{ sala.capacidad }}
            </strong>
          </div>

          <div class="slots">
            @for (slot of slots; track $index) {
              <div class="slot" [class.vacio]="!slot">
                @if (slot) {
                  <span class="slot-nombre">{{ slot.nickname }}</span>
                }
              </div>
            }
          </div>
        </section>

        <div class="acciones">
          <button
            type="button"
            class="boton boton-primario"
            [disabled]="!puedeIniciar"
            (click)="iniciarPartida()"
          >
            INICIAR PARTIDA
          </button>
        </div>
      }

      @if (error) {
        <p class="error">{{ error }}</p>
      }
    </div>
  `,
  styles: [
    `
      .pantalla {
        min-height: 100vh;
        box-sizing: border-box;
        padding: 40px 24px 64px;
        background-color: var(--ca-fondo);
        background-image: linear-gradient(
            rgba(34, 211, 238, 0.055) 1px,
            transparent 1px
          ),
          linear-gradient(90deg, rgba(34, 211, 238, 0.055) 1px, transparent 1px);
        background-size: 44px 44px;
        color: var(--ca-texto);
        font-family: var(--ca-mono);
      }

      .marca h1 {
        margin: 0 0 28px;
        font-size: 30px;
        letter-spacing: 4px;
        text-shadow: 0 0 18px rgba(34, 211, 238, 0.55);
      }

      .neon {
        color: var(--ca-cian);
      }

      .panel {
        max-width: 1100px;
        margin: 0 auto 20px;
        padding: 18px 20px;
        background: var(--ca-panel);
        border: 1px solid var(--ca-borde);
        box-shadow: 0 0 18px rgba(34, 211, 238, 0.09),
          inset 0 0 24px rgba(34, 211, 238, 0.04);
      }

      .etiqueta {
        display: block;
        margin-bottom: 6px;
        font-size: 11px;
        letter-spacing: 2px;
        color: var(--ca-tenue);
      }

      .codigo {
        font-size: 30px;
        letter-spacing: 6px;
        color: var(--ca-cian-brillo);
        text-shadow: 0 0 16px rgba(34, 211, 238, 0.6);
      }

      .fila-titulo {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        margin-bottom: 14px;
      }

      .contador {
        font-size: 16px;
        letter-spacing: 3px;
        color: var(--ca-morado-brillo);
      }

      .slots {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 10px;
      }

      .slot {
        display: flex;
        align-items: center;
        min-height: 62px;
        padding: 14px 16px;
        background: var(--ca-panel-alto);
        border: 1px solid var(--ca-cian);
        border-radius: 3px;
        box-shadow: 0 0 14px rgba(34, 211, 238, 0.3);
      }

      .slot.vacio {
        border: 1px dashed var(--ca-borde);
        box-shadow: none;
      }

      .slot-nombre {
        font-size: 15px;
        letter-spacing: 2px;
        color: var(--ca-cian-brillo);
      }

      .acciones {
        max-width: 1100px;
        margin: 26px auto 0;
      }

      .boton {
        padding: 15px 42px;
        border: none;
        border-radius: 3px;
        background: linear-gradient(90deg, var(--ca-cian), var(--ca-morado));
        color: #05121a;
        font-family: var(--ca-mono);
        font-size: 14px;
        font-weight: bold;
        letter-spacing: 3px;
        cursor: pointer;
        box-shadow: 0 0 22px rgba(34, 211, 238, 0.5);
      }

      .boton:hover:not(:disabled) {
        box-shadow: 0 0 32px rgba(34, 211, 238, 0.8);
      }

      .boton:disabled {
        background: var(--ca-panel-alto);
        color: var(--ca-tenue);
        cursor: not-allowed;
        box-shadow: none;
      }

      .error {
        max-width: 1100px;
        margin: 18px auto 0;
        padding: 12px 16px;
        border: 1px solid #f43f5e;
        background: rgba(244, 63, 94, 0.09);
        color: #fda4af;
        font-size: 13px;
        letter-spacing: 1px;
      }
    `,
  ],
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

  get slots(): (Jugador | null)[] {
    const capacidad = this.sala ? this.sala.capacidad : 0;
    const lista: (Jugador | null)[] = [];

    for (let i = 0; i < capacidad; i++) {
      lista.push(this.jugadores[i] ? this.jugadores[i] : null);
    }

    return lista;
  }

  iniciarPartida(): void {
    this.router.navigate(['/arena']);
  }

  get puedeIniciar(): boolean {
    return this.jugadores.length >= 2;
  }
}
