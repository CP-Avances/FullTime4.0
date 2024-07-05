import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RolPermisosService {

  constructor(
    private http: HttpClient
  ) { }

  //METODO PARA ENLISTAR PAGINAS QUE NO SEAN MODULOS
  getMenu() {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/rolPermisos/menu/paginas`);
  }

  //METODO PARA ENLISTAR PAGINAS SEAN MODULOS
  getModulos() {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/rolPermisos/menu/modulos`);
  }

  //METODO PARA ENLISTAR PAGINAS QUE SON MODULOS, CLASIFICANDOLAS POR EL NOMBRE DEL MODULO
  getMenuModulos(datos) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/rolPermisos/menu/paginasmodulos`, datos);
  }
  
  // METODO PARA BUSCAR SI EXISTEN PAGINAS CON EL ID DEL ROL REGISTRADA CUANDO NO TIENE ACCION
  BuscarIdPaginas(datos: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/rolPermisos/menu/paginas/ide`, datos);
  }

  // METODO PARA BUSCAR LAS PAGINAS POR ID_ROL Y POR SU ACCION
  BuscarIdPaginasConAcciones(datos: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/rolPermisos/menu/paginas/ideaccion`, datos);
  }

  // METODO PARA ASIGNAR PERMISOS AL ROL
  crearPaginaRol(data: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/rolPermisos/menu/paginas/insertar`, data).pipe(
      catchError(data));;
  }

  //METODO PARA BUSCAR TODAS LAS PAGINAS QUE TIENE EL ROL
  BuscarPaginasRol(datos: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/rolPermisos/menu/todaspaginasrol`, datos);
  }

  BuscarPaginasMenuRol(datos: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/rolPermisos/menu/todaspaginasmenurol`, datos);
  }

  // ELIMINAR PAGINAS ROL
  EliminarPaginasRol(datos: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/rolPermisos/menu/paginas/eliminar`, datos).pipe(catchError(datos));
  }

  // METODO PARA BUSCAR LAS ACCIONES POR CADA PAGINA
  BuscarAccionesPaginas(datos: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/rolPermisos/menu/paginas/acciones`, datos);
  }

  // METODO PARA ENLISTAR ACCIONES SEGUN LA PAGINA 
  BuscarAccionesExistentesPaginas(datos: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/rolPermisos/menu/paginas/accionesexistentes`, datos);
  }

  // ENLISTAR ACCIONES
  ObtenerAcciones() {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/rolPermisos/menu/paginas/acciones/todas`);
  }
}
