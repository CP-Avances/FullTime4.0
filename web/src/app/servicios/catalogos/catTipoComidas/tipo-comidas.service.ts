import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class TipoComidasService {

  constructor(
    private http: HttpClient
  ) { }

  // Invocación del METODO post para crear nuevo tipo de comida
  CrearNuevoTipoComida(datos: any) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/tipoComidas`, datos);
  }

  ConsultarTipoComida() {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/tipoComidas`);
  }

  ConsultarTipoComidaDetalle() {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/tipoComidas/detalle`);
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

  EliminarRegistro(id: number) {
    return this.http.delete(`${(localStorage.getItem('empresaURL') as string)}/tipoComidas/eliminar/${id}`);
  }

  ObtenerUltimoId() {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/tipoComidas/registro/ultimo`);
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

  EliminarDetalleMenu(id: number) {
    return this.http.delete(`${(localStorage.getItem('empresaURL') as string)}/tipoComidas/detalle/menu/eliminar/${id}`);
  }

  // Servicios para verificar y subir datos
  subirArchivoExcel(formData) {
    return this.http.post<any>((localStorage.getItem('empresaURL') as string) + '/tipoComidas/upload', formData)
  }

  Verificar_Datos_ArchivoExcel(formData) {
    return this.http.post<any>((localStorage.getItem('empresaURL') as string) + '/tipoComidas/verificar_datos/upload', formData)
  }

  VerificarArchivoExcel(formData) {
    return this.http.post<any>((localStorage.getItem('empresaURL') as string) + '/tipoComidas/verificar_plantilla/upload', formData)
  }
}
