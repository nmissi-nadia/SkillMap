import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { NotificationService } from '../../core/services/notification.service';
import { Notification } from '../../core/models/notification.model';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="notifications-container">
      <div class="notifications-header">
        <h1>Centre de Notifications</h1>
        <div class="header-actions">
          @if (unreadCount > 0) {
            <button class="btn-outline" (click)="markAllAsRead()">Tout marquer comme lu</button>
          }
          <button class="btn-danger-outline" (click)="deleteAll()" [disabled]="notifications.length === 0">Tout supprimer</button>
        </div>
      </div>

      <div class="filters">
        <button [class.active]="filter === 'all'" (click)="setFilter('all')">Toutes</button>
        <button [class.active]="filter === 'unread'" (click)="setFilter('unread')">Non lues ({{ unreadCount }})</button>
      </div>

      <div class="notifications-list">
        @if (filteredNotifications.length === 0) {
          <div class="empty-state">
            <span class="icon">📭</span>
            <h3>Aucune notification</h3>
            <p>Vous êtes à jour !</p>
          </div>
        }

        @for (notif of filteredNotifications; track notif.id) {
          <div class="notif-card" [class.unread]="!notif.lu">
            <div class="notif-icon" [class]="notif.type.toLowerCase()">
              {{ getTypeIcon(notif.type) }}
            </div>
            <div class="notif-body">
              <div class="notif-top">
                <h4 class="notif-title">{{ notif.titre }}</h4>
                <span class="notif-date">{{ notif.dateEnvoi | date:'dd MMMM yyyy, HH:mm' }}</span>
              </div>
              <p class="notif-text">{{ notif.contenu }}</p>
              @if (notif.senderNom) {
                <span class="notif-sender">De: <strong>{{ notif.senderNom }}</strong></span>
              }
              <div class="notif-actions">
                @if (notif.lien) {
                  <a [routerLink]="notif.lien" class="btn-primary-sm" (click)="onActionClick(notif)">Voir les détails</a>
                }
                @if (!notif.lu) {
                  <button class="btn-text" (click)="markAsRead(notif.id)">Marquer comme lu</button>
                }
                <button class="btn-icon-delete" (click)="deleteNotif(notif.id)" title="Supprimer">✕</button>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .notifications-container {
      max-width: 900px;
      margin: 40px auto;
      padding: 0 20px;
    }

    .notifications-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
      background: rgba(30, 34, 53, 0.6);
      padding: 24px 30px;
      border-radius: 20px;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255,255,255,0.05);

      h1 { margin: 0; font-size: 1.8rem; color: #fff; }
    }

    .header-actions { display: flex; gap: 12px; }

    .filters {
      display: flex;
      gap: 15px;
      margin-bottom: 24px;
      padding-left: 10px;

      button {
        background: transparent;
        border: none;
        color: rgba(255,255,255,0.5);
        font-weight: 600;
        cursor: pointer;
        padding: 8px 16px;
        border-radius: 8px;
        transition: all 0.2s;
        &.active {
          background: rgba(99, 102, 241, 0.15);
          color: #6366f1;
        }
        &:hover:not(.active) { color: #fff; }
      }
    }

    .notifications-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .notif-card {
      display: flex;
      gap: 20px;
      background: #1e2235;
      padding: 24px;
      border-radius: 16px;
      border: 1px solid rgba(255,255,255,0.05);
      transition: transform 0.2s, box-shadow 0.2s;
      position: relative;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
      }

      &.unread {
        border-left: 4px solid #6366f1;
        background: rgba(99,102,241,0.03);
      }
    }

    .notif-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      flex-shrink: 0;

      &.info { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
      &.alerte { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
      &.action { background: rgba(99, 102, 241, 0.1); color: #6366f1; }
      &.success { background: rgba(16, 185, 129, 0.1); color: #10b881; }
    }

    .notif-body { flex: 1; min-width: 0; }

    .notif-top {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      .notif-title { margin: 0; font-size: 1.1rem; color: #fff; }
      .notif-date { color: rgba(255,255,255,0.3); font-size: 0.85rem; }
    }

    .notif-text {
      color: rgba(255,255,255,0.7);
      margin: 0 0 12px;
      line-height: 1.5;
    }

    .notif-sender {
      display: block;
      font-size: 0.8rem;
      color: rgba(255,255,255,0.4);
      margin-bottom: 16px;
    }

    .notif-actions {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .btn-primary-sm {
      background: #6366f1;
      color: white;
      text-decoration: none;
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 0.85rem;
      font-weight: 500;
      &:hover { background: #4f46e5; }
    }

    .btn-text {
      background: none;
      border: none;
      color: #6366f1;
      font-size: 0.85rem;
      font-weight: 500;
      cursor: pointer;
      &:hover { text-decoration: underline; }
    }

    .btn-icon-delete {
      margin-left: auto;
      background: none;
      border: none;
      color: rgba(255,255,255,0.2);
      cursor: pointer;
      font-size: 1rem;
      padding: 8px;
      border-radius: 8px;
      transition: all 0.2s;
      &:hover { color: #ef4444; background: rgba(239, 68, 68, 0.1); }
    }

    .empty-state {
      text-align: center;
      padding: 100px 20px;
      background: rgba(30, 34, 53, 0.3);
      border-radius: 20px;
      border: 1px dashed rgba(255,255,255,0.1);
      .icon { font-size: 4rem; display: block; margin-bottom: 20px; }
      h3 { color: #fff; margin-bottom: 10px; }
      p { color: rgba(255,255,255,0.4); }
    }

    /* Buttons utilities */
    .btn-outline {
      background: transparent;
      border: 1px solid rgba(255,255,255,0.1);
      color: #fff;
      padding: 10px 20px;
      border-radius: 10px;
      cursor: pointer;
      font-weight: 500;
      &:hover { background: rgba(255,255,255,0.05); }
    }

    .btn-danger-outline {
      background: transparent;
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: #ef4444;
      padding: 10px 20px;
      border-radius: 10px;
      cursor: pointer;
      font-weight: 500;
      &:hover { background: rgba(239, 68, 68, 0.1); }
      &:disabled { opacity: 0.3; cursor: not-allowed; }
    }
  `]
})
export class NotificationsComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  unreadCount = 0;
  filter: 'all' | 'unread' = 'all';

  private subs: Subscription[] = [];

  constructor(private notifService: NotificationService) {}

  ngOnInit(): void {
    this.subs.push(
      this.notifService.notifications$.subscribe(n => this.notifications = n),
      this.notifService.unreadCount$.subscribe(c => this.unreadCount = c)
    );
    this.notifService.loadAll();
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  get filteredNotifications(): Notification[] {
    if (this.filter === 'unread') {
      return this.notifications.filter(n => !n.lu);
    }
    return this.notifications;
  }

  setFilter(f: 'all' | 'unread'): void {
    this.filter = f;
  }

  getTypeIcon(type: string): string {
    switch (type) {
      case 'SUCCESS': return '✅';
      case 'ALERTE': return '⚠️';
      case 'ACTION': return '🔔';
      default: return 'ℹ️';
    }
  }

  markAsRead(id: string): void {
    this.notifService.markAsRead(id).subscribe(() => {
      this.notifService.markAsReadLocally(id);
    });
  }

  markAllAsRead(): void {
    this.notifService.markAllAsRead().subscribe(() => {
      this.notifService.loadAll();
    });
  }

  deleteNotif(id: string): void {
    if (confirm('Supprimer cette notification ?')) {
      this.notifService.delete(id).subscribe(() => {
        this.notifService.deleteLocally(id);
      });
    }
  }

  deleteAll(): void {
    if (confirm('Voulez-vous supprimer TOUTES vos notifications ?')) {
      // Pour faire simple ici on pourrait itérer ou ajouter un endpoint delete-all
      // Disons qu'on les supprime localement pour démo si pas d'endpoint
      this.notifications.forEach(n => this.notifService.delete(n.id).subscribe());
      this.notifService.loadAll();
    }
  }

  onActionClick(notif: Notification): void {
    if (!notif.lu) {
      this.markAsRead(notif.id);
    }
  }
}
