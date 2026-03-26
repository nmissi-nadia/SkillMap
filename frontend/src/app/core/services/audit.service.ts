import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AuditLog {
    id: string;
    action: string;
    entite: string;
    ancienEtat: string;
    nouvelEtat: string;
    dateAction: string;
    utilisateurId: string;
}

export interface PaginatedResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}

@Injectable({
    providedIn: 'root'
})
export class AuditService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/audit-logs`;

    getLogs(page: number = 0, size: number = 10): Observable<PaginatedResponse<AuditLog>> {
        const params = new HttpParams()
            .set('page', page.toString())
            .set('size', size.toString());
        
        return this.http.get<PaginatedResponse<AuditLog>>(this.apiUrl, { params });
    }
}
