import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { catchError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GenerosService {

  constructor(
    private http: HttpClient
  ) { }

   // METODO PARA LISTAR TITULOS   **USADO
   ListarGeneros() {
    return this.http.get(`${environment.url}/generos/`);
  }

  // METODO PARA BUSCAR NIVEL POR SU NOMBRE   **USADO
  BuscarGenero(genero: string) {
    return this.http.get<any>(`${environment.url}/generos/buscar/${genero}`);
  }

  // METODO PARA REGISTRAR GENERO   **USADO
  RegistrarGenero(data: any) {
    return this.http.post<any>(`${environment.url}/generos`, data);
  }


  // METODO PARA ACTUALIZAR REGISTRO DE TITULO   **USADO
  ActualizarUnGenero(datos: any) {
    return this.http.put(`${environment.url}/generos`, datos);
  }

    // ELIMIAR REGISTRO   **USADO
    EliminarGenero(id: any, datos: any) {
      const url = `${environment.url}/generos/eliminar/${id}`;
      const httpOtions = {
        body: datos
      };
      return this.http.request('delete', url, httpOtions).pipe(catchError(id));
    }

}
