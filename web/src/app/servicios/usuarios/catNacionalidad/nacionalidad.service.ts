import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
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
    return this.http.get(`${environment.url}/nacionalidades/`);
  }

  // METODO PARA BUSCAR NIVEL POR SU NOMBRE   **USADO
  BuscarNacionalidad(nombre: string) {
    return this.http.get<any>(`${environment.url}/nacionalidades/buscar/${nombre}`);
  }

  // METODO PARA REGISTRAR GENERO   **USADO
  RegistrarNacionalidad(data: any) {
    return this.http.post<any>(`${environment.url}/nacionalidades`, data);
  }


  // METODO PARA ACTUALIZAR REGISTRO DE TITULO   **USADO
  ActualizarUnNacionalidad(datos: any) {
    return this.http.put(`${environment.url}/nacionalidades`, datos);
  }

    // ELIMIAR REGISTRO   **USADO
    EliminarNacionalidad(id: any, datos: any) {
      const url = `${environment.url}/nacionalidades/eliminar/${id}`;
      const httpOtions = {
        body: datos
      };
      return this.http.request('delete', url, httpOtions).pipe(catchError(id));
    }

}
