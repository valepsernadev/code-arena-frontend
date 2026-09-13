import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SalasService } from '../../services/salas.service';

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
    <h1>CodeArena 3D</h1>

    <p>
      <label for="nickname">Nickname</label><br />
      <input id="nickname" type="text" name="nickname" [(ngModel)]="nickname" />
    </p>

    <p>
      <label for="tema">Tema</label><br />
      <select id="tema" name="tema" [(ngModel)]="tema">
        @for (opcion of temas; track opcion) {
          <option [value]="opcion">{{ opcion }}</option>
        }
      </select>
    </p>

    <p>
      <label for="codigo">Código de sala</label><br />
      <input id="codigo" type="text" name="codigo" [(ngModel)]="codigo" />
    </p>

    <p>
      <button type="button" (click)="crearSala()">Crear Sala</button>
      <button type="button" (click)="unirseASala()">Unirse a Sala</button>
    </p>

    @if (error) {
      <p>{{ error }}</p>
    }
  `,
  styles: [],
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
        localStorage.setItem('salaId', sala.id);
        localStorage.setItem('codigo', sala.codigo);
        this.router.navigate(['/lobby']);
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
        localStorage.setItem('salaId', detalle.sala.id);
        localStorage.setItem('codigo', detalle.sala.codigo);
        this.router.navigate(['/lobby']);
      },
      error: (respuesta) => {
        this.error = respuesta.error?.error ?? 'No se pudo unir a la sala';
      },
    });
  }
}
