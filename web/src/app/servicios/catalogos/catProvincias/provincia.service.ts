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


  // METODO PARA BUSCAR CONTINENTES  **USADO
  BuscarContinente() {
    return this.http.get(`${environment.url}/provincia/continentes`);
  }

  // METODO PARA BUSCAR LISTA DE PAISES  **USADO
  BuscarPais(continente: string) {
    return this.http.get(`${environment.url}/provincia/pais/${continente}`);
  }

  // BUSCAR PROVINCIAS POR PAIS  **USADO
  BuscarProvinciaPais(id_pais: number) {
    return this.http.get(`${environment.url}/provincia/${id_pais}`);
  }

  // METODO PARA BUSCAR PROVINCIAS  **USADO
  BuscarProvincias() {
    return this.http.get(`${environment.url}/provincia`);
  }

  // METODO PARA ELIMINAR REGISTRO  **USADO
  EliminarProvincia(id: any, datos: any) {
    const url = `${environment.url}/provincia/eliminar/${id}`;
    const httpOtions = {
      body: datos
    };
    return this.http.request('delete', url, httpOtions).pipe(catchError(id));
  }

  // METODO PARA REGISTRAR PROVINCIA  **USADO
  RegistrarProvincia(data: any) {
    return this.http.post(`${environment.url}/provincia`, data);
  }

  // METODO PARA BUSCAR DATOS DE UNA PROVINCIA
  BuscarUnaProvinciaId(id: number) {
    return this.http.get(`${environment.url}/provincia/buscar/${id}`);
  }

  // METODO PARA BUSCAR INFORMACION DE UN PAIS    **USADO
  BuscarPaisId(id: number) {
    return this.http.get(`${environment.url}/provincia/buscar/pais/${id}`);
  }

}

