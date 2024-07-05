import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})

export class EmpleadoHorariosService {

  constructor(
    private http: HttpClient,
  ) { }

  // METODO PARA VERIFICAR HORARIOS DUPLICADOS  --**VERIFICADO
  VerificarDuplicidadHorarios(codigo: string, datos: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/empleadoHorario/validarFechas/${codigo}`, datos);
  }
  // METODO PARA BUSCAR HORARIOS DE EMPLEADO EN UN RANGO DE FECHAS  --**VERIFICADO
  VerificarHorariosExistentes(codigo: string, datos: any) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/empleadoHorario/horarios-existentes/${codigo}`, datos);
  }
  
  // METODO PARA BUSCAR HORARIO DEL USUARIO POR HORAS MISMO DIA (MD)
  BuscarHorarioHorasMD(datos: any) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/empleadoHorario/horario-horas-mismo-dia`, datos);
  }

  // METODO PARA BUSCAR HORARIO DEL USUARIO POR HORAS DIAS DIFERENTES (DD)
  BuscarHorarioHorasDD(datos: any) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/empleadoHorario/horario-horas-dias-diferentes`, datos);
  }

  // METODO PARA BUSCAR HORARIO DEL USUARIO POR HORAS MISMO DIA (MD)
  BuscarComidaHorarioHorasMD(datos: any) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/empleadoHorario/horario-comida-horas-mismo-dia`, datos);
  }

  // METODO PARA BUSCAR HORARIO DEL USUARIO POR HORAS DIAS DIFERENTES (DD)
  BuscarComidaHorarioHorasDD(datos: any) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/empleadoHorario/horario-comida-horas-dias-diferentes`, datos);
  }

  //Horarios Empleado
  ObtenerHorariosFechasEmpleado(codigo: string | number, data: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/empleadoHorario/fechas_horario/${codigo}`, data)
  }

  // Verificar datos de la plantilla de horario fijo
  VerificarDatos_EmpleadoHorario(formData: any, id: number) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/empleadoHorario/revisarData/${id}`, formData)
  }

  VerificarPlantilla_EmpleadoHorario(formData: any) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/empleadoHorario/verificarPlantilla/upload`, formData)
  }

  CreaPlanificacion(formData: any, id: number, codigo: string | number) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/empleadoHorario/plan_general/upload/${id}/${codigo}`, formData)
  }

  SubirArchivoExcel(formData: any, id: number, codigo: string | number) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/empleadoHorario/upload/${id}/${codigo}`, formData)
  }

  BuscarHorarioFechas(codigo: any, datos: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/empleadoHorario/busqueda-horarios/${codigo}`, datos);
  }
}
