import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class EnroladosRelojesService {

  constructor(
    private http: HttpClient,
  ) { }

  // Asignar Ciudad Feriado

  CrearEnroladoReloj(datos: any) {
    return this.http.post(`${environment.url}/enroladosRelojes/insertar`, datos);
  }

  BuscarIdReloj(datos: any) {
    return this.http.post(`${environment.url}/enroladosRelojes/buscar`, datos);
  }

  BuscarEnroladosReloj(id: number) {
    return this.http.get(`${environment.url}/enroladosRelojes/nombresReloj/${id}`);
  }

  ActualizarDatos(datos: any) {
    return this.http.put(`${environment.url}/enroladosRelojes`, datos);
  }

  EliminarRegistro(id: number) {
    return this.http.delete(`${environment.url}/enroladosRelojes/eliminar/${id}`);
  }

}
