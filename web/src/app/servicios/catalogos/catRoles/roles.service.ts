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
  EliminarRoles(id: any) {
    return this.http.delete(`${environment.url}/rol/eliminar/${id}`).pipe(catchError(id));
  }

  // METODO PARA REGISTRAR ROL
  RegistraRol(data: any) {
    console.log(data);
    return this.http.post(`${environment.url}/rol`, data);
  }

  // Roles
  getOneRol(id: number) {
    return this.http.get<any>(`${environment.url}/rol/${id}`);
  }
  ListarRolesActualiza(id: number) {
    return this.http.get<any>(`${environment.url}/rol/actualiza/${id}`);
  }
  ActualizarRol(data: any) {
    return this.http.put(`${environment.url}/rol`, data);
  }





}
