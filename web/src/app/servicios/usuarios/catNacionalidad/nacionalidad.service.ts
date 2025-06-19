import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NacionalidadService {

  constructor(
    private http: HttpClient
  ) { }

  // METODO PARA LISTAR NACIONALIDAD   **USADO
  ListarNacionalidad() {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/nacionalidades/`);
  }

  // METODO PARA BUSCAR NACIONALIDAD POR SU NOMBRE   **USADO
  BuscarNacionalidad(nombre: string) {
    return this.http.get<any>(`${(localStorage.getItem('empresaURL') as string)}/nacionalidades/buscar/${nombre}`);
  }

  // METODO PARA REGISTRAR NACIONALIDAD   **USADO
  RegistrarNacionalidad(data: any) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/nacionalidades`, data);
  }

  // METODO PARA ACTUALIZAR REGISTRO DE NACIONALIDAD   **USADO
  ActualizarUnNacionalidad(datos: any) {
    return this.http.put(`${(localStorage.getItem('empresaURL') as string)}/nacionalidades`, datos);
  }

  // ELIMIAR REGISTRO   **USADO
  EliminarNacionalidad(id: any, datos: any) {
    const url = `${(localStorage.getItem('empresaURL') as string)}/nacionalidades/eliminar/${id}`;
    const httpOtions = {
      body: datos
    };
    return this.http.request('delete', url, httpOtions).pipe(catchError(id));
  }

}
