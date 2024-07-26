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

  // METODO PARA CONSULTAR DATOS DE LOS EMPLEADOS
  ObtenerInformacionGeneral(estado: any) {
    return this.http.get<any>(`${environment.url}/generalidades/informacion-data-general/${estado}`);
  }


  

  // METODO PARA CONSULTAR DATOS DE UN USUARIO ADMINISTRADOR - JEFE
  ObtenerInformacionUserRol(datos: any) {
    return this.http.post(`${environment.url}/generalidades/datos-actuales-usuario-rol`, datos);
  }


  // CONSULTA DE INFORMACION GENERAL DEL COLABORADOR COMUNICADOS SUPERADMIN
  ObtenerInformacionComunicados_SUPERADMIN(estado: any) {
    return this.http.get<any>(`${environment.url}/generalidades/datos_generales_comunicados-superior/${estado}`);
  }


  // CONSULTA DE INFORMACION GENERAL DEL COLABORADOR COMUNICADOS ADMIN
  ObtenerInformacionComunicados_ADMIN(estado: any, sucursales: any) {
    return this.http.post<any>(`${environment.url}/generalidades/datos_generales_comunicados-general/${estado}`, sucursales);
  }


  // CONSULTA DE INFORMACION GENERAL DEL COLABORADOR COMUNICADOS JEFE
  ObtenerInformacionComunicados_JEFE(estado: any, data: any) {
    return this.http.post<any>(`${environment.url}/generalidades/datos_generales_comunicados-jefe/${estado}`, data);
  }

  // METODO PARA CONSULTAR DATOS DEL USUARIO
  ObtenerDatosActuales(id_empleado: number) {
    return this.http.get(`${environment.url}/generalidades/datos-actuales/${id_empleado}`);
  }


  // CONSULTA DE INFORMACION GENERAL DEL COLABORADOR
  ObtenerInformacion(estado: any, sucursales: any) {
    return this.http.post<any>(`${environment.url}/generalidades/informacion-general/${estado}`, sucursales);
  }

  // CONSULTA DE INFORMACION GENERAL DEL COLABORADOR CARGOS
  ObtenerInformacionCargo(estado: any, sucursales: any) {
    return this.http.post<any>(`${environment.url}/generalidades/informacion-general-cargo/${estado}`, sucursales);
  }

  // CONSULTA DE INFORMACION GENERAL DEL COLABORADOR ASIGNADOS UBICACION
  ObtenerInformacionUbicacion(estado: any, ubicacion: any) {
    return this.http.post<any>(`${environment.url}/generalidades/informacion-general-ubicacion/${estado}`, ubicacion);
  }

  // CONSULTA DE INFORMACION GENERAL DEL CARGO Y COLABORADOR ASIGNADOS UBICACION
  ObtenerInformacionCargosUbicacion(estado: any, ubicacion: any) {
    return this.http.post<any>(`${environment.url}/generalidades/informacion-general-ubicacion-cargo/${estado}`, ubicacion);
  }

  // METODO PARA LISTAR INFORMACION ACTUAL DE USUARIO
  ListarInformacionActual() {
    return this.http.get(`${environment.url}/generalidades/info_actual`);
  }

  // METODO PARA LISTAR ID ACTUALES DE USUARIOS
  ListarIdInformacionActual() {
    return this.http.get(`${environment.url}/generalidades/info_actual_id`);
  }

  // METODO PARA BUSCAR INFORMACION DEL USUARIO QUE APRUEBA SOLICITUDES
  InformarEmpleadoAutoriza(id_empleado: number) {
    return this.http.get(`${environment.url}/generalidades/empleadoAutoriza/${id_empleado}`);
  }

  // METODO PARA BUSCAR JEFES DE DEPARTAMENTOS
  BuscarJefes(datos: any) {
    return this.http.post<any>(`${environment.url}/generalidades/buscar-jefes`, datos);
  }

  // METODO DE ACCESO A INFORMACION DE CONFIGURACION DE NOTIFICACIONES
  ObtenerInfoConfiguracion(id_empleado: number) {
    return this.http.get<any>(`${environment.url}/generalidades/info-configuracion/${id_empleado}`);
  }

  // METODO PARA OBTENER USUARIOS DE UNA SUCURSAL
  ObtenerUsuariosSucursal(datos: any) {
    return this.http.post(`${environment.url}/generalidades/datos-actuales-sucursal`, datos);
  }


}
