import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class PlanificacionHorariaService {

  constructor(
    private http: HttpClient,
  ) { }

  // VERIFICAR DATOS DE LA PLANIFICACION HORARIA   **USADO
  VerificarDatosPlanificacionHoraria(formData: any) {
    console.log(formData);
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/planificacionHoraria/verificarDatos`, formData);
  }

  // CARGAR PLANIFICACION HORARIA   **USADO
  RegistrarPlanificacionHoraria(formData: any) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/planificacionHoraria/registrarPlanificacion`, formData);
  }

}
