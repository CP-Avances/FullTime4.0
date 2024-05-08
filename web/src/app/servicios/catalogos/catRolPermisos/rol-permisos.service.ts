import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment'
import { catchError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RolPermisosService {

  constructor(
    private http: HttpClient
  ) {
  }

  // catalogo de ROL PERMISOS

  getRolPermisoRest() {
    return this.http.get(`${environment.url}/rolPermisos`);
  }

  getOneRolPermisoRest(id: number) {
    return this.http.get(`${environment.url}/rolPermisos/${id}`);
  }

  postRolPermisoRest(data: any) {
    return this.http.post(`${environment.url}/rolPermisos`, data);
  }

  // permisos denegado

  getPermisosUsuarioRolRest(id: number) {
    return this.http.get(`${environment.url}/rolPermisos/denegado/${id}`);
  }

  postPermisoDenegadoRest(data: any) {
    return this.http.post(`${environment.url}/rolPermisos/denegado`, data);
  }

  // ENLISTAR LINKS
  getMenu() {
    return this.http.get(`${environment.url}/rolPermisos/menu/paginas`);
  }

  // ENLISTAR LINKS
  getModulos() {
    return this.http.get(`${environment.url}/rolPermisos/menu/modulos`);
  }



  //ENLISTAR PAGINAS MODULOS

  getMenuModulos(datos) {
    return this.http.post(`${environment.url}/rolPermisos/menu/paginasmodulos`, datos);
  }


  // METODO PARA BUSCAR LAS PAGINAS POR ID

  BuscarIdPaginas(datos: any) {
    return this.http.post(`${environment.url}/rolPermisos/menu/paginas/ide`, datos);
  }

  BuscarIdPaginasConAcciones(datos: any) {
    return this.http.post(`${environment.url}/rolPermisos/menu/paginas/ideaccion`, datos);
  }



  crearPaginaRol(data: any) {
    return this.http.post(`${environment.url}/rolPermisos/menu/paginas/insertar`, data);
  }


  BuscarPaginasRol(datos: any) {
    return this.http.post(`${environment.url}/rolPermisos/menu/todaspaginasrol`, datos);
  }


  // ELIMINAR PAGINAS ROL
  EliminarPaginasRol(datos: any) {
    return this.http.post(`${environment.url}/rolPermisos/menu/paginas/eliminar`, datos).pipe(catchError(datos));
  }


  // ELIMINAR  ACCIONES DE PAGINAS ROL
  BuscarAccionesPaginas(datos: any) {
    return this.http.post(`${environment.url}/rolPermisos/menu/paginas/acciones`, datos);
  }

  // ELIMINAR  ACCIONES DE PAGINAS ROL
  BuscarAccionesExistentesPaginas(datos: any) {
    return this.http.post(`${environment.url}/rolPermisos/menu/paginas/accionesexistentes`, datos);
  }


  // ELIMINAR  ACCIONES DE PAGINAS ROL
  BuscarAccionesPorId(datos: any) {
    return this.http.post(`${environment.url}/rolPermisos/menu/paginas/acciones/id`, datos);
  }


  // ENLISTAR ACCIONES
  ObtenerAcciones() {
    return this.http.get(`${environment.url}/rolPermisos/menu/paginas/acciones/todas`);
  }



}
