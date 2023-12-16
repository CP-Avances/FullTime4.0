import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root'
})
export class MrlService {

  constructor(private http: HttpClient) { }

  ReporteTimbresMrl(data: any, desde: string, hasta: string){
    return this.http.put<any>(`${environment.url}/reporte-timbres-mrl/timbres/${desde}/${hasta}`, data);
  }

  ReporteTimbresMrlRegimenCargo(data: any, desde: string, hasta: string){
    return this.http.put<any>(`${environment.url}/reporte-timbres-mrl/timbres-regimen-cargo/${desde}/${hasta}`, data);
  }
}
