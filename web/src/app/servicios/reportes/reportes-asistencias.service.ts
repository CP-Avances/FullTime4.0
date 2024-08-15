import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ReportesAsistenciasService {

  constructor(
    private http: HttpClient
  ) { }

  // METODO PARA MOSTRAR DATOS DE USUARIOS CON CONFIGURACION DE NOTIFICACION
  DatosGeneralesUsuarios() {
    const estado = 1; // 1 = activo 
    return this.http.get<any>(`${(localStorage.getItem('empresaURL') as string)}/reportes-asistencias/datos_generales/${estado}`);
  }
  
  ReportePuntualidadMultiple(data: any, desde: string, hasta: string, parametros: any) {
    const params = new HttpParams()
      .set('menor', parametros.menor)
      .set('intermedio', parametros.intermedio)
      .set('mayor', parametros.mayor);
    return this.http.put<any>(`${(localStorage.getItem('empresaURL') as string)}/reportes-asistencias/puntualidad/${desde}/${hasta}`, data, { params });
  }

  // METODO PARA CONSULTAR LISTA DE TIMBRES DEL USUARIO    **USADO
  ReporteTimbresMultiple(data: any, desde: string, hasta: string) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/reportes-asistencias/timbres/${desde}/${hasta}`, data);
  }

  // METODO DE BUSQUEDA DE TIMBRES DE TIMBRE VIRTUAL      **USADO
  ReporteTimbreSistema(data: any, desde: string, hasta: string) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/reportes-asistencias/timbres-sistema/${desde}/${hasta}`, data);
  }

  // METODO DE BUSQUEDA DE TIMBRES DEL RELOJ VIRTUAL    **USADO
  ReporteTimbreRelojVirtual(data: any, desde: string, hasta: string) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/reportes-asistencias/timbres-reloj-virtual/${desde}/${hasta}`, data);
  }

  // METODO DE BUSQUEDA DE TIMBRES HORARIO ABIERTO    **USADO
  ReporteTimbreHorarioAbierto(data: any, desde: string, hasta: string) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/reportes-asistencias/timbres-horario-abierto/${desde}/${hasta}`, data);
  }

  // METODO DE BUSQUEDA DE TIMBRES INCOMPLETOS      **USADO
  ReporteTimbresIncompletos(data: any, desde: string, hasta: string) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/reportes-asistencias/timbres-incompletos/${desde}/${hasta}`, data);
  }


}