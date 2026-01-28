import { RoleUtilisateur } from './role.enum';

/**
 * Modèle Employé
 */
export interface Employee {
    id: string;
    email: string;
    nom: string;
    prenom: string;
    role: RoleUtilisateur;
    matricule?: string;
    poste?: string;
    departement?: string;
    dateEmbauche?: string;
    niveauExperience?: 'Junior' | 'Intermédiaire' | 'Senior';
    disponibilite?: boolean;
    manager?: {
        id: string;
        nom: string;
        prenom: string;
    };
}

/**
 * Compétence d'un employé
 */
export interface EmployeeCompetence {
    id: string;
    competence: {
        id: string;
        nom: string;
        categorie?: string;
    };
    niveauAuto: number; // 1-5
    niveauManager?: number; // 1-5
    dateEvaluation?: string;
    commentaire?: string;
}

/**
 * KPI Dashboard
 */
export interface EmployeeKPI {
    niveauGlobalCompetences: number; // Score moyen
    competencesValidees: number;
    formationsEnCours: number;
    projetsActifs: number;
}

/**
 * Tâche à faire
 */
export interface TodoItem {
    id: string;
    type: 'EVALUATION' | 'TEST' | 'FORMATION';
    title: string;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    dueDate?: Date;
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
}

/**
 * Notification
 */
export interface Notification {
    id: string;
    type: 'VALIDATION' | 'AFFECTATION' | 'MESSAGE' | 'FORMATION';
    title: string;
    message: string;
    date: Date;
    read: boolean;
}

/**
 * Données pour le radar chart
 */
export interface SkillRadarData {
    labels: string[];
    datasets: {
        label: string;
        data: number[];
        backgroundColor?: string;
        borderColor?: string;
    }[];
}
