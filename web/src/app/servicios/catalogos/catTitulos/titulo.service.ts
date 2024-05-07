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
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/titulo/`);
  }

  // METODO PARA ELIMINAR REGISTRO
  EliminarRegistro(id: any) {
    return this.http.delete(`${(localStorage.getItem('empresaURL') as string)}/titulo/eliminar/${id}`).pipe(catchError(id));
  }

  // METODO PARA CREAR ARCHIVO XML
  CrearXML(data: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/titulo/xmlDownload`, data);
  }

  // METODO PARA REGISTRAR TITULO
  RegistrarTitulo(data: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/titulo`, data);
  }

  // METODO PARA ACTUALIZAR REGISTRO DE TITULO
  ActualizarUnTitulo(datos: any) {
    return this.http.put(`${(localStorage.getItem('empresaURL') as string)}/titulo`, datos);
  }

  RevisarFormato(formData) {
    return this.http.post<any>((localStorage.getItem('empresaURL') as string) + '/titulo/upload/revision', formData);
  }


  // Catálogo de títulos

  getOneTituloRest(id: number) {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/titulo/${id}`);
  }








}
