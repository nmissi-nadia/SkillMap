import { Component, OnInit, signal } from '@angular/core';
const Math = globalThis.Math;
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { RhService, UtilisateurDTO, CreateUtilisateurDTO, UpdateUtilisateurDTO, PageResponse } from '../../../core/services/rh.service';
import { MetadataService, MetadataOption } from '../../../core/services/metadata.service';

@Component({
    selector: 'app-user-management',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    templateUrl: './user-management.component.html',
    styleUrls: ['./user-management.component.css']
})
export class UserManagementComponent implements OnInit {
    users = signal<UtilisateurDTO[]>([]);
    totalElements = signal(0);
    currentPage = signal(0);
    pageSize = signal(10);

    selectedRole = signal<string>('');
    searchTerm = signal('');

    isLoading = signal(false);
    showCreateModal = signal(false);
    showEditModal = signal(false);
    selectedUser = signal<UtilisateurDTO | null>(null);

    newUser = signal<CreateUtilisateurDTO>({
        email: '',
        nom: '',
        prenom: '',
        role: 'EMPLOYE',
        password: ''
    });

    editUser = signal<UpdateUtilisateurDTO>({});

    roles = signal<MetadataOption[]>([]);

    constructor(private rhService: RhService, private metadataService: MetadataService) { }

    ngOnInit(): void {
        this.loadMetadata();
        this.loadUsers();
    }

    loadMetadata(): void {
        this.metadataService.getMetadata().subscribe(meta => {
            this.roles.set(meta.roles);
        });
    }

    loadUsers(): void {
        this.isLoading.set(true);
        const role = this.selectedRole() || undefined;

        this.rhService.getAllUsers(role, this.currentPage(), this.pageSize()).subscribe({
            next: (response: PageResponse<UtilisateurDTO>) => {
                this.users.set(response.content);
                this.totalElements.set(response.totalElements);
                this.isLoading.set(false);
            },
            error: (err) => {
                console.error('Erreur chargement utilisateurs:', err);
                this.isLoading.set(false);
            }
        });
    }

    filterByRole(role: string): void {
        this.selectedRole.set(role);
        this.currentPage.set(0);
        this.loadUsers();
    }

    clearFilter(): void {
        this.selectedRole.set('');
        this.currentPage.set(0);
        this.loadUsers();
    }

    openCreateModal(): void {
        this.newUser.set({
            email: '',
            nom: '',
            prenom: '',
            role: 'EMPLOYE',
            password: ''
        });
        this.showCreateModal.set(true);
    }

    closeCreateModal(): void {
        this.showCreateModal.set(false);
    }

    createUser(): void {
        this.rhService.createUser(this.newUser()).subscribe({
            next: () => {
                this.closeCreateModal();
                this.loadUsers();
            },
            error: (err) => console.error('Erreur création utilisateur:', err)
        });
    }

    openEditModal(user: UtilisateurDTO): void {
        this.selectedUser.set(user);
        this.editUser.set({
            nom: user.nom,
            prenom: user.prenom,
            email: user.email,
            departement: user.departement || user.departementResponsable,
            poste: user.poste,
            service: user.service,
            domaine: user.domaine,
            matricule: user.matricule,
            dateEmbauche: user.dateEmbauche,
            niveauExperience: user.niveauExperience,
            disponibilite: user.disponibilite,
            managerId: user.managerId,
            departementResponsable: user.departementResponsable
        });
        this.showEditModal.set(true);
    }

    closeEditModal(): void {
        this.showEditModal.set(false);
        this.selectedUser.set(null);
    }

    updateUser(): void {
        const user = this.selectedUser();
        if (!user) return;

        this.rhService.updateUser(user.id, this.editUser()).subscribe({
            next: () => {
                this.closeEditModal();
                this.loadUsers();
            },
            error: (err) => console.error('Erreur mise à jour utilisateur:', err)
        });
    }

    toggleUserStatus(user: UtilisateurDTO): void {
        const action = user.enabled
            ? this.rhService.deactivateUser(user.id)
            : this.rhService.activateUser(user.id);

        action.subscribe({
            next: () => this.loadUsers(),
            error: (err) => console.error('Erreur changement statut:', err)
        });
    }

    nextPage(): void {
        if ((this.currentPage() + 1) * this.pageSize() < this.totalElements()) {
            this.currentPage.update(p => p + 1);
            this.loadUsers();
        }
    }

    previousPage(): void {
        if (this.currentPage() > 0) {
            this.currentPage.update(p => p - 1);
            this.loadUsers();
        }
    }

    protected Math = Math;

    getRoleColor(role: string): string {
        switch (role) {
            case 'RH': return 'var(--primary)';
            case 'MANAGER': return 'var(--info)';
            case 'CHEF_PROJET': return 'var(--success)';
            default: return 'var(--text-light)';
        }
    }

    getRoleLabel(role: string): string {
        return this.metadataService.getLabel(this.roles(), role);
    }

    getFilteredUsers(): UtilisateurDTO[] {
        const term = this.searchTerm().toLowerCase();
        if (!term) return this.users();

        return this.users().filter(u =>
            u.nom.toLowerCase().includes(term) ||
            u.prenom.toLowerCase().includes(term) ||
            u.email.toLowerCase().includes(term)
        );
    }
}
