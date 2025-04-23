import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TimbresService {

  constructor(
    private http: HttpClient
  ) { }
  //Metodos aun en desarrollo

  // METODO PARA LISTAR MARCACIONES    **USADO
  ObtenerTimbres() {
    return this.http.get<any>(`${(localStorage.getItem('empresaURL') as string)}/timbres/`);
  }

  // METODO PARA REGISTRAR TIMBRE PERSONAL     **USADO
  RegistrarTimbreWeb(datos: any) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/timbres/`, datos);
  }

  // METODO PARA REGISTRAR TIMBRES ADMINISTRADOR    **USADO
  RegistrarTimbreAdmin(datos: any) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/timbres/admin/`, datos);
  }

  // METODO PARA BUSCAR TIMBRES SEGUN CRITERIOS DE BUSQUEDA   **USADO
  ObtenerTimbresFechaEmple(datos: any) {
    const params = new HttpParams()
      .set('codigo', datos.codigo)
      .set('identificacion', datos.identificacion)
      .set('fecha', datos.fecha)
    return this.http.get<any>(`${(localStorage.getItem('empresaURL') as string)}/timbres/timbresfechaemple`, { params });
  }

  // METODO PARA EDITAR TIMBRES    **USADO
  EditarTimbreEmpleado(data: any) {
    return this.http.put(`${(localStorage.getItem('empresaURL') as string)}/timbres/timbre/editar`, data);
  }

  // METODO PARA BUSCAR TIMBRES (ASISTENCIA)   **USADO
  BuscarTimbresAsistencia(datos: any) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/timbres/buscar/timbres-asistencia`, datos);
  }

  // METODO PARA BUSCAR TIMBRES (PLANIFICACION HORARIA)   **USADO
  BuscarTimbresPlanificacion(datos: any) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/timbres/buscar/timbres-planificacion`, datos);
  }

  // METODO PARA LISTAR LOS TIMBRES DEL USUARIO      **USADO
  ObtenerTimbresEmpleado(id: number) {
    return this.http.get<any>(`${(localStorage.getItem('empresaURL') as string)}/timbres/ver/timbres/${id}`);
  }

  /** ********************************************************************************** **
   ** **                 CONSULTAS DE OPCIONES DE MARCACIONES                         ** **                
   ** ********************************************************************************** **/

  // METODO PARA BUSCAR OPCIONES DE MARCACION   **USADO
  BuscarOpcionesMarcacion(datos: any) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/timbres/listar-opciones-timbre`, datos);
  }

  // METODO PARA BUSCAR OPCIONES DE MARCACION   **USADO
  BuscarVariasOpcionesMarcacion(datos: any) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/timbres/listar-varias-opciones-timbre`, datos);
  }

  // METODO PARA INGRESAR OPCIONES DE MARCACION   **USADO
  IngresarOpcionesMarcacion(datos: any) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/timbres/opciones-timbre`, datos);
  }

  // METODO PARA ACTUALIZAR OPCIONES DE MARCACION   **USADO
  ActualizarOpcionesMarcacion(datos: any) {
    return this.http.put<any>(`${(localStorage.getItem('empresaURL') as string)}/timbres/actualizar-opciones-timbre`, datos);
  }

  // METODO PARA ELIMINAR OPCIONES DE MARCACION   **USADO
  EliminarOpcionesMarcacion(datos: any) {
    const url = `${(localStorage.getItem('empresaURL') as string)}/timbres/eliminar-opcion-marcacion`;
    const httpOtions = {
      body: datos
    };
    return this.http.request('delete', url, httpOtions);
  }


  /** ********************************************************************************** **
   ** **                 CONSULTAS DE OPCIONES DE MARCACIONES                         ** **                
   ** ********************************************************************************** **/

  // METODO PARA BUSCAR OPCIONES DE MARCACION   **USADO
  BuscarVariasOpcionesMarcacionWeb(datos: any) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/timbres/listar-varias-opciones-timbre-web`, datos);
  }

  // METODO PARA BUSCAR OPCIONES DE MARCACION   **USADO
  BuscarVariasOpcionesMarcacionWebMultiple(datos: any) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/timbres/listar-varias-opciones-timbre-web-multiple`, datos);
  }

  // METODO PARA INGRESAR OPCIONES DE MARCACION   **USADO
  IngresarOpcionesMarcacionWeb(datos: any) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/timbres/opciones-timbre-web`, datos);
  }

  // METODO PARA ACTUALIZAR OPCIONES DE MARCACION   **USADO
  ActualizarOpcionesMarcacionWeb(datos: any) {
    return this.http.put<any>(`${(localStorage.getItem('empresaURL') as string)}/timbres/actualizar-opciones-timbre-web`, datos);
  }

  // METODO PARA ELIMINAR OPCIONES DE MARCACION   **USADO
  EliminarOpcionesMarcacionWeb(datos: any) {
    const url = `${(localStorage.getItem('empresaURL') as string)}/timbres/eliminar-opcion-marcacion-web`;
    const httpOtions = {
      body: datos
    };
    return this.http.request('delete', url, httpOtions);
  }

  /**
   * METODO PARA TRAER LAS NOTIFICACIONES DE ATRASOS O SALIDAS ANTES SOLO VIENEN 5 NOTIFICACIONES
   * @param id_empleado Id DEL EMPLEADO QUE INICIA SESION
   */

  // METODO DE CONSULTA DE AVISOS GENERALES
  BuscarAvisosGenerales(id_empleado: number) {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/timbres/avisos-generales/${id_empleado}`);
  }

  // METODO DE CONSULTA DE AVISOS ESPECIFICOS
  ObtenerUnAviso(id: number) {
    return this.http.get<any>(`${(localStorage.getItem('empresaURL') as string)}/timbres/aviso-individual/${id}`);
  }

  ActualizarVistaAvisos(id_noti_timbre: number, datos: any) {
    return this.http.put(`${(localStorage.getItem('empresaURL') as string)}/timbres/noti-timbres/vista/${id_noti_timbre}`, datos);
  }

  AvisosTimbresRealtime(id_empleado: number) {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/timbres/noti-timbres/avisos/${id_empleado}`);
  }

  EliminarAvisos(Seleccionados: any) {
    return this.http.put<any>(`${(localStorage.getItem('empresaURL') as string)}/timbres/eliminar-multiples/avisos`, Seleccionados); //Eliminacion de datos seleccionados.
  }



}
