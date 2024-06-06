import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  constructor(
    private http: HttpClient,
  ) { }

  // REGISTRAR USUARIO
  RegistrarUsuario(data: any) {
    return this.http.post(`${environment.url}/usuarios`, data)
      .pipe(
        catchError(data)
      );
  }

  // METODO DE BUSQUEDA DE DATOS DE USUARIO
  BuscarDatosUser(id: number) {
    return this.http.get(`${environment.url}/usuarios/datos/${id}`);
  }

  ObtenerDepartamentoUsuarios(id: number) {
    return this.http.get(`${environment.url}/usuarios/dato/${id}`);
  }

  // METODO PARA OBTENER IDS USUARIOS DEPARTAMENTO
  ObtenerIdUsuariosDepartamento(data: any) {
    return this.http.post(`${environment.url}/usuarios/buscar-ids-usuarios-departamento`, data);
  }

  // METODO PARA ACTUALIZAR REGISTRO DE USUARIO
  ActualizarDatos(data: any) {
    return this.http.put(`${environment.url}/usuarios/actualizarDatos`, data).pipe(
      catchError(data));
  }

  // METODO PARA REGISTRAR ACCESOS AL SISTEMA
  CrearAccesosSistema(data: any) {
    return this.http.post(`${environment.url}/usuarios/acceso`, data);
  }

  // METODO PARA CAMBIAR PASSWORD
  ActualizarPassword(data: any) {
    return this.http.put(`${environment.url}/usuarios`, data);
  }

  // ADMINISTRACION MODULO DE ALIMENTACION
  RegistrarAdminComida(data: any) {
    return this.http.put(`${environment.url}/usuarios/admin/comida`, data);
  }

  // METODO PARA REGISTRAR FRASE DE SEGURIDAD
  ActualizarFrase(data: any) {
    return this.http.put(`${environment.url}/usuarios/frase`, data);
  }

  // METODO PARA ACTUALIZAR ESTADO TIMBRE WEB
  ActualizarEstadoTimbreWeb(data: any) {
    return this.http.put<any>(`${environment.url}/usuarios/lista-web/`, data);
  }


  // METODO PARA ACTUALIZAR ESTADO DE TIMBRE MOVIL
  ActualizarEstadoTimbreMovil(data: any) {
    return this.http.put<any>(`${environment.url}/usuarios/lista-app-movil/`, data);
  }

  // METODO PARA BUSCAR DISPOSITIVOS REGISTRADOS
  BuscarDispositivoMovill() {
    return this.http.get<any>(`${environment.url}/usuarios/registro-dispositivos`);
  }

  // METODO PARA ELIMINAR REGISTROS DISPOSITIVOS
  EliminarDispositivoMovil(data: any, datos: any) {
    const url = `${environment.url}/usuarios/delete-registro-dispositivos/${data}`;
    const httpOptions = {
      body: datos
    };
    return this.http.request('delete', url, httpOptions);
  }

  // METODO PARA ENVIAR CORREO CAMBIAR FRASE SEGURIDAD
  RecuperarFraseSeguridad(data: any) {
    return this.http.post(`${environment.url}/usuarios/frase/olvido-frase`, data)
  }

  // METODO PARA CAMBIAR LA FRASE DE SEGURIDAD
  CambiarFrase(data: any) {
    return this.http.post(`${environment.url}/usuarios/frase/restaurar-frase/nueva`, data)
  }


  /** *********************************************************************************************** **
   ** **                       SERVICIOS USUARIOS QUE USAN TIMBRE WEB                              ** **
   ** *********************************************************************************************** */

  // METODO PARA BUSCAR DATOS DE USUARIOS TIMBRE WEB SUPERADMINISTRADOR
  UsuariosTimbreWeb_SUPERADMIN(estado: any, habilitado: boolean) {
    return this.http.get<any>(`${environment.url}/usuarios/lista-web-superior/${estado}/activo/${habilitado}`);
  }

  // METODO PARA BUSCAR DATOS DE USUARIOS TIMBRE WEB ADMNISTRADOR
  UsuariosTimbreWeb_ADMIN(estado: any, habilitado: boolean, datos: any) {
    return this.http.post<any>(`${environment.url}/usuarios/lista-web-general/${estado}/activo/${habilitado}`, datos);
  }

  // METODO PARA BUSCAR DATOS DE USUARIOS TIMBRE WEB
  UsuariosTimbreWeb_JEFE(estado: any, habilitado: boolean, datos: any) {
    return this.http.post<any>(`${environment.url}/usuarios/lista-web-jefe/${estado}/activo/${habilitado}`, datos);
  }


  // METODO PARA BUSCAR DATOS DE USUARIOS TIMBRE MOVIL SUPERADMINISTRADOR
  UsuariosTimbreMovil_SUPERADMIN(estado: any, habilitado: boolean) {
    return this.http.get<any>(`${environment.url}/usuarios/lista-app-movil-superior/${estado}/activo/${habilitado}`);
  }

  // METODO PARA BUSCAR DATOS DE USUARIOS TIMBRE MOVIL ADMINISTRADOR
  UsuariosTimbreMovil_ADMIN(estado: any, habilitado: boolean, datos: any) {
    return this.http.post<any>(`${environment.url}/usuarios/lista-app-movil-general/${estado}/activo/${habilitado}`, datos);
  }

  // METODO PARA BUSCAR DATOS DE USUARIOS TIMBRE MOVIL ADMINISTRADOR JEFE
  UsuariosTimbreMovil_JEFE(estado: any, habilitado: boolean, datos: any) {
    return this.http.post<any>(`${environment.url}/usuarios/lista-app-movil-jefe/${estado}/activo/${habilitado}`, datos);
  }



  /** *********************************************************************************************** **
   ** **                       SERVICIOS DE TABLA USUARIO - SUCURSAL                               ** **
   ** *********************************************************************************************** */

  // METODO DE BUSQUEDA DE DATOS DE USUARIO
  BuscarUsuarioSucursal(id_empleado: any) {
    return this.http.post(`${environment.url}/usuarios/buscar-usuario-sucursal`, id_empleado);
  }

  // REGISTRAR USUARIO
  RegistrarUsuarioSucursal(data: any) {
    return this.http.post(`${environment.url}/usuarios/usuario-sucursal`, data)
      .pipe(
        catchError(data)
      );
  }

  //REGISTRAR USUARIO - DEPARTAMENTO
  RegistrarUsuarioDepartamento(data: any) {
    return this.http.post(`${environment.url}/usuarios/usuario-departamento`, data)
      .pipe(
        catchError(data)
      );
  }

  // METODO DE BUSQUEDA DE DATOS DE USUARIO - DEPARTAMENTOS
  BuscarUsuarioDepartamento(id_empleado: any) {
    return this.http.post(`${environment.url}/usuarios/buscar-usuario-departamento`, id_empleado);
  }

  // METODO DE BUSQUEDA DE DATOS DE USUARIO - SUCURSAL
  BuscarUsuarioSucursalPrincipal(id_empleado: any) {
    return this.http.post(`${environment.url}/usuarios/principal-usuario-sucursal`, id_empleado);
  }

  // METODO PARA ACTUALIZAR REGISTRO DE USUARIO - SUCURSAL
  ActualizarUsuarioSucursalPrincipal(data: any) {
    return this.http.put(`${environment.url}/usuarios/actualizar-usuario-sucursal`, data).pipe(
      catchError(data));
  }

  // METODO PARA ELIMINAR REGISTROS DE USUARIO - SUCURSAL
  EliminarUsuarioSucursal(id_usucursal: any, datos: any) {
    const url = `${environment.url}/usuarios/eliminar-usuario-sucursal/${id_usucursal}`;
    const httpOptions = {
      body: datos
    };
    return this.http.request('delete', url, httpOptions);
  }

  // METODO PARA ELIMINAR REGISTROS DE USUARIO - DEPARTAMENTO
  EliminarUsuarioDepartamento(datos: any) {
    const url = `${environment.url}/usuarios/eliminar-usuario-departamento`;
    const httpOptions = {
      body: datos
    };
    return this.http.request('delete', url, httpOptions);
  }

}
