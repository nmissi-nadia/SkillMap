export interface TechnicalTest {
    id: string;
    titre: string;
    description: string;
    type: TestType;
    duree: number; // en minutes
    difficulte: TestDifficulte;
    competences: string[];
    questions?: TestQuestion[];
    dateCreation: Date;
}

export interface TestAssignment {
    id: string;
    testId: string;
    test: TechnicalTest;
    employeId: string;
    employeNom: string;
    employePrenom: string;
    managerId: string;
    statut: TestStatut;
    dateAssignation: Date;
    dateLimite: Date;
    dateDebut?: Date;
    dateFin?: Date;
    score?: number;
    reponses?: TestReponse[];
    commentaireManager?: string;
}

export interface TestQuestion {
    id: string;
    question: string;
    type: QuestionType;
    options?: string[]; // Pour QCM
    reponseCorrecte?: string | string[];
    points: number;
}

export interface TestReponse {
    questionId: string;
    reponse: string | string[];
    estCorrecte?: boolean;
    pointsObtenus?: number;
}

export enum TestType {
    TECHNIQUE = 'TECHNIQUE',
    COMPORTEMENTAL = 'COMPORTEMENTAL',
    COMPETENCE = 'COMPETENCE'
}

export enum TestDifficulte {
    FACILE = 'FACILE',
    MOYEN = 'MOYEN',
    DIFFICILE = 'DIFFICILE'
}

export enum TestStatut {
    ASSIGNE = 'ASSIGNE',
    EN_COURS = 'EN_COURS',
    TERMINE = 'TERMINE',
    EVALUE = 'EVALUE'
}

export enum QuestionType {
    QCM = 'QCM',
    TEXTE_LIBRE = 'TEXTE_LIBRE',
    CODE = 'CODE',
    VRAI_FAUX = 'VRAI_FAUX'
}
