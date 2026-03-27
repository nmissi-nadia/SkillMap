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
    <div class="notif-bell-wrapper">
      <!-- Cloche avec badge -->
      <button class="bell-btn" (click)="toggleDropdown()" [class.active]="isOpen" title="Notifications">
        <svg class="w-6 h-6 bell-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        @if (unreadCount > 0) {
          <span class="badge">{{ unreadCount > 99 ? '99+' : unreadCount }}</span>
        }
      </button>

      <!-- Overlay & Centered Dropdown -->
      @if (isOpen) {
        <div class="notif-overlay" (click)="isOpen = false"></div>
        <div class="notif-dropdown centered">
          <div class="notif-header">
            <h3>Notifications</h3>
            <div class="header-actions">
              @if (unreadCount > 0) {
                <button class="mark-all-btn" (click)="markAllAsRead()">Tout lire</button>
              }
              <button class="close-btn" (click)="isOpen = false">✕</button>
            </div>
          </div>

          <div class="notif-list">
            @if (notifications.length === 0) {
              <div class="notif-empty">
                <div class="empty-icon-wrapper">
                   <svg class="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <p>Aucune notification</p>
              </div>
            }
            @for (notif of notifications; track notif.id) {
              <div class="notif-item" [class.unread]="!notif.lu" (click)="handleNotifClick(notif)">
                <span class="notif-type-icon">
                  @switch (notif.type) {
                    @case ('SUCCESS') {
                      <svg class="w-5 h-5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    }
                    @case ('ALERTE') {
                      <svg class="w-5 h-5 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    }
                    @case ('ACTION') {
                      <svg class="w-5 h-5 text-info" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    }
                    @default {
                      <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    }
                  }
                </span>
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

    /* Overlay background */
    .notif-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.4);
      backdrop-filter: blur(4px);
      z-index: 9998;
      animation: fadeIn 0.3s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    /* Dropdown Centered */
    .notif-dropdown {
      position: fixed;
      top: 62%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 450px;
      max-width: 90vw;
      background: #ffffff;
      border-radius: 20px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.2);
      z-index: 9999;
      overflow: hidden;
      animation: zoomIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    @keyframes zoomIn {
      from { opacity: 0; transform: translate(-50%, -55%) scale(0.95); }
      to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
    }

    .notif-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px;
      border-bottom: 2px solid #f1f5f9;

      h3 { margin: 0; color: #1e293b; font-size: 1.2rem; font-weight: 700; }
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .close-btn {
      background: #f1f5f9;
      border: none;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: #64748b;
      transition: all 0.2s;
    }

    .close-btn:hover {
      background: #e2e8f0;
      color: #0f172a;
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
}
