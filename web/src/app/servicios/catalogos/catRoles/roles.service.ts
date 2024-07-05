import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class RolesService {

  constructor(private http: HttpClient) { }


  // METODO PARA LISTAR ROLES DEL SISTEMA
  BuscarRoles() {
    return this.http.get<any>(`${(localStorage.getItem('empresaURL') as string)}/rol`);
  }

  // ELIMINAR REGISTRO DE ROL
  EliminarRoles(id: number, datos:any) {
    const url = `${(localStorage.getItem('empresaURL') as string)}/rol/eliminar/${id}`;
    const httpOtions = {
      body: datos
    };
    return this.http.request('delete', url, httpOtions);
  }

  // METODO PARA REGISTRAR ROL
  RegistraRol(data: any) {
    console.log(data);
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/rol`, data);
  }


  // Roles
  getOneRol(id: number) {
    return this.http.get<any>(`${(localStorage.getItem('empresaURL') as string)}/rol/${id}`);
  }

  ListarRolesActualiza(id: number) {
    return this.http.get<any>(`${(localStorage.getItem('empresaURL') as string)}/rol/actualiza/${id}`);
  }

  ActualizarRol(data: any) {
    return this.http.put(`${(localStorage.getItem('empresaURL') as string)}/rol`, data);
  }

}
