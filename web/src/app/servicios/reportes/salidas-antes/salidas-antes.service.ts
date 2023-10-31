import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment'

@Injectable({
  providedIn: 'root'
})

export class SalidasAntesService {

  constructor(
    private http: HttpClient
  ) { }

  BuscarTimbresSalidasAnticipadas(data: any, inicio: string, fin: string) {
    return this.http.put<any>(`${environment.url}/reporte-salidas-antes/timbre-salida-anticipada/${inicio}/${fin}`, data);
  }

  BuscarTimbresSalidasAnticipadasRegimenCargo(data: any, inicio: string, fin: string) {
    return this.http.put<any>(`${environment.url}/reporte-salidas-antes/timbre-salida-anticipada-regimen-cargo/${inicio}/${fin}`, data);
  }

}
