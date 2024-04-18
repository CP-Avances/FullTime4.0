import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class PlanGeneralService {

  constructor(
    private http: HttpClient,
  ) { }

  // METODO PARA CREAR PLAN GENERAL   --**VERIFICADO
  CrearPlanGeneral(datos: any) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/planificacion_general/`, datos);
  }

  // METODO PARA BUSCAR ID POR FECHAS PLAN GENERAL   --**VERIFICADO
  BuscarFechas(datos: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/planificacion_general/buscar_fechas`, datos);
  }

  // METODO PARA ELIMINAR REGISTROS    --**VERIFICADO
  EliminarRegistro(data: any,) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/planificacion_general/eliminar`, data);
  }

  // METODO PARA BUSCAR HORARIO DEL USUARIO EN FECHAS ESPECIFICAS
  BuscarHorarioFechas(datos: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/planificacion_general/horario-general-fechas`, datos);
  }

  // METODO PARA LISTAR PLANIFICACIONES DEL USUARIO --**VERIFICADO
  BuscarPlanificacionHoraria(datos: any) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/planificacion_general/horario-general-planificacion`, datos);
  }

  // METODO PARA LISTAR PLANIFICACIONES DEL USUARIO --**VERIFICADO
  BuscarDetallePlanificacion(datos: any) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/planificacion_general/horario-general-detalle`, datos);
  }

  // METODO PARA LISTAR PLANIFICACIONES DEL USUARIO --**VERIFICADO
  BuscarHorariosUsuario(datos: any) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/planificacion_general/horario-solo-planificacion/lista`, datos);
  }

  // METODO PARA LISTAR PLANIFICACIONES DESCANSO DEL USUARIO --**VERIFICADO
  BuscarHorariosDescanso(datos: any) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/planificacion_general/horario-solo-planificacion/lista-descanso`, datos);
  }

  // METODO PARA CONSULTAR ASISTENCIA
  ConsultarAsistencia(data: any) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/planificacion_general/buscar-asistencia`, data);
  }

  // METODO PARA ACTUALIZAR ASISTENCIA MANUAL
  ActualizarAsistenciaManual(data: any) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/planificacion_general/actualizar-asistencia/manual`, data);
  }











  BuscarFecha(datos: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/planificacion_general/buscar_fecha/plan`, datos);
  }


  // DATO NO USADO
  /*BuscarPlanificacionEmpleado(empleado_id: any, datos: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/planificacion_general/buscar_plan/${empleado_id}`, datos);
  }*/

}
