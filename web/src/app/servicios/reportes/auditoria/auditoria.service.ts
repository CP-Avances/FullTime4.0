import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class AuditoriaService {

  constructor(
    private http: HttpClient,
  ) { }

  ConsultarAuditoriaPorTabla(data: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/reportes-auditoria/auditarportabla`, data,);
  }
  
  ConsultarAuditoriaPorTablaEmpaquetados(data: any){
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/reportes-auditoria/auditarportablaempaquetados`, data, {
      observe: 'response',
      responseType: 'blob' // Indicar que esperamos una respuesta de tipo Blob (para la transmisión)
    });
  }

  ConsultarAuditoria(data: any): Observable<HttpResponse<Blob>> {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/reportes-auditoria/auditar`, data, {
      observe: 'response',
      responseType: 'blob' // Indicar que esperamos una respuesta de tipo Blob (para la transmisión)
    });
  }
}