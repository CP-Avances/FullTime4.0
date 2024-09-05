import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  constructor(
    private http: HttpClient,
  ) { }

  // REGISTRAR USUARIO    **USADO
  RegistrarUsuario(data: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/usuarios`, data)
      .pipe(
        catchError(data)
      );
  }

  // METODO DE BUSQUEDA DE DATOS DE USUARIO   **USADO
  BuscarDatosUser(id: number) {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/usuarios/datos/${id}`);
  }

  ObtenerDepartamentoUsuarios(id: number) {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/usuarios/dato/${id}`);
  }

  // METODO PARA OBTENER IDS USUARIOS MEDIANTE DEPARTAMENTO VIGENTE **USADO
  ObtenerIdUsuariosDepartamento(data: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/usuarios/buscar-ids-usuarios-departamento`, data);
  }

  // METODO PARA ACTUALIZAR REGISTRO DE USUARIO    **USADO
  ActualizarDatos(data: any) {
    return this.http.put(`${(localStorage.getItem('empresaURL') as string)}/usuarios/actualizarDatos`, data).pipe(
      catchError(data));
  }

  // METODO PARA CAMBIAR PASSWORD      **USADO
  ActualizarPassword(data: any) {
    return this.http.put(`${(localStorage.getItem('empresaURL') as string)}/usuarios`, data);
  }

  // ADMINISTRACION MODULO DE ALIMENTACION
  RegistrarAdminComida(data: any) {
    return this.http.put(`${(localStorage.getItem('empresaURL') as string)}/usuarios/admin/comida`, data);
  }

  // METODO PARA REGISTRAR FRASE DE SEGURIDAD
  ActualizarFrase(data: any) {
    return this.http.put(`${(localStorage.getItem('empresaURL') as string)}/usuarios/frase`, data);
  }

  // METODO PARA ACTUALIZAR ESTADO TIMBRE WEB    **USADO
  ActualizarEstadoTimbreWeb(data: any) {
    return this.http.put<any>(`${(localStorage.getItem('empresaURL') as string)}/usuarios/lista-web/`, data);
  }


  // METODO PARA ACTUALIZAR ESTADO DE TIMBRE MOVIL    **USADO
  ActualizarEstadoTimbreMovil(data: any) {
    return this.http.put<any>(`${(localStorage.getItem('empresaURL') as string)}/usuarios/lista-app-movil/`, data);
  }

  // METODO PARA BUSCAR DISPOSITIVOS REGISTRADOS     **USADO
  BuscarDispositivoMovil() {
    return this.http.get<any>(`${(localStorage.getItem('empresaURL') as string)}/usuarios/registro-dispositivos`);
  }

  // METODO PARA ELIMINAR REGISTROS DISPOSITIVOS    **USADO
  EliminarDispositivoMovil(data: any, datos: any) {
    const url = `${(localStorage.getItem('empresaURL') as string)}/usuarios/delete-registro-dispositivos/${data}`;
    const httpOptions = {
      body: datos
    };
    return this.http.request('delete', url, httpOptions);
  }

  // METODO PARA ENVIAR CORREO CAMBIAR FRASE SEGURIDAD
  RecuperarFraseSeguridad(data: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/usuarios/frase/olvido-frase`, data)
  }

  // METODO PARA CAMBIAR LA FRASE DE SEGURIDAD
  CambiarFrase(data: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/usuarios/frase/restaurar-frase/nueva`, data)
  }


  /** *********************************************************************************************** **
   ** **                       SERVICIOS USUARIOS QUE USAN TIMBRE WEB                              ** **
   ** *********************************************************************************************** */

  // METODO PARA BUSCAR DATOS GENERALES DE USUARIOS TIMBRE WEB       **USADO
  UsuariosTimbreWebGeneral(estado: any, habilitado: boolean) {
    return this.http.get<any>(`${(localStorage.getItem('empresaURL') as string)}/usuarios/lista-web-general/${estado}/activo/${habilitado}`);
  }

  // METODO PARA BUSCAR DATOS GENERALES DE USUARIOS TIMBRE MOVIL    **USADO
  UsuariosTimbreMovilGeneral(estado: any, habilitado: boolean) {
    return this.http.get<any>(`${(localStorage.getItem('empresaURL') as string)}/usuarios/lista-app-movil-general/${estado}/activo/${habilitado}`);
  }


  

  /** *********************************************************************************************** **
   ** **                     SERVICIOS DE USUARIO - SUCURSAL - DEPARTAMENTO                        ** **
   ** *********************************************************************************************** */

  // METODO DE BUSQUEDA DE DATOS DE USUARIO
  BuscarUsuarioSucursal(id_empleado: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/usuarios/buscar-usuario-sucursal`, id_empleado);
  }

  //REGISTRAR USUARIO - DEPARTAMENTO    **USADO
  RegistrarUsuarioDepartamento(data: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/usuarios/usuario-departamento`, data)
      .pipe(
        catchError(data)
      );
  }

  // METODO DE BUSQUEDA DE DATOS DE USUARIO - DEPARTAMENTOS - ASIGNACION DE INFORMACION **USADO
  BuscarUsuarioDepartamento(id_empleado: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/usuarios/buscar-usuario-departamento`, id_empleado);
  }

  // METODO PARA BUSCAR ASIGNACION DE USUARIO - DEPARTAMENTO   **USADO              
  BuscarAsignacionUsuarioDepartamento(data: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/usuarios/buscar-asignacion-usuario-departamento`, data);
  }

  // METODO PARA BUSCAR TODAS ASIGNACION DE USUARIO - DEPARTAMENTO   **USADO   
  BuscarAsignacionesUsuario(data: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/usuarios/buscar-todas-asignacion-usuario-departamento`, data);
  }

  // METODO PARA ACTUALIZAR REGISTRO DE USUARIO - DEPARTAMENTOS   **USADO
  ActualizarUsuarioDepartamento(data: any) {
    return this.http.put(`${(localStorage.getItem('empresaURL') as string)}/usuarios/actualizar-usuario-departamento`, data).pipe(
      catchError(data));
  }

  // METODO PARA ELIMINAR REGISTROS DE USUARIO - DEPARTAMENTO    **USADO
  EliminarUsuarioDepartamento(datos: any) {
    const url = `${(localStorage.getItem('empresaURL') as string)}/usuarios/eliminar-usuario-departamento`;
    const httpOptions = {
      body: datos
    };
    return this.http.request('delete', url, httpOptions);
  }

  // METODO PARA REGISTRAR MULTIPLES USUARIOS - DEPARTAMENTOS   **USADO
  RegistrarUsuarioDepartamentoMultiple(data: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/usuarios/usuario-departamento/multiple`, data);
  }

  //OBTENER TEXTO ENCRIPTADO
  getTextoEncriptado(data: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/usuarios/datos-usuario`, data)
      .pipe(
        catchError(data)
      );
  }

}
