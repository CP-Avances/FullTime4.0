import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class FeriadosService {

  constructor(
    private http: HttpClient
  ) { }

  // METODO PARA BUSCAR LISTA DE FERIADOS   **USADO
  ConsultarFeriado() {
    return this.http.get(`${environment.url}/feriados`);
  }

  // METODO PARA ELIMINAR REGISTRO   **USADO
  EliminarFeriado(id: number, datos: any) {
    const url = `${environment.url}/feriados/delete/${id}`;
    const httpOtions = {
      body: datos
    };
    return this.http.request('delete', url, httpOtions);
  }

  // METODO PARA CREAR NUEVO REGISTRO DE FERIADO   **USADO
  CrearNuevoFeriado(datos: any) {
    return this.http.post<any>(`${environment.url}/feriados`, datos)
      .pipe(
        catchError(datos)
      );
  }

  // METODO PARA BUSCAR FERIADOS EXCEPTO REGISTRO EDITADO    **USADO
  ConsultarFeriadoActualiza(id: number) {
    return this.http.get(`${environment.url}/feriados/listar/${id}`);
  }

  // METODO PARA ACTUALIZAR REGISTRO   **USADO
  ActualizarUnFeriado(datos: any) {
    return this.http.put(`${environment.url}/feriados`, datos).pipe(
      catchError(datos));
  }

  // METODO PARA BUSCAR INFORMACION DE UN FERIADO ESPECIFICO   **USADO
  ConsultarUnFeriado(id: number) {
    return this.http.get(`${environment.url}/feriados/${id}`);
  }

  // METODO PARA LISTAR FERIADOS SEGUN CIUDAD Y RANGO DE FECHAS   **USADO
  ListarFeriadosCiudad(datos: any) {
    return this.http.post<any>(`${environment.url}/feriados/listar-feriados/ciudad`, datos);
  }

  // METODO PARA LISTAR FERIADOS SEGUN CIUDAD Y RANGO DE FECHAS   **USADO
  ListarFeriadosCiudadMultiplesEmpleados(datos: any) {
    return this.http.post<any>(`${environment.url}/feriados/listar-feriados/ciudad2`, datos);
  }

  // METODO PARA LISTAR FECHAS DE RECUPERACION DE FERIADOS SEGUN CIUDAD Y RANGO DE FECHAS  **USADO
  ListarFeriadosRecuperarCiudad(datos: any) {
    return this.http.post<any>(`${environment.url}/feriados/listar-feriados-recuperar/ciudad`, datos);
  }

  // METODO PARA LISTAR FECHAS DE RECUPERACION DE FERIADOS SEGUN CIUDAD Y RANGO DE FECHAS  **USADO
  ListarFeriadosRecuperarCiudadMultiplesEmpleados(datos: any) {
    return this.http.post<any>(`${environment.url}/feriados/listar-feriados-recuperar/ciudad2`, datos);
  }

  // METODO PARA VALIDAR DATOS DE PLANTILLA   **USADO
  RevisarFormato(formData: any) {
    return this.http.post<any>(environment.url + '/feriados/upload/revision', formData);
  }

  // METODO PARA REGISTRAR DATOS DE PLANTILLA
  Crear_feriados(form: any) {
    return this.http.post<any>(environment.url + '/feriados/upload/crearFeriado', form);
  }

  // METODO PARA CEAR UN FERIADO CIUDAD  PLANTILLA  **USADO  
  Crear_feriados_ciudad(form: any) {
    return this.http.post<any>(environment.url + '/feriados/upload/crearFeriadoCiudad', form);
  }

}
