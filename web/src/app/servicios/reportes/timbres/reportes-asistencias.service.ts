import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ReportesAsistenciasService {

  constructor(
    private http: HttpClient
  ) { }


  // METODO PARA CONSULTAR LISTA DE TIMBRES DEL USUARIO    **USADO**
  ReporteTimbresMultiple(data: any, desde: string, hasta: string) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/reportes-asistencias/timbres/${desde}/${hasta}`, data);
  }

  // METODO DE BUSQUEDA DE TIMBRES DE TIMBRE VIRTUAL      **USADO**
  ReporteTimbreSistema(data: any, desde: string, hasta: string) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/reportes-asistencias/timbres-sistema/${desde}/${hasta}`, data);
  }

  // METODO DE BUSQUEDA DE TIMBRES DEL RELOJ VIRTUAL    **USADO**
  ReporteTimbreRelojVirtual(data: any, desde: string, hasta: string) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/reportes-asistencias/timbres-reloj-virtual/${desde}/${hasta}`, data);
  }

  // METODO DE BUSQUEDA DE TIMBRES HORARIO ABIERTO    **USADO**
  ReporteTimbreHorarioAbierto(data: any, desde: string, hasta: string) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/reportes-asistencias/timbres-horario-abierto/${desde}/${hasta}`, data);
  }

  // METODO DE BUSQUEDA DE TIMBRES INCOMPLETOS      **USADO**
  ReporteTimbresIncompletos(data: any, desde: string, hasta: string) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/reportes-asistencias/timbres-incompletos/${desde}/${hasta}`, data);
  }

}