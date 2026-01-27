/**
 * Interface représentant un employé
 */
export interface Employe {
    id?: number;
    nom: string;
    prenom: string;
    email: string;
    poste?: string;
    departement?: string;
    dateEmbauche?: Date;
}

/**
 * Interface pour la création/mise à jour d'un employé
 */
export interface EmployeDTO {
    nom: string;
    prenom: string;
    email: string;
    poste?: string;
    departement?: string;
}
