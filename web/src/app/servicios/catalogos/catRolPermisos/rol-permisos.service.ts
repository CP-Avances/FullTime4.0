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
  ) { }

  // METODO PARA ENLISTAR PAGINAS QUE NO SEAN MODULOS  ** USADO
  ObtenerMenu(tipo: any) {
    return this.http.get(`${environment.url}/rolPermisos/menu/paginas/${tipo}`);
  }

  // METODO PARA ENLISTAR PAGINAS SEAN MODULOS  **USADO
  ObtenerModulos(tipo: any) {
    return this.http.get(`${environment.url}/rolPermisos/menu/modulos/${tipo}`);
  }

  // METODO PARA ENLISTAR PAGINAS QUE SON MODULOS, CLASIFICANDOLAS POR EL NOMBRE DEL MODULO  **USADO
  ObtenerMenuModulos(datos: any) {
    return this.http.post(`${environment.url}/rolPermisos/menu/paginasmodulos`, datos);
  }

  // METODO PARA BUSCAR SI EXISTEN PAGINAS CON EL ID DEL ROL REGISTRADA CUANDO NO TIENE ACCION  ** USADO
  BuscarIdPaginas(datos: any) {
    return this.http.post(`${environment.url}/rolPermisos/menu/paginas/ide`, datos);
  }

  // METODO PARA BUSCAR LAS PAGINAS POR ID_ROL Y POR SU ACCION  **USADO
  BuscarIdPaginasConAcciones(datos: any) {
    return this.http.post(`${environment.url}/rolPermisos/menu/paginas/ideaccion`, datos);
  }

  // METODO PARA ASIGNAR PERMISOS AL ROL   **USADO
  CrearPaginaRol(data: any) {
    return this.http.post(`${environment.url}/rolPermisos/menu/paginas/insertar`, data).pipe(
      catchError(data));;
  }

  // METODO PARA BUSCAR TODAS LAS PAGINAS QUE TIENE EL ROL  **USADO
  BuscarPaginasRol(datos: any) {
    return this.http.post(`${environment.url}/rolPermisos/menu/todaspaginasrol`, datos);
  }

  // ELIMINAR PAGINAS ROL  **USADO
  EliminarPaginasRol(datos: any) {
    return this.http.post(`${environment.url}/rolPermisos/menu/paginas/eliminar`, datos).pipe(catchError(datos));
  }

  // METODO PARA BUSCAR LAS ACCIONES POR CADA PAGINA  **USADO
  BuscarAccionesPaginas(datos: any) {
    return this.http.post(`${environment.url}/rolPermisos/menu/paginas/acciones`, datos);
  }

  // METODO PARA ENLISTAR ACCIONES SEGUN LA PAGINA  **USADO
  BuscarAccionesExistentesPaginas(datos: any) {
    return this.http.post(`${environment.url}/rolPermisos/menu/paginas/accionesexistentes`, datos);
  }

  // ENLISTAR ACCIONES  **USADO
  ObtenerAcciones() {
    return this.http.get(`${environment.url}/rolPermisos/menu/paginas/acciones/todas`);
  }


  // METODO PARA LISTAR FUNIONES DE ROLES DEL SISTEMA  **USADO
  BuscarFuncionesRoles() {
    return this.http.get<any>(`${environment.url}/rolPermisos/buscar-funciones`);
  }

}
