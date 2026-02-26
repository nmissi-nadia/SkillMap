export interface DashboardSummary {
    // Employe
    validatedCompetencies?: number;
    ongoingFormations?: number;
    upcomingFormations?: any[];
    
    // Manager
    teamStats?: {
        nombreEmployes: number;
        niveauMoyenEquipe: number;
        competencesFortes: string[];
        competencesFaibles: string[];
        evaluationsEnAttente: number;
        testsEnCours: number;
        projetsActifs: number;
    };
    
    // RH
    totalUsers?: number;
    criticalSkillsCount?: number;
    totalFormationBudget?: number;
    skillDistribution?: { [key: string]: number };
    
    // Chef Projet
    activeProjectsCount?: number;
    avgProjectProgression?: number;
}
