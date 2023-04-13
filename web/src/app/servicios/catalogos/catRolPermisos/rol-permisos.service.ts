import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class RolPermisosService {

  constructor(
    private http: HttpClient
  ) { }

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

}
