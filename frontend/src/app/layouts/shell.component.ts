import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { SidebarComponent } from './sidebar/sidebar.component';
import { NavbarComponent } from './navbar/navbar.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterModule, MatSidenavModule, SidebarComponent, NavbarComponent],
  template: `
    <mat-sidenav-container class="shell-container">
      <mat-sidenav #sidenav mode="side" opened class="sidenav" [fixedInViewport]="true">
        <app-sidebar (closeSidenav)="sidenav.close()"></app-sidebar>
      </mat-sidenav>
      <mat-sidenav-content class="main-content">
        <app-navbar (toggleSidenav)="sidenav.toggle()"></app-navbar>
        <div class="page-content">
          <router-outlet></router-outlet>
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .shell-container { height: 100vh; }
    .sidenav { border-right: none; }
    .main-content { display: flex; flex-direction: column; }
    .page-content { padding: 24px; flex: 1; background: #f5f5f5; min-height: calc(100vh - 64px); }
  `]
})
export class ShellComponent {}
