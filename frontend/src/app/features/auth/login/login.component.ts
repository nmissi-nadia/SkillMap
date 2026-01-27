import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { LoginRequest } from '../../../core/models/auth.model';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink],
    templateUrl: './login.component.html',
    styleUrl: './login.component.scss'
})
export class LoginComponent {
    private fb = inject(FormBuilder);
    private authService = inject(AuthService);
    private router = inject(Router);
    private route = inject(ActivatedRoute);

    loginForm: FormGroup;
    isLoading = signal(false);
    errorMessage = signal<string | null>(null);

    constructor() {
        this.loginForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]]
        });
    }

    onSubmit(): void {
        if (this.loginForm.invalid) {
            this.loginForm.markAllAsTouched();
            return;
        }

        this.isLoading.set(true);
        this.errorMessage.set(null);

        const credentials: LoginRequest = this.loginForm.value;

        this.authService.login(credentials).subscribe({
            next: () => {
                // Récupérer l'URL de retour ou rediriger vers le dashboard
                const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
                this.router.navigate([returnUrl]);
            },
            error: (error) => {
                this.isLoading.set(false);
                console.error('Erreur de connexion:', error);

                if (error.status === 401 || error.status === 403) {
                    this.errorMessage.set('Email ou mot de passe incorrect');
                } else if (error.status === 0) {
                    this.errorMessage.set('Impossible de se connecter au serveur');
                } else {
                    this.errorMessage.set('Une erreur est survenue. Veuillez réessayer.');
                }
            }
        });
    }

    // Getters pour faciliter l'accès aux contrôles du formulaire
    get email() {
        return this.loginForm.get('email');
    }

    get password() {
        return this.loginForm.get('password');
    }
}
