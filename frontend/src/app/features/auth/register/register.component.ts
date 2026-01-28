import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { RegisterRequest } from '../../../core/models/auth.model';
import { RoleUtilisateur, RoleLabels } from '../../../core/models/role.enum';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink],
    templateUrl: './register.component.html',
    styleUrl: './register.component.scss'
})
export class RegisterComponent {
    private fb = inject(FormBuilder);
    private authService = inject(AuthService);
    private router = inject(Router);

    registerForm: FormGroup;
    isLoading = signal(false);
    errorMessage = signal<string | null>(null);

    // Exposer les rôles au template
    roles = Object.values(RoleUtilisateur);
    roleLabels = RoleLabels;

    constructor() {
        this.registerForm = this.fb.group({
            nom: ['', [Validators.required, Validators.minLength(2)]],
            prenom: ['', [Validators.required, Validators.minLength(2)]],
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]],
            confirmPassword: ['', [Validators.required]],
            role: [RoleUtilisateur.EMPLOYE, [Validators.required]]
        }, {
            validators: this.passwordMatchValidator
        });
    }

    /**
     * Validateur personnalisé pour vérifier que les mots de passe correspondent
     */
    passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
        const password = control.get('password');
        const confirmPassword = control.get('confirmPassword');

        if (!password || !confirmPassword) {
            return null;
        }

        return password.value === confirmPassword.value ? null : { passwordMismatch: true };
    }

    onSubmit(): void {
        if (this.registerForm.invalid) {
            this.registerForm.markAllAsTouched();
            return;
        }

        this.isLoading.set(true);
        this.errorMessage.set(null);

        const { confirmPassword, ...userData } = this.registerForm.value;
        const registerData: RegisterRequest = userData;

        this.authService.register(registerData).subscribe({
            next: () => {
                // La redirection est gérée automatiquement par auth.service.register()
                // selon le rôle de l'utilisateur
                this.isLoading.set(false);
            },
            error: (error) => {
                this.isLoading.set(false);
                console.error('Erreur d\'inscription:', error);

                if (error.status === 409) {
                    this.errorMessage.set('Cet email est déjà utilisé');
                } else if (error.status === 400) {
                    this.errorMessage.set('Données invalides. Veuillez vérifier vos informations.');
                } else if (error.status === 0) {
                    this.errorMessage.set('Impossible de se connecter au serveur');
                } else {
                    this.errorMessage.set('Une erreur est survenue. Veuillez réessayer.');
                }
            }
        });
    }

    // Getters pour faciliter l'accès aux contrôles du formulaire
    get nom() {
        return this.registerForm.get('nom');
    }

    get prenom() {
        return this.registerForm.get('prenom');
    }

    get email() {
        return this.registerForm.get('email');
    }

    get password() {
        return this.registerForm.get('password');
    }

    get confirmPassword() {
        return this.registerForm.get('confirmPassword');
    }

    get role() {
        return this.registerForm.get('role');
    }

    get passwordsMatch(): boolean {
        return !this.registerForm.errors?.['passwordMismatch'];
    }
}
