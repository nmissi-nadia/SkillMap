import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface MetadataOption {
  value: string | number;
  label: string;
}

export interface MetadataResponse {
  roles: MetadataOption[];
  formationTypes: MetadataOption[];
  formationStatuts: MetadataOption[];
  projetStatuts: MetadataOption[];
  projetPriorites: MetadataOption[];
  competenceLevels: MetadataOption[];
  competenceTypes: MetadataOption[];
  inscriptionStatuts: MetadataOption[];
}

@Injectable({ providedIn: 'root' })
export class MetadataService {
  private readonly apiUrl = `${environment.apiUrl}/metadata`;
  private metadata$?: Observable<MetadataResponse>;

  constructor(private http: HttpClient) {}

  /**
   * Récupérer toutes les métadonnées avec mise en cache (shareReplay)
   */
  getMetadata(): Observable<MetadataResponse> {
    if (!this.metadata$) {
      this.metadata$ = this.http.get<MetadataResponse>(this.apiUrl).pipe(
        shareReplay(1)
      );
    }
    return this.metadata$;
  }

  /**
   * Helper pour obtenir un label à partir d'une valeur et d'une liste d'options
   */
  getLabel(options: MetadataOption[], value: string | number): string {
    const option = options.find(o => o.value === value);
    return option ? option.label : String(value);
  }
}
