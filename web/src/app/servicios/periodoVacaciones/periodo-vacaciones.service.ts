import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment'

@Injectable({
  providedIn: 'root'
})

export class PeriodoVacacionesService {
  constructor(
    private http: HttpClient,
  ) { }

  // BUSCAR ID PERIODO DE VACACIONES
  BuscarIDPerVacaciones(id: number) {
    return this.http.get(`${environment.url}/perVacacion/buscar/${id}`);
  }

  CrearPerVacaciones(datos: any) {
    return this.http.post(`${environment.url}/perVacacion`, datos);
  }

  ObtenerPeriodoVacaciones(id_empleado: string | number) {
    return this.http.get<any>(`${environment.url}/perVacacion/infoPeriodo/${id_empleado}`);
  }
  ActualizarPeriodoV(datos: any) {
    return this.http.put(`${environment.url}/perVacacion`, datos);
  }
}
