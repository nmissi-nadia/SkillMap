import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Notification, UnreadCountResponse, PaginatedNotifications } from '../models/notification.model';
import { environment } from '../../../environments/environment';

/**
 * Service de gestion des notifications.
 * Fournit les appels HTTP REST et la connexion WebSocket temps réel.
 */
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly apiUrl = `${environment.apiUrl}/notifications`;
  private stompClient: Client | null = null;

  // ─── Observables ───────────────────────────────────────────────
  private _notifications = new BehaviorSubject<Notification[]>([]);
  private _unreadCount = new BehaviorSubject<number>(0);

  /** Liste des notifications (observable) */
  notifications$ = this._notifications.asObservable();
  /** Nombre de non-lues (observable) */
  unreadCount$ = this._unreadCount.asObservable();

  constructor(private http: HttpClient) {}

  // ─── HTTP: Récupération ─────────────────────────────────────────

  /** Charger toutes les notifications et mettre à jour le store local */
  loadAll(): void {
    this.http.get<Notification[]>(this.apiUrl).subscribe({
      next: (notifs) => {
        this._notifications.next(notifs);
        this._unreadCount.next(notifs.filter(n => !n.lu).length);
      },
      error: (err) => console.error('Erreur chargement notifications:', err)
    });
  }

  /** Récuperer les notifications paginées (pour la page historique) */
  getPaginated(page: number = 0, size: number = 10): Observable<PaginatedNotifications> {
    return this.http.get<PaginatedNotifications>(this.apiUrl, {
      params: { page: page.toString(), size: size.toString() }
    });
  }

  /** Récupérer les dernières notifications (pour le popup de la cloche) */
  getLatest(limit: number = 5): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.apiUrl}/latest`, {
      params: { limit: limit.toString() }
    });
  }

  /** Récupérer les notifications non lues */
  getUnread(): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.apiUrl}/unread`);
  }

  /** Nombre de notifications non lues */
  fetchUnreadCount(): void {
    this.http.get<UnreadCountResponse>(`${this.apiUrl}/count/unread`).subscribe({
      next: (res) => this._unreadCount.next(res.count),
      error: () => {}
    });
  }

  // ─── HTTP: Actions ──────────────────────────────────────────────

  /** Marquer une notification comme lue */
  markAsRead(id: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/read`, {});
  }

  /** Marquer toutes comme lues */
  markAllAsRead(): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/read-all`, {});
  }

  /** Supprimer une notification */
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // ─── WebSocket ──────────────────────────────────────────────────

  /**
   * Établit la connexion WebSocket STOMP.
   * @param userId ID de l'utilisateur authentifié (pour le canal personnel)
   */
  connectWebSocket(userId: string): void {
    if (this.stompClient?.connected) return;

    this.stompClient = new Client({
      webSocketFactory: () => new SockJS(`${environment.wsUrl}/ws-notifications`),
      reconnectDelay: 5000,
      onConnect: () => {
        console.log('🔌 WebSocket connecté');
        // S'abonner aux notifications personnelles de l'utilisateur
        this.stompClient!.subscribe(`/user/${userId}/queue/notifications`, (message) => {
          const notification: Notification = JSON.parse(message.body);
          // Ajouter la nouvelle notification en tête de liste
          const current = this._notifications.getValue();
          this._notifications.next([notification, ...current]);
          this._unreadCount.next(this._unreadCount.getValue() + 1);
        });
      },
      onStompError: (frame) => {
        console.error('Erreur STOMP:', frame);
      }
    });

    this.stompClient.activate();
  }

  /** Déconnecter le WebSocket */
  disconnect(): void {
    if (this.stompClient) {
      this.stompClient.deactivate();
      this.stompClient = null;
    }
  }

  // ─── Helpers locaux ─────────────────────────────────────────────

  /** Marquer comme lu localement (sans attendre le serveur) */
  markAsReadLocally(id: string): void {
    const updated = this._notifications.getValue().map(n =>
      n.id === id ? { ...n, lu: true } : n
    );
    this._notifications.next(updated);
    const unread = updated.filter(n => !n.lu).length;
    this._unreadCount.next(unread);
  }

  /** Supprimer localement */
  deleteLocally(id: string): void {
    const updated = this._notifications.getValue().filter(n => n.id !== id);
    this._notifications.next(updated);
    this._unreadCount.next(updated.filter(n => !n.lu).length);
  }
}
