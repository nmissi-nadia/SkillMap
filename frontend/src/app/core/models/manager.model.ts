export interface TeamStats {
    nombreEmployes: number;
    niveauMoyenEquipe: number;
    competencesFortes: string[];
    competencesFaibles: string[];
    evaluationsEnAttente: number;
    testsEnCours: number;
    projetsActifs: number;
}

export interface PendingEvaluation {
    id: string;
    employe: {
        id: string;
        nom: string;
        prenom: string;
    };
    competence: {
        id: string;
        nom: string;
    };
    niveauAuto: number;
    commentaireEmploye: string;
    dateAutoEvaluation: Date;
    statut: string;
}

export interface ValidationRequest {
    niveauManager: number;
    commentaireManager: string;
    valide: boolean;
}

export interface TestAssignment {
    id: string;
    employe: {
        nom: string;
        prenom: string;
    };
    test: {
        nom: string;
        competence: string;
    };
    dateAssignation: Date;
    dateEcheance: Date;
    statut: 'EN_COURS' | 'TERMINE' | 'EXPIRE';
    score?: number;
}

export interface ManagerDashboard {
    equipe: {
        nombreEmployes: number;
        niveauMoyen: number;
        disponibles: number;
    };
    evaluations: {
        enAttente: number;
        valideesCeMois: number;
    };
    tests: {
        enCours: number;
        terminesCeMois: number;
        tauxReussite: number;
    };
    projets: {
        actifs: number;
        employesAffectes: number;
    };
}
