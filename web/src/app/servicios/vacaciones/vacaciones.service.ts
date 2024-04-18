import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Socket } from 'ngx-socket-io';
import { environment } from '../../../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class VacacionesService {

  constructor(
    private http: HttpClient,
    private socket: Socket
  ) { }

  // realtime
  EnviarNotificacionRealTime(data: any) {
    this.socket.emit('nueva_notificacion', data);
  }

  ActualizarEstado(id: number, datos: any) {
    return this.http.put(`${(localStorage.getItem('empresaURL') as string)}/vacaciones/${id}/estado`, datos);
  }

  ObtenerListaVacaciones() {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/vacaciones`);
  }

  ObtenerListaVacacionesAutorizadas() {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/vacaciones/estado-solicitud`);
  }







  ObtenerVacacionesPorIdPeriodo(id_peri_perido: number) {
    return this.http.get<any>(`${(localStorage.getItem('empresaURL') as string)}/vacaciones/${id_peri_perido}`)
  }

  BuscarFechasFeriado(datos: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/vacaciones/fechasFeriado`, datos);
  }

  BuscarDatosSolicitud(id_emple_vacacion: number) {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/vacaciones/datosSolicitud/${id_emple_vacacion}`);
  }

  BuscarDatosAutorizacion(id_vacaciones: number) {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/vacaciones/datosAutorizacion/${id_vacaciones}`);
  }

  EliminarVacacion(id_vacacion: number) {
    return this.http.delete(`${(localStorage.getItem('empresaURL') as string)}/vacaciones/eliminar/${id_vacacion}`);
  }





  // REPORTE DE VACACIONES DE FORMA MÚLTIPLE
  BuscarSolicitudVacacion(datos: any, desde: string, hasta: string) {
    return this.http.put(`${(localStorage.getItem('empresaURL') as string)}/empleado-vacaciones-solicitudes/vacaciones-solicitudes/${desde}/${hasta}`, datos);
  }

  // BUSQUEDA DE VACACIONES MEDIANTE ID
  ListarUnaVacacion(id: number) {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/vacaciones/listar/vacacion/${id}`);
  }


  // BUSQUEDA DE VACACIONES POR ID DE VACACIONES
  ObtenerUnaVacacion(id: number) {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/vacaciones/one/${id}`);
  }

  // CREAR SOLICITUD DE VACACIONES
  RegistrarVacaciones(datos: any) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/vacaciones`, datos);
  }

  // EDITAR SOLICITUD DE VACACIONES
  EditarVacacion(id: number, datos: any) {
    return this.http.put<any>(`${(localStorage.getItem('empresaURL') as string)}/vacaciones/${id}/vacacion-solicitada`, datos);
  }

  // ENVIAR CORREOS DE SOLICITUDES DE VACACIONES
  EnviarCorreoVacaciones(datos: any) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/vacaciones/mail-noti`, datos);
  }

   // METODO PARA CREAR ARCHIVO XML
  CrearXML(data: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/vacaciones/xmlDownload`, data);
  }

}
