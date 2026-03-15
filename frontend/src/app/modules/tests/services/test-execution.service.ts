import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { TestEmploye } from '../models/test.model';

@Injectable({
    providedIn: 'root'
})
export class TestExecutionService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}`;

    getEmployeTests(employeId: string): Observable<TestEmploye[]> {
        return this.http.get<TestEmploye[]>(`${this.apiUrl}/employes/${employeId}/tests`);
    }

    startTest(testEmployeId: string): Observable<TestEmploye> {
        return this.http.post<TestEmploye>(`${this.apiUrl}/tests/${testEmployeId}/start`, {});
    }

    submitTest(testEmployeId: string, responses: any): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/tests/${testEmployeId}/submit`, { answers: responses });
    }
}
