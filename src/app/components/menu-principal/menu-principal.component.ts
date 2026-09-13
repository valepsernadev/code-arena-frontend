import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Sala, SalasService } from '../../services/salas.service';

const TEMAS: string[] = [
  'Angular',
  'TypeScript',
  'JavaScript',
  'Python',
  'Java',
  'C#',
  'Go',
  'Node.js',
  'NestJS',
  'React',
  'Vue',
  'HTML',
  'CSS',
  'SQL',
  'PostgreSQL',
  'MongoDB',
  'Docker',
  'Git',
  'GitHub',
  'AWS',
  'Azure',
  'APIs REST',
  'WebSockets',
  'Ciberseguridad',
  'Algoritmos',
  'Estructuras de datos',
  'Bases de datos',
  'Arquitectura de software',
];

@Component({
  selector: 'app-menu-principal',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="pantalla">
      <header class="marca">
        <h1>CODEARENA <span class="neon">3D</span></h1>
      </header>

      <section class="panel">
        <h2 class="panel-titulo"><span class="punto"></span>IDENTIDAD</h2>

        <label class="etiqueta" for="nickname">NICKNAME</label>
        <input
          id="nickname"
          class="campo"
          type="text"
          name="nickname"
          [(ngModel)]="nickname"
        />
      </section>

      <section class="panel">
        <h2 class="panel-titulo">
          <span class="punto morado"></span>TEMA / STACK TECNOLÓGICO
        </h2>

        <div class="grilla-temas">
          @for (opcion of temas; track opcion) {
            <button
              type="button"
              class="tarjeta-tema"
              [class.activa]="opcion === tema"
              (click)="tema = opcion"
            >
              {{ opcion }}
            </button>
          }
        </div>
      </section>

      <section class="panel">
        <h2 class="panel-titulo"><span class="punto"></span>UNIRSE A SALA</h2>

        <label class="etiqueta" for="codigo">CÓDIGO DE SALA</label>
        <input
          id="codigo"
          class="campo"
          type="text"
          name="codigo"
          [(ngModel)]="codigo"
        />
      </section>

      <div class="acciones">
        <button type="button" class="boton boton-primario" (click)="crearSala()">
          CREAR SALA
        </button>
        <button
          type="button"
          class="boton boton-secundario"
          (click)="unirseASala()"
        >
          UNIRSE A SALA
        </button>
      </div>

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
        font-size: 34px;
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

      .panel-titulo {
        display: flex;
        align-items: center;
        gap: 10px;
        margin: 0 0 16px;
        font-size: 13px;
        letter-spacing: 3px;
        color: var(--ca-cian);
      }

      .punto {
        width: 7px;
        height: 7px;
        background: var(--ca-cian);
        box-shadow: 0 0 10px var(--ca-cian);
      }

      .punto.morado {
        background: var(--ca-morado);
        box-shadow: 0 0 10px var(--ca-morado);
      }

      .etiqueta {
        display: block;
        margin-bottom: 6px;
        font-size: 11px;
        letter-spacing: 2px;
        color: var(--ca-tenue);
      }

      .campo {
        box-sizing: border-box;
        width: 100%;
        max-width: 420px;
        padding: 11px 14px;
        background: var(--ca-fondo);
        border: 1px solid var(--ca-borde);
        border-radius: 3px;
        color: var(--ca-texto);
        font-family: var(--ca-mono);
        font-size: 15px;
        letter-spacing: 1px;
      }

      .campo:focus {
        outline: none;
        border-color: var(--ca-cian);
        box-shadow: 0 0 14px rgba(34, 211, 238, 0.45);
      }

      .grilla-temas {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: 8px;
      }

      .tarjeta-tema {
        padding: 11px 12px;
        background: var(--ca-panel-alto);
        border: 1px solid var(--ca-borde);
        border-radius: 3px;
        color: var(--ca-texto);
        font-family: var(--ca-mono);
        font-size: 12px;
        letter-spacing: 1px;
        text-align: left;
        cursor: pointer;
      }

      .tarjeta-tema:hover {
        border-color: var(--ca-morado);
        box-shadow: 0 0 14px rgba(168, 85, 247, 0.35);
      }

      .tarjeta-tema.activa {
        border-color: var(--ca-cian);
        color: var(--ca-cian-brillo);
        box-shadow: 0 0 16px rgba(34, 211, 238, 0.5),
          inset 0 0 16px rgba(34, 211, 238, 0.12);
      }

      .acciones {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        max-width: 1100px;
        margin: 26px auto 0;
      }

      .boton {
        padding: 15px 34px;
        border-radius: 3px;
        font-family: var(--ca-mono);
        font-size: 14px;
        letter-spacing: 3px;
        cursor: pointer;
      }

      .boton-primario {
        border: none;
        background: linear-gradient(90deg, var(--ca-cian), var(--ca-morado));
        color: #05121a;
        font-weight: bold;
        box-shadow: 0 0 22px rgba(34, 211, 238, 0.5);
      }

      .boton-primario:hover {
        box-shadow: 0 0 32px rgba(34, 211, 238, 0.8);
      }

      .boton-secundario {
        background: var(--ca-panel);
        border: 1px solid var(--ca-morado);
        color: var(--ca-morado-brillo);
        box-shadow: 0 0 16px rgba(168, 85, 247, 0.35);
      }

      .boton-secundario:hover {
        box-shadow: 0 0 26px rgba(168, 85, 247, 0.65);
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
export class MenuPrincipalComponent {
  temas = TEMAS;
  nickname = '';
  tema = TEMAS[0];
  codigo = '';
  error: string | null = null;

  constructor(
    private readonly salasService: SalasService,
    private readonly router: Router,
  ) {}

  crearSala(): void {
    this.error = null;

    if (!this.nickname) {
      this.error = 'El nickname es obligatorio';
      return;
    }

    this.salasService.crearSala(this.tema, this.nickname).subscribe({
      next: (sala) => {
        this.salasService.obtenerSala(sala.codigo).subscribe({
          next: (detalle) => {
            const yo = detalle.jugadores.find(
              (jugador) => jugador.nickname === this.nickname,
            );

            this.guardarSesion(sala, yo ? yo.id : '');
            this.router.navigate(['/lobby']);
          },
          error: (respuesta) => {
            this.error = respuesta.error?.error ?? 'No se pudo cargar la sala';
          },
        });
      },
      error: (respuesta) => {
        this.error = respuesta.error?.error ?? 'No se pudo crear la sala';
      },
    });
  }

  unirseASala(): void {
    this.error = null;

    if (!this.nickname) {
      this.error = 'El nickname es obligatorio';
      return;
    }

    if (!this.codigo) {
      this.error = 'El código de sala es obligatorio';
      return;
    }

    this.salasService.unirseASala(this.codigo, this.nickname).subscribe({
      next: (detalle) => {
        const yo = detalle.jugadores.find(
          (jugador) => jugador.nickname === this.nickname,
        );

        this.guardarSesion(detalle.sala, yo ? yo.id : '');
        this.router.navigate(['/lobby']);
      },
      error: (respuesta) => {
        this.error = respuesta.error?.error ?? 'No se pudo unir a la sala';
      },
    });
  }

  private guardarSesion(sala: Sala, jugadorId: string): void {
    localStorage.setItem('salaId', sala.id);
    localStorage.setItem('codigo', sala.codigo);
    localStorage.setItem('jugadorId', jugadorId);
    localStorage.setItem('nickname', this.nickname);
  }
}
