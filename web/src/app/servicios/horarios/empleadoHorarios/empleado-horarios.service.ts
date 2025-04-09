import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})

export class EmpleadoHorariosService {

  constructor(
    private http: HttpClient,
  ) { }

  VerificarDuplicidadHorarios2( datos: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/empleadoHorario/validarFechas`, datos);
  }

  BuscarFechasMultiples( datos: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/empleadoHorario/buscar-horarios-multiples`, datos);
  }

  // METODO PARA VERIFICAR HORARIOS DUPLICADOS  **USADO
  VerificarDuplicidadHorarios(id_empleado: string, datos: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/empleadoHorario/validarFechas/${id_empleado}`, datos);
  }
  // METODO PARA BUSCAR HORARIOS DE EMPLEADO EN UN RANGO DE FECHAS  **USADO
  VerificarHorariosExistentes(id_empleado: string, datos: any) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/empleadoHorario/horarios-existentes1/${id_empleado}`, datos);
  }

  // METODO PARA BUSCAR HORARIOS DE EMPLEADO EN UN RANGO DE FECHAS  **USADO
  VerificarHorariosExistentes2(datos: any) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/empleadoHorario/horarios-existentes`, datos);
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

  BuscarHorarioFechas(codigo: any, datos: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/empleadoHorario/busqueda-horarios/${codigo}`, datos);
  }
  
}
