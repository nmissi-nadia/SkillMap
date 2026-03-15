import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
    {
        path: '',
        redirectTo: '/login',
        pathMatch: 'full'
    },
    {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent),
        canActivate: [guestGuard]
    },
    {
        path: 'register',
        loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent),
        canActivate: [guestGuard]
    },
    {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
        canActivate: [authGuard]
    },
    // Manager routes
    {
        path: 'manager/dashboard',
        loadComponent: () => import('./features/manager/dashboard/manager-dashboard.component').then(m => m.ManagerDashboardComponent),
        canActivate: [authGuard]
    },
    {
        path: 'manager/team',
        loadComponent: () => import('./features/manager/team/team-list.component').then(m => m.TeamListComponent),
        canActivate: [authGuard]
    },
    {
        path: 'manager/evaluations',
        loadComponent: () => import('./features/manager/evaluations/pending-evaluations.component').then(m => m.PendingEvaluationsComponent),
        canActivate: [authGuard]
    },
    {
        path: 'manager/tests',
        loadComponent: () => import('./features/manager/tests/tests.component').then(m => m.ManagerTestsComponent),
        canActivate: [authGuard]
    },
    {
        path: 'manager/projets',
        loadComponent: () => import('./features/manager/projects/projects.component').then(m => m.ManagerProjectsComponent),
        canActivate: [authGuard]
    },
    {
        path: 'manager',
        redirectTo: 'manager/dashboard',
        pathMatch: 'full'
    },
    {
        path: 'rh/dashboard',
        loadComponent: () => import('./features/rh/dashboard/dashboard.component').then(m => m.RhDashboardComponent),
        canActivate: [authGuard]
    },
    {
        path: 'rh/users',
        loadComponent: () => import('./features/rh/user-management/user-management.component').then(m => m.UserManagementComponent),
        canActivate: [authGuard]
    },
    {
        path: 'rh/competencies',
        loadComponent: () => import('./features/rh/competencies-management/competencies-management.component').then(m => m.CompetenciesManagementComponent),
        canActivate: [authGuard]
    },
    {
        path: 'rh/skills-map',
        loadComponent: () => import('./features/rh/skills-map/skills-map.component').then(m => m.SkillsMapComponent),
        canActivate: [authGuard]
    },
    {
        path: 'rh/formations',
        redirectTo: '/formations',
        pathMatch: 'full'
    },
    {
        path: 'rh',
        redirectTo: 'rh/dashboard',
        pathMatch: 'full'
    },
    // Employee routes
    {
        path: 'employee/dashboard',
        loadComponent: () => import('./features/employee/dashboard/dashboard.component').then(m => m.DashboardComponent),
        canActivate: [authGuard]
    },
    {
        path: 'employee/profile',
        loadComponent: () => import('./features/employee/profile/profile.component').then(m => m.ProfileComponent),
        canActivate: [authGuard]
    },
    {
        path: 'employee/competencies',
        loadComponent: () => import('./features/employee/competencies/competencies.component').then(m => m.CompetenciesComponent),
        canActivate: [authGuard]
    },
    {
        path: 'employee/tests',
        loadComponent: () => import('./features/employee/tests/tests.component').then(m => m.EmployeeTestsComponent),
        canActivate: [authGuard]
    },
    {
        path: 'employee/formations',
        redirectTo: '/mes-formations',
        pathMatch: 'full'
    },
    // Chef de Projet routes
    {
        path: 'chef-projet/dashboard',
        loadComponent: () => import('./features/chef-projet/dashboard/dashboard.component').then(m => m.ChefProjetDashboardComponent),
        canActivate: [authGuard]
    },
    {
        path: 'chef-projet/projets',
        loadComponent: () => import('./features/chef-projet/projets/projets.component').then(m => m.ProjetsComponent),
        canActivate: [authGuard]
    },
    {
        path: 'chef-projet/equipe',
        loadComponent: () => import('./features/chef-projet/equipe/equipe.component').then(m => m.EquipeComponent),
        canActivate: [authGuard]
    },
    {
        path: 'chef-projet/messagerie',
        loadComponent: () => import('./features/chef-projet/messagerie/messagerie.component').then(m => m.MessagerieComponent),
        canActivate: [authGuard]
    },
    {
        path: 'chef-projet',
        redirectTo: 'chef-projet/dashboard',
        pathMatch: 'full'
    },
    // Technical Tests Routes
    {
        path: 'tests',
        canActivate: [authGuard],
        children: [
            { path: '', loadComponent: () => import('./modules/tests/components/test-list.component').then(m => m.TestListComponent) },
            { path: 'create', loadComponent: () => import('./modules/tests/components/create-test.component').then(m => m.CreateTestComponent) },
            { path: ':id', loadComponent: () => import('./modules/tests/components/test-detail.component').then(m => m.TestDetailComponent) },
            { path: 'assign/:id', loadComponent: () => import('./modules/tests/components/assign-test.component').then(m => m.AssignTestComponent) }
        ]
    },
    // Formations V2 Routes
    {
        path: 'formations',
        canActivate: [authGuard],
        children: [
            { path: '', loadComponent: () => import('./features/formations/formation-list/formation-list').then(m => m.FormationList) },
            { path: 'create', loadComponent: () => import('./features/formations/formation-create/formation-create').then(m => m.FormationCreate) },
            { path: 'catalogue', loadComponent: () => import('./features/employee/formations-catalogue/formations-catalogue').then(m => m.FormationsCatalogue) },
            { path: ':id', loadComponent: () => import('./features/formations/formation-detail/formation-detail').then(m => m.FormationDetail) }
        ]
    },
    {
        path: 'mes-formations',
        loadComponent: () => import('./features/employee/mes-formations/mes-formations').then(m => m.MesFormations),
        canActivate: [authGuard]
    },
    {
        path: 'employe/tests',
        canActivate: [authGuard],
        children: [
            { path: '', loadComponent: () => import('./modules/tests/components/employe-tests.component').then(m => m.EmployeTestsComponent) },
            { path: ':id/pass', loadComponent: () => import('./modules/tests/components/take-test.component').then(m => m.TakeTestComponent) },
            { path: ':id/result', loadComponent: () => import('./modules/tests/components/test-result.component').then(m => m.TestResultComponent) }
        ]
    },
    {
        path: '**',
        redirectTo: '/login'
    }
];
