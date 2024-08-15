import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class FaltasService {

  constructor(private http: HttpClient) { }

  // METODO DE BUSQUEDA DE DATOS DE FALTAS    **USADO
  BuscarFaltas(data: any, inicio: string, fin: string) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/reporte-faltas/faltas/${inicio}/${fin}`, data);
  }

}
