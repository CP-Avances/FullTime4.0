import { HttpClient, HttpResponse } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class AuditoriaService {

  constructor(
    private http: HttpClient,
  ) { }


  ConsultarAuditoriaPorTablaEmpaquetados(data: any){
    return this.http.post(`${environment.url}/reportes-auditoria/auditarportablaempaquetados`, data, {
      observe: 'response',
      responseType: 'blob' // Indicar que esperamos una respuesta de tipo Blob (para la transmisión)
    });
  }

}