import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class AtrasosService {

  constructor(private http: HttpClient) { }

  // METODO DE BUSQUEDA DE DATOS DE ATRASOS LISTA sucursales[regimenes[departamentos[cargos[empleados]]]]
  ReporteAtrasos(data: any, desde: string, hasta: string) {
    return this.http.put<any>(`${(localStorage.getItem('empresaURL') as string)}/reporte-atrasos/atrasos-empleados/${desde}/${hasta}`, data);
  }

  // METODO DE BUSQUEDA DE DATOS DE ATRASOS LISTA sucursales[empleados]]
  ReporteAtrasosRegimenCargo(data: any, desde: string, hasta: string) {
    return this.http.put<any>(`${(localStorage.getItem('empresaURL') as string)}/reporte-atrasos/atrasos-empleados-regimen-cargo/${desde}/${hasta}`, data);
  }
}
