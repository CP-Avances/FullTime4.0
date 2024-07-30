import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class FuncionesService {

  constructor(
    private http: HttpClient,
  ) { }

  
  // METODO PARA LISTAR FUNCIONES ACTIVAS DEL SISTEMA   **USO TEMPORAL
  ListarFunciones() {
    return this.http.get<any>(`${environment.url}/administracion/funcionalidad`)
  }
}
