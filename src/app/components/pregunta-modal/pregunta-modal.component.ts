import { Component, EventEmitter, Input, Output } from '@angular/core';

export interface Pregunta {
  enunciado: string;
  opciones: string[];
  respuestaCorrecta: number;
  dificultad: string;
}

@Component({
  selector: 'app-pregunta-modal',
  standalone: true,
  template: `
    @if (pregunta) {
      <div class="modal">
        <p class="dificultad">Dificultad: {{ pregunta.dificultad }}</p>
        <p class="enunciado">{{ pregunta.enunciado }}</p>

        @for (opcion of pregunta.opciones; track $index) {
          <button type="button" (click)="responder.emit($index)">
            {{ opcion }}
          </button>
        }
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
        padding: 24px;
        background: #1a1a2e;
        color: #ffffff;
        border: 1px solid #4a4a6e;
        max-width: 480px;
      }
      .modal button {
        display: block;
        width: 100%;
        margin: 6px 0;
        text-align: left;
      }
    `,
  ],
})
export class PreguntaModalComponent {
  @Input() pregunta: Pregunta | null = null;

  @Output() responder = new EventEmitter<number>();
}
