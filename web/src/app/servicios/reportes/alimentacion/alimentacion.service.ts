import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})

export class AlimentacionService {

  constructor(
    private http: HttpClient,
  ) { }

  // METODO PARA BUSCAR DATOS TIEMPO DE ALIMENTACION   **USADO**
  BuscarTimbresAlimentacion(data: any, inicio: string, fin: string) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/alimentacion/timbres-alimentacion/${inicio}/${fin}`, data);
  }


}
