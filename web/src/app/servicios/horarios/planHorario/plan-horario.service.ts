import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class PlanHorarioService {

  constructor(
    private http: HttpClient,
  ) { }

  /* SE ELIMINA EL SERVICIO
  ObtenerHorarioRotativo(codigo: number) {
    return this.http.get<any>(`${environment.url}/planHorario/rotativo/${codigo}`);
  }
  */

  

  ObtenerPlanHorario() {
    return this.http.get(`${environment.url}/planHorario`);
  }

  RegistrarPlanHorario(datos: any) {
    return this.http.post(`${environment.url}/planHorario`, datos);
  }

  BuscarIDPlanHorario(id: number) {
    return this.http.get(`${environment.url}/planHorario/buscar/${id}`);
  }

  ObtenerPlanHorarioPorId(id: number) {
    return this.http.get<any>(`${environment.url}/planHorario/datosPlanHorario/${id}`);
  }

  ActualizarDatos(datos: any) {
    return this.http.put(`${environment.url}/planHorario/`, datos);
  }

  EliminarRegistro(id: number) {
    return this.http.delete(`${environment.url}/planHorario/eliminar/${id}`);
  }

  ObtenerPlanHorarioEmpleadoFechas(id_empleado: number, datos: any) {
    return this.http.post(`${environment.url}/planHorario/fechas_plan/${id_empleado}`, datos);
  }

  VerificarDuplicidadPlan(datos: any, codigo: number,) {
    return this.http.post(`${environment.url}/planHorario/validarFechas/${codigo}`, datos);
  }

  VerificarDuplicidadPlanEdicion(id: number, codigo: number, datos: any) {
    return this.http.post(`${environment.url}/planHorario/validarFechas/horarioEmpleado/${id}/empleado/${codigo}`, datos);
  }
}
