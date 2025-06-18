import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PlanGeneralService {

  constructor(
    private http: HttpClient,
  ) { }

  // METODO PARA CREAR PLAN GENERAL   **USADO
  CrearPlanGeneral(datos: any) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/planificacion_general/`, datos);
  }

  // METODO PARA CREAR PLAN GENERAL POR LOTES  **USADO
  CrearPlanGeneralPorLotes(datos: any) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/planificacion_general/cargar-planificacion`, datos);
  }

  // METODO PARA BUSCAR ID POR FECHAS PLAN GENERAL   **USADO
  BuscarFechas(datos: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/planificacion_general/buscar_fechas`, datos);
  }

  // METODO PARA BUSCAR ID POR FECHAS PLAN GENERAL   **USADO
  BuscarFechasMultiples(datos: any) {
    console.log(">>> Enviando a BuscarFechasMultiples:", datos);
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/planificacion_general/buscar_fechas_multiple`, datos);
  }


  // METODO PARA ELIMINAR REGISTROS    **USADO
  EliminarRegistro(data: any,) {
    console.log(">>> Enviando a eliminar:", data);
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/planificacion_general/eliminar`, data);
  }

  // METODO PARA ELIMINAR REGISTROS - MULTIPLES   **USADO
  EliminarRegistroMutiple(data: any,) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/planificacion_general/eliminar-multiples`, data);
  }

  // METODO PARA BUSCAR HORARIO DEL USUARIO EN FECHAS ESPECIFICAS
  BuscarHorarioFechas(datos: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/planificacion_general/horario-general-fechas`, datos);
  }

  // METODO PARA LISTAR PLANIFICACIONES DEL USUARIO  **USADO
  BuscarPlanificacionHoraria(datos: any) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/planificacion_general/horario-general-planificacion`, datos);
  }

  // METODO PARA LISTAR PLANIFICACIONES DEL USUARIO   **USADO
  BuscarDetallePlanificacion(datos: any) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/planificacion_general/horario-general-detalle`, datos);
  }

  // METODO PARA LISTAR PLANIFICACIONES DEL USUARIO   **USADO
  BuscarHorariosUsuario(datos: any) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/planificacion_general/horario-solo-planificacion/lista`, datos);
  }
  
  // METODO PARA CONSULTAR ASISTENCIA    **USADO
  ConsultarAsistencia(data: any) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/planificacion_general/buscar-asistencia`, data);
  }

  // METODO PARA ACTUALIZAR ASISTENCIA MANUAL    **USADO
  ActualizarAsistenciaManual(data: any) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/planificacion_general/actualizar-asistencia/manual`, data);
  }
  
}
