import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment'
import { catchError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TituloService {

  constructor(
    private http: HttpClient
  ) { }


  // METODO PARA LISTAR TITULOS
  ListarTitulos() {
    return this.http.get(`${environment.url}/titulo/`);
  }

  // METODO PARA CREAR ARCHIVO XML
  BuscarTituloNombre(data: any) {
    return this.http.post(`${environment.url}/titulo/titulo-nombre`, data);
  }

  // METODO PARA ELIMINAR REGISTRO
  EliminarRegistro(id: any, datos:any) {
    const url = `${environment.url}/titulo/eliminar/${id}`;
    const httpOtions = {
      body: datos
    };
    return this.http.request('delete', url, httpOtions).pipe(catchError(id));
  }


  // METODO PARA REGISTRAR TITULO
  RegistrarTitulo(data: any) {
    return this.http.post(`${environment.url}/titulo`, data);
  }

  // METODO PARA ACTUALIZAR REGISTRO DE TITULO
  ActualizarUnTitulo(datos: any) {
    return this.http.put(`${environment.url}/titulo`, datos);
  }

  RevisarFormato(formData) {
    return this.http.post<any>(environment.url + '/titulo/upload/revision', formData);
  }


}
