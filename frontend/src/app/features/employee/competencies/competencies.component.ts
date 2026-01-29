
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmployeeService } from '../../../core/services/employee.service';
import { EmployeeCompetence } from '../../../core/models/employee.model';

@Component({
    selector: 'app-employee-competencies',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './competencies.component.html',
    styleUrls: ['./competencies.component.scss']
})
export class CompetenciesComponent implements OnInit {
    competencies = signal<EmployeeCompetence[]>([]);
    loading = signal(true);
    showModal = signal(false);

    // Evaluation Form
    selectedCompetenceId = '';
    evaluationForm = {
        niveauAuto: 1,
        commentaire: ''
    };

    // Mock list for adding new (should come from backend API of all competencies)
    allCompetencies: any[] = [];

    constructor(private employeeService: EmployeeService) { }

    ngOnInit() {
        this.loadCompetencies();
        // this.loadAllCompetencies(); // TODO: Implement getting all system competencies to add new ones
    }

    loadCompetencies() {
        this.loading.set(true);
        // TODO: Implement getMyCompetencies in EmployeeService
        // For now, mock or empty
        this.loading.set(false);
    }

    openEvaluationModal(comp?: EmployeeCompetence) {
        if (comp) {
            this.selectedCompetenceId = comp.competence.id;
            this.evaluationForm = {
                niveauAuto: comp.niveauAuto,
                commentaire: comp.commentaire || ''
            };
        } else {
            this.selectedCompetenceId = '';
            this.evaluationForm = {
                niveauAuto: 1,
                commentaire: ''
            };
        }
        this.showModal.set(true);
    }

    closeModal() {
        this.showModal.set(false);
    }

    submitEvaluation() {
        // TODO: Call service to save evaluation
        this.closeModal();
    }
}
