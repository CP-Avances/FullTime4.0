import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment'
import { catchError } from 'rxjs';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RolesService {

  constructor(private http: HttpClient) { }


  // METODO PARA LISTAR ROLES DEL SISTEMA  **USADO
  BuscarRoles() {
    return this.http.get<any>(`${environment.url}/rol`);
  }

  // ELIMINAR REGISTRO DE ROL  **USADO
  EliminarRoles(id: number, datos:any) {
    const url = `${environment.url}/rol/eliminar/${id}`;
    const httpOtions = {
      body: datos
    };
    return this.http.request('delete', url, httpOtions);
  }

  // METODO PARA REGISTRAR ROL
  RegistraRol(data: any) {
    console.log(data);
    return this.http.post(`${environment.url}/rol`, data);
  }


  // METODO PARA LISTAR INFORMACION DEL ROL **USADO
  BuscarUnRol(id: number) {
    return this.http.get<any>(`${environment.url}/rol/${id}`);
  }

  // METODO PARA LISTAR ROLES EXCEPTO EL QUE SE ACTUALIZA **USADO
  ListarRolesActualiza(id: number) {
    return this.http.get<any>(`${environment.url}/rol/actualiza/${id}`);
  }

  // METODO PARA ACTUALIZAR ROLES  **USADO
  ActualizarRol(data: any) {
    return this.http.put(`${environment.url}/rol`, data);
  }

  listaUsuariosRoles(){
    return this.http.get(`${environment.url}/rol/listausuariosroles`).pipe(
      catchError(error => {
        console.error('Error occurred:', error);
        return throwError(error);
      })
    );
  }

  actualizarRoles(data: any){
    return this.http.put(`${environment.url}/rol/updateUsers`, data);
  }


}
