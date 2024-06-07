import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { catchError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuditoriaService {

  constructor(
    private http: HttpClient,
  ) { }

  // catalogo de departamentos

  ConsultarAuditoria(data: any) {
    return this.http.post(`${environment.url}/reportes-auditoria/auditar`, data);
  }

}
