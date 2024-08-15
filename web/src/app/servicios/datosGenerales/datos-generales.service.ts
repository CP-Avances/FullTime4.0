import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})

export class DatosGeneralesService {

  constructor(
    private http: HttpClient,
  ) { }

  // METODO PARA CONSULTAR DATOS DE LOS EMPLEADOS    **USADO
  ObtenerInformacionGeneral(estado: any) {
    return this.http.get<any>(`${(localStorage.getItem('empresaURL') as string)}/generalidades/informacion-data-general/${estado}`);
  }

   // METODO PARA CONSULTAR DATOS DE LOS EMPLEADOS
   ObtenerInformacionGeneralDep(estado: any) {
    return this.http.get<any>(`${(localStorage.getItem('empresaURL') as string)}/generalidades/informacion-data-general-rol/${estado}`);
  }



  // METODO PARA CONSULTAR DATOS DE UN USUARIO ADMINISTRADOR - JEFE
  ObtenerInformacionUserRol(datos: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/generalidades/datos-actuales-usuario-rol`, datos);
  }


  // CONSULTA DE INFORMACION GENERAL DEL COLABORADOR QUE RECIBE COMUNICADOS    **USADO
  ObtenerInformacionComunicados(estado: any) {
    return this.http.get<any>(`${(localStorage.getItem('empresaURL') as string)}/generalidades/datos_generales_comunicados/${estado}`);
  }

  // METODO PARA CONSULTAR DATOS DEL USUARIO    **USADO
  ObtenerDatosActuales(id_empleado: number) {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/generalidades/datos-actuales/${id_empleado}`);
  }


  // CONSULTA DE INFORMACION GENERAL DEL COLABORADOR
  ObtenerInformacion(estado: any, sucursales: any) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/generalidades/informacion-general/${estado}`, sucursales);
  }

  // CONSULTA DE INFORMACION GENERAL DEL COLABORADOR CARGOS
  ObtenerInformacionCargo(estado: any, sucursales: any) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/generalidades/informacion-general-cargo/${estado}`, sucursales);
  }

  // CONSULTA DE INFORMACION GENERAL DEL COLABORADOR ASIGNADOS UBICACION   **USADO
  ObtenerInformacionUbicacion(estado: any, ubicacion: any) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/generalidades/informacion-general-ubicacion/${estado}`, ubicacion);
  }

  // METODO PARA LISTAR INFORMACION ACTUAL DE USUARIO
  ListarInformacionActual() {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/generalidades/info_actual`);
  }

  // METODO PARA LISTAR ID ACTUALES DE USUARIOS    **USADO
  ListarIdInformacionActual() {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/generalidades/info_actual_id`);
  }

  // METODO PARA BUSCAR INFORMACION DEL USUARIO QUE APRUEBA SOLICITUDES   **USADO
  InformarEmpleadoAutoriza(id_empleado: number) {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/generalidades/empleadoAutoriza/${id_empleado}`);
  }

  // METODO PARA BUSCAR JEFES DE DEPARTAMENTOS
  BuscarJefes(datos: any) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/generalidades/buscar-jefes`, datos);
  }

  // METODO DE ACCESO A INFORMACION DE CONFIGURACION DE NOTIFICACIONES
  ObtenerInfoConfiguracion(id_empleado: number) {
    return this.http.get<any>(`${(localStorage.getItem('empresaURL') as string)}/generalidades/info-configuracion/${id_empleado}`);
  }

  // METODO PARA OBTENER USUARIOS DE UNA SUCURSAL
  ObtenerUsuariosSucursal(datos: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/generalidades/datos-actuales-sucursal`, datos);
  }

}
