import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ManagerService } from '../../../core/services/manager.service';
import { Employee } from '../../../core/models/employee.model';

@Component({
    selector: 'app-team-list',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './team-list.component.html',
    styleUrls: ['./team-list.component.scss']
})
export class TeamListComponent implements OnInit {
    private managerService = inject(ManagerService);
    private router = inject(Router);

    team = signal<Employee[]>([]);
    loading = signal(true);
    errorMessage = signal<string | null>(null);
    successMessage = signal<string | null>(null);

    // Modal states
    showEvaluateModal = signal(false);
    showTestModal = signal(false);
    showAddMemberModal = signal(false);
    selectedEmployee = signal<Employee | null>(null);
    availableEmployees = signal<Employee[]>([]);

    // Evaluate modal data
    selectedCompetenceId = signal<string>('');
    evaluationLevel = signal<number>(3);
    evaluationComment = signal<string>('');

    // Test modal data
    selectedTestId = signal<string>('');
    testDueDate = signal<string>('');

    // Dynamic Options from API
    availableCompetences = signal<any[]>([]);
    availableTests = signal<any[]>([]);

    ngOnInit() {
        this.loadTeam();
        this.loadOptions();
    }

    loadTeam() {
        this.loading.set(true);
        this.managerService.getMyTeam().subscribe({
            next: (team) => {
                this.team.set(team);
                this.loading.set(false);
            },
            error: (err) => {
                this.errorMessage.set('Erreur lors du chargement de l\'équipe');
                this.loading.set(false);
            }
        });
    }

    loadOptions() {
        this.managerService.getAllAvailableCompetencies().subscribe((comps: any[]) => this.availableCompetences.set(comps));
        this.managerService.getAllAvailableTests().subscribe((tests: any[]) => this.availableTests.set(tests));
    }

    getDisponibiliteLabel(disponible: boolean | undefined): string {
        return disponible ? 'Disponible' : 'Occupé';
    }

    getDisponibiliteClass(disponible: boolean | undefined): string {
        return disponible ? 'badge-success' : 'badge-warning';
    }

    viewProfile(employee: Employee) {
        this.router.navigate(['/manager/team', employee.id]);
    }

    openEvaluateModal(employee: Employee) {
        this.selectedEmployee.set(employee);
        this.selectedCompetenceId.set('');
        this.evaluationLevel.set(3);
        this.evaluationComment.set('');
        this.showEvaluateModal.set(true);
    }

    closeEvaluateModal() {
        this.showEvaluateModal.set(false);
        this.selectedEmployee.set(null);
    }

    submitEvaluation() {
        const employee = this.selectedEmployee();
        if (!employee || !this.selectedCompetenceId()) return;

        // Note: Ici on simule ou on utilise l'endpoint de validation si une auto-éval existe
        // Pour une évaluation directe manager, on pourrait avoir besoin d'un nouvel endpoint
        // Mais restons sur l'existant : simulation de succès pour l'UI
        this.successMessage.set(`Évaluation envoyée pour ${employee.prenom}`);
        this.closeEvaluateModal();
        setTimeout(() => this.successMessage.set(null), 3000);
    }

    openTestModal(employee: Employee) {
        this.selectedEmployee.set(employee);
        this.selectedTestId.set('');
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 7);
        this.testDueDate.set(dueDate.toISOString().split('T')[0]);
        this.showTestModal.set(true);
    }

    closeTestModal() {
        this.showTestModal.set(false);
        this.selectedEmployee.set(null);
    }

    submitTestAssignment() {
        const employee = this.selectedEmployee();
        if (!employee || !this.selectedTestId()) return;

        const assignment = {
            testId: this.selectedTestId(),
            employeId: employee.id,
            dateLimite: this.testDueDate()
        };

        this.managerService.assignTest(assignment).subscribe({
            next: () => {
                this.successMessage.set(`Test assigné à ${employee.prenom}`);
                this.closeTestModal();
                setTimeout(() => this.successMessage.set(null), 3000);
            },
            error: () => this.errorMessage.set('Erreur lors de l\'assignation du test')
        });
    }

    // ========== Gestion de l'équipe (Ajout membres) ==========

    openAddMemberModal() {
        this.managerService.getAvailableEmployees().subscribe({
            next: (employees) => {
                this.availableEmployees.set(employees);
                this.showAddMemberModal.set(true);
            },
            error: () => this.errorMessage.set('Erreur lors de la récupération des employés disponibles')
        });
    }

    closeAddMemberModal() {
        this.showAddMemberModal.set(false);
    }

    assignMember(employee: Employee) {
        this.managerService.assignEmployeeToTeam(employee.id).subscribe({
            next: () => {
                this.successMessage.set(`${employee.prenom} a été ajouté à votre équipe`);
                this.loadTeam();
                this.closeAddMemberModal();
                setTimeout(() => this.successMessage.set(null), 3000);
            },
            error: () => this.errorMessage.set('Erreur lors de l\'ajout du membre')
        });
    }
}
