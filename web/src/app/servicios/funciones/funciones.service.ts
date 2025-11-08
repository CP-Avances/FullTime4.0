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
  
  // METODO PARA LISTAR FUNCIONES ACTIVAS DEL SISTEMA   **USADO**
  ListarFunciones(data: any) {
    return this.http.post<any>(`${environment.url}/administracion/funcionalidad`, data)
  }

}
