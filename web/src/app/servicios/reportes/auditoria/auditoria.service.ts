import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class AuditoriaService {

  constructor(
    private http: HttpClient,
  ) { }

  // METODO PARA CONSULTAR DATOS EMPAQUETADOS - AUDITORIA     **USADO**
  ConsultarAuditoriaPorTablaEmpaquetados(data: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/reportes-auditoria/auditarportablaempaquetados`, data, {
      observe: 'response',
      responseType: 'blob' // INDICAR QUE ESPERAMOS UNA RESPUESTA DE TIPO BLOB (PARA LA TRANSMISIÓN)
    });
  }

  // METODO DE CONSULTA DE AUDITORIA DE INICIOS DE SESION    **USADO**
  ConsultarAuditoriaAccesos(data: any) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/reportes-auditoria/auditarAccesos`, data);
  }

}