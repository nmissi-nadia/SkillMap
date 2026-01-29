
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmployeeService } from '../../../core/services/employee.service';
import { Employee } from '../../../core/models/employee.model';

@Component({
    selector: 'app-employee-profile',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
    employee = signal<Employee | null>(null);
    loading = signal(true);
    error = signal<string | null>(null);
    showEditModal = signal(false);

    // Form data
    editForm: {
        poste: string;
        niveauExperience: 'Junior' | 'Intermédiaire' | 'Senior' | undefined;
        disponibilite: boolean;
        bio: string;
    } = {
            poste: '',
            niveauExperience: undefined,
            disponibilite: false,
            bio: '' // Added bio even if backend doesn't support it yet
        };

    constructor(private employeeService: EmployeeService) { }

    ngOnInit() {
        this.loadProfile();
    }

    loadProfile() {
        this.loading.set(true);
        this.employeeService.getMyProfile().subscribe({
            next: (data) => {
                this.employee.set(data);
                this.loading.set(false);
                this.initializeForm(data);
            },
            error: (err) => {
                this.error.set('Impossible de charger le profil');
                this.loading.set(false);
            }
        });
    }

    initializeForm(data: Employee) {
        this.editForm = {
            poste: data.poste || '',
            niveauExperience: data.niveauExperience || undefined,
            disponibilite: data.disponibilite || false,
            bio: '' // data.bio if available
        };
    }

    openEditModal() {
        if (this.employee()) {
            this.initializeForm(this.employee()!);
            this.showEditModal.set(true);
        }
    }

    closeEditModal() {
        this.showEditModal.set(false);
    }

    saveProfile() {
        this.loading.set(true);
        // Assuming updateMyProfile exists on service, if not I need to add it
        this.employeeService.updateMyProfile(this.editForm).subscribe({
            next: (updatedEmployee) => {
                this.employee.set(updatedEmployee);
                this.showEditModal.set(false);
                this.loading.set(false);
            },
            error: (err) => {
                alert('Erreur lors de la mise à jour');
                this.loading.set(false);
            }
        });
    }
}
