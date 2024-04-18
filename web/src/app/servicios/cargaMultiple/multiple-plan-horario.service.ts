import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class MultiplePlanHorarioService {

  constructor(
    private http: HttpClient,
  ) { }

  CargarArchivoExcel(formData) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/cargaMultiple/upload`, formData)
  }
  CargarHorarioFijoVarios(formData) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/cargaMultiple/horarioFijo/upload`, formData)
  }
}
