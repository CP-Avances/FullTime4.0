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

  // ENLISTAR PAGINAS
  getMenu() {
    return this.http.get(`${environment.url}/rolPermisos/menu/paginas`);
  }

  // ENLISTAR PAGINAS DE LOS MOPDULOS
  getModulos() {
    return this.http.get(`${environment.url}/rolPermisos/menu/modulos`);
  }

  //ENLISTAR PAGINAS SEGUN CADA MODULO
  getMenuModulos(datos) {
    return this.http.post(`${environment.url}/rolPermisos/menu/paginasmodulos`, datos);
  }


  // METODO PARA BUSCAR LAS PAGINAS POR ID
  BuscarIdPaginas(datos: any) {
    return this.http.post(`${environment.url}/rolPermisos/menu/paginas/ide`, datos);
  }

  //BUSCAR SI LA PAGINA CON SUS ACCIONES YA FUE ASIGNADA
  BuscarIdPaginasConAcciones(datos: any) {
    return this.http.post(`${environment.url}/rolPermisos/menu/paginas/ideaccion`, datos);
  }

  // INSERTAR PAGINAS
  crearPaginaRol(data: any) {
    return this.http.post(`${environment.url}/rolPermisos/menu/paginas/insertar`, data);
  }

  // BUSCAR LAS PAGINAS INSERTADAS
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

  // ENLISTAR ACCIONES
  ObtenerAcciones() {
    return this.http.get(`${environment.url}/rolPermisos/menu/paginas/acciones/todas`);
  }

}
