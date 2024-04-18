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
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/enroladosRelojes/insertar`, datos);
  }

  BuscarIdReloj(datos: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/enroladosRelojes/buscar`, datos);
  }

  BuscarEnroladosReloj(id: number) {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/enroladosRelojes/nombresReloj/${id}`);
  }

  ActualizarDatos(datos: any) {
    return this.http.put(`${(localStorage.getItem('empresaURL') as string)}/enroladosRelojes`, datos);
  }

  EliminarRegistro(id: number) {
    return this.http.delete(`${(localStorage.getItem('empresaURL') as string)}/enroladosRelojes/eliminar/${id}`);
  }

}
