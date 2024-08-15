import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RolesService {

  constructor(private http: HttpClient) { }


  // METODO PARA LISTAR ROLES DEL SISTEMA  **USADO
  BuscarRoles() {
    return this.http.get<any>(`${(localStorage.getItem('empresaURL') as string)}/rol`);
  }

  // ELIMINAR REGISTRO DE ROL  **USADO
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

  // METODO PARA LISTAR ROLES EXCEPTO EL QUE SE ACTUALIZA **USADO
  ListarRolesActualiza(id: number) {
    return this.http.get<any>(`${(localStorage.getItem('empresaURL') as string)}/rol/actualiza/${id}`);
  }

  // METODO PARA ACTUALIZAR ROLES  **USADO
  ActualizarRol(data: any) {
    return this.http.put(`${(localStorage.getItem('empresaURL') as string)}/rol`, data);
  }

  listaUsuariosRoles(){
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/rol/listausuariosroles`).pipe(
      catchError(error => {
        console.error('Error occurred:', error);
        return throwError(error);
      })
    );
  }

  actualizarRoles(data: any){
    return this.http.put(`${(localStorage.getItem('empresaURL') as string)}/rol/updateUsers`, data);
  }


}
