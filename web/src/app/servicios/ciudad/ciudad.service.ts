import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class CiudadService {

  constructor(
    private http: HttpClient,
  ) { }

  // BUSCAR INFORMACION DE LA CIUDAD
  BuscarInformacionCiudad(id_ciudad: number) {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/ciudades/informacion-ciudad/${id_ciudad}`);
  }

  // BUSQUEDA DE CIUDADES
  ConsultarCiudades() {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/ciudades/listaCiudad`);
  }

  // BUSCAR CIUDADES POR PROVINCIA
  BuscarCiudadProvincia(id_provincia: number) {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/ciudades/ciudad-provincia/${id_provincia}`);
  }

  // REGISTRAR CIUDAD
  RegistrarCiudad(data: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/ciudades`, data);
  }

  // BUSQUEDA DE NOMBRE CIUDADES - PROVINCIAS
  ListarNombreCiudadProvincia() {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/ciudades`);
  }

  // METODO PARA ELIMINAR REGISTRO
  EliminarCiudad(id: number) {
    return this.http.delete(`${(localStorage.getItem('empresaURL') as string)}/ciudades/eliminar/${id}`);
  }

   // METODO PARA CREAR ARCHIVO XML
   CrearXML(data: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/ciudades/xmlDownload`, data);
  }

  // METODO PARA BUSCAR INFORMACION DE UNA CIUDAD
  BuscarUnaCiudad(id: number) {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/ciudades/${id}`);
  }

}
