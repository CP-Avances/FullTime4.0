import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class TiempoLaboradoService {

  constructor(private http: HttpClient) { }

  ReporteTiempoLaborado(data: any, desde: string, hasta: string) {
    return this.http.put<any>(`${(localStorage.getItem('empresaURL') as string)}/reporte-tiempo-laborado/tiempo-laborado-empleados/${desde}/${hasta}`, data);
  }

  ReporteTiempoLaboradoRegimenCargo(data: any, desde: string, hasta: string) {
    return this.http.put<any>(`${(localStorage.getItem('empresaURL') as string)}/reporte-tiempo-laborado/tiempo-laborado-empleados-regimen-cargo/${desde}/${hasta}`, data);
  }
}
