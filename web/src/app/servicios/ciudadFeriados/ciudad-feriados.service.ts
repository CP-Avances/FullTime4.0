import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment'

@Injectable({
  providedIn: 'root'
})

export class CiudadFeriadosService {

  constructor(
    private http: HttpClient,
  ) { }


  // METODO PARA BUSCAR CIUDADES - PROVINCIA POR NOMBRE
  BuscarCiudadProvincia(nombre: string) {
    return this.http.get(`${environment.url}/ciudadFeriados/${nombre}`);
  }

  // METODO PARA BUSCAR NOMBRES DE CIUDADES
  BuscarCiudadesFeriado(id: number) {
    return this.http.get(`${environment.url}/ciudadFeriados/nombresCiudades/${id}`);
  }

  // METODO PARA ELIMINAR REGISTRO
  EliminarRegistro(id: number) {
    return this.http.delete(`${environment.url}/ciudadFeriados/eliminar/${id}`);
  }

  // METODO PARA BUSCAR ID DE CIUDADES
  BuscarIdCiudad(datos: any) {
    return this.http.post(`${environment.url}/ciudadFeriados/buscar`, datos);
  }

  // METODO PARA REGISTRAR ASIGNACION DE CIUDADES A FERIADOS
  CrearCiudadFeriado(datos: any) {
    return this.http.post(`${environment.url}/ciudadFeriados/insertar`, datos);
  }

  // METODO PARA ACTUALIZAR REGISTRO
  ActualizarDatos(data: any) {
    return this.http.put(`${environment.url}/ciudadFeriados`, data);
  }






  // Asignar Ciudad Feriado













  BuscarFeriados(id_ciudad: number) {
    return this.http.get(`${environment.url}/ciudadFeriados/ciudad/${id_ciudad}`);
  }

}
