export enum TypeFormation {
    PDF = 'PDF',
    ONLINE = 'ONLINE',
    PRESENTIEL = 'PRESENTIEL'
}

export enum TypeRessource {
    PDF = 'PDF',
    LIEN = 'LIEN'
}

export enum InscriptionStatut {
    INSCRIT = 'INSCRIT',
    EN_COURS = 'EN_COURS',
    TERMINE = 'TERMINE'
}

export interface CreateRessourceDTO {
    titre: string;
    url: string;
    typeRessource: TypeRessource;
}

export interface RessourceFormationDTO {
    id: string;
    titre: string;
    url: string;
    typeRessource: TypeRessource;
}

export interface CreateFormationRequestDTO {
    titre: string;
    description: string;
    typeFormation: TypeFormation;
    technologie?: string;
    dateDebut?: string;
    dateFin?: string;
    lieu?: string;
    competenceId?: string;
    niveauCible?: number;
    ressources?: CreateRessourceDTO[];
}

export interface InscriptionDTO {
    id: string;
    employeId: string;
    employeNom: string;
    employePrenom: string;
    statut: InscriptionStatut;
    progress: number;
    score: number;
    dateInscription: string;
}

export interface FormationDetailDTO {
    id: string;
    titre: string;
    description: string;
    typeFormation: TypeFormation;
    technologie?: string;
    dateDebut?: string;
    dateFin?: string;
    lieu?: string;
    competenceId?: string;
    competenceNom?: string;
    niveauCible?: number;
    ressources: RessourceFormationDTO[];
    inscriptions: InscriptionDTO[];
}
