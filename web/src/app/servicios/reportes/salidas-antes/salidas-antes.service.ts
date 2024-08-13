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

  // METODO PARA BUSCAR REGISTROS DE SALIDAS ANTICIPADAS   **USADO
  BuscarTimbresSalidasAnticipadas(data: any, inicio: string, fin: string) {
    return this.http.post<any>(`${environment.url}/reporte-salidas-antes/timbre-salida-anticipada/${inicio}/${fin}`, data);
  }


}
