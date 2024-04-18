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

}
