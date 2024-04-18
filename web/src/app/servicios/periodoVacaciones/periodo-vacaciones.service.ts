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
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/perVacacion/buscar/${id}`);
  }











  // Período de Vacaciones

  ConsultarPerVacaciones() {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/perVacacion`);
  }

  CrearPerVacaciones(datos: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/perVacacion`, datos);
  }


  ObtenerPeriodoVacaciones(codigo: string | number) {
    return this.http.get<any>(`${(localStorage.getItem('empresaURL') as string)}/perVacacion/infoPeriodo/${codigo}`);
  }

  ActualizarPeriodoV(datos: any) {
    return this.http.put(`${(localStorage.getItem('empresaURL') as string)}/perVacacion`, datos);
  }

  // Verificar datos de la plantilla de periodo de vacaciones y luego cargar al sistema
  CargarPeriodosMultiples(formData) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/perVacacion/cargarPeriodo/upload`, formData);
  }

  VerificarDatos(formData) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/perVacacion/cargarPeriodo/verificarDatos/upload`, formData);
  }

  VerificarPlantilla(formData) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/perVacacion/cargarPeriodo/verificarPlantilla/upload`, formData);
  }
}
