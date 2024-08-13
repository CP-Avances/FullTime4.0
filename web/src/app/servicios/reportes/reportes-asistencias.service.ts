import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment'

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
    return this.http.get<any>(`${environment.url}/reportes-asistencias/datos_generales/${estado}`);
  }
  
  ReportePuntualidadMultiple(data: any, desde: string, hasta: string, parametros: any) {
    const params = new HttpParams()
      .set('menor', parametros.menor)
      .set('intermedio', parametros.intermedio)
      .set('mayor', parametros.mayor);
    return this.http.put<any>(`${environment.url}/reportes-asistencias/puntualidad/${desde}/${hasta}`, data, { params });
  }

  // METODO PARA CONSULTAR LISTA DE TIMBRES DEL USUARIO    **USADO
  ReporteTimbresMultiple(data: any, desde: string, hasta: string) {
    return this.http.post<any>(`${environment.url}/reportes-asistencias/timbres/${desde}/${hasta}`, data);
  }

  ReporteTimbreSistema(data: any, desde: string, hasta: string) {
    return this.http.put<any>(`${environment.url}/reportes-asistencias/timbres-sistema/${desde}/${hasta}`, data);
  }

  ReporteTimbreSistemaRegimenCargo(data: any, desde: string, hasta: string) {
    return this.http.put<any>(`${environment.url}/reportes-asistencias/timbres-sistema-regimen-cargo/${desde}/${hasta}`, data);
  }

  ReporteTimbreRelojVirtual(data: any, desde: string, hasta: string) {
    return this.http.put<any>(`${environment.url}/reportes-asistencias/timbres-reloj-virtual/${desde}/${hasta}`, data);
  }

  ReporteTimbreRelojVirtualRegimenCargo(data: any, desde: string, hasta: string) {
    return this.http.put<any>(`${environment.url}/reportes-asistencias/timbres-reloj-virtual-regimen-cargo/${desde}/${hasta}`, data);
  }

  ReporteTimbreHorarioAbierto(data: any, desde: string, hasta: string) {
    return this.http.put<any>(`${environment.url}/reportes-asistencias/timbres-horario-abierto/${desde}/${hasta}`, data);
  }

  ReporteTimbreHorarioAbiertoRegimenCargo(data: any, desde: string, hasta: string) {
    return this.http.put<any>(`${environment.url}/reportes-asistencias/timbres-horario-abierto-regimen-cargo/${desde}/${hasta}`, data);
  }

  ReporteTimbresIncompletos(data: any, desde: string, hasta: string) {
    return this.http.put<any>(`${environment.url}/reportes-asistencias/timbres-incompletos/${desde}/${hasta}`, data);
  }

  ReporteTimbresIncompletosRegimenCargo(data: any, desde: string, hasta: string) {
    return this.http.put<any>(`${environment.url}/reportes-asistencias/timbres-incompletos-regimen-cargo/${desde}/${hasta}`, data);
  }

}