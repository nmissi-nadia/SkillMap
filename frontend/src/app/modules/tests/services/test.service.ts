import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { TestTechnique, TestEmploye } from '../models/test.model';

@Injectable({
    providedIn: 'root'
})
export class TestService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/tests`;

    getAllTests(): Observable<TestTechnique[]> {
        return this.http.get<TestTechnique[]>(this.apiUrl);
    }

    getTestById(id: string): Observable<TestTechnique> {
        return this.http.get<TestTechnique>(`${this.apiUrl}/${id}`);
    }

    createTest(test: TestTechnique): Observable<TestTechnique> {
        return this.http.post<TestTechnique>(this.apiUrl, test);
    }

    assignTest(testId: string, employeId: string): Observable<TestEmploye> {
        return this.http.post<TestEmploye>(`${this.apiUrl}/${testId}/assign/${employeId}`, {});
    }
}
