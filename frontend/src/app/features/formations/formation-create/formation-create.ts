import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, FormArray, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { FormationService } from '../../../core/services/formation.service';
import { TypeFormation, TypeRessource } from '../../../core/models/formation.model';
import { HttpClient } from '@angular/common/http';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-formation-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule
  ],
  templateUrl: './formation-create.html',
  styleUrl: './formation-create.scss',
})
export class FormationCreate implements OnInit {
  formationForm!: FormGroup;
  typesFormation = Object.values(TypeFormation);
  typesRessource = Object.values(TypeRessource);
  competences: any[] = []; // Remplacez par CompetenceDTO[] si dispo

  constructor(
    private fb: FormBuilder,
    private formationService: FormationService,
    private http: HttpClient,
    private router: Router,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.loadCompetences();
  }

  initForm(): void {
    this.formationForm = this.fb.group({
      titre: ['', Validators.required],
      description: ['', Validators.required],
      typeFormation: ['', Validators.required],
      technologie: [''],
      dateDebut: [''],
      dateFin: [''],
      lieu: [''],
      competenceId: [''],
      niveauCible: [1, [Validators.min(1), Validators.max(5)]],
      ressources: this.fb.array([])
    });

    // Écouter les changements de typeFormation pour ajuster les validateurs
    this.formationForm.get('typeFormation')?.valueChanges.subscribe(type => {
      if (type === TypeFormation.PRESENTIEL) {
        this.formationForm.get('lieu')?.setValidators([Validators.required]);
        this.formationForm.get('dateDebut')?.setValidators([Validators.required]);
      } else {
        this.formationForm.get('lieu')?.clearValidators();
        this.formationForm.get('dateDebut')?.clearValidators();
      }
      this.formationForm.get('lieu')?.updateValueAndValidity();
      this.formationForm.get('dateDebut')?.updateValueAndValidity();
    });
  }

  get ressources() {
    return this.formationForm.get('ressources') as FormArray;
  }

  addRessource(): void {
    const ressourceForm = this.fb.group({
      titre: ['', Validators.required],
      url: ['', Validators.required],
      typeRessource: [TypeRessource.LIEN, Validators.required]
    });
    this.ressources.push(ressourceForm);
  }

  removeRessource(index: number): void {
    this.ressources.removeAt(index);
  }

  loadCompetences(): void {
    this.http.get<any[]>('http://localhost:8085/api/competences').subscribe({
      next: (data: any[]) => this.competences = data,
      error: (err: any) => console.error('Erreur chargement compétences', err)
    });
  }

  onSubmit(): void {
    if (this.formationForm.valid) {
      const formValue = this.formationForm.value;

      // Formatting dates if they exist
      if (formValue.dateDebut) {
        formValue.dateDebut = new Date(formValue.dateDebut).toISOString().split('T')[0];
      }
      if (formValue.dateFin) {
        formValue.dateFin = new Date(formValue.dateFin).toISOString().split('T')[0];
      }

      this.formationService.createFormation(formValue).subscribe({
        next: (res) => {
          this.snackBar.open('Formation créée avec succès !', 'Fermer', { duration: 3000 });
          this.router.navigate(['/formations']);
        },
        error: (err) => {
          console.error(err);
          this.snackBar.open('Erreur lors de la création de la formation.', 'Fermer', { duration: 3000 });
        }
      });
    } else {
      this.formationForm.markAllAsTouched();
    }
  }
}
