import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { EmployeeService } from '../../../core/services/employee.service';
import { AuthService } from '../../../core/services/auth.service';
import { Employee, EmployeeKPI, TodoItem, Notification } from '../../../core/models/employee.model';

@Component({
  selector: 'app-employee-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  private employeeService = inject(EmployeeService);
  private authService = inject(AuthService);
  private router = inject(Router);

  // Signals
  employee = signal<Employee | null>(null);
  kpis = signal<EmployeeKPI | null>(null);
  todos = signal<TodoItem[]>([]);
  notifications = signal<Notification[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  today = new Date();

  ngOnInit() {
    console.log('Employee Dashboard Component - ngOnInit appelé');
    this.loadDashboardData();
  }

  /**
   * Charger toutes les données du dashboard
   */
  loadDashboardData() {
    this.loading.set(true);
    this.error.set(null);

    // Charger le profil
    this.employeeService.getMyProfile().subscribe({
      next: (profile) => {
        this.employee.set(profile);
        this.loadKPIs();
        this.loadTodos();
        this.loadNotifications();
      },
      error: (err) => {
        console.error('Erreur lors du chargement du profil:', err);
        this.error.set('Impossible de charger votre profil');
        this.loading.set(false);
      }
    });
  }

  /**
   * Charger les KPIs
   */
  private loadKPIs() {
    this.employeeService.getKPIs().subscribe({
      next: (kpis) => this.kpis.set(kpis),
      error: (err) => console.error('Erreur KPIs:', err)
    });
  }

  /**
   * Charger les tâches à faire
   */
  private loadTodos() {
    this.employeeService.getTodos().subscribe({
      next: (todos) => this.todos.set(todos),
      error: (err) => console.error('Erreur todos:', err)
    });
  }

  /**
   * Charger les notifications
   */
  private loadNotifications() {
    this.employeeService.getNotifications().subscribe({
      next: (notifications) => {
        this.notifications.set(notifications);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Erreur notifications:', err);
        this.loading.set(false);
      }
    });
  }

  /**
   * Obtenir la couleur de priorité
   */
  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'HIGH': return 'var(--error)';
      case 'MEDIUM': return 'var(--warning)';
      case 'LOW': return 'var(--info)';
      default: return 'var(--text-secondary)';
    }
  }

  /**
   * Obtenir l'icône du type de notification
   */
  getNotificationIcon(type: string): string {
    switch (type) {
      case 'VALIDATION': return '✓';
      case 'AFFECTATION': return '';
      case 'MESSAGE': return '';
      case 'FORMATION': return '';
      default: return '';
    }
  }

  /**
   * Formater la date relative
   */
  getRelativeTime(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `Il y a ${minutes} min`;
    if (hours < 24) return `Il y a ${hours}h`;
    return `Il y a ${days}j`;
  }

  /**
   * Obtenir le nombre de notifications non lues
   */
  getUnreadCount(): number {
    return this.notifications().filter(n => !n.read).length;
  }

  /**
   * Déconnexion
   */
  logout() {
    this.authService.logout();
  }
}
