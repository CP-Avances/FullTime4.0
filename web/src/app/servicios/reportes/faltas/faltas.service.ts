import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class FaltasService {

  constructor(private http: HttpClient) { }

  // METODO DE BUSQUEDA DE DATOS DE ATRASOS 
  BuscarFaltas(data: any, inicio: string, fin: string) {
    return this.http.post<any>(`${environment.url}/reporte-faltas/faltas/${inicio}/${fin}`, data);
  }

}
