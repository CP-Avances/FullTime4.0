import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GenerosService {

  constructor(
    private http: HttpClient
  ) { }

  // METODO PARA LISTAR GENEROS   **USADO**
  ListarGeneros() {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/generos/`);
  }

  // METODO PARA BUSCAR GENEROS POR SU NOMBRE   **USADO**
  BuscarGenero(genero: string) {
    return this.http.get<any>(`${(localStorage.getItem('empresaURL') as string)}/generos/buscar/${genero}`);
  }

  // METODO PARA REGISTRAR GENERO   **USADO**
  RegistrarGenero(data: any) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/generos`, data);
  }

  // METODO PARA ACTUALIZAR REGISTRO DE GENERO   **USADO**
  ActualizarUnGenero(datos: any) {
    return this.http.put(`${(localStorage.getItem('empresaURL') as string)}/generos`, datos);
  }

  // ELIMIAR REGISTRO   **USADO**
  EliminarGenero(id: any, datos: any) {
    const url = `${(localStorage.getItem('empresaURL') as string)}/generos/eliminar/${id}`;
    const httpOtions = {
      body: datos
    };
    return this.http.request('delete', url, httpOtions).pipe(catchError(id));
  }

}
