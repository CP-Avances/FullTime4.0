import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment'

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
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/rolPermisos`);
  }

  getOneRolPermisoRest(id: number) {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/rolPermisos/${id}`);
  }

  postRolPermisoRest(data: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/rolPermisos`, data);
  }

  // permisos denegado

  getPermisosUsuarioRolRest(id: number) {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/rolPermisos/denegado/${id}`);
  }

  postPermisoDenegadoRest(data: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/rolPermisos/denegado`, data);
  }

  // ENLISTAR LINKS NUEVOS SERVICIOS
  getMenu() {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/rolPermisos/menu/paginas`);
  }

  // METODO PARA BUSCAR LAS PAGINAS POR ID

  BuscarIdPaginas(datos: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/rolPermisos/menu/paginas/ide`, datos);
  }

  BuscarIdPaginasConAcciones(datos: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/rolPermisos/menu/paginas/ideaccion`, datos);
  }



  crearPaginaRol(data: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/rolPermisos/menu/paginas/insertar`, data);
  }


  BuscarPaginasRol(datos: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/rolPermisos/menu/todaspaginasrol`, datos);
  }

  BuscarPaginasMenuRol(datos: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/rolPermisos/menu/todaspaginasmenurol`, datos);
  }


  // ELIMINAR PAGINAS ROL
  EliminarPaginasRol(datos: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/rolPermisos/menu/paginas/eliminar`, datos);
  }


  // ELIMINAR PAGINAS ROL
  EliminarPaginasRolSinAccion(datos: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/rolPermisos/menu/paginas/eliminarsinaccion`, datos);
  }


  // ELIMINAR  ACCIONES DE PAGINAS ROL
  BuscarAccionesPaginas(datos: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/rolPermisos/menu/paginas/acciones`, datos);
  }


    // ELIMINAR  ACCIONES DE PAGINAS ROL
    BuscarAccionesPorId(datos: any) {
      return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/rolPermisos/menu/paginas/acciones/id`, datos);
    }

    
  // ENLISTAR ACCIONES
  ObtenerAcciones() {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/rolPermisos/menu/paginas/acciones/todas`);
  }


    
}
