import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})

export class ConfigurarVacacionesService {

  constructor(
    private http: HttpClient,
  ) { }

  // METODO PARA CREAR CONFIGURACION DE VACACIONES   **USADO
  CrearConfiguracion(datos: any) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/configurarVacacion`, datos);
  }

  // METODO PARA ACTUALIZAR CONFIGURACION DE VACACIONES  **USADO
  ActualizarConfiguracion(datos: any) {
    return this.http.put(`${(localStorage.getItem('empresaURL') as string)}/configurarVacacion`, datos);
  }

  // METODO PARA BUSCAR DATOS DE CONFIGURACION DE VACACIONES   **USADO
  BuscarConfiguracionVacaciones() {
    return this.http.get<any>(`${(localStorage.getItem('empresaURL') as string)}/configurarVacacion/vacaciones-configuracion`);
  }

  // BUSCAR UNA CONFIGURACION DE VACACIONES   **USADO
  BuscarUnaConfiguracion(id: number) {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/configurarVacacion/buscar-configuracion/${id}`);
  }

  // METODO PARA ELIMINAR CONFIGURACION DE VACACIONES  **USADO
  EliminarConfiguracion(datos: any) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/configurarVacacion/eliminar-configuracion`, datos);
  }

}
