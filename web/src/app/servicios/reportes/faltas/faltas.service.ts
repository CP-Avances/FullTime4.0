import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class FaltasService {

  constructor(private http: HttpClient) { }

  BuscarFaltas(data: any, inicio: string, fin: string) {
    return this.http.put<any>(`${environment.url}/reporte-faltas/faltas/${inicio}/${fin}`, data);
  }

  BuscarFaltasRegimenCargo(data: any, inicio: string, fin: string) {
    return this.http.put<any>(`${environment.url}/reporte-faltas/faltas-regimen-cargo/${inicio}/${fin}`, data);
  }

}
