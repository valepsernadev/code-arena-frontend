import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import * as THREE from 'three';
import { SocketService } from '../../services/socket.service';
import { Jugador, Sala } from '../../services/salas.service';
import { Pregunta, PreguntaModalComponent } from '../pregunta-modal/pregunta-modal.component';
import { HudComponent } from '../hud/hud.component';
import { GanadorComponent } from '../ganador/ganador.component';

const MIN_X = -49;
const MAX_X = 49;
const MIN_Z = -49;
const MAX_Z = 49;
const MIN_Y = 0.5;
const MAX_Y = 50;

const VELOCIDAD = 0.5;
const CAMERA_OFFSET = new THREE.Vector3(0, 3, 10);
const INTERVALO_MOVER_DRONE = 100;

const COLOR_DRONE_MUERTO = 0x888888;

@Component({
  selector: 'app-arena',
  standalone: true,
  imports: [HudComponent, PreguntaModalComponent, GanadorComponent],
  template: `
    <div #arenaContainer></div>

    <app-hud
      [jugadores]="jugadores"
      [jugadorId]="jugadorId"
      [nickname]="nickname"
    ></app-hud>

    <app-pregunta-modal
      [pregunta]="pregunta"
      (responder)="responderPregunta($event)"
    ></app-pregunta-modal>

    <button type="button" class="pregunta" (click)="pedirPregunta()">
      Pedir Pregunta
    </button>
    <button type="button" class="habilidad" (click)="usarHabilidad()">
      Habilidad
    </button>

    @if (ganador) {
      <app-ganador
        [ganador]="ganador"
        [razon]="razon"
        [jugadores]="jugadores"
      ></app-ganador>
    }

    @if (mensaje) {
      <p class="mensaje">{{ mensaje }}</p>
    }
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .habilidad {
        position: fixed;
        right: 16px;
        bottom: 16px;
      }
      .pregunta {
        position: fixed;
        right: 16px;
        bottom: 52px;
      }
      .mensaje {
        position: fixed;
        left: 50%;
        bottom: 16px;
        transform: translateX(-50%);
        color: #ffffff;
        font-family: sans-serif;
      }
    `,
  ],
})
export class ArenaComponent implements AfterViewInit, OnDestroy {
  @ViewChild('arenaContainer', { static: true })
  arenaContainer!: ElementRef<HTMLDivElement>;

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private drone!: THREE.Mesh;
  private dronesAjenos = new Map<string, THREE.Mesh>();
  private coloresPorNickname = new Map<string, string>();
  private direction = new THREE.Vector3();
  private pressedKeys = new Set<string>();
  private animationFrameId = 0;
  private intervalMoverDrone?: ReturnType<typeof setInterval>;

  salaId = '';
  jugadorId = '';
  nickname = '';
  jugadores: Jugador[] = [];
  sala: Sala | null = null;
  pregunta: Pregunta | null = null;
  habilidadDesbloqueada: string | null = null;
  mensaje = '';
  ganador: string | null = null;
  razon = '';

  constructor(private readonly socketService: SocketService) {}

  ngAfterViewInit(): void {
    this.salaId = localStorage.getItem('salaId') ?? '';
    this.jugadorId = localStorage.getItem('jugadorId') ?? '';
    this.nickname = localStorage.getItem('nickname') ?? '';

    this.initScene();
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('blur', this.onBlur);
    this.animate();
    this.conectarSocket();
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.animationFrameId);

    if (this.intervalMoverDrone) {
      clearInterval(this.intervalMoverDrone);
    }

    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('blur', this.onBlur);
    this.renderer.dispose();
  }

  pedirPregunta(): void {
    this.socketService.emit('pedirPregunta', {
      salaId: this.salaId,
      tema: this.sala ? this.sala.tema : '',
    });
  }

  responderPregunta(indice: number): void {
    if (!this.pregunta) {
      return;
    }

    this.socketService.emit('responderPregunta', {
      salaId: this.salaId,
      respuestaUsuario: indice,
      respuestaCorrecta: this.pregunta.respuestaCorrecta,
    });

    this.pregunta = null;
  }

  usarHabilidad(): void {
    if (!this.habilidadDesbloqueada) {
      return;
    }

    this.socketService.emit('usarHabilidad', {
      salaId: this.salaId,
      jugadorId: this.jugadorId,
      habilidad: this.habilidadDesbloqueada,
    });
  }

  private conectarSocket(): void {
    this.socketService.on('jugadorUnido', (payload) => {
      this.coloresPorNickname.set(payload.nickname, payload.color);
    });

    this.socketService.on('estadoSala', (payload) => {
      this.alEstadoSala(payload);
    });

    this.socketService.on('actualizarPosicion', (payload) => {
      this.alActualizarPosicion(payload);
    });

    this.socketService.on('preguntaRecibida', (payload) => {
      this.pregunta = payload;
    });

    this.socketService.on('respuestaCorrecta', (payload) => {
      this.mensaje = `Correcto. +${payload.puntajeSumado} puntos. Racha: ${payload.respuestasConsecutivas}`;
    });

    this.socketService.on('respuestaIncorrecta', (payload) => {
      this.mensaje = payload.mensaje;
    });

    this.socketService.on('habilidadDesbloqueada', (payload) => {
      this.habilidadDesbloqueada = payload.habilidad;
      this.mensaje = `Habilidad desbloqueada: ${payload.habilidad} (${payload.descripcion})`;
    });

    this.socketService.on('jugadorDesconectado', (payload) => {
      this.mensaje = `${payload.nickname} se desconecto`;
    });

    this.socketService.on('jugadorReconectado', () => {
      this.mensaje = 'Un jugador se reconecto';
    });

    this.socketService.on('partidaTerminada', (payload) => {
      this.ganador = payload.ganador;
      this.razon = payload.razon;
      this.pregunta = null;
    });

    this.socketService.emit('unirseSala', {
      salaId: this.salaId,
      nickname: this.nickname,
    });

    this.intervalMoverDrone = setInterval(() => {
      this.socketService.emit('moverDrone', {
        salaId: this.salaId,
        jugadorId: this.jugadorId,
        x: this.drone.position.x,
        y: this.drone.position.y,
        z: this.drone.position.z,
      });
    }, INTERVALO_MOVER_DRONE);
  }

  private alEstadoSala(payload: any): void {
    this.sala = payload.sala;
    this.jugadores = payload.jugadores ?? [];

    this.sincronizarDronesAjenos();
  }

  private alActualizarPosicion(payload: any): void {
    if (payload.jugadorId === this.jugadorId) {
      return;
    }

    const mesh = this.dronesAjenos.get(payload.jugadorId);

    if (mesh) {
      mesh.position.set(payload.x, payload.y, payload.z);
    }
  }

  private sincronizarDronesAjenos(): void {
    this.jugadores.forEach((jugador) => {
      if (this.esMiJugador(jugador)) {
        return;
      }

      if (jugador.vidas <= 0) {
        this.removerDroneAjeno(jugador.id);
        return;
      }

      let mesh = this.dronesAjenos.get(jugador.id);

      if (!mesh) {
        mesh = this.crearDroneAjeno(jugador);
        this.dronesAjenos.set(jugador.id, mesh);
        this.scene.add(mesh);
      }

      mesh.position.set(
        Number(jugador.posicion_x),
        Number(jugador.posicion_y),
        Number(jugador.posicion_z),
      );
    });
  }

  private esMiJugador(jugador: Jugador): boolean {
    if (this.jugadorId !== '' && jugador.id === this.jugadorId) {
      return true;
    }

    return this.nickname !== '' && jugador.nickname === this.nickname;
  }

  private crearDroneAjeno(jugador: Jugador): THREE.Mesh {
    const colorGuardado = this.coloresPorNickname.get(jugador.nickname);
    const color = colorGuardado
      ? new THREE.Color().setStyle(colorGuardado)
      : new THREE.Color().setHex(Math.floor(Math.random() * 0xffffff));

    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshStandardMaterial({ color }),
    );

    mesh.castShadow = true;

    return mesh;
  }

  private removerDroneAjeno(jugadorId: string): void {
    const mesh = this.dronesAjenos.get(jugadorId);

    if (!mesh) {
      return;
    }

    (mesh.material as THREE.MeshStandardMaterial).color.setHex(
      COLOR_DRONE_MUERTO,
    );
    this.scene.remove(mesh);
    this.dronesAjenos.delete(jugadorId);
  }

  private initScene(): void {
    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );
    this.camera.position.set(0, 5, 10);

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.arenaContainer.nativeElement.appendChild(this.renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(50, 50, 50);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.left = -60;
    directionalLight.shadow.camera.right = 60;
    directionalLight.shadow.camera.top = 60;
    directionalLight.shadow.camera.bottom = -60;
    this.scene.add(directionalLight);

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(100, 100),
      new THREE.MeshStandardMaterial({ color: 0x2a2a4e }),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.scene.add(floor);

    const wallGeometry = new THREE.BoxGeometry(100, 10, 1);
    const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x4a4a6e });

    const wallNorth = new THREE.Mesh(wallGeometry, wallMaterial);
    wallNorth.position.set(0, 5, -50);

    const wallSouth = new THREE.Mesh(wallGeometry, wallMaterial);
    wallSouth.position.set(0, 5, 50);

    const wallEast = new THREE.Mesh(wallGeometry, wallMaterial);
    wallEast.position.set(50, 5, 0);
    wallEast.rotation.y = Math.PI / 2;

    const wallWest = new THREE.Mesh(wallGeometry, wallMaterial);
    wallWest.position.set(-50, 5, 0);
    wallWest.rotation.y = Math.PI / 2;

    this.scene.add(wallNorth, wallSouth, wallEast, wallWest);

    this.drone = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshStandardMaterial({ color: 0x00ff00 }),
    );
    this.drone.position.set(0, 2, 0);
    this.drone.castShadow = true;
    this.scene.add(this.drone);

    this.camera.lookAt(this.drone.position);
  }

  private animate(): void {
    this.animationFrameId = requestAnimationFrame(() => this.animate());

    this.processInput();
    this.drone.position.add(this.direction);
    this.applyArenaLimits();
    this.updateCamera();
    this.renderer.render(this.scene, this.camera);
  }

  private processInput(): void {
    this.direction.set(0, 0, 0);

    if (this.pressedKeys.has('KeyW')) {
      this.direction.z -= VELOCIDAD;
    }
    if (this.pressedKeys.has('KeyS')) {
      this.direction.z += VELOCIDAD;
    }
    if (this.pressedKeys.has('KeyA')) {
      this.direction.x -= VELOCIDAD;
    }
    if (this.pressedKeys.has('KeyD')) {
      this.direction.x += VELOCIDAD;
    }
    if (this.pressedKeys.has('Space')) {
      this.direction.y += VELOCIDAD;
    }
    if (
      this.pressedKeys.has('ShiftLeft') ||
      this.pressedKeys.has('ShiftRight')
    ) {
      this.direction.y -= VELOCIDAD;
    }
  }

  private applyArenaLimits(): void {
    this.drone.position.x = Math.max(
      MIN_X,
      Math.min(MAX_X, this.drone.position.x),
    );
    this.drone.position.y = Math.max(
      MIN_Y,
      Math.min(MAX_Y, this.drone.position.y),
    );
    this.drone.position.z = Math.max(
      MIN_Z,
      Math.min(MAX_Z, this.drone.position.z),
    );
  }

  private updateCamera(): void {
    this.camera.position.copy(this.drone.position).add(CAMERA_OFFSET);
    this.camera.lookAt(this.drone.position);
  }

  private onKeyDown = (event: KeyboardEvent): void => {
    this.pressedKeys.add(event.code);

    if (event.code === 'Space') {
      event.preventDefault();
    }
  };

  private onBlur = (): void => {
    this.pressedKeys.clear();
  };

  private onKeyUp = (event: KeyboardEvent): void => {
    this.pressedKeys.delete(event.code);
  };
}
