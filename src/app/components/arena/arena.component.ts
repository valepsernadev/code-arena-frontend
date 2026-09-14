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

const RADIO_DRON = 0.55;

interface Obstaculo {
  x: number;
  z: number;
  ancho: number;
  fondo: number;
  alto: number;
}

// Distribucion fija: las mismas posiciones en todos los clientes.
const OBSTACULOS: Obstaculo[] = [
  { x: -22, z: -18, ancho: 8, fondo: 8, alto: 10 },
  { x: 20, z: -24, ancho: 10, fondo: 6, alto: 9 },
  { x: -26, z: 22, ancho: 6, fondo: 12, alto: 11 },
  { x: 24, z: 20, ancho: 9, fondo: 9, alto: 8 },
  { x: -12, z: 34, ancho: 12, fondo: 4, alto: 10 },
  { x: 14, z: -36, ancho: 4, fondo: 12, alto: 9 },
  { x: 36, z: -8, ancho: 5, fondo: 10, alto: 11 },
  { x: -38, z: 6, ancho: 10, fondo: 5, alto: 9 },
  { x: 4, z: 16, ancho: 5, fondo: 5, alto: 12 },
  { x: -6, z: -26, ancho: 7, fondo: 7, alto: 8 },
  { x: 32, z: 34, ancho: 8, fondo: 8, alto: 10 },
  { x: -34, z: -34, ancho: 6, fondo: 10, alto: 12 },
];

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
      [estado]="sala ? sala.estado : ''"
      [tiempoRestante]="tiempoRestante"
    ></app-hud>

    <app-pregunta-modal
      [pregunta]="pregunta"
      (responder)="responderPregunta($event)"
    ></app-pregunta-modal>

    <button
      type="button"
      class="tarjeta tarjeta-pregunta"
      (click)="pedirPregunta()"
    >
      <span class="tarjeta-icono"></span>
      <span class="tarjeta-textos">
        <span class="tarjeta-titulo">PEDIR RETO</span>
        <span class="tarjeta-sub">Obtener pregunta</span>
      </span>
    </button>

    <button
      type="button"
      class="tarjeta tarjeta-habilidad"
      [class.hab-boost]="habilidadDesbloqueada === 'Boost'"
      [class.hab-attack]="habilidadDesbloqueada === 'Attack'"
      [class.hab-shield]="habilidadDesbloqueada === 'Shield'"
      [disabled]="!habilidadDesbloqueada"
      (click)="usarHabilidad()"
    >
      <span class="tarjeta-icono"></span>
      <span class="tarjeta-textos">
        <span class="tarjeta-titulo">
          {{ habilidadDesbloqueada ? habilidadDesbloqueada : 'HABILIDAD' }}
        </span>
        <span class="tarjeta-sub">// [E]</span>
      </span>
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
      .tarjeta {
        position: fixed;
        right: 16px;
        display: flex;
        align-items: center;
        gap: 12px;
        min-width: 220px;
        padding: 12px 16px;
        background: rgba(13, 20, 37, 0.92);
        border: 1px solid var(--ca-cian);
        border-radius: 3px;
        color: var(--ca-cian-brillo);
        font-family: var(--ca-mono);
        text-align: left;
        cursor: pointer;
        box-shadow: 0 0 18px rgba(34, 211, 238, 0.4);
      }

      .tarjeta-pregunta {
        bottom: 84px;
      }

      .tarjeta-habilidad {
        bottom: 16px;
        border-color: var(--ca-borde);
        color: var(--ca-tenue);
        box-shadow: none;
      }

      .tarjeta-habilidad.hab-boost {
        border-color: #22d3ee;
        color: #67e8f9;
        box-shadow: 0 0 20px rgba(34, 211, 238, 0.6);
      }

      .tarjeta-habilidad.hab-attack {
        border-color: #f43f5e;
        color: #fda4af;
        box-shadow: 0 0 20px rgba(244, 63, 94, 0.6);
      }

      .tarjeta-habilidad.hab-shield {
        border-color: #a855f7;
        color: #c084fc;
        box-shadow: 0 0 20px rgba(168, 85, 247, 0.6);
      }

      .tarjeta-habilidad:disabled {
        cursor: not-allowed;
      }

      .tarjeta-icono {
        flex: 0 0 auto;
        width: 16px;
        height: 16px;
        border: 1px solid currentColor;
        transform: rotate(45deg);
        box-shadow: 0 0 10px currentColor;
      }

      .tarjeta-textos {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .tarjeta-titulo {
        font-size: 13px;
        letter-spacing: 2px;
      }

      .tarjeta-sub {
        font-size: 10px;
        letter-spacing: 1px;
        color: var(--ca-tenue);
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
  private drone!: THREE.Group;
  private dronesAjenos = new Map<string, THREE.Group>();
  private coloresPorNickname = new Map<string, string>();
  private direction = new THREE.Vector3();
  private pressedKeys = new Set<string>();
  private animationFrameId = 0;
  private intervalMoverDrone?: ReturnType<typeof setInterval>;
  private intervalReloj?: ReturnType<typeof setInterval>;
  private multiplicadorVelocidad = 1;
  private expiraBoost = 0;
  private rayo: THREE.Line | null = null;
  private luzRayo: THREE.PointLight | null = null;
  private expiraRayo = 0;

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
  tiempoRestante: number | null = null;

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

    if (this.intervalReloj) {
      clearInterval(this.intervalReloj);
    }

    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('blur', this.onBlur);
    this.quitarRayo();
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

    this.socketService.on('habilidadUsada', (payload) => {
      this.alHabilidadUsada(payload);
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

    this.intervalReloj = setInterval(() => {
      if (this.tiempoRestante !== null && this.tiempoRestante > 0) {
        this.tiempoRestante = this.tiempoRestante - 1;
      }
    }, 1000);
  }

  private alEstadoSala(payload: any): void {
    this.sala = payload.sala;
    this.jugadores = payload.jugadores ?? [];

    if (payload.tiempoRestante !== undefined) {
      this.tiempoRestante = payload.tiempoRestante;
    }

    const yo = this.jugadores.find((jugador) => this.esMiJugador(jugador));

    if (yo) {
      this.habilidadDesbloqueada = yo.habilidad_desbloqueada;
    }

    this.sincronizarDronesAjenos();
  }

  private alHabilidadUsada(payload: any): void {
    if (payload.habilidad === 'Boost' && payload.jugadorId === this.jugadorId) {
      this.multiplicadorVelocidad = 2;
      this.expiraBoost = Date.now() + payload.duracion * 1000;
    }

    if (payload.habilidad === 'Attack' && payload.objetivoId) {
      this.mostrarRayo(payload.jugadorId, payload.objetivoId);
    }

    if (payload.anulado) {
      this.mensaje = 'El ataque fue bloqueado por un escudo';
    }
  }

  private mostrarRayo(deJugadorId: string, aJugadorId: string): void {
    const origen = this.posicionDe(deJugadorId);
    const destino = this.posicionDe(aJugadorId);

    if (!origen || !destino) {
      return;
    }

    this.quitarRayo();

    this.rayo = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([
        origen.clone(),
        destino.clone(),
      ]),
      new THREE.LineBasicMaterial({ color: 0xff0000 }),
    );
    this.scene.add(this.rayo);

    this.luzRayo = new THREE.PointLight(0xff0000);
    this.luzRayo.position.copy(destino);
    this.scene.add(this.luzRayo);

    this.expiraRayo = Date.now() + 300;
  }

  private quitarRayo(): void {
    if (this.rayo) {
      this.scene.remove(this.rayo);
      this.rayo.geometry.dispose();
      (this.rayo.material as THREE.Material).dispose();
      this.rayo = null;
    }

    if (this.luzRayo) {
      this.scene.remove(this.luzRayo);
      this.luzRayo = null;
    }
  }

  private posicionDe(jugadorId: string): THREE.Vector3 | null {
    if (jugadorId === this.jugadorId) {
      return this.drone.position;
    }

    const mesh = this.dronesAjenos.get(jugadorId);

    return mesh ? mesh.position : null;
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

  private crearDroneAjeno(jugador: Jugador): THREE.Group {
    const colorGuardado = this.coloresPorNickname.get(jugador.nickname);
    const color = colorGuardado
      ? new THREE.Color().setStyle(colorGuardado)
      : new THREE.Color().setHex(Math.floor(Math.random() * 0xffffff));

    return this.crearMallaDrone(color.getHex(), jugador.nickname);
  }

  private crearMallaDrone(colorHex: number, nickname: string): THREE.Group {
    const grupo = new THREE.Group();
    const color = new THREE.Color(colorHex);
    const materialCuerpo = new THREE.MeshStandardMaterial({ color });
    const materialRotor = new THREE.MeshStandardMaterial({
      color,
      transparent: true,
      opacity: 0.5,
    });

    const cuerpo = new THREE.Mesh(
      new THREE.BoxGeometry(0.44, 0.2, 0.44),
      materialCuerpo,
    );
    cuerpo.castShadow = true;
    grupo.add(cuerpo);

    const brazos: [number, number][] = [
      [0.36, 0.36],
      [-0.36, 0.36],
      [0.36, -0.36],
      [-0.36, -0.36],
    ];

    brazos.forEach(([x, z]) => {
      const brazo = new THREE.Mesh(
        new THREE.BoxGeometry(0.52, 0.06, 0.08),
        materialCuerpo,
      );
      brazo.position.set(x / 2, 0, z / 2);
      brazo.rotation.y = Math.atan2(z, x);
      brazo.castShadow = true;
      grupo.add(brazo);

      const rotor = new THREE.Mesh(
        new THREE.CylinderGeometry(0.17, 0.17, 0.04, 12),
        materialRotor,
      );
      rotor.position.set(x, 0.1, z);
      grupo.add(rotor);
    });

    if (nickname) {
      grupo.add(this.crearEtiqueta(nickname, color));
    }

    return grupo;
  }

  private crearEtiqueta(nickname: string, color: THREE.Color): THREE.Sprite {
    const lienzo = document.createElement('canvas');
    lienzo.width = 256;
    lienzo.height = 64;

    const ctx = lienzo.getContext('2d');

    if (ctx) {
      ctx.fillStyle = 'rgba(7, 11, 20, 0.78)';
      ctx.fillRect(0, 0, 256, 64);

      ctx.strokeStyle = `#${color.getHexString()}`;
      ctx.lineWidth = 4;
      ctx.strokeRect(2, 2, 252, 60);

      ctx.fillStyle = '#dbe6f5';
      ctx.font = 'bold 32px Consolas, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(nickname.slice(0, 14), 128, 34);
    }

    const sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(lienzo) }),
    );

    sprite.scale.set(1.7, 0.42, 1);
    sprite.position.y = 0.85;

    return sprite;
  }

  private pintarDrone(grupo: THREE.Group, colorHex: number): void {
    grupo.traverse((hijo) => {
      const mesh = hijo as THREE.Mesh;

      if (mesh.isMesh && mesh.material) {
        (mesh.material as THREE.MeshStandardMaterial).color.setHex(colorHex);
      }
    });
  }

  private removerDroneAjeno(jugadorId: string): void {
    const mesh = this.dronesAjenos.get(jugadorId);

    if (!mesh) {
      return;
    }

    this.pintarDrone(mesh, COLOR_DRONE_MUERTO);
    this.scene.remove(mesh);
    this.dronesAjenos.delete(jugadorId);
  }

  private construirObstaculos(): void {
    const material = new THREE.MeshStandardMaterial({ color: 0x24345c });

    OBSTACULOS.forEach((obstaculo) => {
      const caja = new THREE.Mesh(
        new THREE.BoxGeometry(obstaculo.ancho, obstaculo.alto, obstaculo.fondo),
        material,
      );

      caja.position.set(obstaculo.x, obstaculo.alto / 2, obstaculo.z);
      caja.castShadow = true;
      caja.receiveShadow = true;

      this.scene.add(caja);
    });
  }

  private colisiona(posicion: THREE.Vector3): boolean {
    return OBSTACULOS.some((obstaculo) => {
      if (posicion.y - RADIO_DRON >= obstaculo.alto) {
        return false;
      }

      return (
        posicion.x + RADIO_DRON > obstaculo.x - obstaculo.ancho / 2 &&
        posicion.x - RADIO_DRON < obstaculo.x + obstaculo.ancho / 2 &&
        posicion.z + RADIO_DRON > obstaculo.z - obstaculo.fondo / 2 &&
        posicion.z - RADIO_DRON < obstaculo.z + obstaculo.fondo / 2
      );
    });
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

    const grid = new THREE.GridHelper(100, 40, 0x22d3ee, 0x1a3a52);
    grid.position.y = 0.02;
    this.scene.add(grid);

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

    this.construirObstaculos();

    this.drone = this.crearMallaDrone(0x00ff00, this.nickname);
    this.drone.position.set(0, 2, 0);
    this.scene.add(this.drone);

    this.camera.lookAt(this.drone.position);
  }

  private animate(): void {
    this.animationFrameId = requestAnimationFrame(() => this.animate());

    this.actualizarEfectos();
    this.processInput();

    const anterior = this.drone.position.clone();
    this.drone.position.add(this.direction);
    this.applyArenaLimits();

    if (this.colisiona(this.drone.position)) {
      this.drone.position.copy(anterior);
    }

    this.updateCamera();
    this.renderer.render(this.scene, this.camera);
  }

  private actualizarEfectos(): void {
    if (this.multiplicadorVelocidad !== 1 && Date.now() >= this.expiraBoost) {
      this.multiplicadorVelocidad = 1;
      this.expiraBoost = 0;
    }

    if (this.rayo && Date.now() >= this.expiraRayo) {
      this.quitarRayo();
    }
  }

  private processInput(): void {
    this.direction.set(0, 0, 0);

    const velocidad = VELOCIDAD * this.multiplicadorVelocidad;

    if (this.pressedKeys.has('KeyW')) {
      this.direction.z -= velocidad;
    }
    if (this.pressedKeys.has('KeyS')) {
      this.direction.z += velocidad;
    }
    if (this.pressedKeys.has('KeyA')) {
      this.direction.x -= velocidad;
    }
    if (this.pressedKeys.has('KeyD')) {
      this.direction.x += velocidad;
    }
    if (this.pressedKeys.has('Space')) {
      this.direction.y += velocidad;
    }
    if (
      this.pressedKeys.has('ShiftLeft') ||
      this.pressedKeys.has('ShiftRight')
    ) {
      this.direction.y -= velocidad;
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

    const indice = this.indiceDeAtajo(event.code);
    const pregunta = this.pregunta;

    if (pregunta && indice >= 0 && indice < pregunta.opciones.length) {
      event.preventDefault();
      this.responderPregunta(indice);
      return;
    }

    if (event.code === 'KeyE') {
      this.usarHabilidad();
    }
  };

  private indiceDeAtajo(code: string): number {
    if (code.startsWith('Digit')) {
      return Number(code.replace('Digit', '')) - 1;
    }

    if (code.startsWith('Numpad')) {
      return Number(code.replace('Numpad', '')) - 1;
    }

    return -1;
  }

  private onBlur = (): void => {
    this.pressedKeys.clear();
  };

  private onKeyUp = (event: KeyboardEvent): void => {
    this.pressedKeys.delete(event.code);
  };
}
