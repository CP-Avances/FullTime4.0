import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})

export class PeriodoVacacionesService {
  constructor(
    private http: HttpClient,
  ) { }

  // METODO PARA CREAR PERIODO DE VACACIONES   **USADO
  CrearPerVacaciones(datos: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/perVacacion`, datos);
  }

  // METODO PARA ACTUALIZAR PERIODO DE VACACIONES  **USADO
  ActualizarPeriodoV(datos: any) {
    return this.http.put(`${(localStorage.getItem('empresaURL') as string)}/perVacacion`, datos);
  }

  // METODO PARA BUSCAR DATOS DE PERIODO DE VACACION   **USADO
  ObtenerPeriodoVacaciones(id_empleado: string | number) {
    return this.http.get<any>(`${(localStorage.getItem('empresaURL') as string)}/perVacacion/infoPeriodo/${id_empleado}`);
  }

  // BUSCAR ID PERIODO DE VACACIONES   **USADO
  BuscarIDPerVacaciones(id: number) {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/perVacacion/buscar/${id}`);
  }

  // METODO PARA CERRAR PERIODO DE VACACIONES   **USADO
  CerrarPeriodoVacaciones(datos: any) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/perVacacion/cerrar-periodos`, datos);
  }

  // METODO PARA CREAR PERIODO DE VACACIONES DESDE EL SISTEMA **USADO
  GenerarPeriodoManual(datos: any) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/perVacacion/periodo-crear-manual`, datos);
  }

  // METODO PARA CONSULTAR LISTA DE PERIODO DE VACACIONES DEL USUARIO    **USADO
  ReportePeriodoVacaciones(data: any, estado: any) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/perVacacion/buscar-periodos/${estado}`, data);
  }

}
