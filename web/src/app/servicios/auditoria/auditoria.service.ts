import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders , HttpResponse   } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { catchError } from 'rxjs';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class AuditoriaService {

  constructor(
    private http: HttpClient,
  ) { }

  // catalogo de departamentos

  ConsultarAuditoriaOriginal(data: any) {
    return this.http.post(`${environment.url}/reportes-auditoria/auditar`, data, );
  }
  

  ConsultarAuditoria2(data: any) {
    const headers = new HttpHeaders({
      'Accept-Encoding': 'gzip, deflate',
      'Content-Type': 'application/json'
    });

    return this.http.post(`${environment.url}/reportes-auditoria/auditar`, data, {
      headers: headers,
      responseType: 'arraybuffer' // Esto indica que esperamos una respuesta binaria
    });
  }


  ConsultarAuditoria(data: any): Observable<HttpResponse<Blob>> {
    return this.http.post(`${environment.url}/reportes-auditoria/auditar`, data, {
      observe: 'response',
      responseType: 'blob' // Indicar que esperamos una respuesta de tipo Blob (para la transmisión)
    });
  }
}
