import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
import { NotificationService } from '../../core/services/notification.service';
import { Notification } from '../../core/models/notification.model';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, MatButtonModule, MatTooltipModule],
  template: `
    <div class="notifications-page">
      <div class="notifications-container" [@listAnimation]="notifications.length">
        <header class="page-header">
          <div class="header-content">
            <div class="title-section">
              <mat-icon class="header-icon">notifications_active</mat-icon>
              <div>
                <h1>Centre de Notifications</h1>
                <p class="subtitle">Gardez un œil sur vos activités et projets</p>
              </div>
            </div>
            <div class="header-actions">
              @if (unreadCount > 0) {
                <button class="btn-premium secondary" (click)="markAllAsRead()">
                  <mat-icon>done_all</mat-icon>
                  Tout marquer
                </button>
              }
              <button class="btn-premium delete" (click)="deleteAll()" [disabled]="notifications.length === 0">
                <mat-icon>delete_sweep</mat-icon>
                Vider tout
              </button>
            </div>
          </div>

          <div class="filters-bar">
            <button [class.active]="filter === 'all'" (click)="setFilter('all')">
              Toutes
            </button>
            <button [class.active]="filter === 'unread'" (click)="setFilter('unread')">
              Non lues
            </button>
          </div>
        </header>

        <div class="notifications-list">
          @if (notifications.length === 0) {
            <div class="empty-state" [@fadeIn]>
              <div class="empty-blob">
                <mat-icon>notifications_off</mat-icon>
              </div>
              <h3>Aucune notification</h3>
              <p>C'est très calme ici ! Vous êtes complètement à jour.</p>
            </div>
          }

          @for (notif of notifications; track notif.id) {
            <div class="notif-item" [class.unread]="!notif.lu" [@itemAnimation]>
              <div class="notif-glow"></div>
              <div class="notif-sidebar" [class]="notif.type.toLowerCase()"></div>
              
              <div class="notif-icon-container" [class]="notif.type.toLowerCase()">
                <mat-icon>{{ getMaterialIcon(notif.type) }}</mat-icon>
              </div>

              <div class="notif-content">
                <div class="notif-meta">
                  <span class="notif-category">{{ notif.type }}</span>
                  <span class="notif-date">{{ notif.dateEnvoi | date:'dd MMM, HH:mm' }}</span>
                </div>
                
                <h4 class="notif-title">{{ notif.titre }}</h4>
                <p class="notif-text">{{ notif.contenu }}</p>

                @if (notif.senderNom) {
                  <div class="notif-sender">
                    <div class="avatar-mini">{{ notif.senderNom.substring(0,1) }}</div>
                    <span>Par <strong>{{ notif.senderNom }}</strong></span>
                  </div>
                }

                <div class="notif-footer">
                  <div class="footer-actions">
                    @if (notif.lien) {
                      <a [routerLink]="notif.lien" class="action-link" (click)="onActionClick(notif)">
                        Voir les détails
                        <mat-icon>arrow_forward</mat-icon>
                      </a>
                    }
                    @if (!notif.lu) {
                      <button class="btn-mark-read" (click)="markAsRead(notif.id)">
                        Marquer comme lu
                      </button>
                    }
                  </div>
                  <button class="btn-delete-card" (click)="deleteNotif(notif.id)" matTooltip="Supprimer">
                    <mat-icon>delete_outline</mat-icon>
                  </button>
                </div>
              </div>
            </div>
          }
        </div>

        <!-- Pagination -->
        @if (totalPages > 1) {
          <div class="pagination">
            <button [disabled]="currentPage === 0" (click)="goToPage(currentPage - 1)">
              <mat-icon>chevron_left</mat-icon>
            </button>
            @for (p of [].constructor(totalPages); track i; let i = $index) {
              <button [class.active]="i === currentPage" (click)="goToPage(i)">
                {{ i + 1 }}
              </button>
            }
            <button [disabled]="currentPage === totalPages - 1" (click)="goToPage(currentPage + 1)">
              <mat-icon>chevron_right</mat-icon>
            </button>
          </div>
        }
      </div>
    </div>
  `,
  animations: [
    trigger('listAnimation', [
      transition('* <=> *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(20px)' }),
          stagger('100ms', [
            animate('400ms cubic-bezier(0.175, 0.885, 0.32, 1.275)', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ]),
    trigger('itemAnimation', [
      transition(':leave', [
        animate('300ms ease-in', style({ opacity: 0, transform: 'translateX(30px) scale(0.95)' }))
      ])
    ]),
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.9)' }),
        animate('500ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))
      ])
    ])
  ],
  styles: [`
    :host { --p-primary: #6366f1; --p-accent: #10b881; --p-danger: #f43f5e; --p-warn: #f59e0b; }

    .notifications-page {
      min-height: 100vh;
      padding: 40px 20px;
      font-family: 'Outfit', 'Inter', sans-serif;
    }

    .notifications-container {
      max-width: 850px;
      margin: 0 auto;
    }

    .page-header {
      margin-bottom: 40px;
      padding: 32px;
      background: rgba(255, 255, 255, 0.03);
      backdrop-filter: blur(20px);
      border-radius: 30px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 20px 50px rgba(0,0,0,0.2);

      .header-content {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 30px;
      }
    }

    .title-section {
      display: flex;
      gap: 20px;
      align-items: center;
      .header-icon {
        font-size: 40px; width: 40px; height: 40px;
        color: var(--p-primary);
        filter: drop-shadow(0 0 10px rgba(99, 102, 241, 0.5));
      }
      h1 { margin: 0; font-size: 2.2rem; font-weight: 800; color: #fff; letter-spacing: -1px; }
      .subtitle { margin: 4px 0 0; color: rgba(255,255,255,0.5); font-weight: 500; }
    }

    .header-actions { display: flex; gap: 12px; }

    .btn-premium {
      border: none; padding: 12px 20px; border-radius: 12px;
      display: flex; align-items: center; gap: 8px;
      font-weight: 700; font-size: 0.9rem; cursor: pointer; transition: all 0.3s;
      
      &.secondary { background: rgba(255,255,255,0.1); color: #fff; border: 1px solid rgba(255,255,255,0.1); }
      &.delete { background: rgba(244, 63, 94, 0.1); color: var(--p-danger); border: 1px solid rgba(244, 63, 94, 0.2); }
      
      &:hover:not(:disabled) { transform: translateY(-2px); filter: brightness(1.2); }
      &:disabled { opacity: 0.3; cursor: not-allowed; }
      mat-icon { font-size: 20px; }
    }

    .filters-bar {
      display: flex; gap: 10px;
      button {
        background: rgba(255,255,255,0.05); border: none; color: rgba(255,255,255,0.5);
        padding: 10px 18px; border-radius: 14px; font-weight: 700; cursor: pointer;
        display: flex; align-items: center; gap: 10px; transition: all 0.3s;
        
        &.active {
          background: var(--p-primary); color: #fff;
          box-shadow: 0 10px 20px rgba(99, 102, 241, 0.3);
        }
        &:hover:not(.active) { background: rgba(255,255,255,0.08); color: #fff; }
      }
      .badge {
        background: rgba(255,255,255,0.1); padding: 2px 8px; border-radius: 8px; font-size: 0.8rem;
        &.accent { background: rgba(255,255,255,0.2); }
      }
    }

    .notifications-list { display: flex; flex-direction: column; gap: 20px; }

    .notif-item {
      position: relative; overflow: hidden;
      display: flex; gap: 24px; padding: 28px;
      background: rgba(30, 34, 53, 0.5);
      backdrop-filter: blur(15px);
      border-radius: 24px;
      border: 1px solid rgba(255,255,255,0.05);
      transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);

      &.unread {
        background: rgba(99, 102, 241, 0.05);
        border-color: rgba(99, 102, 241, 0.2);
        box-shadow: 0 10px 30px rgba(99, 102, 241, 0.05);
        .notif-title { font-weight: 700; }
      }

      &:hover {
        transform: scale(1.02);
        background: rgba(30, 34, 53, 0.8);
        border-color: rgba(255, 255, 255, 0.15);
        .notif-glow { opacity: 1; }
      }
    }

    .notif-glow {
      position: absolute; top: 0; left: 0; right: 0; height: 100px;
      background: radial-gradient(circle at top left, rgba(99, 102, 241, 0.1), transparent);
      opacity: 0; transition: opacity 0.4s;
    }

    .notif-sidebar {
      position: absolute; left: 0; top: 0; bottom: 0; width: 4px;
      &.success { background: var(--p-accent); }
      &.alerte { background: var(--p-warn); }
      &.action { background: var(--p-primary); }
      &.info { background: #3b82f6; }
    }

    .notif-icon-container {
      width: 56px; height: 56px; border-radius: 18px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; background: rgba(255,255,255,0.05);
      
      mat-icon { font-size: 28px; }
      &.success { color: var(--p-accent); background: rgba(16, 185, 129, 0.1); }
      &.alerte { color: var(--p-warn); background: rgba(245, 158, 11, 0.1); }
      &.action { color: var(--p-primary); background: rgba(99, 102, 241, 0.1); }
      &.info { color: #3b82f6; background: rgba(59, 130, 246, 0.1); }
    }

    .notif-content { flex: 1; min-width: 0; }

    .notif-meta {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 12px;
      .notif-category { font-size: 0.75rem; font-weight: 800; text-transform: uppercase; color: var(--p-primary); }
      .notif-date { color: rgba(255,255,255,0.3); font-size: 0.85rem; }
    }

    .notif-title { margin: 0 0 8px; font-size: 1.25rem; color: #fff; }
    .notif-text { color: rgba(255,255,255,0.6); margin: 0 0 20px; line-height: 1.6; }

    .notif-sender {
      display: flex; align-items: center; gap: 10px; margin-bottom: 20px;
      font-size: 0.9rem; color: rgba(255,255,255,0.4);
      .avatar-mini {
        width: 24px; height: 24px; border-radius: 50%; background: var(--p-primary); color: #fff;
        display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: 800;
      }
    }

    .notif-footer {
      display: flex; justify-content: space-between; align-items: center;
      padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.05);
    }

    .footer-actions { display: flex; gap: 20px; align-items: center; }

    .action-link {
      color: var(--p-primary); text-decoration: none; font-weight: 700;
      display: flex; align-items: center; gap: 6px; font-size: 0.95rem;
      &:hover { gap: 10px; }
      mat-icon { font-size: 18px; }
    }

    .btn-mark-read {
      background: none; border: none; color: rgba(255,255,255,0.5);
      font-weight: 600; font-size: 0.9rem; cursor: pointer;
      &:hover { color: var(--p-primary); }
    }

    .btn-delete-card {
      background: none; border: none; color: rgba(255,255,255,0.2);
      cursor: pointer; padding: 8px; border-radius: 10px; transition: all 0.2s;
      &:hover { color: var(--p-danger); background: rgba(244, 63, 94, 0.1); }
    }

    .empty-state {
      text-align: center; padding: 80px 40px;
      .empty-blob {
        width: 120px; height: 120px; margin: 0 auto 30px;
        background: rgba(99, 102, 241, 0.05); border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%;
        display: flex; align-items: center; justify-content: center;
        mat-icon { font-size: 60px; width: 60px; height: 60px; color: rgba(255,255,255,0.1); }
      }
      h3 { font-size: 1.8rem; color: #fff; margin-bottom: 12px; }
      p { color: rgba(255,255,255,0.4); max-width: 300px; margin: 0 auto; }
    }

    .pagination {
      display: flex; justify-content: center; align-items: center; gap: 8px;
      margin-top: 40px; padding: 20px;
      button {
        background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
        color: #fff; width: 40px; height: 40px; border-radius: 12px;
        display: flex; align-items: center; justify-content: center;
        cursor: pointer; transition: all 0.3s;
        
        &.active { background: var(--p-primary); border-color: var(--p-primary); box-shadow: 0 8px 15px rgba(99, 102, 241, 0.3); }
        &:hover:not(.active):not(:disabled) { background: rgba(255,255,255,0.1); transform: translateY(-2px); }
        &:disabled { opacity: 0.3; cursor: not-allowed; }
      }
    }
  `]
})
export class NotificationsComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  unreadCount = 0;
  filter: 'all' | 'unread' = 'all';
  currentPage = 0;
  pageSize = 8;
  totalElements = 0;
  totalPages = 0;

  private subs: Subscription[] = [];

  constructor(private notifService: NotificationService) {}

  ngOnInit(): void {
    this.subs.push(
      this.notifService.unreadCount$.subscribe(c => this.unreadCount = c)
    );
    this.loadCurrentPage();
    this.notifService.fetchUnreadCount();
  }

  loadCurrentPage(): void {
    if (this.filter === 'unread') {
      this.notifService.getUnread().subscribe(notifs => {
        this.notifications = notifs;
        this.totalElements = notifs.length;
        this.totalPages = 1;
      });
    } else {
      this.notifService.getPaginated(this.currentPage, this.pageSize).subscribe(page => {
        this.notifications = page.content;
        this.totalElements = page.totalElements;
        this.totalPages = page.totalPages;
      });
    }
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  setFilter(f: 'all' | 'unread'): void {
    this.filter = f;
    this.currentPage = 0;
    this.loadCurrentPage();
  }

  goToPage(p: number): void {
    this.currentPage = p;
    this.loadCurrentPage();
  }

  getMaterialIcon(type: string): string {
    switch (type) {
      case 'SUCCESS': return 'check_circle_outline';
      case 'ALERTE': return 'report_problem';
      case 'ACTION': return 'notifications_active';
      case 'INFO': return 'info_outline';
      default: return 'notifications';
    }
  }

  markAsRead(id: string): void {
    this.notifService.markAsRead(id).subscribe(() => {
      this.loadCurrentPage();
      this.notifService.fetchUnreadCount();
    });
  }

  markAllAsRead(): void {
    this.notifService.markAllAsRead().subscribe(() => {
      this.loadCurrentPage();
      this.notifService.fetchUnreadCount();
    });
  }

  deleteNotif(id: string): void {
    this.notifService.delete(id).subscribe(() => {
      this.loadCurrentPage();
      this.notifService.fetchUnreadCount();
    });
  }

  deleteAll(): void {
    if (confirm('Voulez-vous supprimer TOUTES vos notifications ?')) {
      this.notifService.markAllAsRead().subscribe(() => {
        this.loadCurrentPage();
        this.notifService.fetchUnreadCount();
      });
    }
  }

  onActionClick(notif: Notification): void {
    if (!notif.lu) {
      this.markAsRead(notif.id);
    }
  }
}
