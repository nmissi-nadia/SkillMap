import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ManagerService } from '../../../core/services/manager.service';
import { Employee } from '../../../core/models/employee.model';

@Component({
    selector: 'app-team-list',
    standalone: true,
    imports: [CommonModule, RouterLink, FormsModule],
    templateUrl: './team-list.component.html',
    styleUrls: ['./team-list.component.scss']
})
export class TeamListComponent implements OnInit {
    team = signal<Employee[]>([]);
    loading = signal(true);
    errorMessage = signal<string | null>(null);
    successMessage = signal<string | null>(null);

    // Modal states
    showEvaluateModal = signal(false);
    showTestModal = signal(false);
    selectedEmployee = signal<Employee | null>(null);

    // Evaluate modal data
    selectedCompetence = signal<string>('');
    evaluationLevel = signal<number>(3);
    evaluationComment = signal<string>('');

    // Test modal data
    selectedTest = signal<string>('');
    testDueDate = signal<string>('');

    // Available options (these should come from backend in real app)
    availableCompetences = signal<string[]>([
        'Angular', 'TypeScript', 'Java', 'Spring Boot', 'SQL',
        'Docker', 'Git', 'Communication', 'Leadership', 'Problem Solving'
    ]);

    availableTests = signal<string[]>([
        'Test Technique Angular',
        'Test Technique Java/Spring',
        'Test Architecture Logicielle',
        'Test DevOps',
        'Test Base de Données'
    ]);

    constructor(
        private managerService: ManagerService,
        private router: Router
    ) { }

    ngOnInit() {
        this.loadTeam();
    }

    loadTeam() {
        this.loading.set(true);
        this.errorMessage.set(null);

        this.managerService.getMyTeam().subscribe({
            next: (team) => {
                this.team.set(team);
                this.loading.set(false);
                console.log('✅ Équipe chargée:', team);
            },
            error: (error) => {
                console.error('❌ Erreur lors du chargement de l\'équipe:', error);
                this.errorMessage.set('Impossible de charger votre équipe');
                this.loading.set(false);
            }
        });
    }

    getDisponibiliteLabel(disponible: boolean | undefined): string {
        if (disponible === undefined) return 'Non défini';
        return disponible ? 'Disponible' : 'Non disponible';
    }

    getDisponibiliteClass(disponible: boolean | undefined): string {
        if (disponible === undefined) return 'badge-secondary';
        return disponible ? 'badge-success' : 'badge-warning';
    }

    // Action methods
    viewProfile(employee: Employee) {
        console.log('📋 Viewing profile for:', employee.prenom, employee.nom);
        // Navigate to employee detail page
        this.router.navigate(['/manager/team', employee.id]);
    }

    openEvaluateModal(employee: Employee) {
        console.log('⭐ Opening evaluate modal for:', employee.prenom, employee.nom);
        this.selectedEmployee.set(employee);
        this.selectedCompetence.set('');
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
        if (!employee || !this.selectedCompetence()) {
            this.errorMessage.set('Veuillez sélectionner une compétence');
            return;
        }

        console.log('✅ Submitting evaluation:', {
            employee: employee.prenom + ' ' + employee.nom,
            competence: this.selectedCompetence(),
            level: this.evaluationLevel(),
            comment: this.evaluationComment()
        });

        // TODO: Call backend API to submit evaluation
        // For now, just show success message
        this.successMessage.set(`Évaluation de ${employee.prenom} ${employee.nom} enregistrée avec succès`);
        this.closeEvaluateModal();

        // Clear success message after 5 seconds
        setTimeout(() => this.successMessage.set(null), 5000);
    }

    openTestModal(employee: Employee) {
        console.log('📝 Opening test modal for:', employee.prenom, employee.nom);
        this.selectedEmployee.set(employee);
        this.selectedTest.set('');

        // Set default due date to 7 days from now
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
        if (!employee || !this.selectedTest()) {
            this.errorMessage.set('Veuillez sélectionner un test');
            return;
        }

        console.log('✅ Assigning test:', {
            employee: employee.prenom + ' ' + employee.nom,
            test: this.selectedTest(),
            dueDate: this.testDueDate()
        });

        // TODO: Call backend API to assign test
        // For now, just show success message
        this.successMessage.set(`Test assigné à ${employee.prenom} ${employee.nom} avec succès`);
        this.closeTestModal();

        // Clear success message after 5 seconds
        setTimeout(() => this.successMessage.set(null), 5000);
    }
}
