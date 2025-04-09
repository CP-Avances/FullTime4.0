import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class TipoComidasService {

  constructor(
    private http: HttpClient
  ) { }

  // METODO PARA LISTAR TIPOS DE COMIDAS CON SU DETALLE     **USADO
  ConsultarDetallesComida() {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/tipoComidas/listar-detalle`);
  }

  // Invocación del METODO post para crear nuevo tipo de comida
  CrearNuevoTipoComida(datos: any) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/tipoComidas`, datos);
  }

  ConsultarTipoComida() {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/tipoComidas`);
  }

  ConsultarUnServicio(id: number) {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/tipoComidas/${id}`);
  }


  ConsultarUnMenu(id: number) {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/tipoComidas/buscar/menu/${id}`);
  }

  ActualizarUnAlmuerzo(datos: any) {
    return this.http.put(`${(localStorage.getItem('empresaURL') as string)}/tipoComidas`, datos);
  }

  CrearXML(data: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/tipoComidas/xmlDownload`, data);
  }

  EliminarRegistro(id: number, datos: any) {
    const url = `${(localStorage.getItem('empresaURL') as string)}/tipoComidas/eliminar/${id}`;
    const httpOtions = {
      body: datos
    };
    return this.http.request('delete', url, httpOtions);
  }
  // Servicio para consultar datos de tabla detalle_menu
  ConsultarUnDetalleMenu(id: number) {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/tipoComidas/detalle/menu/${id}`);
  }

  CrearDetalleMenu(datos: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/tipoComidas/detalle/menu`, datos);
  }

  ActualizarDetalleMenu(datos: any) {
    return this.http.put(`${(localStorage.getItem('empresaURL') as string)}/tipoComidas/detalle/menu`, datos);
  }

  EliminarDetalleMenu(id: number, datos: any) {
    const url = `${(localStorage.getItem('empresaURL') as string)}/tipoComidas/detalle/menu/eliminar/${id}`;
    const httpOtions = {
      body: datos
    };
    return this.http.request('delete', url, httpOtions);
  }

}
