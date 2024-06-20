import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment'
import { catchError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CiudadService {

  constructor(
    private http: HttpClient,
  ) { }

  // BUSCAR INFORMACION DE LA CIUDAD
  BuscarInformacionCiudad(id_ciudad: number) {
    return this.http.get(`${environment.url}/ciudades/informacion-ciudad/${id_ciudad}`);
  }

  // BUSQUEDA DE CIUDADES
  ConsultarCiudades() {
    return this.http.get(`${environment.url}/ciudades/listaCiudad`);
  }

  // BUSCAR CIUDADES POR PROVINCIA
  BuscarCiudadProvincia(id_provincia: number) {
    return this.http.get(`${environment.url}/ciudades/ciudad-provincia/${id_provincia}`);
  }

  // REGISTRAR CIUDAD
  RegistrarCiudad(data: any) {
    return this.http.post(`${environment.url}/ciudades`, data);
  }

  // BUSQUEDA DE NOMBRE CIUDADES - PROVINCIAS
  ListarNombreCiudadProvincia() {
    return this.http.get(`${environment.url}/ciudades`);
  }

  // METODO PARA ELIMINAR REGISTRO
  EliminarCiudad(id: any, datos: any) {
    const url = `${environment.url}/ciudades/eliminar/${id}`;
    const httpOtions = {
      body: datos
    };
    return this.http.request('delete', url, httpOtions).pipe(catchError(id));
  }

  // METODO PARA BUSCAR INFORMACION DE UNA CIUDAD
  BuscarUnaCiudad(id: number) {
    return this.http.get(`${environment.url}/ciudades/${id}`);
  }

}
