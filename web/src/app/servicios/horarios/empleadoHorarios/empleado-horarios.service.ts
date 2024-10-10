import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment'

@Injectable({
  providedIn: 'root'
})

export class EmpleadoHorariosService {

  constructor(
    private http: HttpClient,
  ) { }


  VerificarDuplicidadHorarios2( datos: any) {
    return this.http.post(`${environment.url}/empleadoHorario/validarFechas`, datos);
  }

  BuscarFechasMultiples( datos: any) {
    return this.http.post(`${environment.url}/empleadoHorario/buscar-horarios-multiples`, datos);
  }

  // METODO PARA VERIFICAR HORARIOS DUPLICADOS  **USADO
  VerificarDuplicidadHorarios(id_empleado: string, datos: any) {
    return this.http.post(`${environment.url}/empleadoHorario/validarFechas/${id_empleado}`, datos);
  }
  // METODO PARA BUSCAR HORARIOS DE EMPLEADO EN UN RANGO DE FECHAS  **USADO
  VerificarHorariosExistentes(id_empleado: string, datos: any) {
    return this.http.post<any>(`${environment.url}/empleadoHorario/horarios-existentes1/${id_empleado}`, datos);
  }

  // METODO PARA BUSCAR HORARIOS DE EMPLEADO EN UN RANGO DE FECHAS  **USADO
  VerificarHorariosExistentes2(datos: any) {
    return this.http.post<any>(`${environment.url}/empleadoHorario/horarios-existentes`, datos);
  }
  // METODO PARA BUSCAR HORARIO DEL USUARIO POR HORAS MISMO DIA (MD)
  BuscarHorarioHorasMD(datos: any) {
    return this.http.post<any>(`${environment.url}/empleadoHorario/horario-horas-mismo-dia`, datos);
  }

  // METODO PARA BUSCAR HORARIO DEL USUARIO POR HORAS DIAS DIFERENTES (DD)
  BuscarHorarioHorasDD(datos: any) {
    return this.http.post<any>(`${environment.url}/empleadoHorario/horario-horas-dias-diferentes`, datos);
  }

  // METODO PARA BUSCAR HORARIO DEL USUARIO POR HORAS MISMO DIA (MD)
  BuscarComidaHorarioHorasMD(datos: any) {
    return this.http.post<any>(`${environment.url}/empleadoHorario/horario-comida-horas-mismo-dia`, datos);
  }

  // METODO PARA BUSCAR HORARIO DEL USUARIO POR HORAS DIAS DIFERENTES (DD)
  BuscarComidaHorarioHorasDD(datos: any) {
    return this.http.post<any>(`${environment.url}/empleadoHorario/horario-comida-horas-dias-diferentes`, datos);
  }

  //Horarios Empleado
  ObtenerHorariosFechasEmpleado(codigo: string | number, data: any) {
    return this.http.post(`${environment.url}/empleadoHorario/fechas_horario/${codigo}`, data)
  }

  // Verificar datos de la plantilla de horario fijo
  VerificarDatos_EmpleadoHorario(formData: any, id: number) {
    console.log('entra')
    return this.http.post<any>(`${environment.url}/empleadoHorario/revisarData/${id}`, formData)
  }
  VerificarPlantilla_EmpleadoHorario(formData: any) {
    return this.http.post<any>(`${environment.url}/empleadoHorario/verificarPlantilla/upload`, formData)
  }
  CreaPlanificacion(formData: any, id: number, codigo: string | number) {
    return this.http.post<any>(`${environment.url}/empleadoHorario/plan_general/upload/${id}/${codigo}`, formData)
  }
  SubirArchivoExcel(formData: any, id: number, codigo: string | number) {
    return this.http.post<any>(`${environment.url}/empleadoHorario/upload/${id}/${codigo}`, formData)
  }

  BuscarHorarioFechas(codigo: any, datos: any) {
    return this.http.post(`${environment.url}/empleadoHorario/busqueda-horarios/${codigo}`, datos);
  }
}
