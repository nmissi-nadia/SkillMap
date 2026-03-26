import { Component, signal, OnInit, OnDestroy, effect } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';
import { AuthService } from './core/services/auth.service';
import { NotificationService } from './core/services/notification.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, SidebarComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('frontend');

  constructor(
    public authService: AuthService,
    private notifService: NotificationService
  ) {
    // Gérer la connexion WebSocket en fonction de l'état d'authentification
    effect(() => {
      const user = this.authService.currentUser();
      if (user && user.id) {
        this.notifService.connectWebSocket(user.email);
        this.notifService.fetchUnreadCount();
      } else {
        this.notifService.disconnect();
      }
    });
  }
}
