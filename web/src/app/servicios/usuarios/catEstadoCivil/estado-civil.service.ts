import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EstadoCivilService {

  constructor(

    private http: HttpClient

  ) { }

  // METODO PARA LISTAR ESTADO CIVIL   **USADO**
  ListarEstadoCivil() {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/estado-civil/`);
  }

  // METODO PARA BUSCAR ESTADO CIVIL POR SU NOMBRE   **USADO**
  BuscarEstadoCivil(estado: string) {
    return this.http.get<any>(`${(localStorage.getItem('empresaURL') as string)}/estado-civil/buscar/${estado}`);
  }

  // METODO PARA REGISTRAR ESTADO CIVIL   **USADO**
  RegistrarEstadoCivil(data: any) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/estado-civil`, data);
  }

  // METODO PARA ACTUALIZAR REGISTRO DE ESTADO CIVIL   **USADO**
  ActualizarUnEstadoCivil(datos: any) {
    return this.http.put(`${(localStorage.getItem('empresaURL') as string)}/estado-civil`, datos);
  }

  // ELIMIAR REGISTRO   **USADO**
  EliminarEstadoCivil(id: any, datos: any) {
    const url = `${(localStorage.getItem('empresaURL') as string)}/estado-civil/eliminar/${id}`;
    const httpOtions = {
      body: datos
    };
    return this.http.request('delete', url, httpOtions).pipe(catchError(id));
  }

}
