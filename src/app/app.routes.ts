import { Routes } from '@angular/router';
import { MenuPrincipalComponent } from './components/menu-principal/menu-principal.component';
import { LobbyComponent } from './components/lobby/lobby.component';

export const routes: Routes = [
  { path: '', component: MenuPrincipalComponent },
  { path: 'lobby', component: LobbyComponent },
];
