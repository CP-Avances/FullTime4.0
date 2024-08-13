import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root'
})
export class MrlService {

  constructor(private http: HttpClient) { }

  // METODO DE BUSQUEDA DE LISTA DE TIMBRES PARA FORMATEAR MRL     **USADO
  ReporteTimbresMrl(data: any, desde: string, hasta: string){
    return this.http.post<any>(`${environment.url}/reporte-timbres-mrl/timbres/${desde}/${hasta}`, data);
  }

}
