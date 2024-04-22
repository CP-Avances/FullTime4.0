import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';

import { environment } from '../../../../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class ProvinciaService {

  constructor(
    private http: HttpClient,
  ) { }


  // METODO PARA BUSCAR CONTINENTES
  BuscarContinente() {
    return this.http.get(`${environment.url}/provincia/continentes`);
  }

  // METODO PARA BUSCAR LISTA DE PAISES
  BuscarPais(continente: string) {
    return this.http.get(`${environment.url}/provincia/pais/${continente}`);
  }

  // BUSCAR PROVINCIAS POR PAIS
  BuscarProvinciaPais(id_pais: number) {
    return this.http.get(`${environment.url}/provincia/${id_pais}`);
  }

  // METODO PARA BUSCAR PROVINCIAS
  BuscarProvincias() {
    return this.http.get(`${environment.url}/provincia`);
  }

  // METODO PARA ELIMINAR REGISTRO
  EliminarProvincia(id: any) {
    return this.http.delete(`${environment.url}/provincia/eliminar/${id}`).pipe(
      catchError(id)
    );
  }

  // METODO PARA CREAR ARCHIVO XML
  CrearXML(data: any) {
    return this.http.post(`${environment.url}/provincia/xmlDownload`, data);
  }

  // METODO PARA REGISTRAR PROVINCIA
  RegistrarProvincia(data: any) {
    return this.http.post(`${environment.url}/provincia`, data);
  }

  // METODO PARA BUSCAR DATOS DE UNA PROVINCIA
  BuscarUnaProvinciaId(id: number) {
    return this.http.get(`${environment.url}/provincia/buscar/${id}`);
  }

  // METODO PARA BUSCAR INFORMACION DE UN PAIS
  BuscarPaisId(id: number) {
    return this.http.get(`${environment.url}/provincia/buscar/pais/${id}`);
  }




  
  getIdProvinciaRest(nombre: string) {
    return this.http.get(`${environment.url}/provincia/nombreProvincia/${nombre}`);
  }

  BuscarTodosPaises() {
    return this.http.get(`${environment.url}/provincia/paises`);
  }



}

