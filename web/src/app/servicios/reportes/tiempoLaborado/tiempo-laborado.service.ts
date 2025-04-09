import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class TiempoLaboradoService {

  constructor(private http: HttpClient) { }

  // METODO DE BUSQUEDA DE DATOS DE TIEMPO LABORADO    **USADO
  ReporteTiempoLaborado(data: any, desde: string, hasta: string) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/reporte-tiempo-laborado/tiempo-laborado-empleados/${desde}/${hasta}`, data);
  }

}
