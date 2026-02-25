/**
 * Enum des rôles utilisateur
 * Correspond à l'enum RoleUtilisateur du backend
 */
export enum RoleUtilisateur {
    EMPLOYE = 'EMPLOYE',
    MANAGER = 'MANAGER',
    RH = 'RH',
    CHEF_PROJET = 'CHEF_PROJET'
}

/**
 * Labels français pour les rôles
 */
export const RoleLabels: Record<RoleUtilisateur, string> = {
    [RoleUtilisateur.EMPLOYE]: 'Employé',
    [RoleUtilisateur.MANAGER]: 'Manager',
    [RoleUtilisateur.RH]: 'Ressources Humaines',
    [RoleUtilisateur.CHEF_PROJET]: 'Chef de Projet'
};
