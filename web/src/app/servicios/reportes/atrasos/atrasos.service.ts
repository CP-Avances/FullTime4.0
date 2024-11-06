import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AtrasosService {

  constructor(private http: HttpClient) { }

  // METODO DE BUSQUEDA DE DATOS DE ATRASOS    **USADO
  ReporteAtrasos(data: any, desde: string, hasta: string) {
    return this.http.post<any>(`${environment.url}/reporte-atrasos/atrasos-empleados/${desde}/${hasta}`, data);
  }

}
