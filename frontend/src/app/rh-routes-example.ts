import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
    // ... existing routes ...

    // RH Routes
    {
        path: 'rh',
        canActivate: [authGuard, roleGuard],
        data: { roles: ['RH'] },
        children: [
            {
                path: '',
                redirectTo: 'dashboard',
                pathMatch: 'full'
            },
            {
                path: 'dashboard',
                loadComponent: () => import('./features/rh/dashboard/dashboard.component').then(m => m.RhDashboardComponent)
            },
            {
                path: 'users',
                loadComponent: () => import('./features/rh/user-management/user-management.component').then(m => m.UserManagementComponent)
            },
            {
                path: 'skills-map',
                loadComponent: () => import('./features/rh/skills-map/skills-map.component').then(m => m.SkillsMapComponent)
            },
            {
                path: 'formations',
                loadComponent: () => import('./features/rh/formations/formations.component').then(m => m.FormationsComponent)
            }
        ]
    }
];
