import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, KeyValuePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { DashboardService } from '../../core/services/dashboard.service';
import { DashboardSummary } from '../../core/models/dashboard.model';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, RouterLink, KeyValuePipe],
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
    private authService = inject(AuthService);
    private dashboardService = inject(DashboardService);
    private router = inject(Router);

    currentUser = this.authService.currentUser;
    summary = signal<DashboardSummary | null>(null);
    loading = signal(true);
    today = new Date();

    ngOnInit(): void {
        this.loadSummary();
    }

    loadSummary(): void {
        this.dashboardService.getSummary().subscribe({
            next: (data) => {
                this.summary.set(data);
                this.loading.set(false);
            },
            error: () => this.loading.set(false)
        });
    }

    logout(): void {
        this.authService.logout();
    }
}
