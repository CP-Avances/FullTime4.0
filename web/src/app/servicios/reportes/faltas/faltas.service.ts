import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class FaltasService {

  constructor(private http: HttpClient) { }

  // METODO DE BUSQUEDA DE DATOS DE ATRASOS LISTA sucursales[regimenes[departamentos[cargos[empleados]]]]
  BuscarFaltas(data: any, inicio: string, fin: string) {
    return this.http.put<any>(`${(localStorage.getItem('empresaURL') as string)}/reporte-faltas/faltas/${inicio}/${fin}`, data);
  }

  // METODO DE BUSQUEDA DE DATOS DE ATRASOS LISTA sucursales[empleados]]
  BuscarFaltasRegimenCargo(data: any, inicio: string, fin: string) {
    return this.http.put<any>(`${(localStorage.getItem('empresaURL') as string)}/reporte-faltas/faltas-regimen-cargo/${inicio}/${fin}`, data);
  }

}
