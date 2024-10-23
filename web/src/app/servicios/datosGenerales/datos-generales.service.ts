import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment'

@Injectable({
  providedIn: 'root'
})

export class DatosGeneralesService {

  constructor(
    private http: HttpClient,
  ) { }

  // METODO PARA CONSULTAR DATOS DE LOS EMPLEADOS    **USADO
  ObtenerInformacionGeneral(estado: any) {
    return this.http.get<any>(`${environment.url}/generalidades/informacion-data-general/${estado}`);
  }

  // METODO PARA CONSULTAR DATOS DE LOS EMPLEADOS
  ObtenerInformacionGeneralDep(estado: any) {
    return this.http.get<any>(`${environment.url}/generalidades/informacion-data-general-rol/${estado}`);
  }

  // CONSULTA DE INFORMACION GENERAL DEL COLABORADOR QUE RECIBE COMUNICADOS    **USADO
  ObtenerInformacionComunicados(estado: any) {
    return this.http.get<any>(`${environment.url}/generalidades/datos_generales_comunicados/${estado}`);
  }

  // METODO PARA CONSULTAR DATOS DEL USUARIO    **USADO
  ObtenerDatosActuales(id_empleado: number) {
    return this.http.get(`${environment.url}/generalidades/datos-actuales/${id_empleado}`);
  }

  // CONSULTA DE INFORMACION GENERAL DEL COLABORADOR ASIGNADOS UBICACION   **USADO
  ObtenerInformacionUbicacion(estado: any, ubicacion: any) {
    return this.http.post<any>(`${environment.url}/generalidades/informacion-general-ubicacion/${estado}`, ubicacion);
  }

  // METODO PARA LISTAR ID ACTUALES DE USUARIOS    **USADO
  ListarIdInformacionActual() {
    return this.http.get(`${environment.url}/generalidades/info_actual_id`);
  }

  // METODO PARA BUSCAR INFORMACION DEL USUARIO QUE APRUEBA SOLICITUDES   **USADO
  InformarEmpleadoAutoriza(id_empleado: number) {
    return this.http.get(`${environment.url}/generalidades/empleadoAutoriza/${id_empleado}`);
  }













  // METODO PARA LISTAR INFORMACION ACTUAL DE USUARIO
  ListarInformacionActual() {
    return this.http.get(`${environment.url}/generalidades/info_actual`);
  }

  // METODO DE ACCESO A INFORMACION DE CONFIGURACION DE NOTIFICACIONES
  ObtenerInfoConfiguracion(id_empleado: number) {
    return this.http.get<any>(`${environment.url}/generalidades/info-configuracion/${id_empleado}`);
  }

  // METODO PARA BUSCAR JEFES DE DEPARTAMENTOS
  BuscarJefes(datos: any) {
    return this.http.post<any>(`${environment.url}/generalidades/buscar-jefes`, datos);
  }

}
