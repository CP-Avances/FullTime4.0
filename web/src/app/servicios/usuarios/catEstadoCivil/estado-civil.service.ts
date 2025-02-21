import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { catchError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EstadoCivilService {

  constructor(

    private http: HttpClient

  ) { }

  // METODO PARA LISTAR TITULOS   **USADO
  ListarEstadoCivil() {
    return this.http.get(`${environment.url}/estado-civil/`);
  }

  // METODO PARA BUSCAR NIVEL POR SU NOMBRE   **USADO
  BuscarEstadoCivil(genero: string) {
    return this.http.get<any>(`${environment.url}/estado-civil/buscar/${genero}`);
  }

  // METODO PARA REGISTRAR GENERO   **USADO
  RegistrarEstadoCivil(data: any) {
    return this.http.post<any>(`${environment.url}/estado-civil`, data);
  }


  // METODO PARA ACTUALIZAR REGISTRO DE TITULO   **USADO
  ActualizarUnEstadoCivil(datos: any) {
    return this.http.put(`${environment.url}/estado-civil`, datos);
  }

  // ELIMIAR REGISTRO   **USADO
  EliminarEstadoCivil(id: any, datos: any) {
    const url = `${environment.url}/estado-civil/eliminar/${id}`;
    const httpOtions = {
      body: datos
    };
    return this.http.request('delete', url, httpOtions).pipe(catchError(id));
  }

}
