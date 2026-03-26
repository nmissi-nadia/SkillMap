import { Component, OnInit, OnDestroy, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { NotificationService } from '../../../core/services/notification.service';
import { Notification } from '../../../core/models/notification.model';

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="notif-bell-wrapper" #wrapper>
      <!-- Cloche avec badge -->
      <button class="bell-btn" (click)="toggleDropdown()" [class.active]="isOpen" title="Notifications">
        <span class="bell-icon">🔔</span>
        @if (unreadCount > 0) {
          <span class="badge">{{ unreadCount > 99 ? '99+' : unreadCount }}</span>
        }
      </button>

      <!-- Dropdown -->
      @if (isOpen) {
        <div class="notif-dropdown">
          <div class="notif-header">
            <h3>Notifications</h3>
            @if (unreadCount > 0) {
              <button class="mark-all-btn" (click)="markAllAsRead()">Tout lire</button>
            }
          </div>

          <div class="notif-list">
            @if (notifications.length === 0) {
              <div class="notif-empty">
                <span>🎉</span>
                <p>Aucune notification</p>
              </div>
            }
            @for (notif of notifications; track notif.id) {
              <div class="notif-item" [class.unread]="!notif.lu" (click)="handleNotifClick(notif)">
                <span class="notif-type-icon">{{ getTypeIcon(notif.type) }}</span>
                <div class="notif-content">
                  <p class="notif-title">{{ notif.titre }}</p>
                  <p class="notif-msg">{{ notif.contenu }}</p>
                  <span class="notif-time">{{ notif.dateEnvoi | date:'HH:mm · dd/MM' }}</span>
                </div>
                <button class="notif-delete" (click)="deleteNotif($event, notif.id)" title="Supprimer">✕</button>
              </div>
            }
          </div>

          <div class="notif-footer">
            <a routerLink="/notifications" (click)="isOpen = false">Voir toutes les notifications</a>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .notif-bell-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }

    .bell-btn {
      position: relative;
      background: transparent;
      border: none;
      cursor: pointer;
      padding: 8px;
      border-radius: 50%;
      transition: background 0.2s;
      font-size: 1.3rem;
    }

    .bell-btn:hover, .bell-btn.active {
      background: rgba(255,255,255,0.15);
    }

    .bell-icon {
      display: block;
      animation: none;
    }

    .bell-btn.active .bell-icon {
      animation: ring 0.6s ease;
    }

    @keyframes ring {
      0%, 100% { transform: rotate(0); }
      20% { transform: rotate(-20deg); }
      40% { transform: rotate(20deg); }
      60% { transform: rotate(-15deg); }
      80% { transform: rotate(10deg); }
    }

    .badge {
      position: absolute;
      top: 2px;
      right: 2px;
      background: #ef4444;
      color: white;
      font-size: 0.65rem;
      font-weight: 700;
      border-radius: 999px;
      min-width: 18px;
      height: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 4px;
      border: 2px solid transparent;
      animation: pop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    @keyframes pop {
      from { transform: scale(0); }
      to { transform: scale(1); }
    }

    /* Dropdown */
    .notif-dropdown {
      position: absolute;
      top: calc(100% + 12px);
      right: -12px;
      width: 360px;
      background: #ffffff;
      border: 1px solid rgba(0,0,0,0.08);
      border-radius: 16px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.1);
      z-index: 9999;
      overflow: hidden;
      animation: slideDown 0.2s ease;
    }

    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-8px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .notif-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px 12px;
      border-bottom: 1px solid rgba(0,0,0,0.05);

      h3 { margin: 0; color: #1e293b; font-size: 1rem; font-weight: 600; }
    }

    .mark-all-btn {
      background: none;
      border: none;
      color: #6366f1;
      font-size: 0.8rem;
      cursor: pointer;
      padding: 4px 8px;
      border-radius: 6px;
      transition: background 0.2s;
    }
    .mark-all-btn:hover { background: rgba(99,102,241,0.15); }

    .notif-list {
      max-height: 380px;
      overflow-y: auto;
      padding: 4px 0;
    }
    .notif-list::-webkit-scrollbar { width: 4px; }
    .notif-list::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }

    .notif-empty {
      text-align: center;
      padding: 40px 20px;
      color: #64748b;
      span { font-size: 2rem; }
      p { margin: 8px 0 0; font-size: 0.9rem; }
    }

    .notif-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 12px 16px;
      cursor: pointer;
      transition: background 0.15s;
      position: relative;
    }

    .notif-item:hover { background: #f8fafc; }

    .notif-item.unread {
      background: #f5f3ff;
    }

    .notif-item.unread::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 3px;
      background: #6366f1;
      border-radius: 0 3px 3px 0;
    }

    .notif-type-icon {
      font-size: 1.4rem;
      flex-shrink: 0;
      margin-top: 2px;
    }

    .notif-content { flex: 1; min-width: 0; }

    .notif-title {
      margin: 0 0 4px;
      color: #1e293b;
      font-size: 0.85rem;
      font-weight: 600;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .notif-msg {
      margin: 0 0 4px;
      color: #475569;
      font-size: 0.78rem;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .notif-time {
      color: #94a3b8;
      font-size: 0.72rem;
    }

    .notif-delete {
      background: none;
      border: none;
      color: rgba(0,0,0,0.15);
      cursor: pointer;
      font-size: 0.75rem;
      padding: 4px;
      border-radius: 50%;
      transition: all 0.2s;
      flex-shrink: 0;
      opacity: 0;
    }

    .notif-item:hover .notif-delete { opacity: 1; }
    .notif-delete:hover { background: rgba(239,68,68,0.1); color: #ef4444; }

    .notif-footer {
      padding: 12px 20px;
      border-top: 1px solid rgba(0,0,0,0.05);
      text-align: center;

      a {
        color: #6366f1;
        font-size: 0.85rem;
        text-decoration: none;
        transition: color 0.2s;
        &:hover { color: #4338ca; }
      }
    }
  `]
})
export class NotificationBellComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  unreadCount = 0;
  isOpen = false;

  private subs: Subscription[] = [];

  constructor(
    private notifService: NotificationService,
    private router: Router,
    private el: ElementRef
  ) {}

  ngOnInit(): void {
    this.subs.push(
      this.notifService.unreadCount$.subscribe(c => this.unreadCount = c)
    );
    this.notifService.fetchUnreadCount();
    this.refreshLatest();
  }

  refreshLatest(): void {
    this.notifService.getLatest(5).subscribe(notifs => {
      this.notifications = notifs;
    });
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  toggleDropdown(): void {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.refreshLatest();
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (!this.el.nativeElement.contains(event.target)) {
      this.isOpen = false;
    }
  }

  handleNotifClick(notif: Notification): void {
    if (!notif.lu) {
      this.notifService.markAsRead(notif.id).subscribe();
      this.notifService.markAsReadLocally(notif.id);
    }
    if (notif.lien) {
      this.router.navigateByUrl(notif.lien);
    }
    this.isOpen = false;
  }

  markAllAsRead(): void {
    this.notifService.markAllAsRead().subscribe(() => {
      this.notifService.fetchUnreadCount();
      this.refreshLatest();
    });
  }

  deleteNotif(event: Event, id: string): void {
    event.stopPropagation();
    this.notifService.delete(id).subscribe(() => {
      this.refreshLatest();
      this.notifService.fetchUnreadCount();
    });
  }

  getTypeIcon(type: string): string {
    switch (type) {
      case 'SUCCESS': return '✅';
      case 'ALERTE': return '⚠️';
      case 'ACTION': return '🔔';
      default: return 'ℹ️';
    }
  }
}
