export interface Notification {
  id: string;
  titre: string;
  contenu: string;
  type: 'INFO' | 'ALERTE' | 'ACTION' | 'SUCCESS';
  lu: boolean;
  dateEnvoi: string;
  lien?: string;
  senderNom?: string;
  senderId?: string;
}

export interface UnreadCountResponse {
  count: number;
}

export interface PaginatedNotifications {
  content: Notification[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
