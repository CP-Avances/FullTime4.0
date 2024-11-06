import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';;

@Injectable({
  providedIn: 'root'
})

export class CiudadFeriadosService {

  constructor(
    private http: HttpClient,
  ) { }


  // METODO PARA BUSCAR CIUDADES - PROVINCIA POR NOMBRE   **USADO
  BuscarCiudadProvincia(nombre: string) {
    return this.http.get(`${environment.url}/ciudadFeriados/${nombre}`);
  }

  // METODO PARA BUSCAR NOMBRES DE CIUDADES    **USADO
  BuscarCiudadesFeriado(id: number) {
    return this.http.get(`${environment.url}/ciudadFeriados/nombresCiudades/${id}`);
  }

  // METODO PARA ELIMINAR REGISTRO    **USADO
  EliminarRegistro(id: number, dato:any) {
    const url = `${environment.url}/ciudadFeriados/eliminar/${id}`;
    const httpOptions = {
      body: dato
    };
    return this.http.request('delete', url, httpOptions);
  }

  // METODO PARA BUSCAR ID DE CIUDADES    **USADO
  BuscarIdCiudad(datos: any) {
    return this.http.post(`${environment.url}/ciudadFeriados/buscar`, datos);
  }

  // METODO PARA REGISTRAR ASIGNACION DE CIUDADES A FERIADOS   **USADO
  CrearCiudadFeriado(datos: any) {
    return this.http.post(`${environment.url}/ciudadFeriados/insertar`, datos);
  }

  // METODO PARA ACTUALIZAR REGISTRO    **USADO
  ActualizarDatos(data: any) {
    return this.http.put(`${environment.url}/ciudadFeriados`, data);
  }

  BuscarFeriados(id_ciudad: number) {
    return this.http.get(`${environment.url}/ciudadFeriados/ciudad/${id_ciudad}`);
  }

}
