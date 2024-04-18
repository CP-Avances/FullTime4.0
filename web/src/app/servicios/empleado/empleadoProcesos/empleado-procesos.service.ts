import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class EmpleadoProcesosService {

  constructor(private http: HttpClient) { }

  ObtenerListaEmpleProcesos() {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/empleadoProcesos`);
  }

  RegistrarEmpleProcesos(datos: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/empleadoProcesos`, datos);
  }

  ObtenerProcesoUsuario(id_empl_cargo: number) {
    return this.http.get<any>(`${(localStorage.getItem('empresaURL') as string)}/empleadoProcesos/infoProceso/${id_empl_cargo}`);
  }

  ActualizarUnProceso(datos: any) {
    return this.http.put(`${(localStorage.getItem('empresaURL') as string)}/empleadoProcesos`, datos);
  }

  EliminarRegistro(id: number) {
    return this.http.delete(`${(localStorage.getItem('empresaURL') as string)}/empleadoProcesos/eliminar/${id}`);
  }

  

}
