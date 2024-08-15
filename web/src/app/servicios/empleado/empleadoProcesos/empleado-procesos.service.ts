import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class EmpleadoProcesosService {

  constructor(private http: HttpClient) { }

  RegistrarEmpleProcesos(datos: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/empleadoProcesos`, datos);
  }

  // METODO PARA OBTENER PROCESOS DEL USUARIO   **USADO
  ObtenerProcesoUsuario(id_empl_cargo: number) {
    return this.http.get<any>(`${(localStorage.getItem('empresaURL') as string)}/empleadoProcesos/infoProceso/${id_empl_cargo}`);
  }

  ActualizarUnProceso(datos: any) {
    return this.http.put(`${(localStorage.getItem('empresaURL') as string)}/empleadoProcesos`, datos);
  }

  // METODO PARA ELIMINAR REGISTRO   **USADO
  EliminarRegistro(id: number, datos: any) {
    const url = `${(localStorage.getItem('empresaURL') as string)}/empleadoProcesos/eliminar/${id}`;
    const httpOtions = {
      body: datos
    };
    return this.http.request('delete', url, httpOtions);
  }

  
}
