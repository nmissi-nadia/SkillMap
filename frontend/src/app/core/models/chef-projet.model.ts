// ============================================================
// Modèles Chef de Projet
// ============================================================

export interface Projet {
    id: string;
    nom: string;
    description: string;
    dateDebut: string;
    dateFin: string;
    statut: 'PLANIFIE' | 'EN_COURS' | 'TERMINE' | 'SUSPENDU';
    client: string;
    budget: number;
    priorite: 'HAUTE' | 'MOYENNE' | 'BASSE';
    chargeEstimee: number;
    progression: number;
    chefProjetId?: string;
    nombreMembres?: number;
    competencesRequises?: CompetenceRequise[];
}

export interface ProjetCreate {
    nom: string;
    description: string;
    dateDebut: string;
    dateFin: string;
    statut?: string;
    client?: string;
    budget?: number;
    priorite?: string;
    chargeEstimee?: number;
}

export interface CompetenceRequise {
    id?: string;
    competenceId: string;
    competenceNom?: string;
    niveauRequis: number;
    priorite: 'CRITIQUE' | 'IMPORTANTE' | 'OPTIONNELLE';
}

export interface MembreEquipe {
    id: string;
    employeId: string;
    employeNom: string;
    employePrenom: string;
    employeEmail: string;
    roleDansProjet: string;
    tauxAllocation: number;
    dateDebut: string;
    dateFin?: string;
    statut: 'ACTIVE' | 'TERMINEE' | 'ANNULEE';
    scoreCompatibilite?: number;
    disponible?: boolean;
}

export interface AffectationRequest {
    employeId: string;
    roleDansProjet: string;
    tauxAllocation: number;
    dateDebut: string;
    dateFin?: string;
}

export interface EmployeeMatch {
    employeId: string;
    nom: string;
    prenom: string;
    email: string;
    poste: string;
    departement: string;
    scoreGlobal: number;
    scoreCompetences: number;
    scoreDisponibilite: number;
    disponible: boolean;
    competencesMatchees: CompetenceMatch[];
    competencesManquantes: string[];
    chargeActuelle?: number;
}

export interface CompetenceMatch {
    competenceNom: string;
    niveauEmploye: number;
    niveauRequis: number;
    ecart: number;
    satisfait: boolean;
}

export interface MatchingResult {
    projetId: string;
    projetNom: string;
    candidates: EmployeeMatch[];
    totalAnalyses: number;
    scoreMinimum: number;
}

export interface MessageProjet {
    id: string;
    contenu: string;
    dateEnvoi: string;
    lu: boolean;
    expediteur: {
        id: string;
        nom: string;
        prenom: string;
        role: string;
    };
    projetId: string;
    projetNom?: string;
}

export interface MessageCreate {
    contenu: string;
    projetId: string;
    destinataireId?: string;
}

export interface ProjetStats {
    totalProjets: number;
    projetsActifs: number;
    totalMembres: number;
    projetsEnRetard: number;
    progressionMoyenne: number;
    projetsParStatut: Record<string, number>;
    alertesSousStaffing: string[];
}
