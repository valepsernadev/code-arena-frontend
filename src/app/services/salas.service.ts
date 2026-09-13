import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Sala {
  id: string;
  codigo: string;
  tema: string;
  estado: string;
  jugador_count: number;
  capacidad: number;
  creado_en: string;
  actualizado_en: string;
  finalizado_en: string | null;
}

export interface Jugador {
  id: string;
  sala_id: string;
  nickname: string;
  conectado: boolean;
  puntaje: number;
  vidas: number;
  respuestas_correctas_seguidas: number;
  habilidad_desbloqueada: string | null;
  posicion_x: number;
  posicion_y: number;
  posicion_z: number;
  creado_en: string;
  actualizado_en: string;
}

export interface SalaDetalle {
  sala: Sala;
  jugadores: Jugador[];
}

@Injectable({ providedIn: 'root' })
export class SalasService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  crearSala(tema: string, nickname: string): Observable<Sala> {
    return this.http.post<Sala>(`${this.apiUrl}/salas`, { tema, nickname });
  }

  unirseASala(codigo: string, nickname: string): Observable<SalaDetalle> {
    return this.http.post<SalaDetalle>(
      `${this.apiUrl}/salas/${codigo}/unirse`,
      { nickname },
    );
  }

  obtenerSala(codigo: string): Observable<SalaDetalle> {
    return this.http.get<SalaDetalle>(`${this.apiUrl}/salas/${codigo}`);
  }

  listarSalas(estado: string): Observable<Sala[]> {
    return this.http.get<Sala[]>(`${this.apiUrl}/salas`, {
      params: { estado },
    });
  }
}
