import { environment } from 'src/environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})

export class PeriodoVacacionesService {
  constructor(
    private http: HttpClient,
  ) { }

  // BUSCAR ID PERIODO DE VACACIONES   **USADO
  BuscarIDPerVacaciones(id: number) {
    return this.http.get(`${environment.url}/perVacacion/buscar/${id}`);
  }

  CrearPerVacaciones(datos: any) {
    return this.http.post(`${environment.url}/perVacacion`, datos);
  }

  // METODO PARA BUSCAR DATOS DE PERIODO DE VACACION   **USADO
  ObtenerPeriodoVacaciones(id_empleado: string | number) {
    return this.http.get<any>(`${environment.url}/perVacacion/infoPeriodo/${id_empleado}`);
  }

  ActualizarPeriodoV(datos: any) {
    return this.http.put(`${environment.url}/perVacacion`, datos);
  }
}
