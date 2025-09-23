import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AtrasosService {

  constructor(private http: HttpClient) { }

  // METODO DE BUSQUEDA DE DATOS DE ATRASOS    **USADO**
  ReporteAtrasos(data: any, desde: string, hasta: string) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/reporte-atrasos/atrasos-empleados/${desde}/${hasta}`, data);
  }

}
