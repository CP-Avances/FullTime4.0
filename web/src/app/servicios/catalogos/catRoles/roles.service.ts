import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment'
import { catchError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RolesService {

  constructor(private http: HttpClient) { }


  // METODO PARA LISTAR ROLES DEL SISTEMA
  BuscarRoles() {
    return this.http.get<any>(`${environment.url}/rol`);
  }

  // ELIMINAR REGISTRO DE ROL
  EliminarRoles(id: number, datos:any) {
    const url = `${environment.url}/rol/eliminar/${id}`;
    const httpOtions = {
      body: datos
    };
    return this.http.request('delete', url, httpOtions);
  }

  // METODO PARA CREAR ARCHIVO XML
  CrearXML(data: any) {
    return this.http.post(`${environment.url}/rol/xmlDownload`, data);
  }

  // METODO PARA REGISTRAR ROL
  RegistraRol(data: any) {
    console.log(data);
    return this.http.post(`${environment.url}/rol`, data);
  }


  // Roles
  getOneRol(id: number) {
    return this.http.get<any>(`${environment.url}/rol/${id}`);
    return this.http.get<any>(`${environment.url}/rol/actualiza/${id}`);
  }
  ActualizarRol(data: any) {
    return this.http.put(`${environment.url}/rol`, data);
  }





}
