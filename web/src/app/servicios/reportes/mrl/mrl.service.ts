import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';


@Injectable({
  providedIn: 'root'
})
export class MrlService {

  constructor(private http: HttpClient) { }

  ReporteTimbresMrl(data: any, desde: string, hasta: string){
    return this.http.put<any>(`${(localStorage.getItem('empresaURL') as string)}/reporte-timbres-mrl/timbres/${desde}/${hasta}`, data);
  }

  ReporteTimbresMrlRegimenCargo(data: any, desde: string, hasta: string){
    return this.http.put<any>(`${(localStorage.getItem('empresaURL') as string)}/reporte-timbres-mrl/timbres-regimen-cargo/${desde}/${hasta}`, data);
  }
  
}
