import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Socket } from 'ngx-socket-io';

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
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/empleadoPermiso/numPermiso/${id}`);
  }

  // METODO PARA BUSCAR PERMISOS SOLICITADOS
  BuscarPermisosSolicitadosTotales(datos: any) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/empleadoPermiso/permisos-solicitados-totales`, datos);
  }

  // METODO PARA BUSCAR PERMISOS SOLICITADOS POR DIAS
  BuscarPermisosSolicitadosDias(datos: any) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/empleadoPermiso/permisos-solicitados`, datos);
  }

  // METODO PARA BUSCAR PERMISOS SOLICITADOS POR DIAS
  BuscarPermisosSolicitadosHoras(datos: any) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/empleadoPermiso/permisos-solicitados-horas`, datos);
  }

  // METODO PARA BUSCAR PERMISOS SOLICITADOS ACTUALIZAR
  BuscarPermisosSolicitadosTotalesEditar(datos: any) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/empleadoPermiso/permisos-solicitados-totales-editar`, datos);
  }

  // METODO PARA BUSCAR PERMISOS SOLICITADOS POR DIAS ACTUALIZAR
  BuscarPermisosSolicitadosDiasEditar(datos: any) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/empleadoPermiso/permisos-solicitados-editar`, datos);
  }

  // METODO PARA BUSCAR PERMISOS SOLICITADOS POR DIAS ACTUALIZAR
  BuscarPermisosSolicitadosHorasEditar(datos: any) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/empleadoPermiso/permisos-solicitados-horas-editar`, datos);
  }

  // METODO PARA REGISTRAR SOLICITUD DE PERMISO
  IngresarEmpleadoPermisos(datos: any) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/empleadoPermiso`, datos);
  }

  // METODO USADO PAR EDITAR DATOS DE PERMISO
  EditarPermiso(id: number, datos: any) {
    return this.http.put<any>(`${(localStorage.getItem('empresaURL') as string)}/empleadoPermiso/${id}/permiso-solicitado`, datos);
  }

  // METODO USADO PAR ELIMINAR DATOS DE PERMISO
  EliminarDocumentoPermiso(datos: any) {
    return this.http.put<any>(`${(localStorage.getItem('empresaURL') as string)}/empleadoPermiso/eliminar-documento`, datos);
  }

  // SUBIR RESPALDOS DE PERMISOS
  SubirArchivoRespaldo(formData: any, id: number, codigo: any, archivo: any) {
    return this.http.put(`${(localStorage.getItem('empresaURL') as string)}/empleadoPermiso/${id}/archivo/${archivo}/validar/${codigo}`, formData)
  }




  // METODO DE BUSQUEDA DE PERMISOS POR ID DE EMPLEADO
  BuscarPermisoEmpleado(id_empleado: any) {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/empleadoPermiso/permiso-usuario/${id_empleado}`);
  }

  // METODO PARA BUSCAR INFORMACION DE UN PERMISO
  ObtenerInformeUnPermiso(id_permiso: number) {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/empleadoPermiso/informe-un-permiso/${id_permiso}`);
  }

  // METODO PARA ELIMINAR PERMISOS
  EliminarPermiso(datos: any) {
    const { id_permiso, doc, codigo, user_name, ip } = datos;
    const data = { user_name, ip };
    const url = `${(localStorage.getItem('empresaURL') as string)}/empleadoPermiso/eliminar/${id_permiso}/${doc}/verificar/${codigo}`;
    const httpOtions = {
      body: data
    };
    return this.http.request('delete', url, httpOtions);
  }

  // METODO PARA CREAR ARCHIVO XML
  CrearXML(data: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/empleadoPermiso/xmlDownload`, data);
  }

  // METODO PARA ENVIAR NOTIFICACION DE PERMISOS
  EnviarCorreoWeb(datos: any) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/empleadoPermiso/mail-noti`, datos);
  }

  // METODO PARA ENVIAR NOTIFICACION DE PERMISOS EDICION
  EnviarCorreoEditarWeb(datos: any) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/empleadoPermiso/mail-noti-editar`, datos);
  }

  // METODO PARA ENVIAR NOTIFICACION DE PERMISOS
  EnviarCorreoWebMultiple(datos: any) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/empleadoPermiso/mail-noti/solicitud-multiple`, datos);
  }

  // Permisos Empleado
  obtenerAllPermisos() {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/empleadoPermiso/lista`);
  }

  BuscarPermisosAutorizados() {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/empleadoPermiso/lista-autorizados`);
  }

  obtenerUnPermisoEmpleado(id_permiso: number) {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/empleadoPermiso/un-permiso/${id_permiso}`);
  }

  ActualizarEstado(id: number, datos: any) {
    return this.http.put(`${(localStorage.getItem('empresaURL') as string)}/empleadoPermiso/${id}/estado`, datos);
  }

  ObtenerUnPermisoEditar(id: number) {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/empleadoPermiso/permiso/editar/${id}`)
  }

  BuscarDatosSolicitud(id_emple_permiso: number) {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/empleadoPermiso/datosSolicitud/${id_emple_permiso}`);
  }

  BuscarDatosAutorizacion(id_permiso: number) {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/empleadoPermiso/datosAutorizacion/${id_permiso}`);
  }

}
