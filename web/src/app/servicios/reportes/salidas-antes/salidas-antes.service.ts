import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})

export class SalidasAntesService {

  constructor(
    private http: HttpClient
  ) { }

  // METODO PARA BUSCAR REGISTROS DE SALIDAS ANTICIPADAS   **USADO
  BuscarTimbresSalidasAnticipadas(data: any, inicio: string, fin: string) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/reporte-salidas-antes/timbre-salida-anticipada/${inicio}/${fin}`, data);
  }


}
