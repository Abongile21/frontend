import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'fg-root',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="shell">
      <aside class="sidebar">
        <a class="brand" routerLink="/" aria-label="FortyGuard Explorer home">
          <span class="brand-mark">F</span>
          <span>FortyGuard <b>Explorer</b></span>
        </a>
        <p class="nav-label">WORKSPACE</p>
        <nav aria-label="Main navigation">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">
            <span aria-hidden="true">⌂</span> Overview
          </a>
          <a routerLink="/recommendations" routerLinkActive="active">
            <span aria-hidden="true">♧</span> What Should I Wear?
          </a>
        </nav>
        <div class="sidebar-note">
          <span class="status-dot"></span>
          Environmental intelligence
          <small>FortyGuard data only</small>
        </div>
      </aside>
      <main class="main">
        <header class="topbar">
          <span class="breadcrumb">FortyGuard <span>/</span> Explorer</span>
          <span class="topbar-badge"><span class="status-dot"></span> Data integrity first</span>
        </header>
        <router-outlet />
      </main>
    </div>
  `,
  styleUrl: './app.component.scss'
})
export class AppComponent {}
