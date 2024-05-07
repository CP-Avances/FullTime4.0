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
  EliminarCiudad(id: any) {
    return this.http.delete(`${environment.url}/ciudades/eliminar/${id}`).pipe(catchError(id));
  }

   // METODO PARA CREAR ARCHIVO XML
   CrearXML(data: any) {
    return this.http.post(`${environment.url}/ciudades/xmlDownload`, data);
  }

  // METODO PARA BUSCAR INFORMACION DE UNA CIUDAD
  BuscarUnaCiudad(id: number) {
    return this.http.get(`${environment.url}/ciudades/${id}`);
  }

}
