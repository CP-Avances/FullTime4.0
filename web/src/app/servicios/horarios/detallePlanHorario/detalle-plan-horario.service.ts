import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class DetallePlanHorarioService {

  constructor(
    private http: HttpClient,
  ) { }

  ObtenerDetallesPlanHorario() {
    return this.http.get(`${environment.url}/detallePlanHorario`);
  }

  RegistrarDetallesPlanHorario(datos: any) {
    return this.http.post(`${environment.url}/detallePlanHorario`, datos);
  }

  ObtenerPlanHoraDetallePorIdPlanHorario(id_plan_horario: number) {
    return this.http.get<any>(`${environment.url}/detallePlanHorario/infoPlan/${id_plan_horario}`);
  }

  ActualizarRegistro(data: any) {
    return this.http.put(`${environment.url}/detallePlanHorario`, data);
  }

  EliminarRegistro(id: number) {
    return this.http.delete(`${environment.url}/detallePlanHorario/eliminar/${id}`);
  }

  VerificarDuplicidad(datos: any) {
    return this.http.post(`${environment.url}/detallePlanHorario/verificarRegistro`, datos);
  }

  VerificarDuplicidadEdicion(datos: any, id: number) {
    return this.http.post(`${environment.url}/detallePlanHorario/verificarDuplicado/${id}`, datos);
  }

  // Verificar Datos de detalle de plantilla
  VerificarDatos(id_plan_horario: number, formData) {
    return this.http.post<any>(`${environment.url}/detallePlanHorario/verificarDatos/${id_plan_horario}/upload`, formData)
  }
  VerificarPlantilla(formData) {
    return this.http.post<any>(`${environment.url}/detallePlanHorario/verificarPlantilla/upload`, formData)
  }
  subirArchivoExcel(id_plan_horario: number, formData) {
    return this.http.post<any>(`${environment.url}/detallePlanHorario/${id_plan_horario}/upload`, formData)
  }
  CrearPlanificacionGeneral(id: number, codigo: number, formData) {
    return this.http.post<any>(`${environment.url}/detallePlanHorario/plan_general/${id}/${codigo}/upload`, formData)
  }
}
