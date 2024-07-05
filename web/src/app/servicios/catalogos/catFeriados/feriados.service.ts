import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FeriadosService {

  constructor(
    private http: HttpClient
  ) { }

  // METODO PARA BUSCAR LISTA DE FERI-	CrearFeriadoPlantillaOS
  ConsultarFeriado() {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/feriados`);
  }

  // METODO PARA ELIMINAR REGISTRO
  EliminarFeriado(id: number, datos: any) {
    const url = `${(localStorage.getItem('empresaURL') as string)}/feriados/delete/${id}`;
    const httpOtions = {
      body: datos
    };
    return this.http.request('delete', url, httpOtions);
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

  RevisarFormato(formData) {
    return this.http.post<any>((localStorage.getItem('empresaURL') as string)+ '/feriados/upload/revision', formData);
  }

  Crear_feriados(form){
    console.log('form: ',form);
    return this.http.post<any>((localStorage.getItem('empresaURL') as string) + '/feriados/upload/crearFeriado', form);
  }

  Crear_feriados_ciudad(form){
    return this.http.post<any>((localStorage.getItem('empresaURL') as string) + '/feriados/upload/crearFeriadoCiudad', form);
  }

}
