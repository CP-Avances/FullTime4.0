import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class ConexionDataBaseService {

  constructor(
    private http: HttpClient,
  ) { }

  ObtenerDataBase() {
    console.log('entro en conexion base');
    return this.http.get(`${environment.url}/conexionDataBases/dataBase`);
  }
}
