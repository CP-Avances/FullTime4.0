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
  SubirArchivoRespaldo(formData: any, id: number, codigo: any, archivo: any) {
    return this.http.put(`${environment.url}/empleadoPermiso/${id}/archivo/${archivo}/validar/${codigo}`, formData)
  }

  // METODO PARA CREAR PERMISOS MULTIPLES
  CrearPermisosMultiples(datos: any) {
    return this.http.put<any>(`${environment.url}/empleadoPermiso/permisos-multiples`, datos);
  }

  // METODO PARA GUARDAR DOCUMENTOS MULTIPLES
  GuardarDocumentosPermisosMultiples(datos: any) {
    return this.http.put<any>(`${environment.url}/empleadoPermiso/documentos-multiples/`, datos);
  }

  // METODO DE BUSQUEDA DE PERMISOS POR ID DE EMPLEADO   **USADO
  BuscarPermisoEmpleado(id_empleado: any) {
    return this.http.get(`${environment.url}/empleadoPermiso/permiso-usuario/${id_empleado}`);
  }

  // METODO PARA BUSCAR INFORMACION DE UN PERMISO    **USADO
  ObtenerInformeUnPermiso(id_permiso: number) {
    return this.http.get(`${environment.url}/empleadoPermiso/informe-un-permiso/${id_permiso}`);
  }

  // METODO PARA ELIMINAR PERMISOS
  EliminarPermiso(datos: any) {
    const url = `${environment.url}/empleadoPermiso/eliminar`;
    const httpOtions = {
      body: datos
    };
    return this.http.request('delete', url, httpOtions);
  }

  // METODO PARA CREAR ARCHIVO XML
  CrearXML(data: any) {
    return this.http.post(`${environment.url}/empleadoPermiso/xmlDownload`, data);
  }

  // METODO PARA ENVIAR NOTIFICACION DE PERMISOS
  EnviarCorreoWeb(datos: any) {
    return this.http.post<any>(`${environment.url}/empleadoPermiso/mail-noti`, datos);
  }

  // METODO PARA ENVIAR NOTIFICACION DE PERMISOS EDICION
  EnviarCorreoEditarWeb(datos: any) {
    return this.http.post<any>(`${environment.url}/empleadoPermiso/mail-noti-editar`, datos);
  }

  // METODO PARA ENVIAR NOTIFICACION DE PERMISOS
  EnviarCorreoWebMultiple(datos: any) {
    return this.http.post<any>(`${environment.url}/empleadoPermiso/mail-noti/solicitud-multiple`, datos);
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

  ObtenerUnPermisoEditar(id: number) {
    return this.http.get(`${environment.url}/empleadoPermiso/permiso/editar/${id}`)
  }

  BuscarDatosSolicitud(id_emple_permiso: number) {
    return this.http.get(`${environment.url}/empleadoPermiso/datosSolicitud/${id_emple_permiso}`);
  }

  BuscarDatosAutorizacion(id_permiso: number) {
    return this.http.get(`${environment.url}/empleadoPermiso/datosAutorizacion/${id_permiso}`);
  }

}
