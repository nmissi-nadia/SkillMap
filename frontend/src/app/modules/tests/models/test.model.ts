export interface TestTechnique {
    id?: string;
    titre: string;
    description: string;
    competenceId: string;
    dureeMinutes: number;
    niveau: string;
    questions?: Question[];
}

export interface Question {
    id?: string;
    testId?: string;
    contenu: string;
    typeQuestion: string;
    bonneReponse?: string;
    points: number;
}

export interface TestEmploye {
    id?: string;
    testId: string;
    test?: TestTechnique;
    employeId: string;
    statut: string;
    score?: number;
    dateAssignation?: Date;
    dateSoumission?: Date;
}

export interface ReponseEmploye {
    id?: string;
    questionId: string;
    testEmployeId: string;
    reponse: string;
    estCorrect?: boolean;
}

export enum QuestionType {
    QCM = 'QCM',
    TEXTE_LIBRE = 'TEXTE_LIBRE',
    CODE = 'CODE',
    VRAI_FAUX = 'VRAI_FAUX'
}

export enum TestStatus {
    ASSIGNED = 'ASSIGNED',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED'
}
