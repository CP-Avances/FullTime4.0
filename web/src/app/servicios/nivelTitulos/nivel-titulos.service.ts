import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NivelTitulosService {

  constructor(
    private http: HttpClient
  ) { }

  // METODO PARA LISTAR NIVEL DE TITULO PROFESIONAL
  ListarNiveles() {
    return this.http.get<any>(`${(localStorage.getItem('empresaURL') as string)}/nivel-titulo/`);
  }

  // ELIMIAR REGISTRO
  EliminarNivel(id: number) {
    return this.http.delete(`${(localStorage.getItem('empresaURL') as string)}/nivel-titulo/eliminar/${id}`);
  }

  // METODO PARA CREAR ARCHIVO XML
  CrearXML(data: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/nivel-titulo/xmlDownload`, data);
  }

  // METODO PARA REGISTRAR NIVEL DE TITULO
  RegistrarNivel(data: any) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/nivel-titulo`, data);
  }

  // METODO PARA ACTUALIZAR REGISTRO DE NIVEL
  ActualizarNivelTitulo(datos: any) {
    return this.http.put(`${(localStorage.getItem('empresaURL') as string)}/nivel-titulo`, datos);
  }

  // METODO PARA BUSCAR NIVEL POR SU NOMBRE
  BuscarNivelNombre(nombre: string) {
    return this.http.get<any>(`${(localStorage.getItem('empresaURL') as string)}/nivel-titulo/buscar/${nombre}`);
  }


  RevisarFormato(formData) {
    return this.http.post<any>((localStorage.getItem('empresaURL') as string) + '/nivel-titulo/upload/revision', formData);
  }






  // Niveles de titulos
  getOneNivelTituloRest(id: number) {
    return this.http.get<any>(`${(localStorage.getItem('empresaURL') as string)}/nivel-titulo/${id}`);
  }









}
