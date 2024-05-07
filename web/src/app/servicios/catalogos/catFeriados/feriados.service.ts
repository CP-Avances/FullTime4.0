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

  // METODO PARA BUSCAR LISTA DE FERIADOS
  ConsultarFeriado() {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/feriados`);
  }

  // METODO PARA ELIMINAR REGISTRO
  EliminarFeriado(id: any) {
    return this.http.delete(`${(localStorage.getItem('empresaURL') as string)}/feriados/delete/${id}`).pipe(
      catchError(id)
    );
  }

  // METODO PARA CREAR ARCHIVO XML
  CrearXML(data: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/feriados/xmlDownload`, data);
  }

  // METODO PARA CREAR NUEVO REGISTRO DE FERIADO
  CrearNuevoFeriado(datos: any) {
    return this.http.post<any>((localStorage.getItem('empresaURL') as string) +`/feriados`, datos)
      .pipe(
        catchError(datos)
      );
  }

  // METODO PARA BUSCAR FERIADOS EXCEPTO REGISTRO EDITADO
  ConsultarFeriadoActualiza(id: number) {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/feriados/listar/${id}`);
  }

  // METODO PARA ACTUALIZAR REGISTRO
  ActualizarUnFeriado(datos: any) {
    return this.http.put(`${(localStorage.getItem('empresaURL') as string)}/feriados`, datos).pipe(
      catchError(datos));
  }

  // METODO PARA BUSCAR INFORMACION DE UN FERIADO ESPECIFICO
  ConsultarUnFeriado(id: number) {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/feriados/${id}`);
  }

  // METODO PARA LISTAR FERIADOS SEGUN CIUDAD Y RANGO DE FECHAS   --**VERIFICADO
  ListarFeriadosCiudad(datos: any) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/feriados/listar-feriados/ciudad`, datos);
  }

  // METODO PARA LISTAR FECHAS DE RECUPERACION DE FERIADOS SEGUN CIUDAD Y RANGO DE FECHAS  --**VERIFICADO
  ListarFeriadosRecuperarCiudad(datos: any) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/feriados/listar-feriados-recuperar/ciudad`, datos);
  }


  subirArchivoExcel(formData) {
    return this.http.post<any>((localStorage.getItem('empresaURL') as string) + '/feriados/upload', formData);
  }

  RevisarFormato(formData) {
    console.log('formDataferiados: ',formData);
    return this.http.post<any>((localStorage.getItem('empresaURL') as string) + '/feriados/upload/revision', formData);
  }

  RevisarDuplicidad(formData) {
    return this.http.post<any>((localStorage.getItem('empresaURL') as string) + '/feriados/upload/revision_data', formData);
  }


  Crear_feriados_ciudad(form){
    console.log('form: ',form);
    return this.http.post<any>(environment.url + '/feriados/upload/crearFeriadoCiudad', form);
  }

}
