import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class TiempoLaboradoService {

  constructor(private http: HttpClient) { }

  // METODO DE BUSQUEDA DE DATOS DE TIEMPO LABORADO LISTA sucursales[regimenes[departamentos[cargos[empleados]]]]
  ReporteTiempoLaborado(data: any, desde: string, hasta: string) {
    return this.http.put<any>(`${(localStorage.getItem('empresaURL') as string)}/reporte-tiempo-laborado/tiempo-laborado-empleados/${desde}/${hasta}`, data);
  }

  // METODO DE BUSQUEDA DE DATOS DE TIEMPO LABORADO LISTA sucursales[empleados]]
  ReporteTiempoLaboradoRegimenCargo(data: any, desde: string, hasta: string) {
    return this.http.put<any>(`${(localStorage.getItem('empresaURL') as string)}/reporte-tiempo-laborado/tiempo-laborado-empleados-regimen-cargo/${desde}/${hasta}`, data);
  }
}
