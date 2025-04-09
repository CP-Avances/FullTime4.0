import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class RegimenService {

  constructor(
    private http: HttpClient
  ) { }

  /** ** *************************************************************************************** **
   ** ** **                           CONSULTA REGIMEN LABORAL                                ** **
   ** ** *************************************************************************************** **/

  // REGISTRAR NUEVO REGIMEN LABORAL  **USADO
  CrearNuevoRegimen(datos: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/regimenLaboral`, datos).pipe(
      catchError(datos));
  }

  // ACTUALIZAR REGISTRO DE REGIMEN LABORAL  **USADO
  ActualizarRegimen(datos: any) {
    return this.http.put(`${(localStorage.getItem('empresaURL') as string)}/regimenLaboral`, datos);
  }

  // LISTAR REGISTROS DE REGIMEN LABORAL  **USADO
  ConsultarNombresRegimen() {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/regimenLaboral/descripcion`);
  }

  // LISTAR REGISTROS DE REGIMEN LABORAL  **USADO
  ConsultarRegimen() {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/regimenLaboral`);
  }

  // BUSCAR UN REGISTRO DE REGIMEN LABORAL  **USADO
  ConsultarUnRegimen(id: number) {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/regimenLaboral/${id}`);
  }

  // ELIMINAR REGISTRO DE REGIMEN LABORAL  ** USADO
  EliminarRegistro(id: any, datos: any) {
    const url = `${(localStorage.getItem('empresaURL') as string)}/regimenLaboral/eliminar/${id}`;
    const httpOtions = {
      body: datos
    };
    return this.http.request('delete', url, httpOtions).pipe(catchError(id));
  }

  // BUSCAR REGISTRO DE REGIMEN LABORAL POR PAIS    **USADO
  ConsultarRegimenPais(nombre: string) {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/regimenLaboral/pais-regimen/${nombre}`);
  }

  /** ** *************************************************************************************** **
   ** ** **                        CONSULTA PERIODOS DE VACACIONES                            ** **
   ** ** *************************************************************************************** **/

  // REGISTRAR NUEVO PERIODO DE VACACIONES  **USADO
  CrearNuevoPeriodo(datos: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/regimenLaboral/periodo-vacaciones`, datos).pipe(
      catchError(datos));
  }

  // ACTUALIZAR REGISTRO PERIODO DE VACACIONES  **USADO
  ActualizarPeriodo(datos: any) {
    return this.http.put(`${(localStorage.getItem('empresaURL') as string)}/regimenLaboral/periodo-vacaciones`, datos);
  }

  // BUSCAR UN REGISTRO DE PERIODO DE VACACIONES  **USADO
  ConsultarUnPeriodo(id: number) {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/regimenLaboral/periodo-vacaciones/${id}`);
  }

  // ELIMINAR REGISTRO DE PERIODO DE VACACIONES  **USADO
  EliminarPeriodo(id: number, datos:any) {
    const url = `${(localStorage.getItem('empresaURL') as string)}/regimenLaboral/periodo-vacaciones/eliminar/${id}`;
    const httpOtions = {
      body: datos
    };
    return this.http.request('delete', url, httpOtions);
  }

  /** ** *************************************************************************************** **
   ** ** **                        CONSULTA ANTIGUEDAD DE VACACIONES                            ** **
   ** ** *************************************************************************************** **/

  // REGISTRAR NUEVA ANTIGUEDAD DE VACACIONES  **USADO
  CrearNuevaAntiguedad(datos: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/regimenLaboral/antiguedad-vacaciones`, datos).pipe(
      catchError(datos));
  }

  // ACTUALIZAR REGISTRO ANTIGUEDAD DE VACACIONES  **USADO
  ActualizarAntiguedad(datos: any) {
    return this.http.put(`${(localStorage.getItem('empresaURL') as string)}/regimenLaboral/antiguedad-vacaciones`, datos);
  }

  // BUSCAR UN REGISTRO DE ANTIGUEDAD DE VACACIONES  **USADO
  ConsultarAntiguedad(id: number) {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/regimenLaboral/antiguedad-vacaciones/${id}`);
  }

  // ELIMINAR REGISTRO DE ANTIGUEDAD DE VACACIONES  **USADO
  EliminarAntiguedad(id: number, datos: any) {
    const url = `${(localStorage.getItem('empresaURL') as string)}/regimenLaboral/antiguedad-vacaciones/eliminar/${id}`;
    const httpOtions = {
      body: datos
    };
    return this.http.request('delete', url, httpOtions);
  }
  
}
