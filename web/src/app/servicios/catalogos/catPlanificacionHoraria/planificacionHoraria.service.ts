import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PlanificacionHorariaService {

  constructor(
    private http: HttpClient,
  ) { }

  // VERIFICAR DATOS DE LA PLANIFICACION HORARIA
  VerificarDatosPlanificacionHoraria(formData: any) {
    return this.http.post<any>(`${environment.url}/planificacionHoraria/verificarDatos`, formData);
  }

  // CARGAR PLANIFICACION HORARIA
  RegistrarPlanificacionHoraria(formData: any) {
    return this.http.post<any>(`${environment.url}/planificacionHoraria/registrarPlanificacion`, formData);
  }

}
