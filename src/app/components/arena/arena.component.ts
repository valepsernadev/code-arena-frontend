import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import * as THREE from 'three';

const MIN_X = -49;
const MAX_X = 49;
const MIN_Z = -49;
const MAX_Z = 49;
const MIN_Y = 0.5;
const MAX_Y = 50;

const VELOCIDAD = 0.5;
const CAMERA_OFFSET = new THREE.Vector3(0, 3, 10);

@Component({
  selector: 'app-arena',
  standalone: true,
  template: `
    <div #arenaContainer></div>
    <button type="button" class="habilidad">Habilidad</button>
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
  private direction = new THREE.Vector3();
  private pressedKeys = new Set<string>();
  private animationFrameId = 0;

  ngAfterViewInit(): void {
    this.initScene();
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    this.animate();
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.animationFrameId);
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    this.renderer.dispose();
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
    if (this.pressedKeys.has('ShiftLeft') || this.pressedKeys.has('ShiftRight')) {
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

  private onKeyUp = (event: KeyboardEvent): void => {
    this.pressedKeys.delete(event.code);
  };
}
