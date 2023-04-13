import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Socket } from 'ngx-socket-io';
import { environment } from '../../../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class PermisosService {

  constructor(
    private http: HttpClient,
    private socket: Socket
  ) { }

  // ENVIO DE NOTIFICACIONES DE PERMISOS EN TIEMPO REAL
  EnviarNotificacionRealTime(data: any) {
    this.socket.emit('nueva_notificacion', data);
  }

  // METODO DE BUSQUEDA DEL NUMERO DE PERMISO
  BuscarNumPermiso(id: number) {
    return this.http.get(`${environment.url}/empleadoPermiso/numPermiso/${id}`);
  }

  // METODO PARA BUSCAR PERMISOS SOLICITADOS 
  BuscarPermisosSolicitadosTotales(datos: any) {
    return this.http.post<any>(`${environment.url}/empleadoPermiso/permisos-solicitados-totales`, datos);
  }

  // METODO PARA BUSCAR PERMISOS SOLICITADOS POR DIAS
  BuscarPermisosSolicitadosDias(datos: any) {
    return this.http.post<any>(`${environment.url}/empleadoPermiso/permisos-solicitados`, datos);
  }

  // METODO PARA BUSCAR PERMISOS SOLICITADOS POR DIAS
  BuscarPermisosSolicitadosHoras(datos: any) {
    return this.http.post<any>(`${environment.url}/empleadoPermiso/permisos-solicitados-horas`, datos);
  }

  // METODO PARA BUSCAR PERMISOS SOLICITADOS ACTUALIZAR
  BuscarPermisosSolicitadosTotalesEditar(datos: any) {
    return this.http.post<any>(`${environment.url}/empleadoPermiso/permisos-solicitados-totales-editar`, datos);
  }

  // METODO PARA BUSCAR PERMISOS SOLICITADOS POR DIAS ACTUALIZAR
  BuscarPermisosSolicitadosDiasEditar(datos: any) {
    return this.http.post<any>(`${environment.url}/empleadoPermiso/permisos-solicitados-editar`, datos);
  }

  // METODO PARA BUSCAR PERMISOS SOLICITADOS POR DIAS ACTUALIZAR
  BuscarPermisosSolicitadosHorasEditar(datos: any) {
    return this.http.post<any>(`${environment.url}/empleadoPermiso/permisos-solicitados-horas-editar`, datos);
  }

  // METODO PARA REGISTRAR SOLICITUD DE PERMISO
  IngresarEmpleadoPermisos(datos: any) {
    return this.http.post<any>(`${environment.url}/empleadoPermiso`, datos);
  }

  // METODO USADO PAR EDITAR DATOS DE PERMISO
  EditarPermiso(id: number, datos: any) {
    return this.http.put<any>(`${environment.url}/empleadoPermiso/${id}/permiso-solicitado`, datos);
  }

  // METODO USADO PAR ELIMINAR DATOS DE PERMISO
  EliminarDocumentoPermiso(datos: any) {
    return this.http.put<any>(`${environment.url}/empleadoPermiso/eliminar-documento`, datos);
  }

  // SUBIR RESPALDOS DE PERMISOS
  SubirArchivoRespaldo(formData: any, id: number, documento: string, archivo: any) {
    return this.http.put(`${environment.url}/empleadoPermiso/${id}/documento/${documento}/archivo/${archivo}`, formData)
  }

  // METODO DE BUSQUEDA DE PERMISOS POR ID DE EMPLEADO
  BuscarPermisoEmpleado(id_empleado: any) {
    return this.http.get(`${environment.url}/empleadoPermiso/permiso-usuario/${id_empleado}`);
  }

  // METODO PARA BUSCAR INFORMACION DE UN PERMISO
  ObtenerInformeUnPermiso(id_permiso: number) {
    return this.http.get(`${environment.url}/empleadoPermiso/informe-un-permiso/${id_permiso}`);
  }

  // METODO PARA ELIMINAR PERMISOS
  EliminarPermiso(id_permiso: number, doc: string) {
    return this.http.delete<any>(`${environment.url}/empleadoPermiso/eliminar/${id_permiso}/${doc}`);
  }

  // METODO PARA CREAR ARCHIVO XML
  CrearXML(data: any) {
    return this.http.post(`${environment.url}/empleadoPermiso/xmlDownload`, data);
  }

  // METODO PARA ENVIAR NOTIFICACION DE PERMISOS
  EnviarCorreoWeb(datos: any) {
    return this.http.post<any>(`${environment.url}/empleadoPermiso/mail-noti`, datos);
  }












  // Permisos Empleado

  obtenerAllPermisos() {
    return this.http.get(`${environment.url}/empleadoPermiso/lista`);
  }

  BuscarPermisosAutorizados() {
    return this.http.get(`${environment.url}/empleadoPermiso/lista-autorizados`);
  }

  obtenerUnPermisoEmpleado(id_permiso: number) {
    return this.http.get(`${environment.url}/empleadoPermiso/un-permiso/${id_permiso}`);
  }

  ActualizarEstado(id: number, datos: any) {
    return this.http.put(`${environment.url}/empleadoPermiso/${id}/estado`, datos);
  }

  ConsultarEmpleadoPermisos() {
    return this.http.get(`${environment.url}/empleadoPermiso`);
  }


  ObtenerUnPermiso(id: number) {
    return this.http.get(`${environment.url}/empleadoPermiso/${id}`)
  }

  ObtenerUnPermisoEditar(id: number) {
    return this.http.get(`${environment.url}/empleadoPermiso/permiso/editar/${id}`)
  }


  BuscarPermisoContrato(id: any) {
    return this.http.get(`${environment.url}/empleadoPermiso/permisoContrato/${id}`);
  }

  BuscarDatosSolicitud(id_emple_permiso: number) {
    return this.http.get(`${environment.url}/empleadoPermiso/datosSolicitud/${id_emple_permiso}`);
  }

  BuscarDatosAutorizacion(id_permiso: number) {
    return this.http.get(`${environment.url}/empleadoPermiso/datosAutorizacion/${id_permiso}`);
  }



  BuscarFechasPermiso(datos: any, codigo: number) {
    return this.http.post(`${environment.url}/empleadoPermiso/fechas_permiso/${codigo}`, datos);
  }














}
