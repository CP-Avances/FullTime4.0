import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SocketService } from 'src/app/servicios/socket/socket.service';
import { Socket } from 'ngx-socket-io';
import { SolicitudVacacion } from 'src/app/interfaces/SolicitudesVacacion';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VacacionesService {

  socket: Socket | null = null;

  constructor(
    private http: HttpClient,
    private socketService: SocketService,
  ) {
    this.socket = this.socketService.getSocket();
  }

  // realtime
  EnviarNotificacionRealTime(data: any) {
    if (!this.socket) return;
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

  // METODO PARA BUSCAR VACACIONES POR ID DEL PERIODO   **USADO
  ObtenerVacacionesPorIdPeriodo(id_peri_perido: number) {
    return this.http.get<any>(`${(localStorage.getItem('empresaURL') as string)}/vacaciones/${id_peri_perido}`)
  }

  BuscarFechasFeriado(datos: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/vacaciones/fechasFeriado`, datos);
  }

  BuscarDatosSolicitud(id_empleado: number) {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/vacaciones/datosSolicitud/${id_empleado}`);
  }

  BuscarDatosAutorizacion(id_vacaciones: number) {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/vacaciones/datosAutorizacion/${id_vacaciones}`);
  }

  EliminarVacacion(id_vacacion: number, datos: any) {
    const url = `${(localStorage.getItem('empresaURL') as string)}/vacaciones/eliminar/${id_vacacion}`;
    const httpOptions = {
      body: datos
    };
    return this.http.request('delete', url, httpOptions);
  }

  //METODO PARA LISTAR TIPOS DE VACACIONES
  ListarTodasConfiguraciones() {
    return this.http.get(`${localStorage.getItem('empresaURL') as string}/vacaciones/lista-todas-configuraciones`);
  }

  //METODO PARA VERIFICAR VACACIONES MULTIPLE
  VerificarVacacionesMultiples(datosVerificacion: { empleados: number[], fechaInicio: string, fechaFin: string, incluirFeriados: boolean }) {
    const url = `${localStorage.getItem('empresaURL') as string}/vacaciones/verificar-empleados`;
    return this.http.post(url, datosVerificacion);
  }

  //SERVICIO PARA BUSCAR VACACIONES POR ID_EMPELADO Y FECHAS
  BuscarSolicitudExistente(verificacion: any) {
    const url = `${(localStorage.getItem('empresaURL') as string)}/vacaciones/verificar-solicitud/${verificacion.id_empleado}/${verificacion.fecha_inicio}/${verificacion.fecha_final}`;
    return this.http.get<any>(url);
  }

  //METODO PARA SUBIR UN DOCUMENTO
  SubirDocumento(formData: FormData, id_solicitud: number, id_empleado: number) {
    const url = `${(localStorage.getItem('empresaURL') as string)}/vacaciones/${id_solicitud}/documento/${id_empleado}`;
    return this.http.put<any>(url, formData);
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

  EditarSolicitudesVacaciones(id: number, data: SolicitudVacacion): Observable<SolicitudVacacion> {
    return this.http.put<SolicitudVacacion>(`${(localStorage.getItem('empresaURL') as string)}/vacacion-solicitada/${id}`, data);
  }

}
