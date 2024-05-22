import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment'
import { catchError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TipoComidasService {

  constructor(
    private http: HttpClient
  ) { }

  // Invocación del METODO post para crear nuevo tipo de comida
  CrearNuevoTipoComida(datos: any) {
    return this.http.post<any>(`${environment.url}/tipoComidas`, datos);
  }

  ConsultarTipoComida() {
    return this.http.get(`${environment.url}/tipoComidas`);
  }

  ConsultarTipoComidaDetalle() {
    return this.http.get(`${environment.url}/tipoComidas/detalle`);
  }

  ConsultarUnServicio(id: number) {
    return this.http.get(`${environment.url}/tipoComidas/${id}`);
  }


  ConsultarUnMenu(id: number) {
    return this.http.get(`${environment.url}/tipoComidas/buscar/menu/${id}`);
  }

  ActualizarUnAlmuerzo(datos: any) {
    return this.http.put(`${environment.url}/tipoComidas`, datos);
  }

  CrearXML(data: any) {
    return this.http.post(`${environment.url}/tipoComidas/xmlDownload`, data);
  }

  EliminarRegistro(id: number, datos: any) {
    const url = `${environment.url}/tipoComidas/eliminar/${id}`;
    const httpOtions = {
      body: datos
    };
    return this.http.request('delete', url, httpOtions);
  }

  ObtenerUltimoId() {
    return this.http.get(`${environment.url}/tipoComidas/registro/ultimo`);
  }

  // Servicio para consultar datos de tabla detalle_comida
  ConsultarUnDetalleMenu(id: number) {
    return this.http.get(`${environment.url}/tipoComidas/detalle/menu/${id}`);
  }

  CrearDetalleMenu(datos: any) {
    return this.http.post(`${environment.url}/tipoComidas/detalle/menu`, datos);
  }

  ActualizarDetalleMenu(datos: any) {
    return this.http.put(`${environment.url}/tipoComidas/detalle/menu`, datos);
  }

  EliminarDetalleMenu(id: number, datos: any) {
    const url = `${environment.url}/tipoComidas/detalle/menu/eliminar/${id}`;
    const httpOtions = {
      body: datos
    };
    return this.http.request('delete', url, httpOtions);
  }

  // Servicios para verificar y subir datos
  subirArchivoExcel(formData) {
    return this.http.post<any>(environment.url + '/tipoComidas/upload', formData)
  }

  Verificar_Datos_ArchivoExcel(formData) {
    return this.http.post<any>(environment.url + '/tipoComidas/verificar_datos/upload', formData)
  }

  VerificarArchivoExcel(formData) {
    return this.http.post<any>(environment.url + '/tipoComidas/verificar_plantilla/upload', formData)
  }
}
