import { Component, EventEmitter, Input, Output } from '@angular/core';

export interface Pregunta {
  enunciado: string;
  opciones: string[];
  respuestaCorrecta: number;
  dificultad: string;
}

const LETRAS = ['A', 'B', 'C', 'D'];

@Component({
  selector: 'app-pregunta-modal',
  standalone: true,
  template: `
    @if (pregunta) {
      <div class="modal">
        <div class="cabecera">
          <span class="etiqueta">RETO DE CÓDIGO</span>
          <span class="dificultad">{{ pregunta.dificultad }}</span>
        </div>

        <p class="enunciado">{{ pregunta.enunciado }}</p>

        <div class="opciones">
          @for (opcion of pregunta.opciones; track $index) {
            <button
              type="button"
              class="opcion"
              (click)="responder.emit($index)"
            >
              <span class="letra">{{ letras[$index] }}</span>
              <span class="texto">{{ textoDe(opcion) }}</span>
              <span class="atajo">[{{ $index + 1 }}]</span>
            </button>
          }
        </div>
      </div>
    }
  `,
  styles: [
    `
      .modal {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        box-sizing: border-box;
        width: min(620px, calc(100vw - 48px));
        padding: 20px 22px 24px;
        background: rgba(13, 20, 37, 0.96);
        border: 1px solid var(--ca-cian);
        border-radius: 3px;
        box-shadow: 0 0 26px rgba(34, 211, 238, 0.45),
          inset 0 0 30px rgba(34, 211, 238, 0.06);
        color: var(--ca-texto);
        font-family: var(--ca-mono);
      }

      .cabecera {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 14px;
      }

      .etiqueta {
        font-size: 11px;
        letter-spacing: 3px;
        color: var(--ca-cian);
      }

      .dificultad {
        padding: 3px 10px;
        border: 1px solid var(--ca-morado);
        border-radius: 3px;
        color: var(--ca-morado-brillo);
        font-size: 10px;
        letter-spacing: 2px;
      }

      .enunciado {
        margin: 0 0 18px;
        font-size: 15px;
        line-height: 1.5;
      }

      .opciones {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
      }

      @media (max-width: 560px) {
        .opciones {
          grid-template-columns: 1fr;
        }
      }

      .opcion {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 13px 14px;
        background: var(--ca-panel-alto);
        border: 1px solid var(--ca-borde);
        border-radius: 3px;
        color: var(--ca-texto);
        font-family: var(--ca-mono);
        font-size: 13px;
        text-align: left;
        cursor: pointer;
      }

      .opcion:hover {
        border-color: var(--ca-cian);
        box-shadow: 0 0 16px rgba(34, 211, 238, 0.45);
      }

      .letra {
        display: flex;
        align-items: center;
        justify-content: center;
        flex: 0 0 auto;
        width: 26px;
        height: 26px;
        border: 1px solid var(--ca-cian);
        border-radius: 3px;
        color: var(--ca-cian-brillo);
        font-size: 13px;
        text-shadow: 0 0 10px rgba(34, 211, 238, 0.7);
      }

      .texto {
        flex: 1;
        line-height: 1.35;
      }

      .atajo {
        flex: 0 0 auto;
        font-size: 11px;
        letter-spacing: 1px;
        color: var(--ca-tenue);
      }
    `,
  ],
})
export class PreguntaModalComponent {
  @Input() pregunta: Pregunta | null = null;

  @Output() responder = new EventEmitter<number>();

  letras = LETRAS;

  textoDe(opcion: string): string {
    return opcion.replace(/^\s*[A-Da-d]\s*[).]\s*/, '');
  }
}
