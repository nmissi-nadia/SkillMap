import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

// ========== MODELS ==========

export interface UtilisateurDTO {
    id: string;
    email: string;
    nom: string;
    prenom: string;
    role: 'EMPLOYE' | 'MANAGER' | 'RH' | 'CHEF_PROJET' | 'ADMIN';
    enabled: boolean;
    dateCreation: string;
    provider: 'LOCAL' | 'GOOGLE' | 'OKTA';
}

export interface CreateUtilisateurDTO {
    email: string;
    nom: string;
    prenom: string;
    role: 'EMPLOYE' | 'MANAGER' | 'RH' | 'CHEF_PROJET' | 'ADMIN';
    password?: string;
    departement?: string;
    poste?: string;
    service?: string;
    domaine?: string;
}

export interface UpdateUtilisateurDTO {
    nom?: string;
    prenom?: string;
    email?: string;
    departement?: string;
    poste?: string;
    service?: string;
    domaine?: string;
}

export interface SkillsMapDTO {
    totalCompetences: number;
    totalEmployes: number;
    niveauMoyenGlobal: number;
    repartitionParCategorie: { [key: string]: number };
}

export interface RareSkillDTO {
    competenceId: string;
    competenceNom: string;
    categorie: string;
    nombreEmployes: number;
    rarete: 'UNIQUE' | 'TRÈS_RARE' | 'RARE' | 'COMMUN';
}

export interface CriticalSkillDTO {
    competenceId: string;
    competenceNom: string;
    categorie: string;
    nombreEmployes: number;
    niveauMoyen: number;
    criticite: 'CRITIQUE' | 'HAUTE' | 'MOYENNE' | 'BASSE';
}

export interface FormationDTO {
    id: string;
    titre: string;
    organisme: string;
    type: string;
    statut: string;
    dateDebut: string;
    dateFin?: string;
    employeIds: string[];
}

export interface CreateFormationDTO {
    titre: string;
    organisme: string;
    type: string;
    statut?: string;
    dateDebut: string;
    dateFin?: string;
    cout?: number;
    certification?: string;
}

export interface AssignFormationDTO {
    formationId: string;
    employeIds: string[];
    commentaire?: string;
}

export interface FormationBudgetDTO {
    formationId: string;
    titre: string;
    coutTotal?: number;
    nombreEmployesAssignes: number;
    nombreEmployesTermines: number;
    nombreEmployesEnCours: number;
    coutParEmploye?: number;
    tauxCompletion: number;
    roi: number;
    dateDebut: string;
    dateFin?: string;
    employesStatuts: EmployeFormationStatusDTO[];
}

export interface EmployeFormationStatusDTO {
    employeId: string;
    employeNom: string;
    employePrenom: string;
    statut: string;
    progression: number;
    certification?: string;
    valideeParRH: boolean;
}

export interface CertificationValidationDTO {
    employeId: string;
    formationId: string;
    certification: string;
    urlCertificat?: string;
    valide: boolean;
    commentaire?: string;
}

export interface PageResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}

@Injectable({
    providedIn: 'root'
})
export class RhService {
    private apiUrl = `${environment.apiUrl}/rh`;

    constructor(private http: HttpClient) { }

    // ========== PHASE 1: GESTION DES UTILISATEURS ==========

    getAllUsers(role?: string, page: number = 0, size: number = 10): Observable<PageResponse<UtilisateurDTO>> {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('size', size.toString());

        if (role) {
            params = params.set('role', role);
        }

        return this.http.get<PageResponse<UtilisateurDTO>>(`${this.apiUrl}/users`, { params });
    }

    createUser(dto: CreateUtilisateurDTO): Observable<UtilisateurDTO> {
        return this.http.post<UtilisateurDTO>(`${this.apiUrl}/users`, dto);
    }

    updateUser(userId: string, dto: UpdateUtilisateurDTO): Observable<UtilisateurDTO> {
        return this.http.put<UtilisateurDTO>(`${this.apiUrl}/users/${userId}`, dto);
    }

    activateUser(userId: string): Observable<void> {
        return this.http.patch<void>(`${this.apiUrl}/users/${userId}/activate`, {});
    }

    deactivateUser(userId: string): Observable<void> {
        return this.http.patch<void>(`${this.apiUrl}/users/${userId}/deactivate`, {});
    }

    assignManager(employeId: string, managerId: string): Observable<any> {
        return this.http.put(`${this.apiUrl}/employees/${employeId}/manager`, null, {
            params: { managerId }
        });
    }

    getDepartments(): Observable<string[]> {
        return this.http.get<string[]>(`${this.apiUrl}/departments`);
    }

    // ========== PHASE 2: CARTOGRAPHIE DES COMPÉTENCES ==========

    getSkillsMap(department?: string, poste?: string, niveau?: number): Observable<SkillsMapDTO> {
        let params = new HttpParams();

        if (department) params = params.set('department', department);
        if (poste) params = params.set('poste', poste);
        if (niveau) params = params.set('niveau', niveau.toString());

        return this.http.get<SkillsMapDTO>(`${this.apiUrl}/skills/map`, { params });
    }

    getRareSkills(threshold: number = 5): Observable<RareSkillDTO[]> {
        return this.http.get<RareSkillDTO[]>(`${this.apiUrl}/skills/rare`, {
            params: { threshold: threshold.toString() }
        });
    }

    getCriticalSkills(): Observable<CriticalSkillDTO[]> {
        return this.http.get<CriticalSkillDTO[]>(`${this.apiUrl}/skills/critical`);
    }

    // ========== PHASE 3: GESTION DES FORMATIONS ==========

    getAllFormations(page: number = 0, size: number = 10): Observable<PageResponse<FormationDTO>> {
        const params = new HttpParams()
            .set('page', page.toString())
            .set('size', size.toString());

        return this.http.get<PageResponse<FormationDTO>>(`${this.apiUrl}/formations`, { params });
    }

    createFormation(dto: CreateFormationDTO): Observable<FormationDTO> {
        return this.http.post<FormationDTO>(`${this.apiUrl}/formations`, dto);
    }

    updateFormation(formationId: string, dto: CreateFormationDTO): Observable<FormationDTO> {
        return this.http.put<FormationDTO>(`${this.apiUrl}/formations/${formationId}`, dto);
    }

    assignFormation(dto: AssignFormationDTO): Observable<string[]> {
        return this.http.post<string[]>(`${this.apiUrl}/formations/assign`, dto);
    }

    getFormationBudget(formationId: string): Observable<FormationBudgetDTO> {
        return this.http.get<FormationBudgetDTO>(`${this.apiUrl}/formations/${formationId}/budget`);
    }

    getFormationROI(formationId: string): Observable<number> {
        return this.http.get<number>(`${this.apiUrl}/formations/${formationId}/roi`);
    }

    validateCertification(dto: CertificationValidationDTO): Observable<void> {
        return this.http.post<void>(`${this.apiUrl}/certifications/validate`, dto);
    }
}
