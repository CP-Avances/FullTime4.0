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
    return this.http.get<any>(`${(localStorage.getItem('empresaURL') as string)}/reportes-asistencias/datos_generales/${estado}`);
  }




  DepartamentosByEmplEstado(estado: any) {
    return this.http.get<any>(`${(localStorage.getItem('empresaURL') as string)}/reportes-asistencias/datos_generales/${estado}`);
  }

  // CONSULTA DE INFORMACION GENERAL DEL COLABORADOR CARGOS
  ObtenerInformacionCargo(estado: any) {
    return this.http.get<any>(`${(localStorage.getItem('empresaURL') as string)}/reportes-asistencias/informacion-general-cargo/${estado}`);
  }

  ReporteFaltasMultiples(data: any, desde: string, hasta: string) {
    return this.http.put<any>(`${(localStorage.getItem('empresaURL') as string)}/reportes-asistencias/faltas-empleados/${desde}/${hasta}`, data);
  }

  ReporteFaltasMultiplesTabulado(data: any, desde: string, hasta: string) {
    return this.http.put<any>(`${(localStorage.getItem('empresaURL') as string)}/reportes-asistencias/faltas-tabulado/${desde}/${hasta}`, data);
  }

  ReporteHorasTrabajadasMultiple(data: any, desde: string, hasta: string) {
    return this.http.put<any>(`${(localStorage.getItem('empresaURL') as string)}/reportes-asistencias/horas-trabaja/${desde}/${hasta}`, data);
  }

  ReporteTimbresAbiertos(dataArray: any, desde: string, hasta: string) {
    const params = new HttpParams()
      .set('data', JSON.stringify(dataArray))
      .set('desde', desde)
      .set('hasta', hasta);
    return this.http.get<any>(`${(localStorage.getItem('empresaURL') as string)}/reportes-asistencias/timbres-abiertos`, { params });
  }

  ReportePuntualidadMultiple(data: any, desde: string, hasta: string, parametros: any) {
    const params = new HttpParams()
      .set('menor', parametros.menor)
      .set('intermedio', parametros.intermedio)
      .set('mayor', parametros.mayor);
    return this.http.put<any>(`${(localStorage.getItem('empresaURL') as string)}/reportes-asistencias/puntualidad/${desde}/${hasta}`, data, { params });
  }

  ReporteTimbresMultiple(data: any, desde: string, hasta: string) {
    return this.http.put<any>(`${(localStorage.getItem('empresaURL') as string)}/reportes-asistencias/timbres/${desde}/${hasta}`, data);
  }

  ReporteTimbresMultipleRegimenCargo(data: any, desde: string, hasta: string) {
    return this.http.put<any>(`${(localStorage.getItem('empresaURL') as string)}/reportes-asistencias/timbres-regimen-cargo/${desde}/${hasta}`, data);
  }

  ReporteTimbreSistema(data: any, desde: string, hasta: string) {
    return this.http.put<any>(`${(localStorage.getItem('empresaURL') as string)}/reportes-asistencias/timbres-sistema/${desde}/${hasta}`, data);
  }

  ReporteTimbreSistemaRegimenCargo(data: any, desde: string, hasta: string) {
    return this.http.put<any>(`${(localStorage.getItem('empresaURL') as string)}/reportes-asistencias/timbres-sistema-regimen-cargo/${desde}/${hasta}`, data);
  }

  ReporteTimbreRelojVirtual(data: any, desde: string, hasta: string) {
    return this.http.put<any>(`${(localStorage.getItem('empresaURL') as string)}/reportes-asistencias/timbres-reloj-virtual/${desde}/${hasta}`, data);
  }

  ReporteTimbreRelojVirtualRegimenCargo(data: any, desde: string, hasta: string) {
    return this.http.put<any>(`${(localStorage.getItem('empresaURL') as string)}/reportes-asistencias/timbres-reloj-virtual-regimen-cargo/${desde}/${hasta}`, data);
  }

  ReporteTimbreHorarioAbierto(data: any, desde: string, hasta: string) {
    return this.http.put<any>(`${(localStorage.getItem('empresaURL') as string)}/reportes-asistencias/timbres-horario-abierto/${desde}/${hasta}`, data);
  }

  ReporteTimbreHorarioAbiertoRegimenCargo(data: any, desde: string, hasta: string) {
    return this.http.put<any>(`${(localStorage.getItem('empresaURL') as string)}/reportes-asistencias/timbres-horario-abierto-regimen-cargo/${desde}/${hasta}`, data);
  }

  ReporteTimbresIncompletos(data: any, desde: string, hasta: string) {
    return this.http.put<any>(`${(localStorage.getItem('empresaURL') as string)}/reportes-asistencias/timbres-incompletos/${desde}/${hasta}`, data);
  }

  ReporteTimbresIncompletosRegimenCargo(data: any, desde: string, hasta: string) {
    return this.http.put<any>(`${(localStorage.getItem('empresaURL') as string)}/reportes-asistencias/timbres-incompletos-regimen-cargo/${desde}/${hasta}`, data);
  }

  ReporteTimbrestabulados(data: any, desde: string, hasta: string) {
    return this.http.put<any>(`${(localStorage.getItem('empresaURL') as string)}/reportes-asistencias/timbres-tabulados/${desde}/${hasta}`, data);
  }

  ReporteTabuladoTimbresIncompletos(data: any, desde: string, hasta: string) {
    return this.http.put<any>(`${(localStorage.getItem('empresaURL') as string)}/reportes-asistencias/timbres-tabulados-incompletos/${desde}/${hasta}`, data);
  }

}