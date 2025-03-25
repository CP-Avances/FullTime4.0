import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EmpleadoProcesosService {

  constructor(private http: HttpClient) { }

  RegistrarEmpleProcesos(datos: any) {
    return this.http.post(`${environment.url}/empleadoProcesos`, datos);
  }

  // METODO PARA OBTENER PROCESOS DEL USUARIO   **USADO
  ObtenerProcesoUsuario(id_empl: number) {
    return this.http.get<any>(`${environment.url}/empleadoProcesos/infoProceso/${id_empl}`);
  }

  ActualizarUnProceso(datos: any) {
    return this.http.put(`${environment.url}/empleadoProcesos`, datos);
  }

  // METODO PARA ELIMINAR REGISTRO   **USADO
  EliminarRegistro(id: number, datos: any) {
    const url = `${environment.url}/empleadoProcesos/eliminar/${id}`;
    const httpOtions = {
      body: datos
    };
    return this.http.request('delete', url, httpOtions);
  }

  
}
